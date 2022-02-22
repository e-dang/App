import {Transform} from "class-transformer";
import {IsDefined, IsEnum, IsNumber, IsNumberString, IsPositive, IsString} from "class-validator";

export enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

export class AppConfig {
  @IsNumberString()
  @IsDefined()
  readonly apiVersion: string;

  @IsEnum(Environment)
  @IsDefined()
  readonly NODE_ENV: Environment;

  @IsPositive()
  @IsNumber()
  @IsDefined()
  readonly httpPort: number;

  @IsString({each: true})
  @Transform(({value}: {value: string | unknown}) => (typeof value === "string" ? value.split(",") : value))
  @IsDefined()
  readonly allowedHosts: string[];
}
