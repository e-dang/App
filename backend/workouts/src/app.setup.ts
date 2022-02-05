import {config} from "@config";
import {enableLogging} from "@core/logger";
import {INestApplication, ValidationPipe, VersioningType} from "@nestjs/common";
import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";

export function appGlobalsSetup(app: INestApplication) {
  enableLogging(app);
  app.enableCors({origin: config.allowedHosts});
  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: config.apiVersion,
  });
  app.useGlobalPipes(new ValidationPipe());
}

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appGlobalsSetup(app);
  app.enableShutdownHooks(); // needs to be outside of  appGlobalSetup so it isnt included in tests
  await app.listen(config.httpPort);
}
