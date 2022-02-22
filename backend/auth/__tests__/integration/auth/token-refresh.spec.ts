import {User} from "@users/entities/user.entity";
import request from "supertest";
import {Response} from "@core/types";
import {Repository} from "typeorm";
import {HttpStatus} from "@nestjs/common";
import MockDate from "mockdate";
import {AccessTokenPayload, RefreshTokenPayload} from "@jwt/types";
import {decode, expireToken, extractCookies, makeCreateUserAndToken} from "../utils";
import {integrationTest} from "../testWrappers";

integrationTest("/token/refresh", ({app, moduleRef, getRepository}) => () => {
  const url = "/api/v1/auth/token/refresh";
  let refreshToken: string;
  let user: User;
  let repo: Repository<User>;
  const createUserAndToken = makeCreateUserAndToken(moduleRef);

  beforeAll(() => {
    repo = getRepository(User);
  });

  beforeEach(async () => {
    MockDate.reset();
    ({user, refreshToken} = await createUserAndToken());
  });

  describe("successful request", () => {
    test("returns 200 status code when successful", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Cookie", [`rt=${refreshToken}`])
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
    });

    test("returns an accessToken in response body", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Cookie", [`rt=${refreshToken}`])
        .set("Accept", "application/json")
        .send();

      const {accessToken} = (res.body as Response<{accessToken: string}>).data;
      const payload = decode<AccessTokenPayload>(accessToken);
      expect(user.id).toBe(payload.userId);
      expect(user.role).toBe(payload.role);
    });

    test("returns a refreshToken in httpOnly header", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Cookie", [`rt=${refreshToken}`])
        .set("Accept", "application/json")
        .send();

      const cookies = extractCookies(res);
      expect(cookies.rt.flags.HttpOnly).toBe(true);
      const payload = decode<RefreshTokenPayload>(cookies.rt.value);
      expect(user.id).toBe(payload.userId);
      expect(user.tokenVersion).toBe(payload.tokenVersion);
    });
  });

  describe("bad request", () => {
    test("returns 400 status code when refresh token is not included in cookies", async () => {
      const res = await request(app.getHttpServer()).post(url).set("Accept", "application/json").send();

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("returns 400 status code when refresh token is malformed jwt", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Cookie", ["rt=not a jwt"])
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("returns 400 status code when refresh token signature is invalid", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Cookie", [`rt=${refreshToken} + invalidate`])
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("returns 400 status code when refresh token is expired", async () => {
      expireToken(refreshToken);
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Cookie", [`rt=${refreshToken}`])
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("returns 400 status code when refresh token does not have the same tokenVersion as the user", async () => {
      user.tokenVersion++;
      await repo.save(user);
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Cookie", [`rt=${refreshToken}`])
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });
});
