import {ConfigModule} from "@config/config.module";
import {FactoryProvider} from "@nestjs/common";
import {DatabaseConfig, databaseConfig} from "@src/database/database.config";
import path from "path";

const configDir = path.join(__dirname, "secrets");

ConfigModule.forRoot({
  isGlobal: true,
  configDir,
  load: [databaseConfig],
});

const provider = databaseConfig(ConfigModule.getRawConfigs(configDir)) as FactoryProvider;
const config = provider.useFactory() as DatabaseConfig;

export default config.ormConfig;
