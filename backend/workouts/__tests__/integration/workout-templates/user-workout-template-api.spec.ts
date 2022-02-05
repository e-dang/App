import {HttpStatus, INestApplication} from "@nestjs/common";
import {Test} from "@nestjs/testing";
import request from "supertest";
import {User} from "@core/entities/user.entity";
import {Response} from "@core/types";
import {AppModule} from "@src/app.module";
import {Connection, DeepPartial, EntityManager, QueryRunner, Repository} from "typeorm";
import MockDate from "mockdate";
import {appGlobalsSetup} from "@src/app.setup";
import {instanceToPlain} from "class-transformer";
import {WorkoutTemplate} from "@workout-templates/entities/workout-template.entity";
import {randomUUID} from "crypto";
import _ from "lodash";
import {ExerciseGroupTemplate} from "@exercise-group-templates/entities/exercise-group-template.entity";
import {ExerciseTemplate} from "@exercise-templates/entities/exercise-template.entity";
import {
  addExerciseGroupTemplate,
  addExerciseGroupTemplateData,
  addExerciseTemplate,
  addExerciseTemplateData,
  createAdminUserAndToken,
  createExerciseTypesForUser,
  createUserAndToken,
  createWorkoutTemplateData,
  createWorkoutTemplatesForUser,
  expireToken,
} from "../utils";

describe("User scoped WorkoutTemplates api", () => {
  let app: INestApplication;
  let queryRunner: QueryRunner;
  let repo: Repository<WorkoutTemplate>;
  let manager: EntityManager;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    appGlobalsSetup(app);
    await app.init();
    const dbConnection = moduleRef.get(Connection);
    manager = moduleRef.get(EntityManager);
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

  describe("LIST - User WorkoutTemplates", () => {
    let url: string;
    let user: User;
    let accessToken: string;
    const createUrl = (ownerId: string) => `/api/v1/templates/${ownerId}/workouts`;
    let workoutTemplates: WorkoutTemplate[];

    beforeEach(async () => {
      [user, accessToken] = await createUserAndToken();
      workoutTemplates = await createWorkoutTemplatesForUser(user);
      url = createUrl(user.id);
    });

    test("successful request - owner", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<WorkoutTemplate[]>).data;
      expect(payload).toEqual(instanceToPlain(workoutTemplates, {groups: ["user"]}));
      expect(payload[0]).toHaveProperty("id");
      expect(payload[0]).toHaveProperty("ownerId");
      expect(payload[0]).toHaveProperty("name");
      expect(payload[0]).toHaveProperty("createdAt");
      expect(payload[0]).toHaveProperty("updatedAt");
    });

    test("successful request - admin", async () => {
      const [, adminAccessToken] = await createAdminUserAndToken();
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<WorkoutTemplate[]>).data;
      expect(payload).toEqual(instanceToPlain(workoutTemplates, {groups: ["user"]}));
      expect(payload[0]).toHaveProperty("id");
      expect(payload[0]).toHaveProperty("ownerId");
      expect(payload[0]).toHaveProperty("name");
      expect(payload[0]).toHaveProperty("createdAt");
      expect(payload[0]).toHaveProperty("updatedAt");
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

  describe("DETAIL - User WorkoutTemplate", () => {
    let url: string;
    let user: User;
    let accessToken: string;
    const createUrl = (ownerId: string, workoutId: string) => `/api/v1/templates/${ownerId}/workouts/${workoutId}`;
    let workoutTemplate: WorkoutTemplate;

    beforeEach(async () => {
      [user, accessToken] = await createUserAndToken();
      [workoutTemplate] = await createWorkoutTemplatesForUser(user);
      url = createUrl(user.id, workoutTemplate.id);
    });

    test("successful request - owner", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<WorkoutTemplate>).data;
      expect(payload).toEqual(instanceToPlain(workoutTemplate, {groups: ["user", "detail"]}));
      expect(payload).toHaveProperty("id");
      expect(payload).toHaveProperty("name");
      expect(payload).toHaveProperty("ownerId");
      expect(payload).toHaveProperty("exerciseGroups");
      expect(payload).toHaveProperty("createdAt");
      expect(payload).toHaveProperty("updatedAt");
    });

    test("successful request - admin", async () => {
      const [, adminAccessToken] = await createAdminUserAndToken();
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<WorkoutTemplate>).data;
      expect(payload).toEqual(instanceToPlain(workoutTemplate, {groups: ["user", "detail"]}));
      expect(payload).toHaveProperty("id");
      expect(payload).toHaveProperty("name");
      expect(payload).toHaveProperty("ownerId");
      expect(payload).toHaveProperty("exerciseGroups");
      expect(payload).toHaveProperty("createdAt");
      expect(payload).toHaveProperty("updatedAt");
    });

    test("bad request - workoutId is not a valid uuid", async () => {
      const res = await request(app.getHttpServer())
        .get(createUrl(user.id, "notauuid"))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("not found request - no workout template with id", async () => {
      const res = await request(app.getHttpServer())
        .get(createUrl(user.id, randomUUID()))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    test("not found request - no workout template with id belonging to user", async () => {
      const [secondUser] = await createUserAndToken();
      const [secondUserWorkoutTemplate] = await createWorkoutTemplatesForUser(secondUser);
      const res = await request(app.getHttpServer())
        .get(createUrl(user.id, secondUserWorkoutTemplate.id))
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
        .set("Authorization", `Token ${accessToken}awdajio`)
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

  describe("CREATE - User WorkoutTemplate", () => {
    let url: string;
    let user: User;
    let accessToken: string;
    const createUrl = (ownerId: string) => `/api/v1/templates/${ownerId}/workouts`;
    let workoutTemplateData: DeepPartial<WorkoutTemplate>;

    beforeEach(async () => {
      [user, accessToken] = await createUserAndToken();
      workoutTemplateData = createWorkoutTemplateData();
      url = createUrl(user.id);
    });

    test("successful request - owner", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(workoutTemplateData);

      expect(res.statusCode).toBe(HttpStatus.CREATED);
      const payload = (res.body as Response<WorkoutTemplate>).data;
      expect(payload).toHaveProperty("ownerId", user.id);
      expect(payload).toHaveProperty("name", workoutTemplateData.name);
      expect(payload).toHaveProperty("id");
      expect(payload).toHaveProperty("createdAt");
      expect(payload).toHaveProperty("updatedAt");
      expect(payload).toHaveProperty("exerciseGroups", []);
    });

    test("successful request - owner, cascading create", async () => {
      const [exerciseType1, exerciseType2] = await createExerciseTypesForUser(user);
      const exerciseGroupTemplate1 = addExerciseGroupTemplateData(workoutTemplateData);
      const exerciseGroupTemplate2 = addExerciseGroupTemplateData(workoutTemplateData, {index: 1});
      const exerciseTemplate1 = addExerciseTemplateData(exerciseGroupTemplate1, 0, {typeId: exerciseType1.id});
      const exerciseTemplate2 = addExerciseTemplateData(exerciseGroupTemplate1, 1, {typeId: exerciseType2.id});
      const exerciseTemplate3 = addExerciseTemplateData(exerciseGroupTemplate2, 1, {typeId: exerciseType1.id});

      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(workoutTemplateData);

      expect(res.statusCode).toBe(HttpStatus.CREATED);
      const payload = (res.body as Response<WorkoutTemplate>).data;
      expect(payload).toHaveProperty("ownerId", user.id);
      expect(payload).toHaveProperty("name", workoutTemplateData.name);
      expect(payload).toHaveProperty("id");
      expect(payload).toHaveProperty("createdAt");
      expect(payload).toHaveProperty("updatedAt");

      expect(payload).toHaveProperty("exerciseGroups.0.index", exerciseGroupTemplate1.index);
      expect(payload).toHaveProperty("exerciseGroups.0.workoutId", payload.id);
      expect(payload).toHaveProperty("exerciseGroups.0.id");
      expect(payload).toHaveProperty("exerciseGroups.0.createdAt");
      expect(payload).toHaveProperty("exerciseGroups.0.updatedAt");

      expect(payload).toHaveProperty("exerciseGroups.0.exercises.0.exerciseGroupId", payload.exerciseGroups[0].id);
      expect(payload).toHaveProperty("exerciseGroups.0.exercises.0.index", exerciseTemplate1.index);
      expect(payload).toHaveProperty("exerciseGroups.0.exercises.0.targetReps", exerciseTemplate1.targetReps);
      expect(payload).toHaveProperty("exerciseGroups.0.exercises.0.targetSets", exerciseTemplate1.targetSets);
      expect(payload).toHaveProperty("exerciseGroups.0.exercises.0.targetWeight", exerciseTemplate1.targetSets);
      expect(payload).toHaveProperty("exerciseGroups.0.exercises.0.id");
      expect(payload).toHaveProperty("exerciseGroups.0.exercises.0.createdAt");
      expect(payload).toHaveProperty("exerciseGroups.0.exercises.0.updatedAt");

      expect(payload).toHaveProperty("exerciseGroups.0.exercises.1.exerciseGroupId", payload.exerciseGroups[0].id);
      expect(payload).toHaveProperty("exerciseGroups.0.exercises.1.index", exerciseTemplate2.index);
      expect(payload).toHaveProperty("exerciseGroups.0.exercises.1.targetReps", exerciseTemplate2.targetReps);
      expect(payload).toHaveProperty("exerciseGroups.0.exercises.1.targetSets", exerciseTemplate2.targetSets);
      expect(payload).toHaveProperty("exerciseGroups.0.exercises.1.targetWeight", exerciseTemplate2.targetSets);
      expect(payload).toHaveProperty("exerciseGroups.0.exercises.1.id");
      expect(payload).toHaveProperty("exerciseGroups.0.exercises.1.createdAt");
      expect(payload).toHaveProperty("exerciseGroups.0.exercises.1.updatedAt");

      expect(payload).toHaveProperty("exerciseGroups.0.index", exerciseGroupTemplate1.index);
      expect(payload).toHaveProperty("exerciseGroups.0.workoutId", payload.id);
      expect(payload).toHaveProperty("exerciseGroups.0.id");
      expect(payload).toHaveProperty("exerciseGroups.0.createdAt");
      expect(payload).toHaveProperty("exerciseGroups.0.updatedAt");

      expect(payload).toHaveProperty("exerciseGroups.1.exercises.0.exerciseGroupId", payload.exerciseGroups[1].id);
      expect(payload).toHaveProperty("exerciseGroups.1.exercises.0.index", exerciseTemplate3.index);
      expect(payload).toHaveProperty("exerciseGroups.1.exercises.0.targetReps", exerciseTemplate3.targetReps);
      expect(payload).toHaveProperty("exerciseGroups.1.exercises.0.targetSets", exerciseTemplate3.targetSets);
      expect(payload).toHaveProperty("exerciseGroups.1.exercises.0.targetWeight", exerciseTemplate3.targetSets);
      expect(payload).toHaveProperty("exerciseGroups.1.exercises.0.id");
      expect(payload).toHaveProperty("exerciseGroups.1.exercises.0.createdAt");
      expect(payload).toHaveProperty("exerciseGroups.1.exercises.0.updatedAt");
    });

    test("successful request - admin", async () => {
      const [, adminAccessToken] = await createAdminUserAndToken();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(workoutTemplateData);

      expect(res.statusCode).toBe(HttpStatus.CREATED);
    });

    test("bad request - notes is not a string", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...workoutTemplateData, notes: 1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const workoutTemplate = await repo.findOne({name: workoutTemplateData.name, ownerId: user.id});
      expect(workoutTemplate).toBeUndefined();
    });

    test("bad request - name is missing", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(_.omit(workoutTemplateData, ["name"]));

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const workoutTemplate = await repo.findOne({name: workoutTemplateData.name, ownerId: user.id});
      expect(workoutTemplate).toBeUndefined();
    });

    test("bad request - name is blank", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
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
        .set("Authorization", `Token ${accessToken}adawdad`)
        .set("Accept", "application/json")
        .send(workoutTemplateData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const workoutTemplate = await repo.findOne({name: workoutTemplateData.name, ownerId: user.id});
      expect(workoutTemplate).toBeUndefined();
    });

    test("unauthorized request - expired token", async () => {
      expireToken(accessToken);
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(workoutTemplateData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const workoutTemplate = await repo.findOne({name: workoutTemplateData.name, ownerId: user.id});
      expect(workoutTemplate).toBeUndefined();
    });

    test("forbidden request - requestor is not owner of the resource", async () => {
      const [, secondUserAccessToken] = await createUserAndToken();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${secondUserAccessToken}`)
        .set("Accept", "application/json")
        .send(workoutTemplateData);

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      const workoutTemplate = await repo.findOne({name: workoutTemplateData.name, ownerId: user.id});
      expect(workoutTemplate).toBeUndefined();
    });
  });

  describe("UPDATE - User WorkoutTemplate", () => {
    let url: string;
    let user: User;
    let accessToken: string;
    const createUrl = (ownerId: string, workoutId: string) => `/api/v1/templates/${ownerId}/workouts/${workoutId}`;
    let workoutTemplate: WorkoutTemplate;
    let newName: string;

    beforeEach(async () => {
      [user, accessToken] = await createUserAndToken();
      [workoutTemplate] = await createWorkoutTemplatesForUser(user);
      url = createUrl(user.id, workoutTemplate.id);
      newName = `${workoutTemplate.name}randomchars`;
    });

    test("successful request - owner", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({name: newName});

      expect(res.statusCode).toBe(HttpStatus.OK);
      const refreshedWorkoutTemplate = await repo.findOne(
        {name: newName, ownerId: user.id},
        {relations: ["exerciseGroups", "exerciseGroups.exercises", "exerciseGroups.exercises.type"]},
      );
      const payload = (res.body as Response<WorkoutTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(refreshedWorkoutTemplate, {groups: ["user", "detail"]}));
    });

    test("successful request - admin", async () => {
      const [, adminAccessToken] = await createAdminUserAndToken();
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({name: newName});

      expect(res.statusCode).toBe(HttpStatus.OK);
      const refreshedWorkoutTemplate = await repo.findOne(
        {name: newName, ownerId: user.id},
        {relations: ["exerciseGroups", "exerciseGroups.exercises", "exerciseGroups.exercises.type"]},
      );
      const payload = (res.body as Response<WorkoutTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(refreshedWorkoutTemplate, {groups: ["user", "detail"]}));
    });

    test("successful request - sub entities", async () => {
      const [exerciseType0, exerciseType1] = await createExerciseTypesForUser(user);
      const exerciseGroupTemplate0 = await addExerciseGroupTemplate(workoutTemplate);
      const exerciseGroupTemplate1 = await addExerciseGroupTemplate(workoutTemplate, {index: 1});
      const exerciseGroupTemplate2 = await addExerciseGroupTemplate(workoutTemplate, {index: 2});
      const exerciseGroupTemplate3 = await addExerciseGroupTemplate(workoutTemplate, {index: 3});
      const exerciseTemplate0 = await addExerciseTemplate(exerciseGroupTemplate0, exerciseType0, 0);
      const exerciseTemplate1 = await addExerciseTemplate(exerciseGroupTemplate0, exerciseType1, 1);
      const exerciseTemplate2 = await addExerciseTemplate(exerciseGroupTemplate1, exerciseType0, 0);
      await addExerciseTemplate(exerciseGroupTemplate2, exerciseType0, 0);
      const exerciseTemplate4 = await addExerciseTemplate(exerciseGroupTemplate3, exerciseType0, 0);

      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({
          name: newName,
          exerciseGroups: [
            // swap positions of 1st and 2nd exercise group templates, and delete last exercise group template
            {
              id: exerciseGroupTemplate1.id,
              index: 0,
              exercises: [], // delete exercise template
            },
            {
              id: exerciseGroupTemplate0.id,
              index: 1,
              exercises: [
                // swap positions of 1st and 2nd exercise templates
                {
                  id: exerciseTemplate1.id,
                  index: 0,
                },
                {
                  id: exerciseTemplate0.id,
                  index: 1,
                },
              ],
            },
            {
              // dont delete this exercise group template
              id: exerciseGroupTemplate2.id,
            },
          ],
        });

      expect(res.statusCode).toBe(HttpStatus.OK);
      const refreshedWorkoutTemplate = await repo
        .createQueryBuilder("workoutTemplates")
        .leftJoinAndSelect("workoutTemplates.exerciseGroups", "exerciseGroupTemplates")
        .leftJoinAndSelect("exerciseGroupTemplates.exercises", "exerciseTemplates")
        .leftJoinAndSelect("exerciseTemplates.type", "exerciseType")
        .where("workoutTemplates.id = :workoutId", {workoutId: workoutTemplate.id})
        .andWhere("workoutTemplates.ownerId = :ownerId", {ownerId: user.id})
        .orderBy("exerciseGroupTemplates.index", "ASC")
        .addOrderBy("exerciseTemplates.index", "ASC")
        .getOne();

      const payload = (res.body as Response<WorkoutTemplate>).data;
      expect(payload).toStrictEqual(instanceToPlain(refreshedWorkoutTemplate, {groups: ["user", "detail"]}));
      expect(payload.exerciseGroups.length).toBe(3);
      expect(payload.exerciseGroups[0].id).toEqual(exerciseGroupTemplate1.id);
      expect(payload.exerciseGroups[0].index).toBe(0);
      expect(payload.exerciseGroups[0].exercises.length).toBe(0);
      expect(payload.exerciseGroups[1].id).toEqual(exerciseGroupTemplate0.id);
      expect(payload.exerciseGroups[1].index).toBe(1);
      expect(payload.exerciseGroups[1].exercises.length).toBe(2);
      expect(payload.exerciseGroups[1].exercises[0].id).toEqual(exerciseTemplate1.id);
      expect(payload.exerciseGroups[1].exercises[0].index).toBe(0);
      expect(payload.exerciseGroups[1].exercises[1].id).toEqual(exerciseTemplate0.id);
      expect(payload.exerciseGroups[1].exercises[1].index).toBe(1);
      expect(payload.exerciseGroups[2].id).toEqual(exerciseGroupTemplate2.id);
      expect(payload.exerciseGroups[2].index).toBe(2);
      expect(payload.exerciseGroups[2].exercises.length).toBe(1);

      // assert that entities are deleted in the database
      const exerciseGroupTemplateRepo = manager.getRepository(ExerciseGroupTemplate);
      const exerciseGroupTemplateResult = await exerciseGroupTemplateRepo.findOne(exerciseGroupTemplate3.id);
      expect(exerciseGroupTemplateResult).toBeUndefined();
      const exerciseTemplateRepo = manager.getRepository(ExerciseTemplate);
      const exerciseTemplate4Result = await exerciseTemplateRepo.findOne(exerciseTemplate4.id);
      expect(exerciseTemplate4Result).toBeUndefined();
      const exerciseTemplate2Result = await exerciseTemplateRepo.findOne(exerciseTemplate2.id);
      expect(exerciseTemplate2Result).toBeUndefined();
    });

    test("bad request - notes is not a string", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({notes: 1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedWorkoutTemplate = await repo.findOne(workoutTemplate.id);
      expect(updatedWorkoutTemplate.notes).not.toBe(1);
    });

    test("bad request - workoutId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .patch(createUrl(user.id, "notauuid"))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({name: ""});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedWorkoutTemplate = await repo.findOne({name: newName, ownerId: user.id});
      expect(updatedWorkoutTemplate).toBeUndefined();
    });

    test("bad request - name is blank", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({name: ""});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedWorkoutTemplate = await repo.findOne({name: newName, ownerId: user.id});
      expect(updatedWorkoutTemplate).toBeUndefined();
    });

    test("not found request - no workout template with id", async () => {
      const res = await request(app.getHttpServer())
        .patch(createUrl(user.id, randomUUID()))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({name: newName});

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      const updatedWorkoutTemplate = await repo.findOne({name: newName, ownerId: user.id});
      expect(updatedWorkoutTemplate).toBeUndefined();
    });

    test("not found request - no workout template with id belongs to requesting user", async () => {
      const [secondUser] = await createUserAndToken();
      const [secondUserWorkoutTemplate] = await createWorkoutTemplatesForUser(secondUser);
      const res = await request(app.getHttpServer())
        .patch(createUrl(user.id, secondUserWorkoutTemplate.id))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({name: newName});

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
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
        .set("Authorization", `Token ${accessToken}randomchars`)
        .set("Accept", "application/json")
        .send({name: newName});

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const updatedWorkoutTemplate = await repo.findOne({name: newName, ownerId: user.id});
      expect(updatedWorkoutTemplate).toBeUndefined();
    });

    test("unauthorized request - expired token", async () => {
      expireToken(accessToken);
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({name: newName});

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const updatedWorkoutTemplate = await repo.findOne({name: newName, ownerId: user.id});
      expect(updatedWorkoutTemplate).toBeUndefined();
    });

    test("forbidden request - requestor is not owner of the resource", async () => {
      const [, secondUserAccessToken] = await createUserAndToken();
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${secondUserAccessToken}`)
        .set("Accept", "application/json")
        .send({name: newName});

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      const updatedWorkoutTemplate = await repo.findOne({name: newName, ownerId: user.id});
      expect(updatedWorkoutTemplate).toBeUndefined();
    });
  });

  describe("DELETE - User WorkoutTemplate", () => {
    let url: string;
    let user: User;
    let accessToken: string;
    const createUrl = (ownerId: string, workoutId: string) => `/api/v1/templates/${ownerId}/workouts/${workoutId}`;
    let workoutTemplate: WorkoutTemplate;

    beforeEach(async () => {
      [user, accessToken] = await createUserAndToken();
      [workoutTemplate] = await createWorkoutTemplatesForUser(user);
      url = createUrl(user.id, workoutTemplate.id);
    });

    test("successful request - owner", async () => {
      const [exerciseType1, exerciseType2] = await createExerciseTypesForUser(user);
      const exerciseGroupTemplate1 = await addExerciseGroupTemplate(workoutTemplate);
      const exerciseGroupTemplate2 = await addExerciseGroupTemplate(workoutTemplate, {index: 1});
      await addExerciseTemplate(exerciseGroupTemplate1, exerciseType1, 0);
      await addExerciseTemplate(exerciseGroupTemplate1, exerciseType2, 1);
      await addExerciseTemplate(exerciseGroupTemplate2, exerciseType1, 0);

      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${accessToken}`)
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
    });

    test("successful request - admin", async () => {
      const [, adminAccessToken] = await createAdminUserAndToken();
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
    });

    test("bad request - workoutId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .delete(createUrl(user.id, "notauuid"))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const notDeletedWorkoutTemplate = await repo.findOne(workoutTemplate.id);
      expect(notDeletedWorkoutTemplate).not.toBeUndefined();
    });

    test("not found - no workout template with id", async () => {
      const res = await request(app.getHttpServer())
        .delete(createUrl(user.id, randomUUID()))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      const notDeletedWorkoutTemplate = await repo.findOne(workoutTemplate.id);
      expect(notDeletedWorkoutTemplate).not.toBeUndefined();
    });

    test("not found request - no workout template with id belongs to requesting user", async () => {
      const [secondUser] = await createUserAndToken();
      const [secondUserWorkoutTemplate] = await createWorkoutTemplatesForUser(secondUser);
      const res = await request(app.getHttpServer())
        .delete(createUrl(user.id, secondUserWorkoutTemplate.id))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      const notDeletedWorkoutTemplate = await repo.findOne(workoutTemplate.id);
      expect(notDeletedWorkoutTemplate).not.toBeUndefined();
    });

    test("unauthorized request - missing token", async () => {
      const res = await request(app.getHttpServer()).delete(url).set("Accept", "application/json").send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const notDeletedWorkoutTemplate = await repo.findOne(workoutTemplate.id);
      expect(notDeletedWorkoutTemplate).not.toBeUndefined();
    });

    test("unauthorized request - malformed token", async () => {
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${accessToken}randomchars`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const notDeletedWorkoutTemplate = await repo.findOne(workoutTemplate.id);
      expect(notDeletedWorkoutTemplate).not.toBeUndefined();
    });

    test("unauthorized request - expired token", async () => {
      expireToken(accessToken);
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const notDeletedWorkoutTemplate = await repo.findOne(workoutTemplate.id);
      expect(notDeletedWorkoutTemplate).not.toBeUndefined();
    });

    test("forbidden request - requestor is not owner of the resource", async () => {
      const [, secondUserAccessToken] = await createUserAndToken();
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${secondUserAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      const notDeletedWorkoutTemplate = await repo.findOne(workoutTemplate.id);
      expect(notDeletedWorkoutTemplate).not.toBeUndefined();
    });
  });
});
