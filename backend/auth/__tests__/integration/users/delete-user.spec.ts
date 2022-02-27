import request from "supertest";
import {User} from "@users/entities/user.entity";
import {HttpStatus} from "@nestjs/common";
import {Repository} from "typeorm";
import {integrationTest, testUnauthorizedRequests} from "../testWrappers";
import {makeCreateUserAndToken} from "../utils";

integrationTest("DELETE /user", ({app, moduleRef, getRepository}) => () => {
  const url = "/api/v1/user";
  let user: User;
  let accessToken: string;
  let repo: Repository<User>;
  const createUserAndToken = makeCreateUserAndToken(moduleRef);

  beforeAll(() => {
    repo = getRepository(User);
  });

  beforeEach(async () => {
    ({user, accessToken} = await createUserAndToken());
  });

  describe("successful request", () => {
    test("returns 204 status code", async () => {
      const res = await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      expect(res.statusCode).toBe(HttpStatus.NO_CONTENT);
    });

    test("soft deletes the user in the database", async () => {
      await request(app.getHttpServer())
        .delete(url)
        .set("Authorization", `Token ${accessToken}`)
        .set("Accept", "application/json")
        .send();

      const deletedUser = await repo.findOne(user.id, {withDeleted: true});
      expect(deletedUser.deletedAt).not.toBeNull();
    });
  });

  testUnauthorizedRequests(
    () => request(app.getHttpServer()).get(url),
    () => accessToken,
  );
});
