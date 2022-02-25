import {FactoryProvider} from "@nestjs/common";
import {ClassConstructor, instanceToInstance, plainToInstance} from "class-transformer";
import {validateSync} from "class-validator";
import fs from "fs";
import path from "path";

export enum ValidationSteps {
  Before = "before",
  After = "after",
}

export function validate<T extends object>(config: Record<string, unknown>, klass: ClassConstructor<T>) {
  const validatedConfig = plainToInstance(klass, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {skipMissingProperties: false, whitelist: true});

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return instanceToInstance(validatedConfig, {groups: [ValidationSteps.After]});
}

function readConfig(filepath: string) {
  const secretsDir = path.join(process.env.PWD, "secrets", filepath);
  if (!fs.existsSync(secretsDir)) {
    return {};
  }

  return {};
}

export function register<T extends object>(filepath: string, klass: ClassConstructor<T>): FactoryProvider {
  const config = {...process.env, ...readConfig(filepath)};
  return {
    provide: klass,
    useFactory: () => validate(config, klass),
  };
}
