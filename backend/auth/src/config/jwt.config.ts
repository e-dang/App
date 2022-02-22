import {IsDefined, IsString} from "class-validator";

export class JwtConfig {
  @IsString()
  @IsDefined()
  readonly jwtAccessTokenExp: string;

  @IsString()
  @IsDefined()
  readonly jwtRefreshTokenExp: string;

  @IsString()
  @IsDefined()
  readonly accessTokenAlg: string;

  @IsString()
  @IsDefined()
  readonly refreshTokenAlg: string;

  @IsString()
  @IsDefined()
  readonly refreshTokenSecret: string;

  @IsString()
  @IsDefined()
  readonly accessTokenPrivateKey: string;

  @IsString()
  @IsDefined()
  readonly accessTokenPublicKey: string;

  @IsString()
  @IsDefined()
  readonly jwtIssuer: string;

  @IsString()
  @IsDefined()
  readonly jwtAudience: string;
}
