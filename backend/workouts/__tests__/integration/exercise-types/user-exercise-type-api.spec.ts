import {ExerciseType} from "@exercise-types/entities/exercise-type.entity";
import {HttpStatus, INestApplication} from "@nestjs/common";
import {Test} from "@nestjs/testing";
import {AppModule} from "@src/app.module";
import {appGlobalsSetup} from "@src/app.setup";
import {Connection, DeepPartial, EntityManager, QueryRunner, Repository} from "typeorm";
import MockDate from "mockdate";
import request from "supertest";
import {User} from "@core/entities/user.entity";
import {Response} from "@core/types";
import {instanceToPlain} from "class-transformer";
import {randomUUID} from "crypto";
import _ from "lodash";
import {
  createAdminUserAndToken,
  createExerciseTypeData,
  createExerciseTypesForUser,
  createUserAndToken,
  expireToken,
} from "../utils";

describe("User scoped ExerciseType api", () => {
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

  describe("LIST - User ExerciseType", () => {
    let url: string;
    let user: User;
    let accessToken: string;
    const createUrl = (ownerId: string) => `/api/v1/types/${ownerId}/exercises`;
    let exerciseTypes: ExerciseType[];

    beforeEach(async () => {
      [user, accessToken] = await createUserAndToken();
      exerciseTypes = await createExerciseTypesForUser(user);
      url = createUrl(user.id);
    });

    test("successful request - owner", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<ExerciseType[]>).data;
      expect(payload).toStrictEqual(instanceToPlain(exerciseTypes, {groups: ["user"]}));
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
      const payload = (res.body as Response<ExerciseType[]>).data;
      expect(payload).toStrictEqual(instanceToPlain(exerciseTypes, {groups: ["user"]}));
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

  describe("DETAIL - User ExerciseType", () => {
    let url: string;
    let user: User;
    let accessToken: string;
    const createUrl = (ownerId: string, exerciseId: string) => `/api/v1/types/${ownerId}/exercises/${exerciseId}`;
    let exerciseType: ExerciseType;

    beforeEach(async () => {
      [user, accessToken] = await createUserAndToken();
      [exerciseType] = await createExerciseTypesForUser(user);
      url = createUrl(user.id, exerciseType.id);
    });

    test("successful request - owner", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<ExerciseType>).data;
      expect(payload).toStrictEqual(instanceToPlain(exerciseType, {groups: ["user"]}));
    });

    test("successful request - admin", async () => {
      const [, adminAccessToken] = await createAdminUserAndToken();
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const payload = (res.body as Response<ExerciseType>).data;
      expect(payload).toStrictEqual(instanceToPlain(exerciseType, {groups: ["user"]}));
    });

    test("bad request - exerciseId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .get(createUrl(user.id, "notauuid"))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("not found request - exercise type with exerciseId doesnt belong to requesting user", async () => {
      const [secondUser] = await createUserAndToken();
      const [secondExerciseType] = await createExerciseTypesForUser(secondUser);
      const res = await request(app.getHttpServer())
        .get(createUrl(user.id, secondExerciseType.id))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    test("not found request - exercise type with exerciseId doesnt exist", async () => {
      const res = await request(app.getHttpServer())
        .get(createUrl(user.id, randomUUID()))
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

  describe("CREATE - User ExerciseType", () => {
    let url: string;
    let user: User;
    let accessToken: string;
    const createUrl = (ownerId: string) => `/api/v1/types/${ownerId}/exercises`;
    let exerciseTypeData: DeepPartial<ExerciseType>;

    beforeEach(async () => {
      [user, accessToken] = await createUserAndToken();
      exerciseTypeData = createExerciseTypeData({ownerId: user.id});
      url = createUrl(user.id);
    });

    test("successful request - owner", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(exerciseTypeData);

      expect(res.statusCode).toBe(HttpStatus.CREATED);
      const exerciseType = await repo.findOne({name: exerciseTypeData.name});
      expect(exerciseType).not.toBeUndefined();
      const payload = (res.body as Response<ExerciseType>).data;
      expect(payload).toStrictEqual(instanceToPlain(exerciseType, {groups: ["user"]}));
    });

    test("successful request - admin", async () => {
      const [, adminAccessToken] = await createAdminUserAndToken();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(exerciseTypeData);

      expect(res.statusCode).toBe(HttpStatus.CREATED);
      const exerciseType = await repo.findOne({name: exerciseTypeData.name});
      expect(exerciseType).not.toBeUndefined();
      const payload = (res.body as Response<ExerciseType>).data;
      expect(payload).toStrictEqual(instanceToPlain(exerciseType, {groups: ["user"]}));
    });

    test("bad request - name is missing", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(_.omit(exerciseTypeData, ["name"]));

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("bad request - name is blank", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({...exerciseTypeData, name: ""});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("unauthorized request - missing token", async () => {
      const res = await request(app.getHttpServer()).post(url).set("Accept", "application/json").send(exerciseTypeData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const exerciseType = await repo.findOne({name: exerciseTypeData.name});
      expect(exerciseType).toBeUndefined();
    });

    test("unauthorized request - malformed token", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}awdadioj`)
        .set("Accept", "application/json")
        .send(exerciseTypeData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const exerciseType = await repo.findOne({name: exerciseTypeData.name});
      expect(exerciseType).toBeUndefined();
    });

    test("unauthorized request - expired token", async () => {
      expireToken(accessToken);
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(exerciseTypeData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const exerciseType = await repo.findOne({name: exerciseTypeData.name});
      expect(exerciseType).toBeUndefined();
    });

    test("forbidden request - requestor is not owner of the resource", async () => {
      const [, wrongAccessToken] = await createUserAndToken();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${wrongAccessToken}`)
        .set("Accept", "application/json")
        .send(exerciseTypeData);

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      const exerciseType = await repo.findOne({name: exerciseTypeData.name});
      expect(exerciseType).toBeUndefined();
    });
  });

  describe("UPDATE - User ExerciseType", () => {
    let url: string;
    let user: User;
    let accessToken: string;
    const createUrl = (ownerId: string, exerciseId: string) => `/api/v1/types/${ownerId}/exercises/${exerciseId}`;
    let exerciseType: ExerciseType;
    let newData: DeepPartial<ExerciseType>;

    beforeEach(async () => {
      [user, accessToken] = await createUserAndToken();
      [exerciseType] = await createExerciseTypesForUser(user);
      url = createUrl(user.id, exerciseType.id);
      newData = {
        name: `${exerciseType.name}awdijaoidj`,
      };
    });

    test("successful request - owner", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(newData);

      expect(res.statusCode).toBe(HttpStatus.OK);
      const updatedExerciseType = await repo.findOne(newData);
      expect(updatedExerciseType).not.toBeUndefined();
      const payload = (res.body as Response<ExerciseType>).data;
      expect(payload).toStrictEqual(instanceToPlain(updatedExerciseType, {groups: ["user"]}));
    });

    test("successful request - admin", async () => {
      const [, adminAccessToken] = await createAdminUserAndToken();
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send(newData);

      expect(res.statusCode).toBe(HttpStatus.OK);
      const updatedExerciseType = await repo.findOne(newData);
      expect(updatedExerciseType).not.toBeUndefined();
      const payload = (res.body as Response<ExerciseType>).data;
      expect(payload).toStrictEqual(instanceToPlain(updatedExerciseType, {groups: ["user"]}));
    });

    test("bad request - name is blank", async () => {
      const [, adminAccessToken] = await createAdminUserAndToken();
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${adminAccessToken}`)
        .set("Accept", "application/json")
        .send({name: ""});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedExerciseType = await repo.findOne({name: ""});
      expect(updatedExerciseType).toBeUndefined();
    });

    test("bad request - exerciseId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .patch(createUrl(user.id, "notauuid"))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(newData);

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const notUpdatedExerciseType = await repo.findOne({name: exerciseType.name});
      expect(notUpdatedExerciseType).not.toBeUndefined();
    });

    test("not found request - exercise type with exerciseId doesnt belong to requesting user", async () => {
      const [secondUser] = await createUserAndToken();
      const [secondExerciseType] = await createExerciseTypesForUser(secondUser);
      const res = await request(app.getHttpServer())
        .patch(createUrl(user.id, secondExerciseType.id))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(newData);

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      const notUpdatedExerciseType = await repo.findOne(secondExerciseType.id);
      expect(notUpdatedExerciseType.name).not.toEqual(newData.name);
    });

    test("not found request - exercise type with exerciseId doesnt exist", async () => {
      const res = await request(app.getHttpServer())
        .patch(createUrl(user.id, randomUUID()))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(newData);

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    test("unauthorized request - missing token", async () => {
      const res = await request(app.getHttpServer()).patch(url).set("Accept", "application/json").send(newData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const updatedExerciseType = await repo.findOne(newData);
      expect(updatedExerciseType).toBeUndefined();
    });

    test("unauthorized request - malformed token", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}awdadioj`)
        .set("Accept", "application/json")
        .send(newData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const updatedExerciseType = await repo.findOne(newData);
      expect(updatedExerciseType).toBeUndefined();
    });

    test("unauthorized request - expired token", async () => {
      expireToken(accessToken);
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(newData);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      const updatedExerciseType = await repo.findOne(newData);
      expect(updatedExerciseType).toBeUndefined();
    });

    test("forbidden request - requestor is not owner of the resource", async () => {
      const [, wrongAccessToken] = await createUserAndToken();
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${wrongAccessToken}`)
        .set("Accept", "application/json")
        .send(newData);

      expect(res.statusCode).toBe(HttpStatus.FORBIDDEN);
      const updatedExerciseType = await repo.findOne(newData);
      expect(updatedExerciseType).toBeUndefined();
    });
  });

  describe("DELETE - User ExerciseType", () => {
    let url: string;
    let user: User;
    let accessToken: string;
    const createUrl = (ownerId: string, exerciseId: string) => `/api/v1/types/${ownerId}/exercises/${exerciseId}`;
    let exerciseType: ExerciseType;

    beforeEach(async () => {
      [user, accessToken] = await createUserAndToken();
      [exerciseType] = await createExerciseTypesForUser(user);
      url = createUrl(user.id, exerciseType.id);
    });

    test("successful request - owner", async () => {
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
      const deletedExerciseType = await repo.findOne(exerciseType.id, {withDeleted: true});
      expect(deletedExerciseType.deletedAt).not.toBeNull();
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
      const deletedExerciseType = await repo.findOne(exerciseType.id, {withDeleted: true});
      expect(deletedExerciseType.deletedAt).not.toBeNull();
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

    test("not found request - exercise type with exerciseId doesnt belong to requesting user", async () => {
      const [secondUser] = await createUserAndToken();
      const [secondExerciseType] = await createExerciseTypesForUser(secondUser);
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .delete(createUrl(user.id, secondExerciseType.id))
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(prevCount).toBe(await repo.count());
    });

    test("not found request - exercise type with exerciseId doesnt exist", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .delete(createUrl(user.id, randomUUID()))
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
