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

describe("Admin scoped ExerciseTemplates api", () => {
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

  describe("LIST - Admin ExerciseTemplates", () => {
    const url = "/api/v1/templates/exercises";
    let user1: User;
    let user2: User;
    let user1AccessToken: string;
    let adminAccessToken: string;
    let exerciseTemplates: ExerciseTemplate[];

    beforeEach(async () => {
      [user1, user1AccessToken] = await createUserAndToken();
      [user2] = await createUserAndToken();
      [, adminAccessToken] = await createAdminUserAndToken();
      exerciseTemplates = [];
      const [user1WorkoutTemplate] = await createWorkoutTemplatesForUser(user1);
      const [user1ExerciseType] = await createExerciseTypesForUser(user1);
      const user1ExerciseGroupTemplate = await addExerciseGroupTemplate(user1WorkoutTemplate);
      exerciseTemplates.push(await addExerciseTemplate(user1ExerciseGroupTemplate, user1ExerciseType, 0));
      exerciseTemplates.push(await addExerciseTemplate(user1ExerciseGroupTemplate, user1ExerciseType, 1));
      const [user2WorkoutTemplate] = await createWorkoutTemplatesForUser(user2);
      const [user2ExerciseType] = await createExerciseTypesForUser(user2);
      const user2ExerciseGroupTemplate = await addExerciseGroupTemplate(user2WorkoutTemplate);
      exerciseTemplates.push(await addExerciseTemplate(user2ExerciseGroupTemplate, user2ExerciseType, 0));
      exerciseTemplates.push(await addExerciseTemplate(user2ExerciseGroupTemplate, user2ExerciseType, 1));
    });

    test("successful request", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<ExerciseTemplate>).data;
      const sortedExerciseTemplates = exerciseTemplates.sort((a, b) => {
        const x = a.exerciseGroupId.localeCompare(b.exerciseGroupId);
        return x === 0 ? a.index - b.index : x;
      });
      expect(payload).toStrictEqual(instanceToPlain(sortedExerciseTemplates, {groups: ["admin"]}));
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

  describe("DETAIL - Admin ExerciseTemplates", () => {
    let url: string;
    let user: User;
    let userAccessToken: string;
    let adminAccessToken: string;
    let exerciseTemplate: ExerciseTemplate;
    const createUrl = (exerciseId: string) => `/api/v1/templates/exercises/${exerciseId}`;

    beforeEach(async () => {
      [user, userAccessToken] = await createUserAndToken();
      [, adminAccessToken] = await createAdminUserAndToken();
      const [userWorkoutTemplate] = await createWorkoutTemplatesForUser(user);
      const [exerciseType] = await createExerciseTypesForUser(user);
      const exerciseGroupTemplate = await addExerciseGroupTemplate(userWorkoutTemplate);
      exerciseTemplate = await addExerciseTemplate(exerciseGroupTemplate, exerciseType, 0);
      url = createUrl(exerciseTemplate.id);
    });

    test("successful request", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<ExerciseTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(exerciseTemplate, {groups: ["admin"]}));
    });

    test("bad request - exerciseId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .get(createUrl("notauuid"))
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("not found request - exercise template with exerciseId does not exist", async () => {
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

  describe("CREATE - Admin ExerciseTemplates", () => {
    const url = "/api/v1/templates/exercises";
    let user: User;
    let userAccessToken: string;
    let adminAccessToken: string;
    let exerciseTemplateData: DeepPartial<ExerciseTemplate>;

    beforeEach(async () => {
      [user, userAccessToken] = await createUserAndToken();
      [, adminAccessToken] = await createAdminUserAndToken();
      const [userWorkoutTemplate] = await createWorkoutTemplatesForUser(user);
      const [exerciseType] = await createExerciseTypesForUser(user);
      const exerciseGroupTemplate = await addExerciseGroupTemplate(userWorkoutTemplate);
      exerciseTemplateData = createExerciseTemplateData(0, {
        exerciseGroupId: exerciseGroupTemplate.id,
        typeId: exerciseType.id,
      });
    });

    test("successful request", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(exerciseTemplateData);

      expect(res.statusCode).toBe(HttpStatus.CREATED);
      const payload = (res.body as Response<ExerciseTemplate>).data;
      const exerciseTemplate = await repo.findOne({
        index: exerciseTemplateData.index,
        exerciseGroupId: exerciseTemplateData.exerciseGroupId,
      });
      expect(exerciseTemplate).not.toBeUndefined();
      expect(payload).toStrictEqual(instanceToPlain(exerciseTemplate, {groups: ["admin"]}));
    });

    test("bad request - index is less than 0", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, index: -1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("bad request - targetSets is less than 0", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, targetSets: -1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("bad request - targetReps is less than 0", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, targetReps: -1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("bad request - targetWeight is less than 0", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, targetWeight: -1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("bad request - index is greater than maximum smallint", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, index: 32768});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("bad request - targetSets is greater than maximum smallint", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, targetSets: 32768});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("bad request - targetReps is greater than maximum smallint", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, targetReps: 32768});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("bad request - targetWeight is greater than maximum smallint", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, targetWeight: 32768});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("bad request - typeId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, typeId: "notauuid"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("bad request - exercise type with typeId does not exist", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, typeId: randomUUID()});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("bad request - exercise type with typeId does not exist for owning user", async () => {
      const [user2] = await createUserAndToken();
      const [user2ExerciseType] = await createExerciseTypesForUser(user2);
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, typeId: user2ExerciseType.id});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("bad request - exerciseGroupId is not uuid", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, exerciseGroupId: "notauuid"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("bad request - exercise group template with exerciseGroupId does not exist", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, exerciseGroupId: randomUUID()});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("bad request - exercise group template with exerciseGroupId does not exist for owning user", async () => {
      const [user2] = await createUserAndToken();
      const [workoutTemplate] = await createWorkoutTemplatesForUser(user2);
      const exerciseGroupTemplate = await addExerciseGroupTemplate(workoutTemplate);
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTemplateData, exerciseGroupId: exerciseGroupTemplate.id});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
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
      });
      expect(exerciseTemplate).toBeUndefined();
    });

    test("unauthorized request - malformed token", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}awdadioj`)
        .set("Accept", "application/json")
        .send(exerciseTemplateData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const exerciseTemplate = await repo.findOne({
        index: exerciseTemplateData.index,
        exerciseGroupId: exerciseTemplateData.exerciseGroupId,
      });
      expect(exerciseTemplate).toBeUndefined();
    });

    test("unauthorized request - non admin user", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${userAccessToken}`)
        .set("Accept", "application/json")
        .send(exerciseTemplateData);

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      const exerciseTemplate = await repo.findOne({
        index: exerciseTemplateData.index,
        exerciseGroupId: exerciseTemplateData.exerciseGroupId,
      });
      expect(exerciseTemplate).toBeUndefined();
    });

    test("unauthorized request - expired token", async () => {
      expireToken(adminAccessToken);
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(exerciseTemplateData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const exerciseTemplate = await repo.findOne({
        index: exerciseTemplateData.index,
        exerciseGroupId: exerciseTemplateData.exerciseGroupId,
      });
      expect(exerciseTemplate).toBeUndefined();
    });
  });

  describe("UPDATE - Admin ExerciseTemplates", () => {
    let url: string;
    let user: User;
    let userAccessToken: string;
    let adminAccessToken: string;
    let exerciseTemplate: ExerciseTemplate;
    let updateData: DeepPartial<ExerciseTemplate>;
    const createUrl = (exerciseId: string) => `/api/v1/templates/exercises/${exerciseId}`;

    beforeEach(async () => {
      [user, userAccessToken] = await createUserAndToken();
      [, adminAccessToken] = await createAdminUserAndToken();
      const [userWorkoutTemplate] = await createWorkoutTemplatesForUser(user);
      const [exerciseType] = await createExerciseTypesForUser(user);
      const exerciseGroupTemplate = await addExerciseGroupTemplate(userWorkoutTemplate);
      exerciseTemplate = await addExerciseTemplate(exerciseGroupTemplate, exerciseType, 0);
      url = createUrl(exerciseTemplate.id);
      updateData = {
        targetReps: exerciseTemplate.targetReps + 1,
        targetSets: exerciseTemplate.targetSets + 1,
        targetWeight: exerciseTemplate.targetWeight + 1,
      };
    });

    test("successful request", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(updateData);

      expect(res.statusCode).toBe(HttpStatus.OK);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetSets).toBe(updateData.targetSets);
      expect(updatedExerciseTemplate.targetWeight).toBe(updateData.targetWeight);
      const payload = (res.body as Response<ExerciseTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(updatedExerciseTemplate, {groups: ["admin"]}));
    });

    test("bad request - exerciseId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .patch(createUrl("notauuid"))
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(updateData);

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
      expect(updatedExerciseTemplate.targetSets).toBe(exerciseTemplate.targetSets);
      expect(updatedExerciseTemplate.targetWeight).toBe(exerciseTemplate.targetWeight);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetSets).not.toBe(updateData.targetSets);
      expect(updatedExerciseTemplate.targetWeight).not.toBe(updateData.targetWeight);
    });

    test("not found request - exercise template with exerciseId does not exist", async () => {
      const res = await request(app.getHttpServer())
        .patch(createUrl(randomUUID()))
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(updateData);

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
      expect(updatedExerciseTemplate.targetSets).toBe(exerciseTemplate.targetSets);
      expect(updatedExerciseTemplate.targetWeight).toBe(exerciseTemplate.targetWeight);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetSets).not.toBe(updateData.targetSets);
      expect(updatedExerciseTemplate.targetWeight).not.toBe(updateData.targetWeight);
    });

    test("bad request - index is less than 0", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({index: -1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.index).toEqual(exerciseTemplate.index);
    });

    test("bad request - targetSets is less than 0", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({targetSets: -1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetSets).toEqual(exerciseTemplate.targetSets);
    });

    test("bad request - targetReps is less than 0", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({targetReps: -1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).toEqual(exerciseTemplate.targetReps);
    });

    test("bad request - targetWeight is less than 0", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({targetWeight: -1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetWeight).toEqual(exerciseTemplate.targetWeight);
    });

    test("bad request - index is greater than maximum smallint", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({index: 32768});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.index).toEqual(exerciseTemplate.index);
    });

    test("bad request - targetSets is greater than maximum smallint", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({targetSets: 32768});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetSets).toEqual(exerciseTemplate.targetSets);
    });

    test("bad request - targetReps is greater than maximum smallint", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({targetReps: 32768});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).toEqual(exerciseTemplate.targetReps);
    });

    test("bad request - targetWeight is greater than maximum smallint", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({targetWeight: 32768});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetWeight).toEqual(exerciseTemplate.targetWeight);
    });

    test("bad request - typeId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({typeId: "notauuid"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.typeId).toEqual(exerciseTemplate.typeId);
    });

    test("bad request - exercise type with typeId does not exist", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({typeId: randomUUID()});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.typeId).toEqual(exerciseTemplate.typeId);
    });

    test("bad request - exercise type with typeId does not exist for owning user", async () => {
      const [user2] = await createUserAndToken();
      const [user2ExerciseType] = await createExerciseTypesForUser(user2);
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({typeId: user2ExerciseType.id});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.typeId).toEqual(exerciseTemplate.typeId);
    });

    test("bad request - exerciseGroupId is not uuid", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({exerciseGroupId: "notauuid"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.exerciseGroupId).toEqual(exerciseTemplate.exerciseGroupId);
    });

    test("bad request - exercise group template with exerciseGroupId does not exist", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({exerciseGroupId: randomUUID()});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.exerciseGroupId).toEqual(exerciseTemplate.exerciseGroupId);
    });

    test("bad request - exercise group template with exerciseGroupId does not exist for owning user", async () => {
      const [user2] = await createUserAndToken();
      const [workoutTemplate] = await createWorkoutTemplatesForUser(user2);
      const exerciseGroupTemplate = await addExerciseGroupTemplate(workoutTemplate);
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({exerciseGroupId: exerciseGroupTemplate.id});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.exerciseGroupId).toEqual(exerciseTemplate.exerciseGroupId);
    });

    test("unauthorized request - missing token", async () => {
      const res = await request(app.getHttpServer()).patch(url).set("Accept", "application/json").send(updateData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
      expect(updatedExerciseTemplate.targetSets).toBe(exerciseTemplate.targetSets);
      expect(updatedExerciseTemplate.targetWeight).toBe(exerciseTemplate.targetWeight);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetSets).not.toBe(updateData.targetSets);
      expect(updatedExerciseTemplate.targetWeight).not.toBe(updateData.targetWeight);
    });

    test("unauthorized request - malformed token", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}awdadioj`)
        .set("Accept", "application/json")
        .send(updateData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
      expect(updatedExerciseTemplate.targetSets).toBe(exerciseTemplate.targetSets);
      expect(updatedExerciseTemplate.targetWeight).toBe(exerciseTemplate.targetWeight);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetSets).not.toBe(updateData.targetSets);
      expect(updatedExerciseTemplate.targetWeight).not.toBe(updateData.targetWeight);
    });

    test("unauthorized request - non admin user", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${userAccessToken}`)
        .set("Accept", "application/json")
        .send(updateData);

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
      expect(updatedExerciseTemplate.targetSets).toBe(exerciseTemplate.targetSets);
      expect(updatedExerciseTemplate.targetWeight).toBe(exerciseTemplate.targetWeight);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetSets).not.toBe(updateData.targetSets);
      expect(updatedExerciseTemplate.targetWeight).not.toBe(updateData.targetWeight);
    });

    test("unauthorized request - expired token", async () => {
      expireToken(adminAccessToken);
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(updateData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const updatedExerciseTemplate = await repo.findOne(exerciseTemplate.id);
      expect(updatedExerciseTemplate.targetReps).toBe(exerciseTemplate.targetReps);
      expect(updatedExerciseTemplate.targetSets).toBe(exerciseTemplate.targetSets);
      expect(updatedExerciseTemplate.targetWeight).toBe(exerciseTemplate.targetWeight);
      expect(updatedExerciseTemplate.targetReps).not.toBe(updateData.targetReps);
      expect(updatedExerciseTemplate.targetSets).not.toBe(updateData.targetSets);
      expect(updatedExerciseTemplate.targetWeight).not.toBe(updateData.targetWeight);
    });
  });

  describe("DELETE - Admin ExerciseTemplates", () => {
    let url: string;
    let user: User;
    let userAccessToken: string;
    let adminAccessToken: string;
    let exerciseTemplate: ExerciseTemplate;
    const createUrl = (exerciseId: string) => `/api/v1/templates/exercises/${exerciseId}`;

    beforeEach(async () => {
      [user, userAccessToken] = await createUserAndToken();
      [, adminAccessToken] = await createAdminUserAndToken();
      const [userWorkoutTemplate] = await createWorkoutTemplatesForUser(user);
      const [exerciseType] = await createExerciseTypesForUser(user);
      const exerciseGroupTemplate = await addExerciseGroupTemplate(userWorkoutTemplate);
      exerciseTemplate = await addExerciseTemplate(exerciseGroupTemplate, exerciseType, 0);
      url = createUrl(exerciseTemplate.id);
    });

    test("successful request", async () => {
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const deletedExerciseTemplate = await repo.findOne(exerciseTemplate.id, {withDeleted: true});
      expect(deletedExerciseTemplate).toBeUndefined();
      expect(res.body).toStrictEqual({});
    });

    test("bad request - exerciseId is not a uuid", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .delete(createUrl("notauuid"))
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("not found request - exercise template with exerciseId does not exist", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .delete(createUrl(randomUUID()))
        .set("Authorization", `Token ${adminAccessToken}`)
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
        .set("Authorization", `Token ${adminAccessToken}awdadioj`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(prevCount).toBe(await repo.count());
    });

    test("unauthorized request - non admin user", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${userAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      expect(prevCount).toBe(await repo.count());
    });

    test("unauthorized request - expired token", async () => {
      const prevCount = await repo.count();
      expireToken(adminAccessToken);
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(prevCount).toBe(await repo.count());
    });
  });
});
