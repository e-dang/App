import {IsDefined, IsEnum, IsNumber, IsPositive, IsString} from "class-validator";
import {createConfigProvider} from "../config/app.config";

enum PasswordResetTokenAlgorithm {
  SHA256 = "sha256",
}
export class PasswordResetConfig {
  @IsEnum(PasswordResetTokenAlgorithm)
  @IsDefined()
  readonly passwordResetTokenAlg: PasswordResetTokenAlgorithm;

  @IsString()
  @IsDefined()
  readonly passwordResetTokenSecret: string;

  @IsPositive()
  @IsNumber()
  @IsDefined()
  readonly passwordResetTokenExp: number;
}

export const passwordResetConfig = createConfigProvider(PasswordResetConfig, (validatedConfig) => {
  return {
    provide: PasswordResetConfig,
    useFactory: () => validatedConfig,
  };
});
