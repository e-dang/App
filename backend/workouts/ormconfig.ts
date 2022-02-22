import {ConfigModule} from "@nestjs/config";
import {validate} from "@src/config";

ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: "./secrets/.env",
  validate,
});

export default validate(process.env).database;
