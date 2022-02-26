import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UsersModule} from "@users/users.module";
import {AuthModule} from "@auth/auth.module";
import {ConfigModule} from "@config/config.module";
import {databaseConfig, DatabaseConfig} from "@config/database.config";
import {appConfigProvider} from "@config/app.config";
import {HealthModule} from "@health/health.module";
import {LoggerModule} from "nestjs-pino";
import pino from "pino";
import {randomUUID} from "crypto";
import {Request, Response} from "express";
import {AuthenticatedRequest} from "@core/types";
import {AllExceptionsFilter} from "@core/filters/catch-all.filter";
import {loggerConfig, LoggerConfig} from "@config/logger.config";
import path from "path";
import {emailConfig} from "@config/email.config";
import {jwtConfig} from "@config/jwt.config";
import {passwordHasherConfig} from "@config/password-hasher.config";
import {passwordResetConfig} from "@password-reset/password-reset.config";

@Module({
  imports: [
    LoggerModule.forRootAsync({
      useFactory: (config: LoggerConfig) => {
        return {
          pinoHttp: {
            base: undefined,
            level: config.logLevel,
            formatters: {
              level: (label) => ({level: label}),
            },
            wrapSerializers: false,
            serializers: {
              req: (req: Request) => ({
                id: req.id,
                method: req.method,
                url: req.originalUrl || req.url,
                user: (req as AuthenticatedRequest).user?.id,
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
            transport: config.transport,
          },
        };
      },
      inject: [LoggerConfig],
    }),
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
      provide: "APP_FILTER",
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
