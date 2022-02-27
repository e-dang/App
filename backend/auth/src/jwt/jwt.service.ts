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
      .setProtectedHeader({alg: this.config.jwtAccessTokenAlg, type: "JWT"})
      .setIssuedAt()
      .setIssuer(this.config.jwtIssuer)
      .setAudience(this.config.jwtAudience)
      .setExpirationTime(this.config.jwtAccessTokenExp)
      .sign(this.config.jwtAccessTokenPrivateKey);
  }

  createRefreshToken(user: User) {
    const payload: RefreshTokenPayload = {
      userId: user.id,
      tokenVersion: user.tokenVersion,
    };

    return new jose.SignJWT(payload)
      .setProtectedHeader({alg: this.config.jwtRefreshTokenAlg, type: "JWT"})
      .setIssuedAt()
      .setIssuer(this.config.jwtIssuer)
      .setAudience(this.config.jwtAudience)
      .setExpirationTime(this.config.jwtRefreshTokenExp)
      .sign(this.config.jwtRefreshTokenSecret);
  }

  async createJwt(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(user),
      this.createRefreshToken(user),
    ]);
    return {accessToken, refreshToken};
  }

  async verifyAccessToken(token: string) {
    const decoded = await jose.jwtVerify(token, this.config.jwtAccessTokenPublicKey);
    return decoded.payload as AccessTokenPayload;
  }

  async verifyRefreshToken(token: string) {
    try {
      return (await jose.jwtVerify(token, this.config.jwtRefreshTokenSecret)).payload as RefreshTokenPayload;
    } catch (err) {
      throw new InvalidTokenException();
    }
  }
}
