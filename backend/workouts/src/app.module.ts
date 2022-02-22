import {MiddlewareConsumer, Module, NestModule} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {APP_FILTER, APP_GUARD} from "@nestjs/core";
import {AuthenticationMiddleware} from "@core/middleware/authentication.middleware";
import {WorkoutTemplatesModule} from "@workout-templates/workout-templates.module";
import {ExerciseGroupTemplatesModule} from "@exercise-group-templates/exercise-group-templates.module";
import {ExerciseTemplateModule} from "@exercise-templates/exercise-template.module";
import {ExerciseTypesModule} from "@exercise-types/exercise-types.module";
import {RolesGuard} from "@core/guards/roles.guard";
import {TerminusModule} from "@nestjs/terminus";
import {HealthController} from "@health/health.controller";
import {LoggerModule} from "nestjs-pino";
import pino from "pino";
import {Request, Response} from "express";
import {AuthenticatedRequest} from "@core/types";
import {randomUUID} from "crypto";
import {AllExceptionsFilter} from "@core/filters/catch-all.filter";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {Configuration, validate} from "./config";

@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configuration>) => ({
        pinoHttp: {
          base: undefined,
          level: configService.get("logLevel"),
          formatters: {
            level: (label) => ({level: label}),
          },
          wrapSerializers: false,
          serializers: {
            req: (req: Request) => ({
              id: req.id,
              method: req.method,
              url: req.originalUrl || req.url,
              user: (req as AuthenticatedRequest).accessToken?.userId,
              ip: req.socket.remoteAddress || req.ip,
              query: req.query,
              params: req.params,
              headers: {
                "user-agent": req.headers["user-agent"],
                "content-length": req.headers["content-length"],
              },
            }),
            res: (res: Response) => ({
              statusCode: res.statusCode,
              statusMessage: res.statusMessage,
              headers: {
                "content-length": res.getHeader("content-length"),
              },
            }),
          },
          genReqId: (req) => req.headers["x-request-id"] || randomUUID(),
          timestamp: pino.stdTimeFunctions.isoTime,
          transport: configService.get("isProduction") ? undefined : {target: "pino-pretty"},
        },
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configuration>) => ({
        ...configService.get("database"),
        autoLoadEntities: true,
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate,
      envFilePath: "./secrets/.env",
    }),
    TerminusModule,
    WorkoutTemplatesModule,
    ExerciseGroupTemplatesModule,
    ExerciseTemplateModule,
    ExerciseTypesModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).exclude("api/v([0-9])+/health").forRoutes("*");
  }
}
