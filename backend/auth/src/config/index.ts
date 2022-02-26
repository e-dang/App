// import {IsUndefinable} from "@core/decoractors/is-undefinable";
// import {TypeOrmModuleOptions} from "@nestjs/typeorm";
// import {ClassConstructor, plainToInstance, Transform} from "class-transformer";
// import {
//   IsBoolean,
//   IsDefined,
//   IsEnum,
//   IsNumber,
//   IsNumberString,
//   IsPositive,
//   IsString,
//   IsUrl,
//   MinLength,
//   validateSync,
// } from "class-validator";
// import {importPKCS8, importSPKI, KeyLike} from "jose";

// enum Environment {
//   Development = "development",
//   Production = "production",
//   Test = "test",
// }

// enum AccessTokenAlgorithm {
//   EdDSA = "EdDSA",
// }

// enum RefreshTokenAlgorithms {
//   HS512 = "HS512",
// }

// enum LogLevel {
//   Silent = "silent",
//   Trace = "trace",
//   Debug = "debug",
//   Info = "info",
//   Warn = "warn",
//   Error = "error",
//   Fatal = "fatal",
// }

// enum PasswordResetTokenAlgorithms {
//   SHA256 = "sha256",
// }

// enum PasswordHashingAlgorithms {
//   PBKDF2 = "pbkdf2",
// }

// class InputConfiguration {
//   @IsNumberString()
//   @IsDefined()
//   readonly apiVersion: string;

//   @IsEnum(Environment)
//   @IsDefined()
//   readonly NODE_ENV: Environment;

//   @IsPositive()
//   @IsNumber()
//   @IsDefined()
//   readonly httpPort: number;

//   @IsString({each: true})
//   @Transform(({value}: {value: string | unknown}) => (typeof value === "string" ? value.split(",") : value))
//   @IsDefined()
//   readonly allowedHosts: string[];

//   @IsString()
//   @IsDefined()
//   readonly dbHost: string;

//   @IsPositive()
//   @IsNumber()
//   @IsDefined()
//   readonly dbPort: number;

//   @IsString()
//   @IsDefined()
//   readonly dbUser: string;

//   @IsString()
//   @IsDefined()
//   readonly dbPassword: string;

//   @IsString()
//   @IsDefined()
//   readonly dbName: string;

//   @Transform(({obj, key}: {obj: Record<string, unknown>; key: string}) => obj[key] === true || obj[key] === "true")
//   @IsBoolean()
//   @IsDefined()
//   readonly dbSsl: boolean;

//   @Transform(({obj, key}: {obj: Record<string, unknown>; key: string}) => obj[key] === true || obj[key] === "true")
//   @IsBoolean()
//   @IsDefined()
//   readonly dbRunMigrations: boolean;

//   @IsString()
//   @IsDefined()
//   readonly emailHost: string;

//   @IsPositive()
//   @IsNumber()
//   @IsDefined()
//   readonly emailPort: number;

//   @MinLength(1)
//   @IsString()
//   @IsUndefinable()
//   readonly emailUser?: string;

//   @MinLength(1)
//   @IsString()
//   @IsUndefinable()
//   readonly emailPassword?: string;

//   @IsUrl({require_protocol: true, host_whitelist: ["localhost"]})
//   @IsDefined()
//   readonly passwordResetRedirectUrl: string;

//   @IsString()
//   @IsDefined()
//   readonly jwtAccessTokenExp: string;

//   @IsString()
//   @IsDefined()
//   readonly jwtRefreshTokenExp: string;

//   @IsEnum(AccessTokenAlgorithm)
//   @IsDefined()
//   readonly accessTokenAlg: AccessTokenAlgorithm;

//   @IsEnum(RefreshTokenAlgorithms)
//   @IsDefined()
//   readonly refreshTokenAlg: RefreshTokenAlgorithms;

//   @IsString()
//   @IsDefined()
//   readonly refreshTokenSecret: string;

//   @IsString()
//   @IsDefined()
//   readonly accessTokenPrivateKey: string;

//   @IsString()
//   @IsDefined()
//   readonly accessTokenPublicKey: string;

//   @IsString()
//   @IsDefined()
//   readonly jwtIssuer: string;

//   @IsString()
//   @IsDefined()
//   readonly jwtAudience: string;

//   @IsEnum(LogLevel)
//   @IsDefined()
//   readonly logLevel: LogLevel;

//   @IsEnum(PasswordHashingAlgorithms)
//   @IsDefined()
//   readonly passwordHasher: string;

//   @IsPositive()
//   @IsNumber()
//   @IsDefined()
//   readonly passwordIterations: number;

//   @IsPositive()
//   @IsNumber()
//   @IsDefined()
//   readonly passwordSaltLength: number;

//   @IsEnum(PasswordResetTokenAlgorithms)
//   @IsDefined()
//   readonly passwordResetTokenAlg: PasswordResetTokenAlgorithms;

//   @IsString()
//   @IsDefined()
//   readonly passwordResetTokenSecret: string;

//   @IsPositive()
//   @IsNumber()
//   @IsDefined()
//   readonly passwordResetTokenExp: number;
// }

// export class Configuration {
//   readonly apiVersion: string;

//   readonly NODE_ENV: Environment;

//   readonly httpPort: number;

//   readonly allowedHosts: string[];

//   readonly dbHost: string;

//   readonly dbPort: number;

//   readonly dbUser: string;

//   readonly dbPassword: string;

//   readonly dbName: string;

//   readonly dbSsl: boolean;

//   readonly dbRunMigrations: boolean;

//   readonly emailHost: string;

//   readonly emailPort: number;

//   readonly emailUser?: string;

//   readonly emailPassword?: string;

//   readonly passwordResetRedirectUrl: string;

//   readonly jwtAccessTokenExp: string;

//   readonly jwtRefreshTokenExp: string;

//   readonly accessTokenAlg: AccessTokenAlgorithm;

//   readonly refreshTokenAlg: RefreshTokenAlgorithms;

//   readonly refreshTokenSecret: Uint8Array;

//   readonly accessTokenPrivateKey: Promise<KeyLike>;

//   readonly accessTokenPublicKey: Promise<KeyLike>;

//   readonly jwtIssuer: string;

//   readonly jwtAudience: string;

//   readonly logLevel: LogLevel;

//   readonly passwordHasher: string;

//   readonly passwordIterations: number;

//   readonly passwordSaltLength: number;

//   readonly passwordResetTokenAlg: PasswordResetTokenAlgorithms;

//   readonly passwordResetTokenSecret: string;

//   readonly passwordResetTokenExp: number;

//   constructor(config: InputConfiguration) {
//     this.apiVersion = config.apiVersion;
//     this.NODE_ENV = config.NODE_ENV;
//     this.httpPort = config.httpPort;
//     this.dbHost = config.dbHost;
//     this.dbPort = config.dbPort;
//     this.dbUser = config.dbUser;
//     this.dbPassword = config.dbPassword;
//     this.dbName = config.dbName;
//     this.dbSsl = config.dbSsl;
//     this.dbRunMigrations = config.dbRunMigrations;
//     this.allowedHosts = config.allowedHosts;
//     this.passwordHasher = config.passwordHasher;
//     this.logLevel = this.NODE_ENV === Environment.Test ? LogLevel.Silent : config.logLevel;
//     this.accessTokenPublicKey = importSPKI(config.accessTokenPublicKey.replace(/\\n/g, "\n"), config.accessTokenAlg);
//     this.accessTokenPrivateKey = importPKCS8(config.accessTokenPrivateKey.replace(/\\n/g, "\n"), config.accessTokenAlg);
//     this.refreshTokenSecret = new TextEncoder().encode(config.refreshTokenSecret);
//   }

//   get isProduction() {
//     return this.NODE_ENV === Environment.Production;
//   }

//   get database(): TypeOrmModuleOptions {
//     return {
//       type: "postgres",
//       host: this.dbHost,
//       port: this.dbPort,
//       username: this.dbUser,
//       password: this.dbPassword,
//       database: this.dbName,
//       ssl: this.dbSsl,
//       migrationsRun: this.dbRunMigrations,
//       synchronize: false,
//       entities: ["dist/**/*.entity{.ts,.js}"],
//       migrations: ["dist/src/migrations/*{.ts,.js}"],
//     };
//   }
// }

// export function validate(config: Record<string, unknown>) {
//   // doesn't throw error on type conversion so it is still necessary to validate types afterwards
//   const validatedConfig = plainToInstance(InputConfiguration, config, {enableImplicitConversion: true});

//   const errors = validateSync(validatedConfig, {skipMissingProperties: false, whitelist: true});

//   if (errors.length > 0) {
//     throw new Error(errors.toString());
//   }

//   return new Configuration(validatedConfig);
// }

// export function registerConfigService(filepath: string) {
//   return {
//     provide: "CONFIG_NAME",
//     useFactory: async () => {
//       // read config
//       const config = {...process.env, ...fs.readFileSync(filepath)};
//       // validate config
//       const validatedConfig = validate(config);
//       // transform config
//       return {
//         ...validatedConfig,
//       };
//     },
//   };
// }
