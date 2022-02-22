import {IsUndefinable} from "@core/decoractors/is-undefinable";
import {IsDefined, IsNumber, IsPositive, IsString, IsUrl, MinLength} from "class-validator";

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

  @IsUrl({require_protocol: true, host_whitelist: ["localhost"]})
  readonly passwordResetRedirectUrl: string;
}
