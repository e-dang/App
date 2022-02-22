import {NotFoundException} from "@nestjs/common";

export class SignInException extends NotFoundException {
  constructor() {
    super("A user with this email and/or password does not exist");
  }
}
