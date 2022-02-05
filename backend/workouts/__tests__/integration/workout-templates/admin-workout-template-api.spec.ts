import {HttpStatus, INestApplication} from "@nestjs/common";
import {Test} from "@nestjs/testing";
import {AppModule} from "@src/app.module";
import {appGlobalsSetup} from "@src/app.setup";
import request from "supertest";
import {WorkoutTemplate} from "@src/workout-templates/entities/workout-template.entity";
import {Connection, DeepPartial, EntityManager, QueryRunner, Repository} from "typeorm";
import MockDate from "mockdate";
import {User} from "@core/entities/user.entity";
import {randomUUID} from "crypto";
import _ from "lodash";
import {Response} from "@core/types";
import {instanceToPlain} from "class-transformer";
import {
  addExerciseGroupTemplate,
  addExerciseTemplate,
  createAdminUserAndToken,
  createExerciseTypesForUser,
  createUserAndToken,
  createWorkoutTemplateData,
  createWorkoutTemplatesForUser,
  expireToken,
} from "../utils";

describe("Admin scoped WorkoutTemplates api", () => {
  let app: INestApplication;
  let queryRunner: QueryRunner;
  let repo: Repository<WorkoutTemplate>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    appGlobalsSetup(app);
    await app.init();
    const dbConnection = moduleRef.get(Connection);
    const manager = moduleRef.get(EntityManager);
    repo = manager.getRepository(WorkoutTemplate);
    queryRunner = dbConnection.createQueryRunner("master");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    manager.queryRunner = queryRunner;
  });

  beforeEach(async () => {
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    MockDate.reset();
    await queryRunner.rollbackTransaction();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("LIST - Admin WorkoutTemplates", () => {
    const url = "/api/v1/templates/workouts";
    let user1: User;
    let user2: User;
    let user1AccessToken: string;
    let adminAccessToken: string;
    let workoutTemplates: WorkoutTemplate[];

    beforeEach(async () => {
      [user1, user1AccessToken] = await createUserAndToken();
      [user2] = await createUserAndToken();
      [, adminAccessToken] = await createAdminUserAndToken();
      workoutTemplates = [];
      workoutTemplates.push(...(await createWorkoutTemplatesForUser(user1)));
      workoutTemplates.push(...(await createWorkoutTemplatesForUser(user2)));
    });

    test("successful request", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<WorkoutTemplate>).data;
      const sortedWorkoutTemplates = workoutTemplates.sort((a, b) => {
        const x = a.ownerId.localeCompare(b.ownerId);
        return x === 0 ? a.name.localeCompare(b.name) : x;
      });

      expect(payload).toStrictEqual(instanceToPlain(sortedWorkoutTemplates, {groups: ["admin"]}));
    });

    test("unauthorized request - missing token", async () => {
      const res = await request(app.getHttpServer()).get(url).set("Accept", "application/json").send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    test("unauthorized request - malformed token", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${adminAccessToken}awdadioj`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    test("unauthorized request - non admin user", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${user1AccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    test("unauthorized request - expired token", async () => {
      expireToken(adminAccessToken);
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("DETAIL - Admin WorkoutTemplates", () => {
    let url: string;
    let user: User;
    let userAccessToken: string;
    let adminAccessToken: string;
    let workoutTemplate: WorkoutTemplate;
    const createUrl = (workoutId: string) => `/api/v1/templates/workouts/${workoutId}`;

    beforeEach(async () => {
      [user, userAccessToken] = await createUserAndToken();
      [, adminAccessToken] = await createAdminUserAndToken();
      [workoutTemplate] = await createWorkoutTemplatesForUser(user);
      url = createUrl(workoutTemplate.id);
    });

    test("successful request", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<WorkoutTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(workoutTemplate, {groups: ["admin"]}));
    });

    test("bad request - workoutId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .get(createUrl("notauuid"))
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("not found request - workout with id does not exist", async () => {
      const res = await request(app.getHttpServer())
        .get(createUrl(randomUUID()))
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    test("unauthorized request - missing token", async () => {
      const res = await request(app.getHttpServer()).get(url).set("Accept", "application/json").send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    test("unauthorized request - malformed token", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${adminAccessToken}awdadioj`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    test("unauthorized request - non admin user", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${userAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
    });

    test("unauthorized request - expired token", async () => {
      expireToken(adminAccessToken);
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("CREATE - Admin WorkoutTemplates", () => {
    const url = "/api/v1/templates/workouts";
    let user: User;
    let userAccessToken: string;
    let adminAccessToken: string;
    let workoutTemplateData: DeepPartial<WorkoutTemplate>;

    beforeEach(async () => {
      [user, userAccessToken] = await createUserAndToken();
      [, adminAccessToken] = await createAdminUserAndToken();
      workoutTemplateData = createWorkoutTemplateData({ownerId: user.id});
    });

    test("successful request", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(workoutTemplateData);

      expect(res.statusCode).toBe(HttpStatus.CREATED);
      const workoutTemplate = await repo.findOne({name: workoutTemplateData.name, ownerId: user.id});
      expect(workoutTemplate).not.toBeUndefined();
      const payload = (res.body as Response<WorkoutTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(workoutTemplate, {groups: ["admin"]}));
    });

    test("bad request - owner id is missing", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(_.omit(workoutTemplateData, ["ownerId"]));

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const workoutTemplate = await repo.findOne({name: workoutTemplateData.name, ownerId: user.id});
      expect(workoutTemplate).toBeUndefined();
    });

    test("bad request - no user with owner id exists", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...workoutTemplateData, ownerId: randomUUID()});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const workoutTemplate = await repo.findOne({name: workoutTemplateData.name, ownerId: user.id});
      expect(workoutTemplate).toBeUndefined();
    });

    test("bad request - name is missing", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(_.omit(workoutTemplateData, ["name"]));

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const workoutTemplate = await repo.findOne({name: workoutTemplateData.name, ownerId: user.id});
      expect(workoutTemplate).toBeUndefined();
    });

    test("bad request - name is blank", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...workoutTemplateData, name: ""});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const workoutTemplate = await repo.findOne({name: workoutTemplateData.name, ownerId: user.id});
      expect(workoutTemplate).toBeUndefined();
    });

    test("unauthorized request - missing token", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send(workoutTemplateData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const workoutTemplate = await repo.findOne({name: workoutTemplateData.name, ownerId: user.id});
      expect(workoutTemplate).toBeUndefined();
    });

    test("unauthorized request - malformed token", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}awdadioj`)
        .set("Accept", "application/json")
        .send(workoutTemplateData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const workoutTemplate = await repo.findOne({name: workoutTemplateData.name, ownerId: user.id});
      expect(workoutTemplate).toBeUndefined();
    });

    test("unauthorized request - non admin user", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${userAccessToken}`)
        .set("Accept", "application/json")
        .send(workoutTemplateData);

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      const workoutTemplate = await repo.findOne({name: workoutTemplateData.name, ownerId: user.id});
      expect(workoutTemplate).toBeUndefined();
    });

    test("unauthorized request - expired token", async () => {
      expireToken(adminAccessToken);
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(workoutTemplateData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const workoutTemplate = await repo.findOne({name: workoutTemplateData.name, ownerId: user.id});
      expect(workoutTemplate).toBeUndefined();
    });
  });

  describe("UPDATE - Admin WorkoutTemplates", () => {
    let url: string;
    let user: User;
    let userAccessToken: string;
    let adminAccessToken: string;
    let workoutTemplate: WorkoutTemplate;
    let newName: string;
    const createUrl = (workoutId: string) => `/api/v1/templates/workouts/${workoutId}`;

    beforeEach(async () => {
      [user, userAccessToken] = await createUserAndToken();
      [, adminAccessToken] = await createAdminUserAndToken();
      [workoutTemplate] = await createWorkoutTemplatesForUser(user);
      newName = `${workoutTemplate.name}randomchars`;
      url = createUrl(workoutTemplate.id);
    });

    test("successful request", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({name: newName});

      expect(res.statusCode).toBe(HttpStatus.OK);
      const updatedWorkoutTemplate = await repo.findOne({name: newName, ownerId: user.id});
      expect(updatedWorkoutTemplate).not.toBeUndefined();
      const payload = (res.body as Response<WorkoutTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(updatedWorkoutTemplate, {groups: ["admin"]}));
    });

    test("bad request - name is blank", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({name: ""});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedWorkoutTemplate = await repo.findOne({name: "", ownerId: user.id});
      expect(updatedWorkoutTemplate).toBeUndefined();
    });

    test("bad request - user with ownerId does not exist", async () => {
      const randUuid = randomUUID();
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({ownerId: randUuid});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedWorkoutTemplate = await repo.findOne({name: newName, ownerId: randUuid});
      expect(updatedWorkoutTemplate).toBeUndefined();
    });

    test("not found request - workout with id does not exist", async () => {
      const res = await request(app.getHttpServer())
        .patch(createUrl(randomUUID()))
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({name: newName});

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      const updatedWorkoutTemplate = await repo.findOne({name: newName, ownerId: user.id});
      expect(updatedWorkoutTemplate).toBeUndefined();
    });

    test("bad request - workoutId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .patch(createUrl("notauuid"))
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({ownerId: newName});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedWorkoutTemplate = await repo.findOne({name: newName, ownerId: user.id});
      expect(updatedWorkoutTemplate).toBeUndefined();
    });

    test("unauthorized request - missing token", async () => {
      const res = await request(app.getHttpServer()).patch(url).set("Accept", "application/json").send({name: newName});

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const updatedWorkoutTemplate = await repo.findOne({name: newName, ownerId: user.id});
      expect(updatedWorkoutTemplate).toBeUndefined();
    });

    test("unauthorized request - malformed token", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}awdadioj`)
        .set("Accept", "application/json")
        .send({name: newName});

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const updatedWorkoutTemplate = await repo.findOne({name: newName, ownerId: user.id});
      expect(updatedWorkoutTemplate).toBeUndefined();
    });

    test("unauthorized request - non admin user", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${userAccessToken}`)
        .set("Accept", "application/json")
        .send({name: newName});

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      const updatedWorkoutTemplate = await repo.findOne({name: newName, ownerId: user.id});
      expect(updatedWorkoutTemplate).toBeUndefined();
    });

    test("unauthorized request - expired token", async () => {
      expireToken(adminAccessToken);
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({name: newName});

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const updatedWorkoutTemplate = await repo.findOne({name: newName, ownerId: user.id});
      expect(updatedWorkoutTemplate).toBeUndefined();
    });
  });

  describe("DELETE - Admin WorkoutTemplates", () => {
    let url: string;
    let user: User;
    let userAccessToken: string;
    let adminAccessToken: string;
    let workoutTemplate: WorkoutTemplate;
    const createUrl = (workoutId: string) => `/api/v1/templates/workouts/${workoutId}`;

    beforeEach(async () => {
      [user, userAccessToken] = await createUserAndToken();
      [, adminAccessToken] = await createAdminUserAndToken();
      [workoutTemplate] = await createWorkoutTemplatesForUser(user);
      url = createUrl(workoutTemplate.id);
    });

    test("successful request", async () => {
      const [exerciseType1, exerciseType2] = await createExerciseTypesForUser(user);
      const exerciseGroupTemplate1 = await addExerciseGroupTemplate(workoutTemplate);
      const exerciseGroupTemplate2 = await addExerciseGroupTemplate(workoutTemplate, {index: 1});
      await addExerciseTemplate(exerciseGroupTemplate1, exerciseType1, 0);
      await addExerciseTemplate(exerciseGroupTemplate1, exerciseType2, 1);
      await addExerciseTemplate(exerciseGroupTemplate2, exerciseType1, 0);

      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const deletedWorkoutTemplate = await repo.findOne(workoutTemplate.id, {
        withDeleted: true,
        relations: ["exerciseGroups", "exerciseGroups.exercises", "exerciseGroups.exercises.type"],
      });
      expect(deletedWorkoutTemplate.deletedAt).not.toBe(null);
      for (const exerciseGroupTemplate of deletedWorkoutTemplate.exerciseGroups) {
        expect(exerciseGroupTemplate.deletedAt).not.toBe(null);
        for (const exerciseTemplate of exerciseGroupTemplate.exercises) {
          expect(exerciseTemplate.deletedAt).not.toBe(null);
          expect(exerciseTemplate.type.deletedAt).toBe(null);
        }
      }
      expect(res.body).toStrictEqual({});
    });

    test("bad request - workoutId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .delete(createUrl("notauuid"))
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const notDeletedWorkoutTemplate = await repo.findOne(workoutTemplate.id);
      expect(notDeletedWorkoutTemplate.deletedAt).toBe(null);
    });

    test("not found request - workout template with id does not exist", async () => {
      const res = await request(app.getHttpServer())
        .delete(createUrl(randomUUID()))
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      const notDeletedWorkoutTemplate = await repo.findOne(workoutTemplate.id);
      expect(notDeletedWorkoutTemplate.deletedAt).toBe(null);
    });

    test("unauthorized request - missing token", async () => {
      const res = await request(app.getHttpServer()).delete(url).set("Accept", "application/json").send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const notDeletedWorkoutTemplate = await repo.findOne(workoutTemplate.id);
      expect(notDeletedWorkoutTemplate.deletedAt).toBe(null);
    });

    test("unauthorized request - malformed token", async () => {
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${adminAccessToken}awdadioj`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const notDeletedWorkoutTemplate = await repo.findOne(workoutTemplate.id);
      expect(notDeletedWorkoutTemplate.deletedAt).toBe(null);
    });

    test("unauthorized request - non admin user", async () => {
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${userAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      const notDeletedWorkoutTemplate = await repo.findOne(workoutTemplate.id);
      expect(notDeletedWorkoutTemplate.deletedAt).toBe(null);
    });

    test("unauthorized request - expired token", async () => {
      expireToken(adminAccessToken);
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const notDeletedWorkoutTemplate = await repo.findOne(workoutTemplate.id);
      expect(notDeletedWorkoutTemplate.deletedAt).toBe(null);
    });
  });
});
