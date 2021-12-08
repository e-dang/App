import {ApiGroup, AuthenticatedRequest} from '@api';
import {Workout} from '@entities';
import {WorkoutNotFoundError} from '@errors';
import {validateDeleteWorkoutRequest, validatePatchWorkoutRequest, validateWorkoutDetailRequest} from '@schemas';
import {validateIsAdmin, validateIsOwner, verifyAuthN} from '@src/middleware';
import {Response, NextFunction, Router} from 'express';

const workoutRouter = Router();

workoutRouter.use(verifyAuthN);

workoutRouter.get('/', validateIsAdmin, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const workouts = (await Workout.find()).map((workout) => workout.serialize());
    return res.status(200).json({data: workouts});
});

workoutRouter.get('/:userId', validateIsOwner, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    return res.status(200).json({data: await req.user.getSerializedWorkouts()});
});

workoutRouter.get(
    '/:userId/:workoutId',
    validateIsOwner,
    validateWorkoutDetailRequest,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const workout = await req.user.getWorkout(req.params.workoutId);

        if (!workout || workout.isDeleted) {
            return next(new WorkoutNotFoundError(req.user.id, req.params.workoutId));
        }

        return res.status(200).json({data: workout.serialize()});
    },
);

workoutRouter.post(
    '/:userId',
    validateIsOwner,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const workout = await req.user.addWorkout(req.body);
        return res.status(201).json({data: workout.serialize()});
    },
);

workoutRouter.patch(
    '/:userId/:workoutId',
    validateIsOwner,
    validatePatchWorkoutRequest,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const workout = await req.user.getWorkout(req.params.workoutId);

        if (!workout) {
            return next(new WorkoutNotFoundError(req.user.id, req.params.workoutId));
        }

        workout.name = req.body?.name || workout.name;
        await workout.save();

        return res.status(200).json({data: workout.serialize()});
    },
);

workoutRouter.delete(
    '/:userId/:workoutId',
    validateIsOwner,
    validateDeleteWorkoutRequest,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const workout = await req.user.getWorkout(req.params.workoutId);

        if (!workout) {
            return next(new WorkoutNotFoundError(req.user.id, req.params.workoutId));
        }

        workout.isDeleted = true;
        await workout.save();

        return res.status(202).json();
    },
);

export const workoutApis: ApiGroup = {
    pathPrefix: 'workouts',
    router: workoutRouter,
};
