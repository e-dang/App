import {Location} from "express-validator";
import {DomainError, DomainErrorDetails} from "./base";

export class ValidationError extends DomainError {
  constructor(errors: DomainErrorDetails) {
    super(400, errors);
  }
}

export class InvalidTokenError extends ValidationError {
  constructor(location: Location, param: string) {
    super([
      {
        location,
        param,
        msg: "Invalid token.",
        value: undefined,
      },
    ]);
  }
}

export class ExpiredTokenError extends ValidationError {
  constructor(location: Location, param: string) {
    super([
      {
        location,
        param,
        msg: "Expired token.",
        value: undefined,
      },
    ]);
  }
}
