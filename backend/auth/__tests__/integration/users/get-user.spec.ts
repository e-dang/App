import request from "supertest";
import {User} from "@users/entities/user.entity";
import {HttpStatus} from "@nestjs/common";
import {Response} from "@core/types";
import {instanceToPlain} from "class-transformer";
import {integrationTest, testUnauthorizedRequests} from "../testWrappers";
import {makeCreateUserAndToken} from "../utils";

integrationTest("GET /user", ({app, moduleRef}) => () => {
  const url = "/api/v1/user";
  let user: User;
  let accessToken: string;
  const createUserAndToken = makeCreateUserAndToken(moduleRef);

  beforeEach(async () => {
    ({user, accessToken} = await createUserAndToken());
  });

  describe("successful request", () => {
    test("returns 200 status code on success", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Accept", "application/json")
        .set("Authorization", `Token ${accessToken}`)
        .send();

      expect(res.statusCode).toBe(HttpStatus.OK);
    });

    test("returns the user whose id is contained in the access token", async () => {
      const res = await request(app.getHttpServer())
        .get(url)
        .set("Accept", "application/json")
        .set("Authorization", `Token ${accessToken}`)
        .send();

      const payload = (res.body as Response<User>).data;
      expect(payload).not.toHaveProperty("password");
      expect(payload).not.toHaveProperty("lastLogin");
      expect(payload).not.toHaveProperty("tokenVersion");
      expect(payload).not.toHaveProperty("role");
      expect(payload).not.toHaveProperty("deletedAt");
      expect(payload).toStrictEqual(instanceToPlain(user));
    });
  });

  testUnauthorizedRequests(
    () => request(app.getHttpServer()).get(url),
    () => accessToken,
  );
});
