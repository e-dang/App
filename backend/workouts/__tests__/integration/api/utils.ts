import {User} from "@entities";
import {AccessTokenPayload} from "@src/middleware";
import {randomUUID} from "crypto";
import * as jose from "jose";

export async function createToken(payload: AccessTokenPayload) {
  return new jose.SignJWT(payload)
    .setProtectedHeader({alg: "EdDSA", typ: "JWT"})
    .setIssuedAt()
    .setIssuer("dev.erickdang.com")
    .setAudience("dev.erickdang.com")
    .setExpirationTime("5m")
    .sign(await jose.importPKCS8(process.env.accessTokenPrivateKey, "EdDSA"));
}

export async function createUserAndToken(): Promise<[User, string]> {
  const userId = randomUUID();
  const accessToken = await createToken({userId, roles: ["user"]});
  const user = await User.create({id: userId}).save();
  return [user, accessToken];
}

export async function createAdminUserAndToken(): Promise<[User, string]> {
  const userId = randomUUID();
  const accessToken = await createToken({userId, roles: ["admin"]});
  const user = await User.create({id: userId}).save();
  return [user, accessToken];
}

export const decode = <T>(jwt: string) => {
  const tokenParts = jwt.split(".");
  return JSON.parse(Buffer.from(tokenParts[1], "base64").toString()) as T;
};
