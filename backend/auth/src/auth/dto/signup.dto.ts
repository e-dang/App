import {IsStrongPassword} from "@core/decoractors/is-strong-password";
import {IsEmail, IsString, MinLength} from "class-validator";

export class SignUpDto {
  @MinLength(1)
  @IsString()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsStrongPassword()
  readonly password: string;
}
