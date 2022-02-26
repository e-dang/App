import {IsDefined, IsEnum, IsNumber, IsPositive} from "class-validator";
import {register} from "@config";
import {PasswordHasherAlgorithms} from "./constants";

export class PasswordHasherConfig {
  @IsEnum(PasswordHasherAlgorithms)
  @IsDefined()
  readonly passwordHasher: PasswordHasherAlgorithms;

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
