import {ApiGroup, AuthenticatedRequest} from '@api';
import {verifyAuthN} from '@src/middleware';
import {Response, NextFunction, Router} from 'express';

const workoutRouter = Router();

workoutRouter.use(verifyAuthN);

workoutRouter.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    return res.status(200).json({data: await req.user.getSerializedWorkouts()});
});

workoutRouter.get('/:workoutId', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {});

workoutRouter.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {});

workoutRouter.patch('/:workoutId', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {});

workoutRouter.delete('/:workoutId', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {});

export const workoutApis: ApiGroup = {
    pathPrefix: 'workout',
    router: workoutRouter,
};
