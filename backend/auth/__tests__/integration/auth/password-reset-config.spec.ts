import request from "supertest";
import {User} from "@users/entities/user.entity";
import {HttpStatus} from "@nestjs/common";
import MockDate from "mockdate";
import {randomUUID} from "crypto";
import {Repository} from "typeorm";
import {integrationTest} from "../testWrappers";
import {makeCreatePasswordResetToken, makeCreateUser, makePasswordIsValid} from "../utils";

integrationTest("/password/reset/confirm", ({app, moduleRef, getRepository}) => () => {
  const url = "/api/v1/auth/password/reset/confirm";
  let user: User;
  let token: string;
  let newPassword: string;
  let confirmPassword: string;
  let repo: Repository<User>;
  const createUser = makeCreateUser(moduleRef);
  const passwordIsValid = makePasswordIsValid(moduleRef);
  const createPasswordResetToken = makeCreatePasswordResetToken(moduleRef);

  beforeAll(() => {
    repo = getRepository(User);
  });

  beforeEach(async () => {
    let password: string;
    ({user, password} = await createUser());
    token = createPasswordResetToken(user);
    newPassword = `${password}randomchars12387^&^&`;
    confirmPassword = newPassword;
  });

  afterEach(() => {
    MockDate.reset();
  });

  describe("successful request", () => {
    test("returns 200 status code", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({userId: user.id, token, newPassword, confirmPassword});

      expect(res.statusCode).toBe(HttpStatus.OK);
    });

    test("successful request updates the user's password", async () => {
      await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({userId: user.id, token, newPassword, confirmPassword});

      const updatedUser = await repo.findOne(user.id);
      expect(passwordIsValid(newPassword, updatedUser.password)).toBe(true);
    });
  });

  describe("bad request", () => {
    test("returns 400 status code when userId is not provided", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({token, newPassword, confirmPassword});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("returns 400 status code when userId is not a uuid", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({userId: "dne-id", token, newPassword, confirmPassword});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("returns 400 status code when no user with the specified userId exists", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({userId: randomUUID(), token, newPassword, confirmPassword});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("returns 400 status code when token is not provided", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({userId: user.id, newPassword, confirmPassword});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("returns 400 status code when token is expired", async () => {
      MockDate.set(new Date().getTime() * 1000 + 2000);
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({userId: user.id, token, newPassword, confirmPassword});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("returns 400 status code when token is malformed", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({userId: user.id, token: `${token}randomchars`, newPassword, confirmPassword});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("returns 400 status code after user has already used the token to reset their password", async () => {
      const newPassword2 = `${newPassword}randomchars`;
      const res1 = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({userId: user.id, token, newPassword, confirmPassword});
      const res2 = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({userId: user.id, token, newPassword2, confirmPassword: newPassword2});

      const updatedUser = await repo.findOne(user.id);
      expect(res1.statusCode).toBe(HttpStatus.OK);
      expect(res2.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(passwordIsValid(newPassword, updatedUser.password)).toBe(true);
      expect(passwordIsValid(newPassword2, updatedUser.password)).toBe(false);
    });

    test("returns 400 status code when newPassword is not provided", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({userId: user.id, token, confirmPassword});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("returns 400 status code when newPassword is not a strong password", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({userId: user.id, token, newPassword: "password123", confirmPassword: "password123"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("returns 400 status code when confirmPassword is not provided", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({userId: user.id, token, newPassword});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("returns 400 status code when confirmPassword does not match newPassword", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({userId: user.id, token, newPassword, confirmPassword: `${newPassword}mismatch`});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });
});
