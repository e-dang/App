import {ErrorInterface} from '@errors';
import {Request, Response, NextFunction} from 'express';

export function errorHandler(err: ErrorInterface, req: Request, res: Response, next: NextFunction) {
    res.status(err.statusCode).json(err.json);
}
