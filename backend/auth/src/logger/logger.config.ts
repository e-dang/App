import {IsDefined, IsEnum} from "class-validator";
import {register} from "@config";
import {Environment} from "@src/app.config";

enum LogLevel {
  Silent = "silent",
  Trace = "trace",
  Debug = "debug",
  Info = "info",
  Warn = "warn",
  Error = "error",
  Fatal = "fatal",
}

interface LoggerConfigProperties {
  readonly logLevel: LogLevel;
}

class InputLoggerConfigValidator implements LoggerConfigProperties {
  @IsEnum(LogLevel)
  @IsDefined()
  readonly logLevel: LogLevel;
}

export class LoggerConfig implements LoggerConfigProperties {
  readonly logLevel: LogLevel;

  constructor(validatedConfig: InputLoggerConfigValidator) {
    this.logLevel = process.env.NODE_ENV === Environment.Test ? LogLevel.Silent : validatedConfig.logLevel;
  }

  get transport() {
    return process.env.NODE_ENV === Environment.Production ? undefined : {target: "pino-pretty"};
  }
}

export const loggerConfig = register(InputLoggerConfigValidator, (validatedConfig) => {
  return {
    provide: LoggerConfig,
    useValue: new LoggerConfig(validatedConfig),
  };
});
