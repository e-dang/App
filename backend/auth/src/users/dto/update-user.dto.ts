import {IsUndefinable} from "@core/decoractors/is-undefinable";
import {IsEmail, IsString, MinLength} from "class-validator";

export class UpdateUserDto {
  @MinLength(1)
  @IsString()
  @IsUndefinable()
  readonly name?: string;

  @IsEmail()
  @IsUndefinable()
  readonly email?: string;
}
