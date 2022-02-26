import {IsDefined, IsEnum, IsString} from "class-validator";
import {importPKCS8, importSPKI, KeyLike} from "jose";
import {createConfigProvider} from "../config/app.config";

enum AccessTokenAlgorithm {
  EdDSA = "EdDSA",
}

enum RefreshTokenAlgorithm {
  HS512 = "HS512",
}

interface JwtConfigProperties {
  readonly jwtAccessTokenExp: string;
  readonly jwtRefreshTokenExp: string;
  readonly accessTokenAlg: AccessTokenAlgorithm;
  readonly refreshTokenAlg: RefreshTokenAlgorithm;
  readonly refreshTokenSecret: unknown;
  readonly accessTokenPrivateKey: unknown;
  readonly accessTokenPublicKey: unknown;
  readonly jwtIssuer: string;
  readonly jwtAudience: string;
}

class InputJwtConfigValidator implements JwtConfigProperties {
  @IsString()
  @IsDefined()
  readonly jwtAccessTokenExp: string;

  @IsString()
  @IsDefined()
  readonly jwtRefreshTokenExp: string;

  @IsEnum(AccessTokenAlgorithm)
  @IsDefined()
  readonly accessTokenAlg: AccessTokenAlgorithm;

  @IsEnum(RefreshTokenAlgorithm)
  @IsDefined()
  readonly refreshTokenAlg: RefreshTokenAlgorithm;

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

export class JwtConfig implements JwtConfigProperties {
  readonly jwtAccessTokenExp: string;

  readonly jwtRefreshTokenExp: string;

  readonly accessTokenAlg: AccessTokenAlgorithm;

  readonly refreshTokenAlg: RefreshTokenAlgorithm;

  readonly refreshTokenSecret: Uint8Array;

  readonly accessTokenPrivateKey: KeyLike;

  readonly accessTokenPublicKey: KeyLike;

  readonly jwtIssuer: string;

  readonly jwtAudience: string;

  constructor(validatedConfig: InputJwtConfigValidator, accessTokenPrivateKey: KeyLike, accessTokenPublicKey: KeyLike) {
    this.jwtAccessTokenExp = validatedConfig.jwtAccessTokenExp;
    this.jwtRefreshTokenExp = validatedConfig.jwtRefreshTokenExp;
    this.accessTokenAlg = validatedConfig.accessTokenAlg;
    this.refreshTokenAlg = validatedConfig.refreshTokenAlg;
    this.refreshTokenSecret = new TextEncoder().encode(validatedConfig.refreshTokenSecret);
    this.accessTokenPrivateKey = accessTokenPrivateKey;
    this.accessTokenPublicKey = accessTokenPublicKey;
    this.jwtIssuer = validatedConfig.jwtIssuer;
    this.jwtAudience = validatedConfig.jwtAudience;
  }
}

export const jwtConfig = createConfigProvider(InputJwtConfigValidator, (validatedConfig) => {
  return {
    provide: JwtConfig,
    useFactory: async () => {
      const accessTokenPublicKey = await importSPKI(
        validatedConfig.accessTokenPublicKey.replace(/\\n/g, "\n"),
        validatedConfig.accessTokenAlg,
      );
      const accessTokenPrivateKey = await importPKCS8(
        validatedConfig.accessTokenPrivateKey.replace(/\\n/g, "\n"),
        validatedConfig.accessTokenAlg,
      );

      return new JwtConfig(validatedConfig, accessTokenPrivateKey, accessTokenPublicKey);
    },
  };
});
