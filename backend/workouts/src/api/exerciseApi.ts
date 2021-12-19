import {validateIsOwner, verifyAuthN} from '@src/middleware';
import {NextFunction, Response, Router} from 'express';
import {ApiGroup, AuthenticatedRequest} from './types';

const exerciseRouter = Router();

exerciseRouter.use(verifyAuthN);

exerciseRouter.get(
    '/:userId/exercises',
    validateIsOwner,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        return res.status(200).json({data: await req.user.getSerializedExercises()});
    },
);

export const exerciseApi: ApiGroup = {
    router: exerciseRouter,
};
