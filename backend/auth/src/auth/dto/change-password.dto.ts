import {IsStrongPassword} from "@core/decoractors/is-strong-password";
import {Match} from "@core/decoractors/match";
import {IsString, MinLength} from "class-validator";

export class ChangePasswordDto {
  @MinLength(1)
  @IsString()
  readonly oldPassword: string;

  @IsStrongPassword()
  readonly newPassword: string;

  @Match("newPassword")
  readonly confirmPassword: string;
}
