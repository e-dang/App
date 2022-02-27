import {IsStrongPassword} from "@core/decoractors/is-strong-password";
import {Match} from "@core/decoractors/match";
import {IsString, IsUUID} from "class-validator";

export class ResetPasswordConfirmDto {
  @IsUUID()
  readonly userId: string;

  @IsString()
  readonly token: string;

  @IsStrongPassword()
  readonly newPassword: string;

  @Match("newPassword")
  readonly confirmPassword: string;
}
