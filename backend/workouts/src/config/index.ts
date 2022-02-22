import {TypeOrmModuleOptions} from "@nestjs/typeorm";
import {plainToInstance, Transform} from "class-transformer";
import {IsBoolean, IsDefined, IsEnum, IsNumber, IsPositive, IsString, validateSync} from "class-validator";
import {importSPKI, KeyLike} from "jose";

enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

enum AccessTokenAlgorithms {
  EdDSA = "EdDSA",
}

enum LogLevel {
  Silent = "silent",
  Trace = "trace",
  Debug = "debug",
  Info = "info",
  Warn = "warn",
  Error = "error",
  Fatal = "fatal",
}

interface ConfigurationProperties {
  readonly apiVersion: number;

  readonly NODE_ENV: Environment;

  readonly httpPort: number;

  readonly dbHost: string;

  readonly dbPort: number;

  readonly dbUser: string;

  readonly dbPassword: string;

  readonly dbName: string;

  readonly dbSsl: boolean;

  readonly dbRunMigrations: boolean;

  readonly logLevel: LogLevel;

  readonly allowedHosts: string[];

  readonly accessTokenPublicKey: unknown;
}

class RawConfiguration implements ConfigurationProperties {
  @IsPositive()
  @IsNumber()
  @IsDefined()
  readonly apiVersion: number;

  @IsEnum(Environment)
  @IsDefined()
  readonly NODE_ENV: Environment;

  @IsNumber()
  @IsDefined()
  readonly httpPort: number;

  @IsString()
  @IsDefined()
  readonly dbHost: string;

  @IsPositive()
  @IsNumber()
  @IsDefined()
  readonly dbPort: number;

  @IsString()
  @IsDefined()
  readonly dbUser: string;

  @IsString()
  @IsDefined()
  readonly dbPassword: string;

  @IsString()
  @IsDefined()
  readonly dbName: string;

  @Transform(({obj}: {obj: Record<string, unknown>}) => obj.dbSsl === true || obj.dbSsl === "true")
  @IsBoolean()
  @IsDefined()
  readonly dbSsl: boolean;

  @Transform(({obj}: {obj: Record<string, unknown>}) => obj.dbRunMigrations === true || obj.dbRunMigrations === "true")
  @IsBoolean()
  @IsDefined()
  readonly dbRunMigrations: boolean;

  @IsEnum(LogLevel)
  @IsDefined()
  readonly logLevel: LogLevel;

  @Transform(({value}: {value: string}) => value.split(","), {toClassOnly: true})
  @IsDefined()
  readonly allowedHosts: string[];

  @IsString()
  @IsDefined()
  readonly accessTokenPublicKey: string;

  @IsEnum(AccessTokenAlgorithms)
  @IsDefined()
  readonly accessTokenAlg: AccessTokenAlgorithms;
}

export class Configuration implements ConfigurationProperties {
  readonly apiVersion: number;

  readonly NODE_ENV: Environment;

  readonly httpPort: number;

  readonly dbHost: string;

  readonly dbPort: number;

  readonly dbUser: string;

  readonly dbPassword: string;

  readonly dbName: string;

  readonly dbRunMigrations: boolean;

  readonly dbSsl: boolean;

  readonly logLevel: LogLevel;

  readonly allowedHosts: string[];

  readonly accessTokenPublicKey: Promise<KeyLike>;

  constructor(config: RawConfiguration) {
    this.apiVersion = config.apiVersion;
    this.NODE_ENV = config.NODE_ENV;
    this.httpPort = config.httpPort;
    this.dbHost = config.dbHost;
    this.dbPort = config.dbPort;
    this.dbUser = config.dbUser;
    this.dbPassword = config.dbPassword;
    this.dbName = config.dbName;
    this.dbSsl = config.dbSsl;
    this.dbRunMigrations = config.dbRunMigrations;
    this.allowedHosts = config.allowedHosts;
    this.logLevel = this.NODE_ENV === Environment.Test ? LogLevel.Silent : config.logLevel;
    this.accessTokenPublicKey = importSPKI(config.accessTokenPublicKey.replace(/\\n/g, "\n"), config.accessTokenAlg);
  }

  get isProduction() {
    return this.NODE_ENV === Environment.Production;
  }

  get database(): TypeOrmModuleOptions {
    return {
      type: "postgres",
      host: this.dbHost,
      port: this.dbPort,
      username: this.dbUser,
      password: this.dbPassword,
      database: this.dbName,
      ssl: this.dbSsl,
      migrationsRun: this.dbRunMigrations,
      synchronize: false,
      entities: ["dist/**/*.entity{.ts,.js}"],
      migrations: ["dist/src/migrations/*{.ts,.js}"],
    };
  }
}

export function validate(config: Record<string, unknown>) {
  // doesn't throw error on type conversion so it is still necessary to validate types afterwards
  const validatedConfig = plainToInstance(RawConfiguration, config, {enableImplicitConversion: true});

  const errors = validateSync(validatedConfig, {skipMissingProperties: false, whitelist: true});

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return new Configuration(validatedConfig);
}
