import {ExerciseTemplate} from "@exercise-templates/entities/exercise-template.entity";
import {HttpStatus, INestApplication} from "@nestjs/common";
import {Test} from "@nestjs/testing";
import {AppModule} from "@src/app.module";
import {appGlobalsSetup} from "@src/app.setup";
import {Connection, DeepPartial, EntityManager, QueryRunner, Repository} from "typeorm";
import MockDate from "mockdate";
import {User} from "@core/entities/user.entity";
import request from "supertest";
import {Response} from "@core/types";
import {instanceToPlain} from "class-transformer";
import _ from "lodash";
import {randomUUID} from "crypto";
import {
  addExerciseGroupTemplate,
  addExerciseTemplate,
  createAdminUserAndToken,
  createExerciseTemplateData,
  createExerciseTypesForUser,
  createUserAndToken,
  createWorkoutTemplatesForUser,
  expireToken,
} from "../utils";

describe("User scoped ExerciseTemplates api", () => {
  let app: INestApplication;
  let queryRunner: QueryRunner;
  let repo: Repository<ExerciseTemplate>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    appGlobalsSetup(app);
    await app.init();
    const dbConnection = moduleRef.get(Connection);
    const manager = moduleRef.get(EntityManager);
    repo = manager.getRepository(ExerciseTemplate);
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

  describe("LIST - User ExerciseTemplates", () => {
    let url: string;
    let user: User;
    let accessToken: string;
    const createUrl = (ownerId: string) => `/api/v1/templates/${ownerId}/exercises`;
    let exercises: ExerciseTemplate[];

    beforeEach(async () => {
      [user, accessToken] = await createUserAndToken();
      const [workoutTemplate] = await createWorkoutTemplatesForUser(user);
      const [exerciseType1, exerciseType2] = await createExerciseTypesForUser(user);
      const exerciseGroup = await addExerciseGroupTemplate(workoutTemplate);
      exercises = [];
      exercises.push(await addExerciseTemplate(exerciseGroup, exerciseType1, 0));
      exercises.push(await addExerciseTemplate(exerciseGroup, exerciseType2, 1));
      url = createUrl(user.id);
    });

    test("successful request - owner", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<ExerciseTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(exercises, {groups: ["user"]}));
    });

    test("successful request - admin", async () => {
      const [, adminAccessToken] = await createAdminUserAndToken();
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<ExerciseTemplate>).data;

      expect(payload).toStrictEqual(instanceToPlain(exercises, {groups: ["user"]}));
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

  describe("DETAIL - User ExerciseTemplates", () => {
    let url: string;
    let user: User;
    let accessToken: string;
    const createUrl = (ownerId: string, exerciseId: string) => `/api/v1/templates/${ownerId}/exercises/${exerciseId}`;
    let exerciseTemplate: ExerciseTemplate;

    beforeEach(async () => {
      [user, accessToken] = await createUserAndToken();
      const [workoutTemplate] = await createWorkoutTemplatesForUser(user);
      const [exerciseType] = await createExerciseTypesForUser(user);
      const exerciseGroup = await addExerciseGroupTemplate(workoutTemplate);
      exerciseTemplate = await addExerciseTemplate(exerciseGroup, exerciseType, 0);
      url = createUrl(user.id, exerciseTemplate.id);
    });

    test("successful request - owner", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<ExerciseTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(exerciseTemplate, {groups: ["user"]}));
    });

    test("successful request - admin", async () => {
      const [, adminAccessToken] = await createAdminUserAndToken();
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<ExerciseTemplate>).data;

      expect(payload).toStrictEqual(instanceToPlain(exerciseTemplate, {groups: ["user"]}));
    });

    test("bad request - exerciseId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .get(createUrl(user.id, "notauuid"))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("not found request - exercise template with exerciseId does not exist", async () => {
      const res = await request(app.getHttpServer())
        .get(createUrl(user.id, randomUUID()))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    test("not found request - exercise template with exerciseId does not exist for requesting user", async () => {
      const [user2] = await createUserAndToken();
      const [workoutTemplate] = await createWorkoutTemplatesForUser(user2);
      const [exerciseType] = await createExerciseTypesForUser(user2);
      const exerciseGroup = await addExerciseGroupTemplate(workoutTemplate);
      const user2ExericseTemplate = await addExerciseTemplate(exerciseGroup, exerciseType, 0);
      const res = await request(app.getHttpServer())
        .get(createUrl(user.id, user2ExericseTemplate.id))
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

  describe("CREATE - User ExerciseTemplates", () => {
    let url: string;
    let user: User;
    let accessToken: string;
    const createUrl = (ownerId: string) => `/api/v1/templates/${ownerId}/exercises`;
    let exerciseTemplateData: DeepPartial<ExerciseTemplate>;

    beforeEach(async () => {
      [user, accessToken] = await createUserAndToken();
      const [workoutTemplate] = await createWorkoutTemplatesForUser(user);
      const [exerciseType] = await createExerciseTypesForUser(user);
      const exerciseGroup = await addExerciseGroupTemplate(workoutTemplate);
      exerciseTemplateData = createExerciseTemplateData(0, {
        exerciseGroupId: exerciseGroup.id,
        typeId: exerciseType.id,
      });
      url = createUrl(user.id);
    });

    test("successful request - owner", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(exerciseTemplateData);

      expect(res.statusCode).toBe(HttpStatus.CREATED);
      const exerciseTemplate = await repo.findOne({
        index: exerciseTemplateData.index,
        exerciseGroupId: exerciseTemplateData.exerciseGroupId,
        typeId: exerciseTemplateData.typeId,
      });
      expect(exerciseTemplate).not.toBeUndefined();
      const payload = (res.body as Response<ExerciseTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(exerciseTemplate, {groups: ["user"]}));
    });

    test("successful request - admin", async () => {
      const [, adminAccessToken] = await createAdminUserAndToken();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(exerciseTemplateData);

      expect(res.statusCode).toBe(HttpStatus.CREATED);
      const exerciseTemplate = await repo.findOne({
        index: exerciseTemplateData.index,
        exerciseGroupId: exerciseTemplateData.exerciseGroupId,
        typeId: exerciseTemplateData.typeId,
      });
      expect(exerciseTemplate).not.toBeUndefined();
      const payload = (res.body as Response<ExerciseTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(exerciseTemplate, {groups: ["user"]}));
    });

    test("bad request - unit is missing", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(_.omit(exerciseTemplateData, "unit"));

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - unit is not a proper Unit Enum", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, unit: "pound"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - index is less than 0", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, index: -1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - index is greater than int16", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, index: 32768});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - index is not a number", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, index: "a"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - targetReps is less than 0", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, targetReps: -1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - targetReps is greater than int16", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, targetReps: 32768});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - targetReps is not a number", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, targetReps: "a"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - targetSets is less than 0", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, targetSets: -1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - targetSets is greater than int16", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, targetSets: 32768});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - targetSets is not a number", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, targetSets: "a"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - targetWeight is less than 0", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, targetWeight: -1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - targetWeight is greater than int16", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, targetWeight: 32768});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - targetWeight is not a number", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, targetWeight: "a"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad requets - the requesting user does not own the exercise type", async () => {
      const [user2] = await createUserAndToken();
      const [user2ExerciseType] = await createExerciseTypesForUser(user2);
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, typeId: user2ExerciseType});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - the requesting user does not own the exercise group", async () => {
      const [user2] = await createUserAndToken();
      const [workoutTemplate] = await createWorkoutTemplatesForUser(user2);
      const user2ExerciseGroupTemplate = await addExerciseGroupTemplate(workoutTemplate);
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, exerciseGroupId: user2ExerciseGroupTemplate.id});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("unauthorized request - missing token", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send(exerciseTemplateData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const exerciseTemplate = await repo.findOne({
        index: exerciseTemplateData.index,
        exerciseGroupId: exerciseTemplateData.exerciseGroupId,
        typeId: exerciseTemplateData.typeId,
      });
      expect(exerciseTemplate).toBeUndefined();
    });

    test("unauthorized request - malformed token", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}awdadioj`)
        .set("Accept", "application/json")
        .send(exerciseTemplateData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const exerciseTemplate = await repo.findOne({
        index: exerciseTemplateData.index,
        exerciseGroupId: exerciseTemplateData.exerciseGroupId,
        typeId: exerciseTemplateData.typeId,
      });
      expect(exerciseTemplate).toBeUndefined();
    });

    test("unauthorized request - expired token", async () => {
      expireToken(accessToken);
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(exerciseTemplateData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const exerciseTemplate = await repo.findOne({
        index: exerciseTemplateData.index,
        exerciseGroupId: exerciseTemplateData.exerciseGroupId,
        typeId: exerciseTemplateData.typeId,
      });
      expect(exerciseTemplate).toBeUndefined();
    });

    test("forbidden request - requestor is not owner of the resource", async () => {
      const [, wrongAccessToken] = await createUserAndToken();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${wrongAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      const exerciseTemplate = await repo.findOne({
        index: exerciseTemplateData.index,
        exerciseGroupId: exerciseTemplateData.exerciseGroupId,
        typeId: exerciseTemplateData.typeId,
      });
      expect(exerciseTemplate).toBeUndefined();
    });
  });

  describe("UPDATE - User ExerciseTemplates", () => {
    let url: string;
    let user: User;
    let accessToken: string;
    const createUrl = (ownerId: string, exerciseId: string) => `/api/v1/templates/${ownerId}/exercises/${exerciseId}`;
    let exerciseTemplate: ExerciseTemplate;
    let updateData: DeepPartial<ExerciseTemplate>;

    beforeEach(async () => {
      [user, accessToken] = await createUserAndToken();
      const [workoutTemplate] = await createWorkoutTemplatesForUser(user);
      const [exerciseType] = await createExerciseTypesForUser(user);
      const exerciseGroup = await addExerciseGroupTemplate(workoutTemplate);
      exerciseTemplate = await addExerciseTemplate(exerciseGroup, exerciseType, 0);
      url = createUrl(user.id, exerciseTemplate.id);
      updateData = {
        targetReps: exerciseTemplate.targetReps + 1,
      };
    });

    test("successful request - owner", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(updateData);

      expect(res.statusCode).toBe(HttpStatus.OK);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).toBe(updateData.targetReps);
      const payload = (res.body as Response<ExerciseTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(updatedExerciseTemplate, {groups: ["user"]}));
    });

    test("successful request - admin", async () => {
      const [, adminAccessToken] = await createAdminUserAndToken();
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(updateData);

      expect(res.statusCode).toBe(HttpStatus.OK);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).toBe(updateData.targetReps);
      const payload = (res.body as Response<ExerciseTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(updatedExerciseTemplate, {groups: ["user"]}));
    });

    test("bad request - exerciseId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .patch(createUrl(user.id, "notauuid"))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(updateData);

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
    });

    test("not found request - exercise template with exerciseId does not exist", async () => {
      const res = await request(app.getHttpServer())
        .patch(createUrl(user.id, randomUUID()))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(updateData);

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
    });

    test("not found request - exercise template with exerciseId does not exist for requesting user", async () => {
      const [user2] = await createUserAndToken();
      const [workoutTemplate] = await createWorkoutTemplatesForUser(user2);
      const [exerciseType] = await createExerciseTypesForUser(user2);
      const exerciseGroup = await addExerciseGroupTemplate(workoutTemplate);
      const user2ExericseTemplate = await addExerciseTemplate(exerciseGroup, exerciseType, 0);
      const res = await request(app.getHttpServer())
        .patch(createUrl(user.id, user2ExericseTemplate.id))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(updateData);

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
    });

    test("bad request - index is less than 0", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...updateData, index: -1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
    });

    test("bad request - index is greater than int16", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...updateData, index: 32768});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
    });

    test("bad request - index is not a number", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...updateData, index: "a"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
    });

    test("bad request - targetReps is less than 0", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...updateData, targetReps: -1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
    });

    test("bad request - targetReps is greater than int16", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...updateData, targetReps: 32768});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
    });

    test("bad request - targetReps is not a number", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...updateData, targetReps: "a"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
    });

    test("bad request - targetSets is less than 0", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...updateData, targetSets: -1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
    });

    test("bad request - targetSets is greater than int16", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...updateData, targetSets: 32768});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
    });

    test("bad request - targetSets is not a number", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...updateData, targetSets: "a"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
    });

    test("bad request - targetWeight is less than 0", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...updateData, targetWeight: -1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
    });

    test("bad request - targetWeight is greater than int16", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...updateData, targetWeight: 32768});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
    });

    test("bad request - targetWeight is not a number", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...updateData, targetWeight: "a"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
    });

    test("bad requets - the requesting user does not own the exercise type", async () => {
      const [user2] = await createUserAndToken();
      const [user2ExerciseType] = await createExerciseTypesForUser(user2);
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...updateData, typeId: user2ExerciseType});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
    });

    test("bad request - the requesting user does not own the exercise group", async () => {
      const [user2] = await createUserAndToken();
      const [workoutTemplate] = await createWorkoutTemplatesForUser(user2);
      const user2ExerciseGroupTemplate = await addExerciseGroupTemplate(workoutTemplate);
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...updateData, exerciseGroupId: user2ExerciseGroupTemplate.id});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
    });

    test("unauthorized request - missing token", async () => {
      const res = await request(app.getHttpServer()).patch(url).set("Accept", "application/json").send(updateData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
    });

    test("unauthorized request - malformed token", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}awdadioj`)
        .set("Accept", "application/json")
        .send(updateData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
    });

    test("unauthorized request - expired token", async () => {
      expireToken(accessToken);
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(updateData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
    });

    test("forbidden request - requestor is not owner of the resource", async () => {
      const [, wrongAccessToken] = await createUserAndToken();
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${wrongAccessToken}`)
        .set("Accept", "application/json")
        .send(updateData);

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
    });
  });

  describe("DELETE - User ExerciseTemplates", () => {
    let url: string;
    let user: User;
    let accessToken: string;
    const createUrl = (ownerId: string, exerciseId: string) => `/api/v1/templates/${ownerId}/exercises/${exerciseId}`;
    let exerciseTemplate: ExerciseTemplate;

    beforeEach(async () => {
      [user, accessToken] = await createUserAndToken();
      const [workoutTemplate] = await createWorkoutTemplatesForUser(user);
      const [exerciseType] = await createExerciseTypesForUser(user);
      const exerciseGroup = await addExerciseGroupTemplate(workoutTemplate);
      exerciseTemplate = await addExerciseTemplate(exerciseGroup, exerciseType, 0);
      url = createUrl(user.id, exerciseTemplate.id);
    });

    test("successful request - owner", async () => {
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const deletedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(deletedExerciseTemplate).toBeUndefined();
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
      const deletedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(deletedExerciseTemplate).toBeUndefined();
      expect(res.body).toStrictEqual({});
    });

    test("bad request - exerciseId is not a uuid", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .delete(createUrl(user.id, "notauuid"))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("not found request - exercise template with exerciseId does not exist", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .delete(createUrl(user.id, randomUUID()))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(prevCount).toBe(await repo.count());
    });

    test("not found request - exercise template with exerciseId does not exist for requesting user", async () => {
      const [user2] = await createUserAndToken();
      const [workoutTemplate] = await createWorkoutTemplatesForUser(user2);
      const [exerciseType] = await createExerciseTypesForUser(user2);
      const exerciseGroup = await addExerciseGroupTemplate(workoutTemplate);
      const user2ExericseTemplate = await addExerciseTemplate(exerciseGroup, exerciseType, 0);
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .delete(createUrl(user.id, user2ExericseTemplate.id))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(prevCount).toBe(await repo.count());
    });

    test("unauthorized request - missing token", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer()).delete(url).set("Accept", "application/json").send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(prevCount).toBe(await repo.count());
    });

    test("unauthorized request - malformed token", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${accessToken}awdadioj`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(prevCount).toBe(await repo.count());
    });

    test("unauthorized request - expired token", async () => {
      const prevCount = await repo.count();
      expireToken(accessToken);
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(prevCount).toBe(await repo.count());
    });

    test("forbidden request - requestor is not owner of the resource", async () => {
      const prevCount = await repo.count();
      const [, wrongAccessToken] = await createUserAndToken();
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${wrongAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      expect(prevCount).toBe(await repo.count());
    });
  });
});
