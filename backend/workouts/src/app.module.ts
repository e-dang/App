import {MiddlewareConsumer, Module, NestModule} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {APP_FILTER, APP_GUARD} from "@nestjs/core";
import {AuthenticationMiddleware} from "@core/middleware/authentication.middleware";
import {WorkoutTemplatesModule} from "@workout-templates/workout-templates.module";
import {ExerciseGroupTemplatesModule} from "@exercise-group-templates/exercise-group-templates.module";
import {ExerciseTemplateModule} from "@exercise-templates/exercise-template.module";
import {ExerciseTypesModule} from "@exercise-types/exercise-types.module";
import {RolesGuard} from "@core/guards/roles.guard";
import {HealthController} from "@health/health.controller";
import {AllExceptionsFilter} from "@core/filters/catch-all.filter";
import {ConfigModule} from "@config";
import path from "path";
import {HealthModule} from "@health/health.module";
import {DatabaseConfig, databaseConfig} from "./database";
import {appConfig} from "./app.config";
import {loggerConfig, LoggerModule} from "./logger";

@Module({
  imports: [
    LoggerModule,
    TypeOrmModule.forRootAsync({
      inject: [DatabaseConfig],
      useFactory: (config: DatabaseConfig) => config.ormModuleConfig,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, loggerConfig],
      configDir: path.join(process.env.PWD, "secrets"),
    }),
    HealthModule,
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
