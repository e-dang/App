import {ApiGroup, AuthenticatedRequest} from '@api';
import {WorkoutNotFoundError} from '@errors';
import {validateWorkoutDetailRequest} from '@schemas';
import {verifyAuthN} from '@src/middleware';
import {Response, NextFunction, Router} from 'express';

const workoutRouter = Router();

workoutRouter.use(verifyAuthN);

workoutRouter.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    return res.status(200).json({data: await req.user.getSerializedWorkouts()});
});

workoutRouter.get(
    '/:workoutId',
    validateWorkoutDetailRequest,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const workout = await req.user.getWorkout(req.params.workoutId);

        if (!workout || workout.isDeleted) {
            return next(new WorkoutNotFoundError(req.user.id, req.params.workoutId));
        }

        return res.status(200).json({data: workout.serialize()});
    },
);

workoutRouter.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const workout = await req.user.addWorkout(req.body);
    return res.status(201).json({data: workout.serialize()});
});

workoutRouter.patch('/:workoutId', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {});

workoutRouter.delete('/:workoutId', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {});

export const workoutApis: ApiGroup = {
    pathPrefix: 'workout',
    router: workoutRouter,
};
