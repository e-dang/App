import {IsDefined, IsNumber, IsPositive, IsString} from "class-validator";

export class PasswordResetConfig {
  @IsString()
  @IsDefined()
  readonly passwordResetTokenAlg: string;

  @IsString()
  @IsDefined()
  readonly passwordResetTokenSecret: string;

  @IsPositive()
  @IsNumber()
  @IsDefined()
  readonly passwordResetTokenExp: number;
}
