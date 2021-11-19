import {NextFunction, Request, Response} from 'express';
import {InternalError} from './errors';

export function errorHandler(err: InternalError, req: Request, res: Response, next: NextFunction) {
    res.status(err.statusCode).json(err.json);
}
