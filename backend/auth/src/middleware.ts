import {NextFunction, Request, Response} from 'express';
import {AuthenticationError, InternalError} from './errors';
import passport from 'passport';
import {User} from '@entities';
import {checkSchema, Schema, ValidationChain, validationResult} from 'express-validator';

export function errorHandler(err: InternalError, req: Request, res: Response, next: NextFunction) {
    res.status(err.statusCode).json(err.json);
}

export const verifyAuthN = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', {session: false}, (err: Error, user: User | boolean, info: Object | undefined) => {
        if (err || !user) {
            return next(new AuthenticationError());
        }
        return next();
    })(req, res, next); /* passport.authentication returns a function,
                           we invoke it with normal req..res arguments
                           to override default functionality */
};

export const validate = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        await Promise.all(validations.map((validation) => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({errors: errors.array()});
    };
};

export function createValidationSchemaMiddleware(schema: Schema) {
    return validate(checkSchema(schema));
}
