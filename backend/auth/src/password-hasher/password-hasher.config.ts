import {IsDefined, IsEnum, IsNumber, IsPositive, ValidateIf} from "class-validator";
import {register} from "@config";
import {PasswordHasherAlgorithms, PBKDF2Digest} from "./constants";

export class PasswordHasherConfig {
  @IsEnum(PasswordHasherAlgorithms)
  @IsDefined()
  readonly passwordHasher: PasswordHasherAlgorithms;

  @IsPositive()
  @IsNumber()
  @IsDefined()
  @ValidateIf((obj: PasswordHasherConfig) => obj.passwordHasher === PasswordHasherAlgorithms.PBKDF2)
  readonly pbkdf2Iterations: number;

  @IsPositive()
  @IsNumber()
  @IsDefined()
  @ValidateIf((obj: PasswordHasherConfig) => obj.passwordHasher === PasswordHasherAlgorithms.PBKDF2)
  readonly pbkdf2SaltLength: number;

  @IsPositive()
  @IsNumber()
  @IsDefined()
  @ValidateIf((obj: PasswordHasherConfig) => obj.passwordHasher === PasswordHasherAlgorithms.PBKDF2)
  readonly pbkdf2keylen: number;

  @IsEnum(PBKDF2Digest)
  @IsDefined()
  @ValidateIf((obj: PasswordHasherConfig) => obj.passwordHasher === PasswordHasherAlgorithms.PBKDF2)
  readonly pbkdf2Digest: PBKDF2Digest;
}

export const passwordHasherConfig = register(PasswordHasherConfig);
