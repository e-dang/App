import {IsDefined, IsEnum} from "class-validator";
import {createConfigProvider, Environment} from "../config/app.config";

enum LogLevel {
  Silent = "silent",
  Trace = "trace",
  Debug = "debug",
  Info = "info",
  Warn = "warn",
  Error = "error",
  Fatal = "fatal",
}

export class LoggerConfig {
  @IsEnum(LogLevel)
  @IsDefined()
  private readonly level: LogLevel;

  get logLevel() {
    return process.env.NODE_ENV === Environment.Test ? "silent" : this.level;
  }

  get transport() {
    return process.env.NODE_ENV === Environment.Production ? undefined : {target: "pino-pretty"};
  }
}

export const loggerConfig = createConfigProvider(LoggerConfig, (validatedConfig) => {
  return {
    provide: LoggerConfig,
    useFactory: () => validatedConfig,
  };
});