import {ValidationError} from "express-validator";

interface RequestErrorDetail {
  location: "request";
  msg: string;
}

export type DomainErrorDetails = ValidationError[] | RequestErrorDetail[];

interface ErrorJson {
  errors: DomainErrorDetails;
}

export interface ErrorInterface {
  statusCode: number;
  json: ErrorJson;
}

export class DomainError extends Error implements ErrorInterface {
  public statusCode: number;

  public json: ErrorJson;

  constructor(statusCode: number, errors: DomainErrorDetails) {
    super(JSON.stringify(errors));
    this.statusCode = statusCode;
    this.json = {
      errors,
    };
  }
}
