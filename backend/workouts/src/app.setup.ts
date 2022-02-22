import {INestApplication, ValidationPipe, VersioningType} from "@nestjs/common";
import {NestFactory} from "@nestjs/core";
import {Logger} from "nestjs-pino";
import helmet from "helmet";
import {ConfigService} from "@nestjs/config";
import {AppModule} from "./app.module";

export function appGlobalsSetup(app: INestApplication) {
  const config = app.get(ConfigService);
  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.enableCors({origin: config.get("allowedHosts")});
  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: config.get("apiVersion"),
  });
  app.useGlobalPipes(new ValidationPipe());
}

export async function bootstrap() {
  const app = await NestFactory.create(AppModule, {bufferLogs: true});
  appGlobalsSetup(app);
  app.enableShutdownHooks(); // needs to be outside of  appGlobalSetup so it isnt included in tests
  await app.listen(app.get(ConfigService).get("httpPort"));
}
