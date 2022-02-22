import {IsEmail} from "class-validator";

export class ResetPasswordDto {
  @IsEmail()
  readonly email: string;
}
