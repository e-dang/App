import request from "supertest";
import {User} from "@users/entities/user.entity";
import {HttpStatus} from "@nestjs/common";
import {Response} from "@core/types";
import {instanceToPlain} from "class-transformer";
import {Repository} from "typeorm";
import {integrationTest, testUnauthorizedRequests} from "../testWrappers";
import {makeCreateUserAndToken} from "../utils";

integrationTest("PATCH /user", ({app, moduleRef, getRepository}) => () => {
  const url = "/api/v1/user";
  let user: User;
  let accessToken: string;
  let newName: string;
  const newEmail = "newemail@demo.com";
  let repo: Repository<User>;
  const createUserAndToken = makeCreateUserAndToken(moduleRef);

  beforeAll(() => {
    repo = getRepository(User);
  });
  beforeEach(async () => {
    ({user, accessToken} = await createUserAndToken());
    newName = `${user.name}nadioajd129i`;
  });

  describe("successful request", () => {
    test("returns 200 status code on name update", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({
          name: newName,
        });

      expect(res.statusCode).toBe(HttpStatus.OK);
      const updatedUser = await repo.findOne({name: newName});
      expect(updatedUser).not.toBeUndefined();
      const payload = (res.body as Response<User>).data;
      expect(payload).toStrictEqual(instanceToPlain(updatedUser));
    });

    test("returns 200 status code on email update", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({
          email: newEmail,
        });

      expect(res.statusCode).toBe(HttpStatus.OK);
      const updatedUser = await repo.findOne({email: newEmail});
      expect(updatedUser).not.toBeUndefined();
      const payload = (res.body as Response<User>).data;
      expect(payload).toStrictEqual(instanceToPlain(updatedUser));
    });
  });

  describe("bad request", () => {
    test("returns 400 error when name is an empty string", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({
          name: "",
        });

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedUser = await repo.findOne({name: ""});
      expect(updatedUser).toBeUndefined();
    });

    test("returns 400 error when name is null", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({
          name: null,
        });

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedUser = await repo.findOne({name: null});
      expect(updatedUser).toBeUndefined();
    });

    test("returns 400 error when email is malformed", async () => {
      const badEmail = "malformed email";
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({
          email: badEmail,
        });

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedUser = await repo.findOne({email: badEmail});
      expect(updatedUser).toBeUndefined();
    });

    test("returns 400 error when email is null", async () => {
      const res = await request(app.getHttpServer())
        .patch(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send({
          email: null,
        });

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const updatedUser = await repo.findOne({email: null});
      expect(updatedUser).toBeUndefined();
    });
  });

  testUnauthorizedRequests(
    () => request(app.getHttpServer()).get(url),
    () => accessToken,
    () => ({
      name: newName,
    }),
  );
});
