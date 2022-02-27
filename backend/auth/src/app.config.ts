import {IsDefined, IsEnum, IsNumber, IsPositive, IsString} from "class-validator";
import {register} from "@config";

export enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

interface AppConfigProperties {
  readonly NODE_ENV: Environment;
  readonly httpPort: number;
  readonly allowedHosts: unknown;
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
}

export class AppConfig implements AppConfigProperties {
  readonly apiVersion: string = "1";

  readonly NODE_ENV: Environment;

  readonly httpPort: number;

  readonly allowedHosts: string[];

  constructor(validatedConfig: InputAppConfigValidator) {
    this.NODE_ENV = validatedConfig.NODE_ENV;
    this.httpPort = validatedConfig.httpPort;
    this.allowedHosts = validatedConfig.allowedHosts.split(",");
  }
}

export const appConfigProvider = register(InputAppConfigValidator, (validatedConfig) => {
  return {
    provide: AppConfig,
    useFactory: () => new AppConfig(validatedConfig),
  };
});
