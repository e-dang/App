import {IsStrongPassword} from "@core/decoractors/is-strong-password";
import {IsEmail} from "class-validator";

export class SignInDto {
  @IsEmail()
  readonly email: string;

  @IsStrongPassword()
  readonly password: string;
}
