import {DomainError, DomainErrorDetails} from "./base";

export class AlreadyExistsError extends DomainError {
  constructor(errors: DomainErrorDetails) {
    super(409, errors);
  }
}
