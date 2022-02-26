import {IsDefined, IsEnum, IsNumber, IsPositive} from "class-validator";
import {register} from "@config";

enum PasswordHasherAlgorithm {
  PBKDF2 = "pbkdf2",
}
export class PasswordHasherConfig {
  @IsEnum(PasswordHasherAlgorithm)
  @IsDefined()
  readonly passwordHasher: PasswordHasherAlgorithm;

  @IsPositive()
  @IsNumber()
  @IsDefined()
  readonly passwordIterations: number;

  @IsPositive()
  @IsNumber()
  @IsDefined()
  readonly passwordSaltLength: number;
}

export const passwordHasherConfig = register(PasswordHasherConfig);
