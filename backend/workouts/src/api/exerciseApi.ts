import {validateCreateExerciseRequest} from '@schemas';
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

exerciseRouter.post(
    '/:userId/exercises',
    validateIsOwner,
    validateCreateExerciseRequest,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const exercise = await req.user.addExercise(req.body);
        return res.status(201).json({data: exercise.serialize()});
    },
);

export const exerciseApi: ApiGroup = {
    router: exerciseRouter,
};
