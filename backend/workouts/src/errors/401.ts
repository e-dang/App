import {DomainError} from "./base";

export class AuthenticationError extends DomainError {
  constructor() {
    super(401, [{msg: "Please signin to continue.", location: "headers", param: "Authorization", value: undefined}]);
  }
}
