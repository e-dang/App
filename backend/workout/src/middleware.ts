import {Request, Response, NextFunction} from 'express';
import {config} from '@config';
import {User} from '@entities';
import {AuthenticationError, ErrorInterface, ValidationError} from '@errors';
import {checkSchema, Schema, ValidationChain, validationResult} from 'express-validator';
import * as jose from 'jose';

export function errorHandler(err: ErrorInterface, req: Request, res: Response, next: NextFunction) {
    res.status(err.statusCode).json(err.json);
}

interface AccessTokenPayload extends jose.JWTPayload {
    userId: string;
}

function parseAccessToken(req: Request) {
    const authHeader = req.get('authorization');
    if (!authHeader) {
        throw new AuthenticationError();
    }

    const [specifier, token] = authHeader.split(' ');
    if (specifier !== 'Token') {
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
        // If user not found, but we have verified that the JWT is valid, then create new user.
        // This might only be temprorary until event architecture is in place
        user = await User.create({id: payload.userId}).save();
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
