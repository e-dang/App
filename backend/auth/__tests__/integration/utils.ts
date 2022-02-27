import {User} from "@users/entities/user.entity";
import {DeepPartial} from "typeorm";
import request from "supertest";
import {Role} from "@core/types";
import {AccessTokenPayload} from "@jwt/types";
import {UsersService} from "@users/users.service";
import {JwtService} from "@jwt/jwt.service";
import {TestingModule} from "@nestjs/testing";
import MockDate from "mockdate";
import {PasswordHasherService} from "@password-hasher/password-hasher.service";
import {PasswordResetService} from "@password-reset/password-reset.service";

export function createUserData(overrides: DeepPartial<User> = {}) {
  return {
    name: "Test User",
    email: "email@demo.com",
    password: "Mytestpassword123!",
    lastLogin: new Date(),
    role: Role.User,
    ...overrides,
  } as DeepPartial<User>;
}

export function makeCreateUser(moduleRef: TestingModule) {
  return async (overrides: DeepPartial<User> = {}) => {
    const data = createUserData(overrides);
    const userService = moduleRef.get(UsersService);
    const user = await userService.create(data);

    return {user, password: data.password};
  };
}

export function makeCreateJwtForUser(moduleRef: TestingModule) {
  return (user: User) => {
    const jwtService = moduleRef.get(JwtService);
    return jwtService.createJwt(user);
  };
}

export function makePasswordIsValid(moduleRef: TestingModule) {
  return (password: string, storedPassword: string) => {
    const passwordHasher = moduleRef.get(PasswordHasherService);
    return passwordHasher.passwordIsValid(password, storedPassword);
  };
}

export function makeCreateUserAndToken(moduleRef: TestingModule) {
  const createUser = makeCreateUser(moduleRef);
  const createJwt = makeCreateJwtForUser(moduleRef);

  return async (overrides: DeepPartial<User> = {}) => {
    const {user, password} = await createUser(overrides);
    const tokens = await createJwt(user);
    return {user, password, ...tokens};
  };
}

export function makeCreatePasswordResetToken(moduleRef: TestingModule) {
  return (user: User) => {
    const passwordResetService = moduleRef.get(PasswordResetService);
    return passwordResetService.createToken(user);
  };
}

export const decode = <T>(jwt: string) => {
  const tokenParts = jwt.split(".");
  return JSON.parse(Buffer.from(tokenParts[1], "base64").toString()) as T;
};

interface Flags {
  [x: string]: string | boolean;
}

interface Cookie {
  value: string;
  flags: Flags;
}

export interface Cookies {
  [x: string]: Cookie;
}

// https://gist.github.com/the-vampiire/a564af41ed0ce8eb7c30dbe6c0f627d8
const shapeFlags = (flags: string[]) =>
  flags.reduce((shapedFlags: Flags, flag: string) => {
    const [flagName, rawValue] = flag.split("=");
    // edge case where a cookie has a single flag and "; " split results in trailing ";"
    const value = rawValue ? rawValue.replace(";", "") : true;
    return {...shapedFlags, [flagName]: value};
  }, {}) as Flags;

export const extractCookies = (res: request.Response): Cookies => {
  const cookies = (res.headers as Record<string, string[]>)["set-cookie"];

  return cookies.reduce((shapedCookies: Cookies, cookieString: string) => {
    const [rawCookie, ...flags] = cookieString.split("; ");
    const [cookieName, value] = rawCookie.split("=");
    return {...shapedCookies, [cookieName]: {value, flags: shapeFlags(flags)}};
  }, {}) as Cookies;
};

export function expireToken(accessToken: string) {
  const payload = decode<AccessTokenPayload>(accessToken);
  MockDate.set(payload.exp * 1000 + 2000);
}
