import {User} from "@entities";
import {config} from "@config";
import * as jose from "jose";

interface TokenPayload extends jose.JWTPayload {
  userId: string;
}

export interface AccessTokenPayload extends TokenPayload {}

export interface RefreshTokenPayload extends TokenPayload {
  tokenVersion: number;
}

export async function createAccessToken(user: User) {
  const payload: AccessTokenPayload = {
    userId: user.id,
  };

  return {
    accessToken: await new jose.SignJWT(payload)
      .setProtectedHeader({alg: config.accessTokenAlg, typ: "JWT"})
      .setIssuedAt()
      .setIssuer(config.jwtIssuer)
      .setAudience(config.jwtAudience)
      .setExpirationTime(config.jwtAccessTokenExp)
      .sign(await config.accessTokenPrivateKey),
  };
}

export async function createRefreshToken(user: User) {
  const payload: RefreshTokenPayload = {
    userId: user.id,
    tokenVersion: user.tokenVersion,
  };

  return {
    refreshToken: await new jose.SignJWT(payload)
      .setProtectedHeader({alg: config.refreshTokenAlg, typ: "JWT"})
      .setIssuedAt()
      .setIssuer(config.jwtIssuer)
      .setAudience(config.jwtAudience)
      .setExpirationTime(config.jwtRefreshTokenExp)
      .sign(config.refreshTokenPrivateKey),
  };
}

export async function createJwt(user: User) {
  return {...(await createAccessToken(user)), ...(await createRefreshToken(user))};
}

export async function verifyRefreshToken(token: string) {
  const decoded = await jose.jwtVerify(token, config.refreshTokenPrivateKey);
  return decoded.payload as RefreshTokenPayload;
}
