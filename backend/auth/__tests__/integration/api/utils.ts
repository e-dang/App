import {User} from "@entities";
import supertest from "supertest";
import {Express} from "express";

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

export const extractCookies = (headers): Cookies => {
  const cookies: string[] = headers["set-cookie"];

  return cookies.reduce((shapedCookies: Cookies, cookieString: string) => {
    const [rawCookie, ...flags] = cookieString.split("; ");
    const [cookieName, value] = rawCookie.split("=");
    return {...shapedCookies, [cookieName]: {value, flags: shapeFlags(flags)}};
  }, {}) as Cookies;
};

export const createUser = async (
  app: Express,
  {email, name, password}: {email: string; name: string; password: string},
) => {
  const res = await supertest(app).post("/api/v1/auth/signup").send({email, name, password});
  const user = await User.findOne({email});
  return {
    user,
    refreshToken: extractCookies(res.headers).rt.value,
    accessToken: res.body.data.accessToken,
  };
};

export const decode = <T>(jwt: string) => {
  const tokenParts = jwt.split(".");
  return JSON.parse(Buffer.from(tokenParts[1], "base64").toString()) as T;
};
