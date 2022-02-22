import {HttpStatus} from "@nestjs/common";
import request from "supertest";
import {User} from "@users/entities/user.entity";
import {DeepPartial, Repository} from "typeorm";
import _ from "lodash";
import {Response} from "@core/types";
import {AccessTokenPayload, RefreshTokenPayload} from "@jwt/types";
import {createUserData, decode, extractCookies} from "../utils";
import {integrationTest} from "../testWrappers";

integrationTest("/signup", ({app, getRepository}) => () => {
  const url = "/api/v1/auth/signup";
  let signUpData: DeepPartial<User>;
  let repo: Repository<User>;

  beforeAll(() => {
    repo = getRepository(User);
  });

  beforeEach(() => {
    signUpData = createUserData();
  });

  describe("successful request", () => {
    test("returns 201 status code", async () => {
      const res = await request(app.getHttpServer()).post(url).set("Accept", "application/json").send(signUpData);

      expect(res.statusCode).toBe(HttpStatus.CREATED);
    });

    test("creates user in database", async () => {
      await request(app.getHttpServer()).post(url).set("Accept", "application/json").send(signUpData);

      const user = await repo.findOne({email: signUpData.email});
      expect(user).not.toBeUndefined();
    });

    test("returns accessToken in response body", async () => {
      const res = await request(app.getHttpServer()).post(url).set("Accept", "application/json").send(signUpData);

      const user = await repo.findOne({email: signUpData.email});
      const {accessToken} = (res.body as Response<{accessToken: string}>).data;
      const accessTokenPayload = decode<AccessTokenPayload>(accessToken);
      expect(accessTokenPayload.userId).toEqual(user.id);
      expect(accessTokenPayload.role).toEqual(user.role);
    });

    test("returns refreshToken in http only cookie", async () => {
      const res = await request(app.getHttpServer()).post(url).set("Accept", "application/json").send(signUpData);

      const user = await repo.findOne({email: signUpData.email});
      const cookies = extractCookies(res);
      expect(cookies.rt.flags.HttpOnly).toBe(true);
      const refreshTokenPayload = decode<RefreshTokenPayload>(cookies.rt.value);
      expect(refreshTokenPayload.userId).toEqual(user.id);
      expect(refreshTokenPayload.tokenVersion).toEqual(user.tokenVersion);
    });

    test("strips extra data that would cause an error from request so that it still succeeds", async () => {
      const id = "notauuid";
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({...signUpData, id});

      expect(res.statusCode).toBe(HttpStatus.CREATED);

      const user = await repo.findOne({email: signUpData.email});
      expect(user).not.toBeUndefined();
      expect(user.id).not.toEqual(id);
    });
  });

  describe("bad request", () => {
    test("returns 400 status code when password is too common", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({
          ...signUpData,
          password: "password123",
        });

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("returns 400 status code when password is not given", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send(_.omit(signUpData, "password"));

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("returns 400 status code when email is invalid", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({
          ...signUpData,
          email: "bad email",
        });

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("returns 400 status code when email is not given", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send(_.omit(signUpData, "email"));

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("returns 400 status code when name is not a string", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({...signUpData, name: 1});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("returns 400 status code when name is blank", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({...signUpData, name: ""});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });

    test("returns 400 status code when name is not given", async () => {
      const prevCount = await repo.count();
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send(_.omit(signUpData, "name"));

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(prevCount).toBe(await repo.count());
    });
  });

  describe("request duplicating entities", () => {
    test("returns 409 status code when email has already been registered to a user", async () => {
      const user = repo.create({...signUpData, lastLogin: new Date()});
      await repo.save(user);
      const user2Name = `${signUpData.name}randomchars`;

      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({...signUpData, name: user2Name});

      expect(res.statusCode).toBe(HttpStatus.CONFLICT);
      const user2 = await repo.findOne({name: user2Name});
      expect(user2).toBeUndefined();
    });
  });
});
