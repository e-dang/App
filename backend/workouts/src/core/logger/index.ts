import {INestApplication, Logger} from "@nestjs/common";
import morgan from "morgan";

export function enableLogging(app: INestApplication) {
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === undefined) {
    app.useLogger(Logger);
    app.use(morgan("combined"));
  } else if (process.env.NODE_ENV === "test") {
    app.useLogger(false);
  } else if (process.env.NODE_ENV === "production") {
    app.useLogger(Logger);
    app.use(morgan("combined"));
  } else {
    const errMsg = `Node environment ${process.env.NODE_ENV} is not supported. Please specify either development, test, or production.`;
    throw new Error(errMsg);
  }
}
