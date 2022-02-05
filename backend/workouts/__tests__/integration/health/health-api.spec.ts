import {HttpStatus, INestApplication} from "@nestjs/common";
import request from "supertest";
import {Test} from "@nestjs/testing";
import {AppModule} from "@src/app.module";
import {appGlobalsSetup} from "@src/app.setup";
import {Connection} from "typeorm";

describe("Healthcheck api", () => {
  let app: INestApplication;
  let dbConnection: Connection;
  const url = "/api/v1/health";

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    dbConnection = moduleRef.get(Connection);
    appGlobalsSetup(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test("health check returns 200 status when connected to database", async () => {
    const res = await request(app.getHttpServer()).get(url).set("Accept", "application/json").send();

    expect(res.statusCode).toBe(HttpStatus.OK);
  });

  test("health check returns 503 when not connected to database", async () => {
    await dbConnection.close();
    const res = await request(app.getHttpServer()).get(url).set("Accept", "application/json").send();

    expect(res.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
  });
});
