import {registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";
import validator from "validator";

@ValidatorConstraint({name: "password", async: false})
class IsStrongPasswordValidator implements ValidatorConstraintInterface {
  validate(value: unknown): boolean | Promise<boolean> {
    return typeof value === "string" && validator.isStrongPassword(value);
  }

  defaultMessage(): string {
    return "The password is too common.";
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: "isStrongPassword",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsStrongPasswordValidator,
    });
  };
}
