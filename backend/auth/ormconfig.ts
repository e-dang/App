import {DatabaseConfig} from "@src/config/database.config";
import {validate} from "@src/config/validate";

const config = validate(process.env, DatabaseConfig);

export default {
  type: "postgres",
  host: config.dbHost,
  port: config.dbPort,
  username: config.dbUser,
  password: config.dbPassword,
  database: config.dbName,
  ssl: config.dbSsl,
  runMigrations: config.runMigrations,
  synchronize: false,
  entities: ["dist/**/*.entity{.ts,.js}"],
  migrations: ["dist/src/migrations/*{.ts,.js}"],
};
