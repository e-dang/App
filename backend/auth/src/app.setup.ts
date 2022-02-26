import {INestApplication, ValidationPipe, VersioningType} from "@nestjs/common";
import {NestFactory} from "@nestjs/core";
import {AppConfig} from "@src/app.config";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import {Logger} from "nestjs-pino";
import {AppModule} from "./app.module";

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
  app.useGlobalPipes(new ValidationPipe({whitelist: true}));
  app.use(cookieParser());
}

export async function bootstrap() {
  const app = await NestFactory.create(AppModule, {bufferLogs: true});
  appGlobalsSetup(app);
  app.enableShutdownHooks(); // needs to be outside of appGlobalSetup so it isnt included in tests
  await app.listen(app.get(AppConfig).httpPort);
}
