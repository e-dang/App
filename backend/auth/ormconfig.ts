import {ConfigModule} from "@config/config.module";
import {DatabaseConfig, databaseConfig} from "@src/config/database.config";
import path from "path";

const configDir = path.join(__dirname, "secrets");

ConfigModule.forRoot({
  isGlobal: true,
  configDir,
  load: [databaseConfig],
});

const config = databaseConfig(ConfigModule.getRawConfigs(configDir)).useFactory() as DatabaseConfig;

export default config.ormConfig;
