import {HttpStatus, INestApplication} from "@nestjs/common";
import {ExerciseType} from "@exercise-types/entities/exercise-type.entity";
import {Connection, DeepPartial, EntityManager, QueryRunner, Repository} from "typeorm";
import {Test} from "@nestjs/testing";
import {AppModule} from "@src/app.module";
import {appGlobalsSetup} from "@src/app.setup";
import MockDate from "mockdate";
import {User} from "@core/entities/user.entity";
import request from "supertest";
import {randomUUID} from "crypto";
import _ from "lodash";
import {Response} from "@core/types";
import {instanceToPlain} from "class-transformer";
import {
  createAdminUserAndToken,
  createExerciseTypeData,
  createExerciseTypesForUser,
  createUserAndToken,
  expireToken,
} from "../utils";

describe("Admin scoped ExerciseType api", () => {
  let app: INestApplication;
  let queryRunner: QueryRunner;
  let repo: Repository<ExerciseType>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    appGlobalsSetup(app);
    await app.init();
    const dbConnection = moduleRef.get(Connection);
    const manager = moduleRef.get(EntityManager);
    repo = manager.getRepository(ExerciseType);
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

  describe("LIST - Admin ExerciseType", () => {
    const url = "/api/v1/types/exercises";
    let user1: User;
    let user2: User;
    let user1AccessToken: string;
    let adminAccessToken: string;
    let exerciseTypes: ExerciseType[];

    beforeEach(async () => {
      [user1, user1AccessToken] = await createUserAndToken();
      [user2] = await createUserAndToken();
      [, adminAccessToken] = await createAdminUserAndToken();
      exerciseTypes = [];
      exerciseTypes.push(...(await createExerciseTypesForUser(user1)));
      exerciseTypes.push(...(await createExerciseTypesForUser(user2)));
    });

    test("successful request", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<ExerciseType[]>).data;
      const sortedExerciseTypes = instanceToPlain(
        exerciseTypes.sort((a, b) => {
          const x = a.ownerId.localeCompare(b.ownerId);
          return x === 0 ? a.name.localeCompare(b.name) : x;
        }),
        {groups: ["admin"]},
      );
      expect(payload).toStrictEqual(sortedExerciseTypes);
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

  describe("DETAIL - Admin ExerciseType", () => {
    let url: string;
    let user: User;
    let userAccessToken: string;
    let adminAccessToken: string;
    let exerciseType: ExerciseType;
    const createUrl = (exerciseTypeId: string) => `/api/v1/types/exercises/${exerciseTypeId}`;

    beforeEach(async () => {
      [user, userAccessToken] = await createUserAndToken();
      [, adminAccessToken] = await createAdminUserAndToken();
      [exerciseType] = await createExerciseTypesForUser(user);
      url = createUrl(exerciseType.id);
    });

    test("successful request", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<ExerciseType>).data;
      expect(payload).toStrictEqual(instanceToPlain(exerciseType, {groups: ["admin"]}));
    });

    test("not found request - exercise type with id doesnt exist", async () => {
      const res = await request(app.getHttpServer())
        .get(createUrl(randomUUID()))
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    test("bad request - exerciseId is not a uuid", async () => {
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

  describe("CREATE - Admin ExerciseType", () => {
    const url = "/api/v1/types/exercises";
    let user: User;
    let userAccessToken: string;
    let adminAccessToken: string;
    let exerciseTypeData: DeepPartial<ExerciseType>;

    beforeEach(async () => {
      [user, userAccessToken] = await createUserAndToken();
      [, adminAccessToken] = await createAdminUserAndToken();
      exerciseTypeData = createExerciseTypeData({ownerId: user.id});
    });

    test("successful request", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(exerciseTypeData);

      expect(res.statusCode).toBe(HttpStatus.CREATED);
      const exerciseType = await repo.findOne({name: exerciseTypeData.name, ownerId: user.id});
      expect(exerciseType).not.toBeUndefined();
      const payload = (res.body as Response<ExerciseType>).data;
      expect(payload).toStrictEqual(instanceToPlain(exerciseType, {groups: ["admin"]}));
    });

    test("bad request - name is missing", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(_.omit(exerciseTypeData, "name"));

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - name is blank", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTypeData, name: ""});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - ownerId is not a uuid", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTypeData, ownerId: "notauuid"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - ownerId is missing", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(_.omit(exerciseTypeData, "ownerId"));

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("bad request - a user with ownerId does not exist", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTypeData, ownerId: randomUUID()});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("unauthorized request - missing token", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer()).post(url).set("Accept", "application/json").send(exerciseTypeData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(prevCount).toBe(await repo.count());
    });

    test("unauthorized request - malformed token", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}awdadioj`)
        .set("Accept", "application/json")
        .send(exerciseTypeData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(prevCount).toBe(await repo.count());
    });

    test("unauthorized request - non admin user", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${userAccessToken}`)
        .set("Accept", "application/json")
        .send(exerciseTypeData);

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      expect(prevCount).toBe(await repo.count());
    });

    test("unauthorized request - expired token", async () => {
      const prevCount = await repo.count();
      expireToken(adminAccessToken);
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(exerciseTypeData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(prevCount).toBe(await repo.count());
    });
  });

  describe("UPDATE - Admin ExerciseType", () => {
    let url: string;
    let user: User;
    let userAccessToken: string;
    let adminAccessToken: string;
    let exerciseType: ExerciseType;
    let updateData: DeepPartial<ExerciseType>;
    const createUrl = (exerciseTypeId: string) => `/api/v1/types/exercises/${exerciseTypeId}`;

    beforeEach(async () => {
      [user, userAccessToken] = await createUserAndToken();
      [, adminAccessToken] = await createAdminUserAndToken();
      [exerciseType] = await createExerciseTypesForUser(user);
      url = createUrl(exerciseType.id);
      updateData = {
        name: `${exerciseType.name}awdoahdawf`,
      };
    });

    test("successful request", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(updateData);

      expect(res.statusCode).toBe(HttpStatus.OK);
      const updatedExerciseType = await repo.findOne(updateData);
      expect(updatedExerciseType).not.toBeUndefined();
      const payload = (res.body as Response<ExerciseType>).data;
      expect(payload).toStrictEqual(instanceToPlain(updatedExerciseType, {groups: ["admin"]}));
    });

    test("bad request - name is blank", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({name: ""});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseType = await repo.findOne({name: ""});
      expect(updatedExerciseType).toBeUndefined();
    });

    test("bad request - owner with ownerId does not exist", async () => {
      const uuid = randomUUID();
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({ownerId: uuid});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseType = await repo.findOne({ownerId: uuid});
      expect(updatedExerciseType).toBeUndefined();
    });

    test("bad request - ownerId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({ownerId: "notauuid"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const notUpdatedExerciseType = await repo.findOne({ownerId: user.id, name: exerciseType.name});
      expect(notUpdatedExerciseType).not.toBeUndefined();
    });

    test("bad request - exerciseId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .patch(createUrl("notauuid"))
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(updateData);

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseType = await repo.findOne(updateData);
      expect(updatedExerciseType).toBeUndefined();
    });

    test("not found request - exercise type with id does not exist", async () => {
      const res = await request(app.getHttpServer())
        .patch(createUrl(randomUUID()))
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(updateData);

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      const updatedExerciseType = await repo.findOne(updateData);
      expect(updatedExerciseType).toBeUndefined();
    });

    test("unauthorized request - missing token", async () => {
      const res = await request(app.getHttpServer()).patch(url).set("Accept", "application/json").send(updateData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const updatedExerciseType = await repo.findOne(updateData);
      expect(updatedExerciseType).toBeUndefined();
    });

    test("unauthorized request - malformed token", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}awdadioj`)
        .set("Accept", "application/json")
        .send(updateData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const updatedExerciseType = await repo.findOne(updateData);
      expect(updatedExerciseType).toBeUndefined();
    });

    test("unauthorized request - non admin user", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${userAccessToken}`)
        .set("Accept", "application/json")
        .send(updateData);

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      const updatedExerciseType = await repo.findOne(updateData);
      expect(updatedExerciseType).toBeUndefined();
    });

    test("unauthorized request - expired token", async () => {
      expireToken(adminAccessToken);
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(updateData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const updatedExerciseType = await repo.findOne(updateData);
      expect(updatedExerciseType).toBeUndefined();
    });
  });

  describe("DELETE - Admin ExerciseType", () => {
    let url: string;
    let user: User;
    let userAccessToken: string;
    let adminAccessToken: string;
    let exerciseType: ExerciseType;
    const createUrl = (exerciseTypeId: string) => `/api/v1/types/exercises/${exerciseTypeId}`;

    beforeEach(async () => {
      [user, userAccessToken] = await createUserAndToken();
      [, adminAccessToken] = await createAdminUserAndToken();
      [exerciseType] = await createExerciseTypesForUser(user);
      url = createUrl(exerciseType.id);
    });

    test("successful request", async () => {
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const deletedExerciseType = await repo.findOne(exerciseType.id, {withDeleted: true});
      expect(deletedExerciseType.deletedAt).not.toBeNull();
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

    test("not found request - exericse type with id does not exist", async () => {
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
