import {IsDefined, IsEnum, IsNumber, IsPositive, IsString} from "class-validator";
import {register} from "@config";
import {importSPKI, KeyLike} from "jose";

export enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

export enum AccessTokenAlgorithms {
  EdDSA = "EdDSA",
}

interface AppConfigProperties {
  readonly NODE_ENV: Environment;
  readonly httpPort: number;
  readonly allowedHosts: unknown;
  readonly accessTokenAlg: AccessTokenAlgorithms;
  readonly accessTokenPublicKey: unknown;
}

class InputAppConfigValidator implements AppConfigProperties {
  @IsEnum(Environment)
  @IsDefined()
  readonly NODE_ENV: Environment;

  @IsPositive()
  @IsNumber()
  @IsDefined()
  readonly httpPort: number;

  @IsString()
  @IsDefined()
  readonly allowedHosts: string;

  @IsString()
  @IsDefined()
  readonly accessTokenPublicKey: string;

  @IsEnum(AccessTokenAlgorithms)
  @IsDefined()
  readonly accessTokenAlg: AccessTokenAlgorithms;
}

export class AppConfig implements AppConfigProperties {
  readonly apiVersion: string = "1";

  readonly NODE_ENV: Environment;

  readonly httpPort: number;

  readonly allowedHosts: string[];

  readonly accessTokenPublicKey: KeyLike;

  readonly accessTokenAlg: AccessTokenAlgorithms;

  constructor(validatedConfig: InputAppConfigValidator, accessTokenPublicKey: KeyLike) {
    this.NODE_ENV = validatedConfig.NODE_ENV;
    this.httpPort = validatedConfig.httpPort;
    this.allowedHosts = validatedConfig.allowedHosts.split(",");
    this.accessTokenAlg = validatedConfig.accessTokenAlg;
    this.accessTokenPublicKey = accessTokenPublicKey;
  }
}

export const appConfig = register(InputAppConfigValidator, (validatedConfig) => {
  return {
    provide: AppConfig,
    useFactory: async () => {
      const accessTokenPublicKey = await importSPKI(
        validatedConfig.accessTokenPublicKey.replace(/\\n/g, "\n"),
        validatedConfig.accessTokenAlg,
      );
      return new AppConfig(validatedConfig, accessTokenPublicKey);
    },
  };
});
