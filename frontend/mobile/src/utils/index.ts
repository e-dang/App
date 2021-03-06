import {Buffer} from "buffer";

export * from "./async";
export * from "./errors";

export function decode<T>(jwt: string) {
  const tokenParts = jwt.split(".");
  return JSON.parse(Buffer.from(tokenParts[1], "base64").toString()) as T;
}
