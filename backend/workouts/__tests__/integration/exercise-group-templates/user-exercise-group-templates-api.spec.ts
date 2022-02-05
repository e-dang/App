import {HttpStatus, INestApplication} from "@nestjs/common";
import {Test} from "@nestjs/testing";
import {AppModule} from "@src/app.module";
import {appGlobalsSetup} from "@src/app.setup";
import {ExerciseGroupTemplate} from "@exercise-group-templates/entities/exercise-group-template.entity";
import {Connection, DeepPartial, EntityManager, QueryRunner, Repository} from "typeorm";
import MockDate from "mockdate";
import {User} from "@core/entities/user.entity";
import {WorkoutTemplate} from "@workout-templates/entities/workout-template.entity";
import request from "supertest";
import {randomUUID} from "crypto";
import _ from "lodash";
import {Response} from "@core/types";
import {instanceToPlain} from "class-transformer";
import {
  addExerciseGroupTemplate,
  addExerciseTemplate,
  createAdminUserAndToken,
  createExerciseGroupTemplateData,
  createExerciseTypesForUser,
  createUserAndToken,
  createWorkoutTemplatesForUser,
  expireToken,
} from "../utils";

describe("User scoped ExerciseGroupTemplates api", () => {
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

  describe("LIST - User ExerciseGroupTemplates", () => {
    let url: string;
    let user: User;
    let accessToken: string;
    const createUrl = (ownerId: string) => `/api/v1/templates/${ownerId}/exercise-groups`;
    let exerciseGroups: ExerciseGroupTemplate[];

    beforeEach(async () => {
      [user, accessToken] = await createUserAndToken();
      const [workoutTemplate] = await createWorkoutTemplatesForUser(user);
      exerciseGroups = [];
      exerciseGroups.push(await addExerciseGroupTemplate(workoutTemplate));
      exerciseGroups.push(await addExerciseGroupTemplate(workoutTemplate, {index: 1}));
      url = createUrl(user.id);
    });

    test("successful request - owner", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<ExerciseGroupTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(exerciseGroups, {groups: ["user"]}));
    });

    test("successful request - admin", async () => {
      const [, adminAccessToken] = await createAdminUserAndToken();
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<ExerciseGroupTemplate>).data;

      expect(payload).toStrictEqual(instanceToPlain(exerciseGroups, {groups: ["user"]}));
    });

    test("unauthorized request - missing token", async () => {
      const res = await request(app.getHttpServer()).get(url).set("Accept", "application/json").send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    test("unauthorized request - malformed token", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${accessToken}awdadioj`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    test("unauthorized request - expired token", async () => {
      expireToken(accessToken);
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    test("forbidden request - requestor is not owner of the resource", async () => {
      const [, wrongAccessToken] = await createUserAndToken();
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${wrongAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
    });
  });

  describe("DETAIL - User ExerciseGroupTemplates", () => {
    let url: string;
    let user: User;
    let accessToken: string;
    const createUrl = (ownerId: string, exerciseGroupId: string) =>
      `/api/v1/templates/${ownerId}/exercise-groups/${exerciseGroupId}`;
    let exerciseGroup: ExerciseGroupTemplate;

    beforeEach(async () => {
      [user, accessToken] = await createUserAndToken();
      const [workoutTemplate] = await createWorkoutTemplatesForUser(user);
      exerciseGroup = await addExerciseGroupTemplate(workoutTemplate);
      url = createUrl(user.id, exerciseGroup.id);
    });

    test("successful request - owner", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<ExerciseGroupTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(exerciseGroup, {groups: ["user"]}));
    });

    test("successful request - admin", async () => {
      const [, adminAccessToken] = await createAdminUserAndToken();
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<ExerciseGroupTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(exerciseGroup, {groups: ["user"]}));
    });

    test("bad request - exerciseGroupId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .get(createUrl(user.id, "notauuid"))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("not found request - exercise group template with id does not exist", async () => {
      const res = await request(app.getHttpServer())
        .get(createUrl(user.id, randomUUID()))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    test("not found request - exercise group template with id belonging to user does not exist", async () => {
      const [secondUser] = await createUserAndToken();
      const [secondUserWorkoutTemplate] = await createWorkoutTemplatesForUser(secondUser);
      const secondUserExerciseGroupTemplate = await addExerciseGroupTemplate(secondUserWorkoutTemplate);
      const res = await request(app.getHttpServer())
        .get(createUrl(user.id, secondUserExerciseGroupTemplate.id))
        .set("Authorization", `Token ${accessToken}`)
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
        .set("Authorization", `Token ${accessToken}awdadioj`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    test("unauthorized request - expired token", async () => {
      expireToken(accessToken);
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    test("forbidden request - requestor is not owner of the resource", async () => {
      const [, wrongAccessToken] = await createUserAndToken();
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${wrongAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
    });
  });

  describe("CREATE - User ExerciseGroupTemplates", () => {
    let url: string;
    let user: User;
    let accessToken: string;
    const createUrl = (ownerId: string) => `/api/v1/templates/${ownerId}/exercise-groups/`;
    let workoutTemplate: WorkoutTemplate;
    let exerciseGroupData: DeepPartial<ExerciseGroupTemplate>;

    beforeEach(async () => {
      [user, accessToken] = await createUserAndToken();
      [workoutTemplate] = await createWorkoutTemplatesForUser(user);
      exerciseGroupData = createExerciseGroupTemplateData({workoutId: workoutTemplate.id});
      url = createUrl(user.id);
    });

    test("successful request - owner", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(exerciseGroupData);

      expect(res.statusCode).toBe(HttpStatus.CREATED);
      const exerciseGroupTemplate = await repo.findOne({index: exerciseGroupData.index, workoutId: workoutTemplate.id});
      expect(exerciseGroupTemplate).not.toBeUndefined();
      const payload = (res.body as Response<ExerciseGroupTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(exerciseGroupTemplate, {groups: ["user"]}));
    });

    test("successful request - admin", async () => {
      const [, adminAccessToken] = await createAdminUserAndToken();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(exerciseGroupData);

      expect(res.statusCode).toBe(HttpStatus.CREATED);
      const exerciseGroupTemplate = await repo.findOne({index: exerciseGroupData.index, workoutId: workoutTemplate.id});
      expect(exerciseGroupTemplate).not.toBeUndefined();
      const payload = (res.body as Response<ExerciseGroupTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(exerciseGroupTemplate, {groups: ["user"]}));
    });

    test("bad request - index is missing", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(_.omit(exerciseGroupData, "index"));

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const exerciseGroupTemplate = await repo.findOne({index: exerciseGroupData.index, workoutId: workoutTemplate.id});
      expect(exerciseGroupTemplate).toBeUndefined();
    });

    test("bad request - index is less than 0", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseGroupData, index: -1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - index is greater than int16", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseGroupData, index: 32768});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - index is not a number", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseGroupData, index: "a"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const exerciseGroupTemplate = await repo.findOne({index: exerciseGroupData.index, workoutId: workoutTemplate.id});
      expect(exerciseGroupTemplate).toBeUndefined();
    });

    test("bad request - workoutId is missing", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(_.omit(exerciseGroupData, "workoutId"));

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const exerciseGroupTemplate = await repo.findOne({index: exerciseGroupData.index, workoutId: workoutTemplate.id});
      expect(exerciseGroupTemplate).toBeUndefined();
    });

    test("bad request - workoutId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseGroupData, workoutId: "noauuid"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const exerciseGroupTemplate = await repo.findOne({index: exerciseGroupData.index, workoutId: workoutTemplate.id});
      expect(exerciseGroupTemplate).toBeUndefined();
    });

    test("bad request - workout template with workoutId does not exist", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseGroupData, workoutId: randomUUID()});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const exerciseGroupTemplate = await repo.findOne({index: exerciseGroupData.index, workoutId: workoutTemplate.id});
      expect(exerciseGroupTemplate).toBeUndefined();
    });

    test("bad request - workout template with id belonging to user does not exist", async () => {
      const [secondUser] = await createUserAndToken();
      const [secondUserWorkoutTemplate] = await createWorkoutTemplatesForUser(secondUser);
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseGroupData, workoutId: secondUserWorkoutTemplate.id});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const exerciseGroupTemplate = await repo.findOne({index: exerciseGroupData.index, workoutId: workoutTemplate.id});
      expect(exerciseGroupTemplate).toBeUndefined();
    });

    test("unauthorized request - missing token", async () => {
      const res = await request(app.getHttpServer()).post(url).set("Accept", "application/json").send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const exerciseGroupTemplate = await repo.findOne({index: exerciseGroupData.index, workoutId: workoutTemplate.id});
      expect(exerciseGroupTemplate).toBeUndefined();
    });

    test("unauthorized request - malformed token", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}awdadioj`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const exerciseGroupTemplate = await repo.findOne({index: exerciseGroupData.index, workoutId: workoutTemplate.id});
      expect(exerciseGroupTemplate).toBeUndefined();
    });

    test("unauthorized request - expired token", async () => {
      expireToken(accessToken);
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const exerciseGroupTemplate = await repo.findOne({index: exerciseGroupData.index, workoutId: workoutTemplate.id});
      expect(exerciseGroupTemplate).toBeUndefined();
    });

    test("forbidden request - requestor is not owner of the resource", async () => {
      const [, wrongAccessToken] = await createUserAndToken();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${wrongAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      const exerciseGroupTemplate = await repo.findOne({index: exerciseGroupData.index, workoutId: workoutTemplate.id});
      expect(exerciseGroupTemplate).toBeUndefined();
    });
  });

  describe("UPDATE - User ExerciseGroupTemplates", () => {
    let url: string;
    let user: User;
    let accessToken: string;
    const createUrl = (ownerId: string, exerciseGroupId: string) =>
      `/api/v1/templates/${ownerId}/exercise-groups/${exerciseGroupId}`;
    let workoutTemplate: WorkoutTemplate;
    let exerciseGroupTemplate: ExerciseGroupTemplate;
    let newIndex: number;

    beforeEach(async () => {
      [user, accessToken] = await createUserAndToken();
      [workoutTemplate] = await createWorkoutTemplatesForUser(user);
      exerciseGroupTemplate = await addExerciseGroupTemplate(workoutTemplate);
      url = createUrl(user.id, exerciseGroupTemplate.id);
      newIndex = exerciseGroupTemplate.index + 1;
    });

    test("successful request - owner", async () => {
      const [exerciseType] = await createExerciseTypesForUser(user);
      const exerciseTemplate = await addExerciseTemplate(exerciseGroupTemplate, exerciseType, 0);
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({exercises: [exerciseTemplate]});

      expect(res.statusCode).toBe(HttpStatus.OK);
      const updatedExerciseGroupTemplate = await repo.findOne(exerciseGroupTemplate.id, {relations: ["exercises"]});
      const payload = (res.body as Response<ExerciseGroupTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(updatedExerciseGroupTemplate, {groups: ["user"]}));
    });

    test("successful request - admin", async () => {
      const [exerciseType] = await createExerciseTypesForUser(user);
      const exerciseTemplate = await addExerciseTemplate(exerciseGroupTemplate, exerciseType, 0);
      const [, adminAccessToken] = await createAdminUserAndToken();
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({exercises: [exerciseTemplate]});

      expect(res.statusCode).toBe(HttpStatus.OK);
      const updatedExerciseGroupTemplate = await repo.findOne(exerciseGroupTemplate.id, {relations: ["exercises"]});
      const payload = (res.body as Response<ExerciseGroupTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(updatedExerciseGroupTemplate, {groups: ["user"]}));
    });

    test("bad request - index is not a number", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({index: "a"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const notUpdatedExerciseGroupTemplate = await repo.findOne({
        index: exerciseGroupTemplate.index,
        workoutId: workoutTemplate.id,
      });
      expect(notUpdatedExerciseGroupTemplate).not.toBeUndefined();
    });

    test("bad request - index is less than 0", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({index: -1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - index is greater than int16", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({index: 32768});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - workoutId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({workoutId: "notauuid"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const notUpdatedExerciseGroupTemplate = await repo.findOne({
        index: exerciseGroupTemplate.index,
        workoutId: workoutTemplate.id,
      });
      expect(notUpdatedExerciseGroupTemplate).not.toBeUndefined();
    });

    test("bad request - workout template with workoutId doesnt exist for user", async () => {
      const [user2] = await createUserAndToken();
      const [user2WorkoutTemplate] = await createWorkoutTemplatesForUser(user2);
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({workoutId: user2WorkoutTemplate.id});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const notUpdatedExerciseGroupTemplate = await repo.findOne({
        index: exerciseGroupTemplate.index,
        workoutId: workoutTemplate.id,
      });
      expect(notUpdatedExerciseGroupTemplate).not.toBeUndefined();
    });

    test("bad request - exerciseGroupId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .patch(createUrl(user.id, "notauuid"))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({index: newIndex});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const notUpdatedExerciseGroupTemplate = await repo.findOne({
        index: newIndex,
        workoutId: workoutTemplate.id,
      });
      expect(notUpdatedExerciseGroupTemplate).toBeUndefined();
    });

    test("not found request - exercise group template with id does not exist", async () => {
      const res = await request(app.getHttpServer())
        .patch(createUrl(user.id, randomUUID()))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({index: newIndex});

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      const notUpdatedExerciseGroupTemplate = await repo.findOne({
        index: newIndex,
        workoutId: workoutTemplate.id,
      });
      expect(notUpdatedExerciseGroupTemplate).toBeUndefined();
    });

    test("not found request - exercise group template with id belonging to user does not exist", async () => {
      const [secondUser] = await createUserAndToken();
      const [secondUserWorkoutTemplate] = await createWorkoutTemplatesForUser(secondUser);
      const secondUserExerciseGroupTemplate = await addExerciseGroupTemplate(secondUserWorkoutTemplate);
      const res = await request(app.getHttpServer())
        .patch(createUrl(user.id, secondUserExerciseGroupTemplate.id))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({index: newIndex});

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      const notUpdatedExerciseGroupTemplate = await repo.findOne({
        index: newIndex,
        workoutId: workoutTemplate.id,
      });
      expect(notUpdatedExerciseGroupTemplate).toBeUndefined();
    });

    test("unauthorized request - missing token", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Accept", "application/json")
        .send({index: newIndex});

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const notUpdateExerciseGroupTemplate = await repo.findOne({
        index: newIndex,
        workoutId: workoutTemplate.id,
      });
      expect(notUpdateExerciseGroupTemplate).toBeUndefined();
    });

    test("unauthorized request - malformed token", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}awdadioj`)
        .set("Accept", "application/json")
        .send({index: newIndex});

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const notUpdateExerciseGroupTemplate = await repo.findOne({
        index: newIndex,
        workoutId: workoutTemplate.id,
      });
      expect(notUpdateExerciseGroupTemplate).toBeUndefined();
    });

    test("unauthorized request - expired token", async () => {
      expireToken(accessToken);
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({index: newIndex});

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const notUpdateExerciseGroupTemplate = await repo.findOne({
        index: newIndex,
        workoutId: workoutTemplate.id,
      });
      expect(notUpdateExerciseGroupTemplate).toBeUndefined();
    });

    test("forbidden request - requestor is not owner of the resource", async () => {
      const [, wrongAccessToken] = await createUserAndToken();
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${wrongAccessToken}`)
        .set("Accept", "application/json")
        .send({index: newIndex});

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      const notUpdateExerciseGroupTemplate = await repo.findOne({
        index: newIndex,
        workoutId: workoutTemplate.id,
      });
      expect(notUpdateExerciseGroupTemplate).toBeUndefined();
    });
  });

  describe("DELETE - User ExerciseGroupTemplates", () => {
    let url: string;
    let user: User;
    let accessToken: string;
    const createUrl = (ownerId: string, exerciseGroupId: string) =>
      `/api/v1/templates/${ownerId}/exercise-groups/${exerciseGroupId}`;
    let exerciseGroup: ExerciseGroupTemplate;

    beforeEach(async () => {
      [user, accessToken] = await createUserAndToken();
      const [workoutTemplate] = await createWorkoutTemplatesForUser(user);
      exerciseGroup = await addExerciseGroupTemplate(workoutTemplate);
      url = createUrl(user.id, exerciseGroup.id);
    });
    test("successful request - owner", async () => {
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const deletedExerciseGroup = await repo.findOne(exerciseGroup.id, {withDeleted: true});
      expect(deletedExerciseGroup).toBeUndefined();
      expect(res.body).toStrictEqual({});
    });

    test("successful request - admin", async () => {
      const [, adminAccessToken] = await createAdminUserAndToken();
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const deletedExerciseGroup = await repo.findOne(exerciseGroup.id, {withDeleted: true});
      expect(deletedExerciseGroup).toBeUndefined();
      expect(res.body).toStrictEqual({});
    });

    test("bad request - exerciseGroupId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .delete(createUrl(user.id, "notauuid"))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const deletedExerciseGroup = await repo.findOne(exerciseGroup.id, {withDeleted: true});
      expect(deletedExerciseGroup).not.toBeUndefined();
    });

    test("not found - no exercise group template with id exists", async () => {
      const res = await request(app.getHttpServer())
        .delete(createUrl(user.id, randomUUID()))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      const deletedExerciseGroup = await repo.findOne(exerciseGroup.id, {withDeleted: true});
      expect(deletedExerciseGroup).not.toBeUndefined();
    });

    test("not found - no exercise group template with id belonging to user exists", async () => {
      const [secondUser] = await createUserAndToken();
      const [secondUserWorkoutTemplate] = await createWorkoutTemplatesForUser(secondUser);
      const secondUserExerciseGroupTemplate = await addExerciseGroupTemplate(secondUserWorkoutTemplate);
      const res = await request(app.getHttpServer())
        .delete(createUrl(user.id, secondUserExerciseGroupTemplate.id))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      const deletedExerciseGroup = await repo.findOne(exerciseGroup.id, {withDeleted: true});
      expect(deletedExerciseGroup).not.toBeUndefined();
    });

    test("unauthorized request - missing token", async () => {
      const res = await request(app.getHttpServer()).delete(url).set("Accept", "application/json").send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const deletedExerciseGroup = await repo.findOne(exerciseGroup.id);
      expect(deletedExerciseGroup).not.toBeUndefined();
    });

    test("unauthorized request - malformed token", async () => {
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${accessToken}awdadioj`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const deletedExerciseGroup = await repo.findOne(exerciseGroup.id);
      expect(deletedExerciseGroup).not.toBeUndefined();
    });

    test("unauthorized request - expired token", async () => {
      expireToken(accessToken);
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const deletedExerciseGroup = await repo.findOne(exerciseGroup.id);
      expect(deletedExerciseGroup).not.toBeUndefined();
    });

    test("forbidden request - requestor is not owner of the resource", async () => {
      const [, wrongAccessToken] = await createUserAndToken();
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${wrongAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      const deletedExerciseGroup = await repo.findOne(exerciseGroup.id);
      expect(deletedExerciseGroup).not.toBeUndefined();
    });
  });
});
