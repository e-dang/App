import {IsUndefinable} from "@core/decoractors/is-undefinable";
import {IsDefined, IsNumber, IsPositive, IsString, IsUrl, MinLength} from "class-validator";
import {createConfigProvider} from "./app.config";

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
  @IsDefined()
  readonly passwordResetRedirectUrl: string;
}

export const emailConfig = createConfigProvider(EmailConfig, (validatedConfig) => {
  return {
    provide: EmailConfig,
    useFactory: () => validatedConfig,
  };
});
