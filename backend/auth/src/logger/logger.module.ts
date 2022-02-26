import {LoggerConfig} from "@src/logger/logger.config";
import {Module} from "@nestjs/common";
import {LoggerModule as PinoLoggerModule} from "nestjs-pino";
import pino from "pino";
import {randomUUID} from "crypto";
import {Request, Response} from "express";
import {AuthenticatedRequest} from "@core/types";

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
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
  ],
  exports: [],
})
export class LoggerModule {}
