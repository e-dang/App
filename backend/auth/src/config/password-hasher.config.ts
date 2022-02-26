import {IsDefined, IsEnum, IsNumber, IsPositive} from "class-validator";
import {createConfigProvider} from "./app.config";

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

export const passwordHasherConfig = createConfigProvider(PasswordHasherConfig, (validatedConfig) => {
  return {
    provide: PasswordHasherConfig,
    useFactory: () => validatedConfig,
  };
});
