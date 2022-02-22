import request from "supertest";
import {User} from "@users/entities/user.entity";
import {HttpStatus} from "@nestjs/common";
import {mocked, MockedObjectDeep} from "jest-mock";
import nodemailer, {Transporter} from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import {integrationTest} from "../testWrappers";
import {makeCreateUser} from "../utils";

jest.mock("nodemailer", () => {
  return {
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn(),
    }),
  };
});

const mockedNodeMailer = mocked(nodemailer, true);

integrationTest("/password/reset", ({app, moduleRef}) => () => {
  const url = "/api/v1/auth/password/reset";
  let user: User;
  const createUser = makeCreateUser(moduleRef);
  const mockedTransport = mockedNodeMailer.createTransport() as MockedObjectDeep<
    Transporter<SMTPTransport.SentMessageInfo>
  >;

  beforeEach(async () => {
    mockedTransport.sendMail.mockClear();
    ({user} = await createUser());
  });

  describe("successful request", () => {
    test("returns 200 status code when use with email exists", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({email: user.email});

      expect(res.statusCode).toBe(HttpStatus.OK);
    });

    test("sends an email to the user with a link to reset their password that contains the user id and generated token", async () => {
      await request(app.getHttpServer()).post(url).set("Accept", "application/json").send({email: user.email});

      const message = mockedTransport.sendMail.mock.calls[0][0];
      expect(message.to).toEqual(user.email);
      expect(message.html).toContain(user.id);
    });

    test("returns 200 status code when no user exists with the given email", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({email: "doesnotexist@demo.com"});

      expect(res.statusCode).toBe(HttpStatus.OK);
    });

    test("does not send an email when no user has the provided email address", async () => {
      await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({email: "doesnotexist@demo.com"});

      expect(mockedTransport.sendMail.mock.calls.length).toBe(0);
    });
  });

  describe("bad request", () => {
    test("returns 400 status code when email is invalid", async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .set("Accept", "application/json")
        .send({email: "invalid email address"});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test("returns 400 status code when email is not provided", async () => {
      const res = await request(app.getHttpServer()).post(url).set("Accept", "application/json").send({});

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });
});
