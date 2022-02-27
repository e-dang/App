import request from "supertest";
import {Repository} from "typeorm";
import {User} from "@users/entities/user.entity";
import {HttpStatus} from "@nestjs/common";
import MockDate from "mockdate";
import {RefreshTokenPayload} from "@jwt/types";
import {decode, makeCreateUserAndToken} from "../utils";
import {integrationTest, testUnauthorizedRequests} from "../testWrappers";

integrationTest("/signout", ({app, moduleRef, getRepository}) => () => {
  const url = "/api/v1/auth/signout";
  let user: User;
  let accessToken: string;
  let refreshToken: string;
  const createUserAndToken = makeCreateUserAndToken(moduleRef);
  let repo: Repository<User>;

  beforeAll(() => {
    repo = getRepository(User);
  });

  beforeEach(async () => {
    MockDate.reset();
    ({user, accessToken, refreshToken} = await createUserAndToken());
  });

  describe("successful request", () => {
    test("returns 200 status code", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
    });

    test("increments user's tokenVersion", async () => {
      await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      const payload = decode<RefreshTokenPayload>(refreshToken);
      const userAfterSignOut = await repo.findOne(user.id);
      expect(payload.tokenVersion).toBe(userAfterSignOut.tokenVersion - 1);
    });
  });

  testUnauthorizedRequests(
    () => request(app.getHttpServer()).post(url),
    () => accessToken,
  );
});
