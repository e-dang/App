import {TypeOrmModuleOptions} from "@nestjs/typeorm";
import {Transform} from "class-transformer";
import {IsBoolean, IsDefined, IsNumber, IsPositive, IsString} from "class-validator";
import {ConnectionOptions} from "typeorm";
import {register} from "../config/register";

class InputDatabaseConfigValidator {
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

  @Transform(({obj, key}: {obj: Record<string, unknown>; key: string}) => obj[key] === true || obj[key] === "true")
  @IsBoolean()
  @IsDefined()
  readonly dbSsl: boolean;

  @Transform(({obj, key}: {obj: Record<string, unknown>; key: string}) => obj[key] === true || obj[key] === "true")
  @IsBoolean()
  @IsDefined()
  readonly runMigrations: boolean;
}

export class DatabaseConfig {
  readonly ormConfig: ConnectionOptions;

  readonly ormModuleConfig: TypeOrmModuleOptions;

  constructor(validatedConfig: InputDatabaseConfigValidator) {
    this.ormConfig = {
      type: "postgres",
      host: validatedConfig.dbHost,
      port: validatedConfig.dbPort,
      username: validatedConfig.dbUser,
      password: validatedConfig.dbPassword,
      database: validatedConfig.dbName,
      ssl: validatedConfig.dbSsl,
      migrationsRun: validatedConfig.runMigrations,
      synchronize: false,
      entities: ["dist/**/*.entity{.ts,.js}"],
      migrations: ["dist/src/migrations/*{.ts,.js}"],
    };

    this.ormModuleConfig = {
      ...this.ormConfig,
      autoLoadEntities: true,
    };
  }
}

export const databaseConfig = register(InputDatabaseConfigValidator, (validatedConfig) => {
  return {
    provide: DatabaseConfig,
    useFactory: () => new DatabaseConfig(validatedConfig),
  };
});
