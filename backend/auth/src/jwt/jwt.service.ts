import {Injectable} from "@nestjs/common";
import {User} from "@users";
import * as jose from "jose";
import {InvalidTokenException} from "@core/exceptions";
import {AccessTokenPayload, RefreshTokenPayload} from "./types";
import {JwtConfig} from "./jwt.config";

@Injectable()
export class JwtService {
  constructor(private readonly config: JwtConfig) {}

  createAccessToken(user: User) {
    const payload: AccessTokenPayload = {
      userId: user.id,
      role: user.role,
    };

    return new jose.SignJWT(payload)
      .setProtectedHeader({alg: this.config.accessTokenAlg, type: "JWT"})
      .setIssuedAt()
      .setIssuer(this.config.jwtIssuer)
      .setAudience(this.config.jwtAudience)
      .setExpirationTime(this.config.jwtAccessTokenExp)
      .sign(this.config.accessTokenPrivateKey);
  }

  createRefreshToken(user: User) {
    const payload: RefreshTokenPayload = {
      userId: user.id,
      tokenVersion: user.tokenVersion,
    };

    return new jose.SignJWT(payload)
      .setProtectedHeader({alg: this.config.refreshTokenAlg, type: "JWT"})
      .setIssuedAt()
      .setIssuer(this.config.jwtIssuer)
      .setAudience(this.config.jwtAudience)
      .setExpirationTime(this.config.jwtRefreshTokenExp)
      .sign(this.config.refreshTokenSecret);
  }

  async createJwt(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(user),
      this.createRefreshToken(user),
    ]);
    return {accessToken, refreshToken};
  }

  async verifyAccessToken(token: string) {
    const decoded = await jose.jwtVerify(token, this.config.accessTokenPublicKey);
    return decoded.payload as AccessTokenPayload;
  }

  async verifyRefreshToken(token: string) {
    try {
      return (await jose.jwtVerify(token, this.config.refreshTokenSecret)).payload as RefreshTokenPayload;
    } catch (err) {
      throw new InvalidTokenException();
    }
  }
}
