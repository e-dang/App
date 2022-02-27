import {INestApplication, ValidationPipe, VersioningType} from "@nestjs/common";
import {NestFactory} from "@nestjs/core";
import {Logger} from "nestjs-pino";
import helmet from "helmet";
import {AppModule} from "./app.module";
import {AppConfig} from "./app.config";

export function appGlobalsSetup(app: INestApplication) {
  const config = app.get(AppConfig);
  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.enableCors({origin: config.allowedHosts});
  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: config.apiVersion,
  });
  app.useGlobalPipes(new ValidationPipe());
}

export async function bootstrap() {
  const app = await NestFactory.create(AppModule, {bufferLogs: true});
  appGlobalsSetup(app);
  app.enableShutdownHooks(); // needs to be outside of  appGlobalSetup so it isnt included in tests
  await app.listen(app.get(AppConfig).httpPort);
}
