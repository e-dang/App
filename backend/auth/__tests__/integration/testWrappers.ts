/* eslint-disable jest/no-export */
import {HttpStatus, INestApplication} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {AppModule} from "@src/app.module";
import {appGlobalsSetup} from "@src/app.setup";
import {Connection, EntityManager, EntityTarget, QueryRunner, Repository} from "typeorm";
import supertest from "supertest";
import MockDate from "mockdate";
import {expireToken} from "./utils";

interface TestHelpers {
  app: INestApplication;
  moduleRef: TestingModule;
  getRepository: <Entity>(entity: EntityTarget<Entity>) => Repository<Entity>;
}

export function integrationTest(name: string, fn: (helpers: TestHelpers) => jest.EmptyFunction) {
  describe("integration test", () => {
    let moduleRef: TestingModule;
    let app: INestApplication;
    let queryRunner: QueryRunner;
    let manager: EntityManager;
    const helpers: TestHelpers = {
      app: new Proxy(
        {},
        {
          get(target, prop) {
            return app[prop] as unknown;
          },
        },
      ) as INestApplication,
      moduleRef: new Proxy(
        {},
        {
          get(target, prop) {
            return moduleRef[prop] as unknown;
          },
        },
      ) as TestingModule,
      getRepository: <Entity>(entity: EntityTarget<Entity>) => manager.getRepository(entity),
    };

    beforeAll(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleRef.createNestApplication();
      appGlobalsSetup(app);
      await app.init();
      const dbConnection = moduleRef.get(Connection);
      manager = moduleRef.get(EntityManager);

      queryRunner = dbConnection.createQueryRunner("master");
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      manager.queryRunner = queryRunner;
    });

    beforeEach(async () => {
      await queryRunner.startTransaction();
    });

    afterEach(async () => {
      await queryRunner.rollbackTransaction();
    });

    afterAll(async () => {
      await app.close();
    });

    // eslint-disable-next-line jest/valid-describe-callback, jest/valid-title
    describe(name, fn(helpers));
  });
}

export function testUnauthorizedRequests(
  request: () => supertest.Test,
  getAccessToken: () => string,
  getPayload: () => Record<string, unknown> = () => ({}),
) {
  describe("unauthorized request", () => {
    beforeEach(() => {
      MockDate.reset();
    });

    test("returns 401 status code when access token is not attached to authorization header", async () => {
      const res = await request().set("Accept", "application/json").send(getPayload());

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    test("returns 401 status code when accessToken is malformed", async () => {
      const accessToken = getAccessToken();
      const res = await request()
        .set("Authorization", `Token ${accessToken}randomchars`)
        .set("Accept", "application/json")
        .send(getPayload());

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    test("returns 401 status code when access token is expired", async () => {
      const accessToken = getAccessToken();
      expireToken(accessToken);
      const res = await request()
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send(getPayload());

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });
  });
}
