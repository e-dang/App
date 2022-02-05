import {TypeOrmModuleOptions} from "@nestjs/typeorm";
import {config} from "../config";

const entities = ["dist/**/*.entity{.ts,.js}"];

let typeOrmConfig: TypeOrmModuleOptions = {
  type: "postgres",
  host: config.dbHost,
  port: config.dbPort,
  username: config.dbUser,
  password: config.dbPassword,
  database: config.dbName,
  ssl: config.dbSSL,
  migrations: ["dist/src/migrations/*{.ts,.js}"],
};

if (process.env.NODE_ENV === undefined) {
  typeOrmConfig = {
    ...typeOrmConfig,
    entities,
  };
} else if (process.env.NODE_ENV === "development") {
  typeOrmConfig = {
    ...typeOrmConfig,
    synchronize: false,
    migrationsRun: false,
  };
} else if (process.env.NODE_ENV === "test") {
  typeOrmConfig = {
    ...typeOrmConfig,
    entities,
    synchronize: false,
    migrationsRun: true,
  };
} else if (process.env.NODE_ENV === "production") {
  typeOrmConfig = {
    ...typeOrmConfig,
    synchronize: false,
    migrationsRun: false,
  };
}

export default {...typeOrmConfig} as TypeOrmModuleOptions;
