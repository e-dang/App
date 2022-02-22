import {HttpStatus} from "@nestjs/common";
import request from "supertest";
import {User} from "@users/entities/user.entity";
import {Repository} from "typeorm";
import _ from "lodash";
import {Response} from "@core/types";
import {AccessTokenPayload, RefreshTokenPayload} from "@jwt/types";
import {createUserData, decode, extractCookies, makeCreateUser} from "../utils";
import {integrationTest} from "../testWrappers";

integrationTest("/signin", ({app, moduleRef, getRepository}) => () => {
  let repo: Repository<User>;
  const createUser = makeCreateUser(moduleRef);

  const url = "/api/v1/auth/signin";
  let user: User;
  let signInData: {
    email: string;
    password: string;
  };

  beforeAll(() => {
    repo = getRepository(User);
  });

  beforeEach(async () => {
    let password: string;
    const data = createUserData();
    ({user, password} = await createUser(data));
    signInData = {
      email: user.email,
      password,
    };
  });

  describe("successful request", () => {
    test("returns 200 status code", async () => {
      const res = await request(app.getHttpServer()).post(url).set("Accept", "application/json").send(signInData);

      expect(res.statusCode).toBe(HttpStatus.OK);
    });

    test("returns accessToken with userId and role in body", async () => {
      const res = await request(app.getHttpServer()).post(url).set("Accept", "application/json").send(signInData);

      const {accessToken} = (res.body as Response<{accessToken: string}>).data;
      const accessTokenPayload = decode<AccessTokenPayload>(accessToken);
      expect(accessTokenPayload.userId).toEqual(user.id);
      expect(accessTokenPayload.role).toEqual(user.role);
    });

    test("returns refreshToken with userId and tokenVersion in http only cookie", async () => {
      const res = await request(app.getHttpServer()).post(url).set("Accept", "application/json").send(signInData);

      const cookies = extractCookies(res);
      expect(cookies.rt.flags.HttpOnly).toBe(true);
      const refreshTokenPayload = decode<RefreshTokenPayload>(cookies.rt.value);
      expect(refreshTokenPayload.userId).toEqual(user.id);
      expect(refreshTokenPayload.tokenVersion).toEqual(user.tokenVersion);
    });

    test("updates user lastLogin time", async () => {
      const prevLastLoginTime = new Date(user.lastLogin);
      await request(app.getHttpServer()).post(url).set("Accept", "application/json").send(signInData);

      const signedInUser = await repo.findOne(user.id);
      expect(new Date(signedInUser.lastLogin) > prevLastLoginTime).toBe(true);
    });
  });

  describe("bad request", () => {
    test("returns 400 status code when password is missing", async () => {
      const lastLogin = new Date(user.lastLogin);
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send(_.omit(signInData, "password"));

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const refreshedUser = await repo.findOne(user.id);
      expect(new Date(refreshedUser.lastLogin)).toEqual(lastLogin);
    });

    test("returns 400 status code when email is missing", async () => {
      const lastLogin = new Date(user.lastLogin);
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send(_.omit(signInData, "email"));

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const refreshedUser = await repo.findOne(user.id);
      expect(new Date(refreshedUser.lastLogin)).toEqual(lastLogin);
    });

    test("returns 400 status code when email is invalid", async () => {
      const lastLogin = new Date(user.lastLogin);
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({...signInData, email: "notanemail"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const refreshedUser = await repo.findOne(user.id);
      expect(new Date(refreshedUser.lastLogin)).toEqual(lastLogin);
    });
  });

  describe("not found request", () => {
    test("return 404 status code when password is not correct", async () => {
      const lastLogin = new Date(user.lastLogin);
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({...signInData, password: `${signInData.password}randomchars`});

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      const refreshedUser = await repo.findOne(user.id);
      expect(new Date(refreshedUser.lastLogin)).toEqual(lastLogin);
    });

    test("returns 404 status code when user with email does not exist", async () => {
      const lastLogin = new Date(user.lastLogin);
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({...signInData, email: `${signInData.email}dne`});

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      const refreshedUser = await repo.findOne(user.id);
      expect(new Date(refreshedUser.lastLogin)).toEqual(lastLogin);
    });
  });
});
