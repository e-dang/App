import {Transform} from "class-transformer";
import {IsDefined, IsEnum, IsNumber, IsNumberString, IsPositive, IsString} from "class-validator";
import {register} from "./register";

export enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

interface AppConfigProperties {
  readonly apiVersion: string;
  readonly NODE_ENV: Environment;
  readonly httpPort: number;
  readonly allowedHosts: unknown;
}

class InputAppConfigValidator implements AppConfigProperties {
  @IsNumberString()
  @IsDefined()
  readonly apiVersion: string;

  @IsEnum(Environment)
  @IsDefined()
  readonly NODE_ENV: Environment;

  @IsPositive()
  @IsNumber()
  @IsDefined()
  readonly httpPort: number;

  @IsString({each: true})
  @Transform(({value}: {value: string | unknown}) => (typeof value === "string" ? value.split(",") : value))
  @IsDefined()
  readonly allowedHosts: string[];
}

export class AppConfig implements AppConfigProperties {
  readonly apiVersion: string;

  readonly NODE_ENV: Environment;

  readonly httpPort: number;

  readonly allowedHosts: string[];

  constructor(validatedConfig: InputAppConfigValidator) {
    this.apiVersion = validatedConfig.apiVersion;
    this.NODE_ENV = validatedConfig.NODE_ENV;
    this.httpPort = validatedConfig.httpPort;
    this.allowedHosts = validatedConfig.allowedHosts;
  }
}

export const appConfigProvider = register(InputAppConfigValidator, (validatedConfig) => {
  return {
    provide: AppConfig,
    useFactory: () => new AppConfig(validatedConfig),
  };
});
