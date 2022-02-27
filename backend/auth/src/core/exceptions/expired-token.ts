import {BadRequestException} from "@nestjs/common";

export class ExpiredTokenException extends BadRequestException {
  constructor() {
    super("Expired token");
  }
}
