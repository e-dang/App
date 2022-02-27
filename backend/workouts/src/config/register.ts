import {FactoryProvider, ValueProvider} from "@nestjs/common";
import {ClassConstructor, plainToInstance} from "class-transformer";
import {validateSync} from "class-validator";

export type ConfigProviderFactory = (config: Record<string, unknown>) => FactoryProvider | ValueProvider;

export function register<T extends object, U extends T, V extends T>(
  validator: ClassConstructor<U>,
  configProviderFactory?: (validatedConfig: U) => FactoryProvider<V> | ValueProvider<V>,
): ConfigProviderFactory {
  return (config: Record<string, unknown>) => {
    const validatedConfig = plainToInstance(validator, config, {
      enableImplicitConversion: true,
    });

    const errors = validateSync(validatedConfig, {skipMissingProperties: false, whitelist: true});

    if (errors.length > 0) {
      throw new Error(errors.toString());
    }

    if (configProviderFactory === undefined) {
      return {
        provide: validator,
        useValue: validatedConfig,
      };
    }

    return configProviderFactory(validatedConfig);
  };
}
