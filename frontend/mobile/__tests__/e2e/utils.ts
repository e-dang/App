import {by, element} from "detox";
import {v4 as uuidv4} from "uuid";
import axios from "axios";
import {SignInRequest, SignUpRequest} from "@api";
import {decode} from "@utils";
import {ExerciseType} from "@entities";

const BASE_URL = "https://dev.erickdang.com/api/v1";
const MAILHOG_URL = "https://mail.dev.erickdang.com/api/v2/search";

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

export const extractCookies = (headers: any): Cookies => {
  const cookies: string[] = headers["set-cookie"];

  return cookies.reduce((shapedCookies: Cookies, cookieString: string) => {
    const [rawCookie, ...flags] = cookieString.split("; ");
    const [cookieName, value] = rawCookie.split("=");
    return {...shapedCookies, [cookieName]: {value, flags: shapeFlags(flags)}};
  }, {}) as Cookies;
};

export function generateEmail() {
  return `${uuidv4()}@e2etest.com`;
}

export async function createUser(userData: Partial<SignUpRequest> = {}) {
  const data = {
    name: userData.name || "E2E Test User",
    email: userData.email || generateEmail(),
    password: userData.password || "Mytestpassword123!",
  };

  const response = await axios.post(`${BASE_URL}/auth/signup`, data);

  return {
    ...data,
    accessToken: response.data.data.accessToken,
    refreshToken: extractCookies(response.headers).rt.value,
  };
}

export async function signOut() {
  await element(by.id("masterSignOut")).tap();
}

export async function checkForEmail(to: string, predicate: (msg: any) => boolean) {
  const messages = await axios.get(MAILHOG_URL, {
    params: {
      kind: "to",
      query: to,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return (messages.data.items as any[]).some(predicate);
}

export async function signIn({email, password}: SignInRequest) {
  await element(by.id("signInBtn")).tap();
  await element(by.id("emailInput")).typeText(email);
  await element(by.id("passwordInput")).typeText(password);
  await element(by.id("signInBtn")).tap();
}

export async function createExercises(accessToken: string, exercises: Partial<ExerciseType>[]) {
  const payload = decode<{userId: string}>(accessToken);

  for (const exercise of exercises) {
    await axios.post(`${BASE_URL}/${payload.userId}/exercises`, exercise, {
      headers: {Authorization: `Token ${accessToken}`},
    });
  }
}
