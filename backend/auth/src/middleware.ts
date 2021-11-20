import {NextFunction, Request, Response} from 'express';
import {AuthenticationError, InternalError} from './errors';
import passport from 'passport';
import {User} from '@entities';

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
