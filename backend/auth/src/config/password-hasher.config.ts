import {IsDefined, IsNumber, IsPositive, IsString} from "class-validator";

export class PasswordHasherConfig {
  @IsString()
  @IsDefined()
  readonly passwordHasher: string;

  @IsPositive()
  @IsNumber()
  @IsDefined()
  readonly passwordIterations: number;

  @IsNumber()
  @IsDefined()
  readonly passwordSaltLength: number;
}
