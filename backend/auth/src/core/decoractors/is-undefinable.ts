import {ValidateIf, ValidationOptions} from "class-validator";

export function IsUndefinable<K extends string, T extends {[$K in K]: unknown}>(
  options?: ValidationOptions,
): PropertyDecorator {
  return function IsUndefinableDecorator(prototype: T, propertyKey: K): void {
    ValidateIf((obj: T): boolean => undefined !== obj[propertyKey], options)(prototype, propertyKey);
  };
}
