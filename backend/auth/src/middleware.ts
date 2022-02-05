import {NextFunction, Request, Response} from "express";
import {AuthenticationError, ErrorInterface, ValidationError} from "@errors";
import {User} from "@entities";
import {checkSchema, Schema, ValidationChain, validationResult} from "express-validator";
import * as jose from "jose";
import {config} from "@config";
import {AccessTokenPayload} from "@auth";

export function errorHandler(err: ErrorInterface, req: Request, res: Response, _: NextFunction) {
  res.status(err.statusCode).json(err.json);
}

function parseAccessToken(req: Request) {
  const authHeader = req.get("authorization");
  if (!authHeader) {
    throw new AuthenticationError();
  }

  const [specifier, token] = authHeader.split(" ");
  if (specifier !== "Token") {
    throw new AuthenticationError();
  }

  return token;
}

export const verifyAuthN = async (req: Request, res: Response, next: NextFunction) => {
  let token: string;
  try {
    token = parseAccessToken(req);
  } catch (err) {
    return next(err);
  }

  let payload: AccessTokenPayload;
  try {
    const decoded = await jose.jwtVerify(token, await config.accessTokenPublicKey);
    payload = decoded.payload as AccessTokenPayload;
  } catch (err) {
    return next(new AuthenticationError());
  }

  let user: User;
  try {
    user = await User.findOne({id: payload.userId});
  } catch (err) {
    return next(new AuthenticationError());
  }

  if (!user) {
    return next(new AuthenticationError());
  }

  req.user = user;
  return next();
};

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return next(new ValidationError(errors.array()));
  };
};

export function createValidationSchemaMiddleware(schema: Schema) {
  return validate(checkSchema(schema));
}
