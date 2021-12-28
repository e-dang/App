import {DomainError, DomainErrorDetails} from "./base";

class ResourceNotFoundError extends DomainError {
  constructor(errors: DomainErrorDetails) {
    super(404, errors);
  }
}

export class UserNotFoundError extends ResourceNotFoundError {
  constructor(id: string) {
    super([{msg: `A user with the id '${id}' does not exist.`, location: "request"}]);
  }
}

export class SignInError extends ResourceNotFoundError {
  constructor() {
    super([{msg: "A user with this email and/or password does not exist.", location: "request"}]);
  }
}
