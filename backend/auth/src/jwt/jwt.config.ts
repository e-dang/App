import {IsDefined, IsEnum, IsString} from "class-validator";
import {importPKCS8, importSPKI, KeyLike} from "jose";
import {register} from "@config";

enum AccessTokenAlgorithm {
  EdDSA = "EdDSA",
}

enum RefreshTokenAlgorithm {
  HS512 = "HS512",
}

interface JwtConfigProperties {
  readonly jwtAccessTokenExp: string;
  readonly jwtRefreshTokenExp: string;
  readonly jwtAccessTokenAlg: AccessTokenAlgorithm;
  readonly jwtRefreshTokenAlg: RefreshTokenAlgorithm;
  readonly jwtRefreshTokenSecret: unknown;
  readonly jwtAccessTokenPrivateKey: unknown;
  readonly jwtAccessTokenPublicKey: unknown;
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
  readonly jwtAccessTokenAlg: AccessTokenAlgorithm;

  @IsEnum(RefreshTokenAlgorithm)
  @IsDefined()
  readonly jwtRefreshTokenAlg: RefreshTokenAlgorithm;

  @IsString()
  @IsDefined()
  readonly jwtRefreshTokenSecret: string;

  @IsString()
  @IsDefined()
  readonly jwtAccessTokenPrivateKey: string;

  @IsString()
  @IsDefined()
  readonly jwtAccessTokenPublicKey: string;

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

  readonly jwtAccessTokenAlg: AccessTokenAlgorithm;

  readonly jwtRefreshTokenAlg: RefreshTokenAlgorithm;

  readonly jwtRefreshTokenSecret: Uint8Array;

  readonly jwtAccessTokenPrivateKey: KeyLike;

  readonly jwtAccessTokenPublicKey: KeyLike;

  readonly jwtIssuer: string;

  readonly jwtAudience: string;

  constructor(
    validatedConfig: InputJwtConfigValidator,
    jwtAccessTokenPrivateKey: KeyLike,
    jwtAccessTokenPublicKey: KeyLike,
  ) {
    this.jwtAccessTokenExp = validatedConfig.jwtAccessTokenExp;
    this.jwtRefreshTokenExp = validatedConfig.jwtRefreshTokenExp;
    this.jwtAccessTokenAlg = validatedConfig.jwtAccessTokenAlg;
    this.jwtRefreshTokenAlg = validatedConfig.jwtRefreshTokenAlg;
    this.jwtRefreshTokenSecret = new TextEncoder().encode(validatedConfig.jwtRefreshTokenSecret);
    this.jwtAccessTokenPrivateKey = jwtAccessTokenPrivateKey;
    this.jwtAccessTokenPublicKey = jwtAccessTokenPublicKey;
    this.jwtIssuer = validatedConfig.jwtIssuer;
    this.jwtAudience = validatedConfig.jwtAudience;
  }
}

export const jwtConfig = register(InputJwtConfigValidator, (validatedConfig) => {
  return {
    provide: JwtConfig,
    useFactory: async () => {
      const jwtAccessTokenPublicKey = await importSPKI(
        validatedConfig.jwtAccessTokenPublicKey.replace(/\\n/g, "\n"),
        validatedConfig.jwtAccessTokenAlg,
      );
      const jwtAccessTokenPrivateKey = await importPKCS8(
        validatedConfig.jwtAccessTokenPrivateKey.replace(/\\n/g, "\n"),
        validatedConfig.jwtAccessTokenAlg,
      );

      return new JwtConfig(validatedConfig, jwtAccessTokenPrivateKey, jwtAccessTokenPublicKey);
    },
  };
});
