import {FactoryProvider} from "@nestjs/common";
import {ClassConstructor, plainToInstance, Transform} from "class-transformer";
import {IsDefined, IsEnum, IsNumber, IsNumberString, IsPositive, IsString, validateSync} from "class-validator";
import {ConfigProviderFactory} from "./config.module";

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

export function createConfigProvider<T extends object, U extends T, V extends T>(
  validator: ClassConstructor<U>,
  createConfigClass: (validatedConfig: U) => FactoryProvider<V>,
): ConfigProviderFactory {
  return (config: Record<string, unknown>) => {
    const validatedConfig = plainToInstance(validator, config, {
      enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, {skipMissingProperties: false, whitelist: true});

    if (errors.length > 0) {
      throw new Error(errors.toString());
    }

    return createConfigClass(validatedConfig);
  };
}

export const appConfigProvider = createConfigProvider(InputAppConfigValidator, (validatedConfig) => {
  return {
    provide: AppConfig,
    useFactory: () => new AppConfig(validatedConfig),
  };
});
