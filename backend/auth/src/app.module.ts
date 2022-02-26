import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UsersModule} from "@users/users.module";
import {AuthModule} from "@auth/auth.module";
import {ConfigModule} from "@config/config.module";
import {databaseConfig, DatabaseConfig} from "@config/database.config";
import {appConfigProvider} from "@src/app.config";
import {HealthModule} from "@health/health.module";
import {AllExceptionsFilter} from "@core/filters/catch-all.filter";
import {loggerConfig} from "@src/logger/logger.config";
import path from "path";
import {emailConfig} from "@emailer/email.config";
import {jwtConfig} from "@jwt/jwt.config";
import {passwordHasherConfig} from "@password-hasher/password-hasher.config";
import {passwordResetConfig} from "@password-reset/password-reset.config";
import {APP_FILTER} from "@nestjs/core";
import {LoggerModule} from "./logger/logger.module";

@Module({
  imports: [
    LoggerModule,
    TypeOrmModule.forRootAsync({
      useFactory: (config: DatabaseConfig) => config.ormModuleConfig,
      inject: [DatabaseConfig],
    }),
    ConfigModule.forRoot({
      load: [
        appConfigProvider,
        loggerConfig,
        databaseConfig,
        emailConfig,
        jwtConfig,
        passwordHasherConfig,
        passwordResetConfig,
      ],
      isGlobal: true,
      configDir: path.join(process.env.PWD, "secrets"),
    }),
    HealthModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
