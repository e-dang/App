import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UsersModule} from "@users/users.module";
import {AuthModule} from "@auth/auth.module";
import {ConfigModule} from "@config/config.module";
import {DatabaseConfig} from "@config/database.config";
import {AppConfig} from "@config/app.config";
import {HealthModule} from "@health/health.module";
import {LoggerModule} from "nestjs-pino";
import pino from "pino";
import {randomUUID} from "crypto";
import {Request, Response} from "express";
import {AuthenticatedRequest} from "@core/types";
import {AllExceptionsFilter} from "@core/filters/catch-all.filter";
import {LoggerConfig} from "@config/logger.config";

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule.forFeature(LoggerConfig)],
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
      imports: [ConfigModule.forFeature(DatabaseConfig)],
      useFactory: (config: DatabaseConfig) => {
        return {
          type: "postgres",
          host: config.dbHost,
          port: config.dbPort,
          username: config.dbUser,
          password: config.dbPassword,
          database: config.dbName,
          ssl: config.dbSsl,
          migrationsRun: config.runMigrations,
          synchronize: false,
          entities: ["dist/**/*.entity{.ts,.js}"],
          migrations: ["dist/src/migrations/*{.ts,.js}"],
          autoLoadEntities: true,
        };
      },
      inject: [DatabaseConfig],
    }),
    ConfigModule.forFeature(AppConfig),
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
