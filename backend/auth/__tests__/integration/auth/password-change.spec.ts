import request from "supertest";
import {User} from "@users/entities/user.entity";
import {Repository} from "typeorm";
import MockDate from "mockdate";
import {HttpStatus} from "@nestjs/common";
import {integrationTest, testUnauthorizedRequests} from "../testWrappers";
import {makeCreateUserAndToken, makePasswordIsValid} from "../utils";

integrationTest("/password/change", ({app, moduleRef, getRepository}) => () => {
  const url = "/api/v1/auth/password/change";
  let user: User;
  let accessToken: string;
  let password: string;
  let newPassword: string;
  let repo: Repository<User>;
  const createUserAndToken = makeCreateUserAndToken(moduleRef);
  const passwordIsValid = makePasswordIsValid(moduleRef);

  beforeAll(() => {
    repo = getRepository(User);
  });

  beforeEach(async () => {
    MockDate.reset();
    ({user, password, accessToken} = await createUserAndToken());
    newPassword = `${password}awidjioafhashfopa123(*^&*)`;
  });

  describe("successful request", () => {
    test("returns 200 status code", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({
          oldPassword: password,
          newPassword,
          confirmPassword: newPassword,
        });

      expect(res.statusCode).toBe(HttpStatus.OK);
    });

    test("changes the user's password", async () => {
      await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({
          oldPassword: password,
          newPassword,
          confirmPassword: newPassword,
        });

      const refreshedUser = await repo.findOne(user.id);
      const passwordsAreTheSame = passwordIsValid(newPassword, refreshedUser.password);
      expect(passwordsAreTheSame).toBe(true);
    });

    test("changes the password even if the new password is the same as the old password", async () => {
      await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({
          oldPassword: password,
          newPassword: password,
          confirmPassword: password,
        });

      const refreshedUser = await repo.findOne(user.id);
      expect(refreshedUser.password).not.toEqual(user.password);
    });
  });

  describe("bad request", () => {
    test("returns 400 status code when oldPassword is missing", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({
          newPassword,
          confirmPassword: newPassword,
        });

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("returns 400 status code when newPassword is missing", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({
          oldPassword: password,
          confirmPassword: newPassword,
        });

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("returns 400 status code when confirmPassword is missing", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({
          oldPassword: password,
          newPassword,
        });

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("returns 400 status code when new password is not a strong password", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({
          oldPassword: password,
          newPassword: "password123",
          confirmPassword: "password123",
        });

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("returns 400 status code when newPassword and confirmPassword are mismatching", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({
          oldPassword: password,
          newPassword,
          confirmPassword: `${newPassword}awdiajdjjjj`,
        });

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("returns 400 status code when old password doesnt match the old password in database", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({
          oldPassword: `${password}randomchars`,
          newPassword,
          confirmPassword: newPassword,
        });

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  testUnauthorizedRequests(
    () => request(app.getHttpServer()).post(url),
    () => accessToken,
    () => ({
      oldPassword: password,
      newPassword,
      confirmPassword: newPassword,
    }),
  );
});
