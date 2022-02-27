import {IsUndefinable} from "@core/decoractors";
import {IsDefined, IsNumber, IsPositive, IsString, IsUrl, MinLength} from "class-validator";
import {register} from "@config";
import {Environment} from "@src/app.config";

export class EmailConfig {
  @IsString()
  @IsDefined()
  readonly emailHost: string;

  @IsPositive()
  @IsNumber()
  @IsDefined()
  readonly emailPort: number;

  @MinLength(1)
  @IsString()
  @IsUndefinable()
  readonly emailUser?: string;

  @MinLength(1)
  @IsString()
  @IsUndefinable()
  readonly emailPassword?: string;

  @IsUrl({
    require_protocol: true,
    require_port: false,
    require_tld: process.env.NODE_ENV === Environment.Production,
  })
  @IsDefined()
  readonly passwordResetRedirectUrl: string;
}

export const emailConfig = register(EmailConfig);
