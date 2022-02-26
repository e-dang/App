import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {APP_FILTER} from "@nestjs/core";
import {UsersModule} from "@users";
import {AuthModule} from "@auth";
import {ConfigModule} from "@config";
import {databaseConfig, DatabaseConfig} from "@database";
import {appConfigProvider} from "@src/app.config";
import {HealthModule} from "@health";
import {AllExceptionsFilter} from "@core/filters/catch-all.filter";
import {LoggerModule, loggerConfig} from "@logger";
import path from "path";
import {emailConfig} from "@emailer";
import {jwtConfig} from "@jwt";
import {passwordHasherConfig} from "@password-hasher";
import {passwordResetConfig} from "@password-reset";

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
