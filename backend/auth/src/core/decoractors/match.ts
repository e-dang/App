import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({name: "Match"})
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints as [string, unknown];
    const relatedValue = (args.object as Record<string, string>)[relatedPropertyName];
    return value === relatedValue;
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints as [string, unknown];
    return `${relatedPropertyName} and ${args.property} don't match`;
  }
}

export function Match<K extends string, T extends {[$K in K]: unknown}>(
  property: K,
  validationOptions?: ValidationOptions,
) {
  return (object: T, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchConstraint,
    });
  };
}
