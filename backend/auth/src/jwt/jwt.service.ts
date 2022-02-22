import {AccessTokenPayload, RefreshTokenPayload} from "@jwt/types";
import {Injectable} from "@nestjs/common";
import {User} from "@users/entities/user.entity";
import * as jose from "jose";
import {InvalidTokenException} from "@core/exceptions/invalid-token";
import {JwtConfig} from "@src/config/jwt.config";

@Injectable()
export class JwtService {
  private accessTokenPrivateKey: Promise<jose.KeyLike>;

  private accessTokenPublicKey: Promise<jose.KeyLike>;

  private refreshTokenPrivateKey: Uint8Array;

  constructor(private readonly config: JwtConfig) {
    this.accessTokenPrivateKey = jose.importPKCS8(
      config.accessTokenPrivateKey.replace(/\\n/g, "\n"),
      config.accessTokenAlg,
    );
    this.accessTokenPublicKey = jose.importSPKI(
      config.accessTokenPublicKey.replace(/\\n/g, "\n"),
      config.accessTokenAlg,
    );
    this.refreshTokenPrivateKey = new TextEncoder().encode(config.refreshTokenSecret);
  }

  async createAccessToken(user: User) {
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
      .sign(await this.accessTokenPrivateKey);
  }

  async createRefreshToken(user: User) {
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
      .sign(this.refreshTokenPrivateKey);
  }

  async createJwt(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(user),
      this.createRefreshToken(user),
    ]);
    return {accessToken, refreshToken};
  }

  async verifyAccessToken(token: string) {
    const decoded = await jose.jwtVerify(token, await this.accessTokenPublicKey);
    return decoded.payload as AccessTokenPayload;
  }

  async verifyRefreshToken(token: string) {
    try {
      return (await jose.jwtVerify(token, this.refreshTokenPrivateKey)).payload as RefreshTokenPayload;
    } catch (err) {
      throw new InvalidTokenException();
    }
  }
}
