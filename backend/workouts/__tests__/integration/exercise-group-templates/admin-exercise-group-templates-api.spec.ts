import {HttpStatus, INestApplication} from "@nestjs/common";
import {Test} from "@nestjs/testing";
import {AppModule} from "@src/app.module";
import {appGlobalsSetup} from "@src/app.setup";
import {ExerciseGroupTemplate} from "@exercise-group-templates/entities/exercise-group-template.entity";
import {Connection, DeepPartial, EntityManager, QueryRunner, Repository} from "typeorm";
import MockDate from "mockdate";
import {User} from "@core/entities/user.entity";
import {randomUUID} from "crypto";
import request from "supertest";
import _ from "lodash";
import {WorkoutTemplate} from "@src/workout-templates/entities/workout-template.entity";
import {Response} from "@core/types";
import {instanceToPlain} from "class-transformer";
import {
  addExerciseGroupTemplate,
  createAdminUserAndToken,
  createExerciseGroupTemplateData,
  createUserAndToken,
  createWorkoutTemplatesForUser,
  expireToken,
} from "../utils";

describe("Admin scoped ExerciseGroupTemplates api", () => {
  let app: INestApplication;
  let queryRunner: QueryRunner;
  let repo: Repository<ExerciseGroupTemplate>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    appGlobalsSetup(app);
    await app.init();
    const dbConnection = moduleRef.get(Connection);
    const manager = moduleRef.get(EntityManager);
    repo = manager.getRepository(ExerciseGroupTemplate);
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

  describe("LIST - Admin ExerciseGroupTemplate", () => {
    const url = "/api/v1/templates/exercise-groups";
    let user1: User;
    let user2: User;
    let user1AccessToken: string;
    let adminAccessToken: string;
    let exerciseGroupTemplates: ExerciseGroupTemplate[];

    beforeEach(async () => {
      [user1, user1AccessToken] = await createUserAndToken();
      [user2] = await createUserAndToken();
      [, adminAccessToken] = await createAdminUserAndToken();
      exerciseGroupTemplates = [];
      const [user1WorkoutTemplate] = await createWorkoutTemplatesForUser(user1);
      exerciseGroupTemplates.push(await addExerciseGroupTemplate(user1WorkoutTemplate));
      exerciseGroupTemplates.push(await addExerciseGroupTemplate(user1WorkoutTemplate, {index: 1}));
      const [user2WorkoutTemplate] = await createWorkoutTemplatesForUser(user2);
      exerciseGroupTemplates.push(await addExerciseGroupTemplate(user2WorkoutTemplate));
      exerciseGroupTemplates.push(await addExerciseGroupTemplate(user2WorkoutTemplate, {index: 1}));
    });

    test("successful request", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<ExerciseGroupTemplate>).data;
      const sortedExerciseGroupTemplates = exerciseGroupTemplates.sort((a, b) => {
        const x = a.workoutId.localeCompare(b.workoutId);
        return x === 0 ? a.index - b.index : x;
      });
      expect(payload).toStrictEqual(instanceToPlain(sortedExerciseGroupTemplates, {groups: ["admin"]}));
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

  describe("DETAIL - Admin ExerciseGroupTemplate", () => {
    let url: string;
    let user: User;
    let userAccessToken: string;
    let adminAccessToken: string;
    let exerciseGroupTemplate: ExerciseGroupTemplate;
    const createUrl = (exerciseGroupId: string) => `/api/v1/templates/exercise-groups/${exerciseGroupId}`;

    beforeEach(async () => {
      [user, userAccessToken] = await createUserAndToken();
      [, adminAccessToken] = await createAdminUserAndToken();
      const [userWorkoutTemplate] = await createWorkoutTemplatesForUser(user);
      exerciseGroupTemplate = await addExerciseGroupTemplate(userWorkoutTemplate);
      url = createUrl(exerciseGroupTemplate.id);
    });

    test("successful request", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<ExerciseGroupTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(exerciseGroupTemplate, {groups: ["admin"]}));
    });

    test("not found request - exercise group template with id does not exist", async () => {
      const res = await request(app.getHttpServer())
        .get(createUrl(randomUUID()))
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    test("bad request - exerciseGroupId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .get(createUrl("notauuid"))
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
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

  describe("CREATE - Admin ExerciseGroupTemplate", () => {
    const url = "/api/v1/templates/exercise-groups";
    let user: User;
    let userAccessToken: string;
    let adminAccessToken: string;
    let workoutTemplate: WorkoutTemplate;
    let exerciseGroupTemplateData: DeepPartial<ExerciseGroupTemplate>;

    beforeEach(async () => {
      [user, userAccessToken] = await createUserAndToken();
      [, adminAccessToken] = await createAdminUserAndToken();
      [workoutTemplate] = await createWorkoutTemplatesForUser(user);
      exerciseGroupTemplateData = createExerciseGroupTemplateData({workoutId: workoutTemplate.id});
    });

    test("successful request", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(exerciseGroupTemplateData);

      expect(res.statusCode).toBe(HttpStatus.CREATED);
      const exerciseGroupTemplate = await repo.findOne({
        index: exerciseGroupTemplateData.index,
        workoutId: workoutTemplate.id,
      });
      expect(exerciseGroupTemplate).not.toBeUndefined();
      const payload = (res.body as Response<ExerciseGroupTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(exerciseGroupTemplate, {groups: ["admin"]}));
    });

    test("bad request - missing workoutId", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(_.omit(exerciseGroupTemplateData, "workoutId"));

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - workoutId is not a uuid", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseGroupTemplateData, workoutId: "notauuid"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - workout template with id doesnt exist", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseGroupTemplateData, workoutId: randomUUID()});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - missing index", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(_.omit(exerciseGroupTemplateData, "index"));

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - index is not a number", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseGroupTemplateData, index: "a"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - index is less than 0", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseGroupTemplateData, index: -1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - index is greater than int16", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseGroupTemplateData, index: 32768});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("unauthorized request - missing token", async () => {
      const res = await request(app.getHttpServer()).post(url).set("Accept", "application/json").send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const exerciseGroupTemplate = await repo.findOne({
        index: exerciseGroupTemplateData.index,
        workoutId: workoutTemplate.id,
      });
      expect(exerciseGroupTemplate).toBeUndefined();
    });

    test("unauthorized request - malformed token", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}awdadioj`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const exerciseGroupTemplate = await repo.findOne({
        index: exerciseGroupTemplateData.index,
        workoutId: workoutTemplate.id,
      });
      expect(exerciseGroupTemplate).toBeUndefined();
    });

    test("unauthorized request - non admin user", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${userAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      const exerciseGroupTemplate = await repo.findOne({
        index: exerciseGroupTemplateData.index,
        workoutId: workoutTemplate.id,
      });
      expect(exerciseGroupTemplate).toBeUndefined();
    });

    test("unauthorized request - expired token", async () => {
      expireToken(adminAccessToken);
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("UPDATE - Admin ExerciseGroupTemplate", () => {
    let url: string;
    let user: User;
    let userAccessToken: string;
    let adminAccessToken: string;
    let exerciseGroupTemplate: ExerciseGroupTemplate;
    let newIndex: number;
    const createUrl = (exerciseGroupId: string) => `/api/v1/templates/exercise-groups/${exerciseGroupId}`;

    beforeEach(async () => {
      [user, userAccessToken] = await createUserAndToken();
      [, adminAccessToken] = await createAdminUserAndToken();
      const [userWorkoutTemplate] = await createWorkoutTemplatesForUser(user);
      exerciseGroupTemplate = await addExerciseGroupTemplate(userWorkoutTemplate);
      newIndex = exerciseGroupTemplate.index + 1;
      url = createUrl(exerciseGroupTemplate.id);
    });

    test("successful request", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({index: newIndex});

      expect(res.statusCode).toBe(HttpStatus.OK);
      const updatedExerciseGroupTemplate = await repo.findOne({
        index: newIndex,
        workoutId: exerciseGroupTemplate.workoutId,
      });
      expect(updatedExerciseGroupTemplate).not.toBeUndefined();
      const payload = (res.body as Response<ExerciseGroupTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(updatedExerciseGroupTemplate, {groups: ["admin"]}));
    });

    test("bad request - index is not a number", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({index: "a"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const originalExerciseGroupTemplate = await repo.findOne({
        index: exerciseGroupTemplate.index,
        workoutId: exerciseGroupTemplate.workoutId,
      });
      expect(originalExerciseGroupTemplate).not.toBeUndefined();
    });

    test("bad request - index is less than 0", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({index: -1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - index is greater than int16", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({index: 32768});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - workoutId is not uuid", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({workoutId: "notauuid"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const originalExerciseGroupTemplate = await repo.findOne({
        index: exerciseGroupTemplate.index,
        workoutId: exerciseGroupTemplate.workoutId,
      });
      expect(originalExerciseGroupTemplate).not.toBeUndefined();
    });

    test("bad request - workout template with workoutId does not exist", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({workoutId: randomUUID()});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const originalExerciseGroupTemplate = await repo.findOne({
        index: exerciseGroupTemplate.index,
        workoutId: exerciseGroupTemplate.workoutId,
      });
      expect(originalExerciseGroupTemplate).not.toBeUndefined();
    });

    test("not found request - exercise group template with id doesnt exist", async () => {
      const res = await request(app.getHttpServer())
        .patch(createUrl(randomUUID()))
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({index: newIndex});

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      const originalExerciseGroupTemplate = await repo.findOne({
        index: exerciseGroupTemplate.index,
        workoutId: exerciseGroupTemplate.workoutId,
      });
      expect(originalExerciseGroupTemplate).not.toBeUndefined();
    });

    test("unauthorized request - missing token", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Accept", "application/json")
        .send({index: newIndex});

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const updatedExerciseGroupTemplate = await repo.findOne({
        index: newIndex,
        workoutId: exerciseGroupTemplate.workoutId,
      });
      expect(updatedExerciseGroupTemplate).toBeUndefined();
    });

    test("unauthorized request - malformed token", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}awdadioj`)
        .set("Accept", "application/json")
        .send({index: newIndex});

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const updatedExerciseGroupTemplate = await repo.findOne({
        index: newIndex,
        workoutId: exerciseGroupTemplate.workoutId,
      });
      expect(updatedExerciseGroupTemplate).toBeUndefined();
    });

    test("unauthorized request - non admin user", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${userAccessToken}`)
        .set("Accept", "application/json")
        .send({index: newIndex});

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      const updatedExerciseGroupTemplate = await repo.findOne({
        index: newIndex,
        workoutId: exerciseGroupTemplate.workoutId,
      });
      expect(updatedExerciseGroupTemplate).toBeUndefined();
    });

    test("unauthorized request - expired token", async () => {
      expireToken(adminAccessToken);
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({index: newIndex});

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const updatedExerciseGroupTemplate = await repo.findOne({
        index: newIndex,
        workoutId: exerciseGroupTemplate.workoutId,
      });
      expect(updatedExerciseGroupTemplate).toBeUndefined();
    });
  });

  describe("DELETE - Admin ExerciseGroupTemplate", () => {
    let url: string;
    let user: User;
    let userAccessToken: string;
    let adminAccessToken: string;
    let exerciseGroupTemplate: ExerciseGroupTemplate;
    const createUrl = (exerciseGroupId: string) => `/api/v1/templates/exercise-groups/${exerciseGroupId}`;

    beforeEach(async () => {
      [user, userAccessToken] = await createUserAndToken();
      [, adminAccessToken] = await createAdminUserAndToken();
      const [userWorkoutTemplate] = await createWorkoutTemplatesForUser(user);
      exerciseGroupTemplate = await addExerciseGroupTemplate(userWorkoutTemplate);
      url = createUrl(exerciseGroupTemplate.id);
    });

    test("successful request", async () => {
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const deletedExerciseGroupTemplate = await repo.findOne(exerciseGroupTemplate.id, {withDeleted: true});
      expect(deletedExerciseGroupTemplate).toBeUndefined();
      expect(res.body).toStrictEqual({});
    });

    test("not found request - exercise group template with id doesnt exist", async () => {
      const res = await request(app.getHttpServer())
        .delete(createUrl(randomUUID()))
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      const notDeletedExerciseGroupTemplate = await repo.findOne(exerciseGroupTemplate.id);
      expect(notDeletedExerciseGroupTemplate).not.toBeUndefined();
    });

    test("bad request - exerciseGroupId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .delete(createUrl("notauuid"))
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const notDeletedExerciseGroupTemplate = await repo.findOne(exerciseGroupTemplate.id);
      expect(notDeletedExerciseGroupTemplate).not.toBeUndefined();
    });

    test("unauthorized request - missing token", async () => {
      const res = await request(app.getHttpServer()).delete(url).set("Accept", "application/json").send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const notDeletedExerciseGroupTemplate = await repo.findOne(exerciseGroupTemplate.id);
      expect(notDeletedExerciseGroupTemplate).not.toBeUndefined();
    });

    test("unauthorized request - malformed token", async () => {
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${adminAccessToken}awdadioj`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const notDeletedExerciseGroupTemplate = await repo.findOne(exerciseGroupTemplate.id);
      expect(notDeletedExerciseGroupTemplate).not.toBeUndefined();
    });

    test("unauthorized request - non admin user", async () => {
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${userAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      const notDeletedExerciseGroupTemplate = await repo.findOne(exerciseGroupTemplate.id);
      expect(notDeletedExerciseGroupTemplate).not.toBeUndefined();
    });

    test("unauthorized request - expired token", async () => {
      expireToken(adminAccessToken);
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const notDeletedExerciseGroupTemplate = await repo.findOne(exerciseGroupTemplate.id);
      expect(notDeletedExerciseGroupTemplate).not.toBeUndefined();
    });
  });
});
