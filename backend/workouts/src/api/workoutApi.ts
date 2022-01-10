import {ApiGroup, AuthenticatedRequest} from "@api";
import {WorkoutTemplate} from "@entities";
import {WorkoutNotFoundError} from "@errors";
import {validateDeleteWorkoutRequest, validatePatchWorkoutRequest, validateWorkoutDetailRequest} from "@schemas";
import {validateIsAdmin, validateIsOwner, verifyAuthN} from "@src/middleware";
import {Response, NextFunction, Router} from "express";
import {DeepPartial} from "typeorm";

const workoutRouter = Router();

workoutRouter.use(verifyAuthN);

workoutRouter.get("/workouts", validateIsAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const workouts = (await WorkoutTemplate.find()).map((workout) => workout.serialize());
  return res.status(200).json({data: workouts});
});

workoutRouter.get("/:userId/workouts", validateIsOwner, async (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({data: await req.user.getSerializedWorkoutTemplates()});
});

workoutRouter.get(
  "/:userId/workouts/:workoutId",
  validateIsOwner,
  validateWorkoutDetailRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const workout = await req.user.getWorkoutTemplate(req.params.workoutId);

    if (!workout || workout.isDeleted) {
      return next(new WorkoutNotFoundError(req.user.id, req.params.workoutId));
    }

    return res.status(200).json({data: workout.serialize()});
  },
);

workoutRouter.post("/:userId/workouts", validateIsOwner, async (req: AuthenticatedRequest, res: Response) => {
  const workout = await req.user.addWorkoutTemplate(req.body as DeepPartial<WorkoutTemplate>);
  return res.status(201).json({data: workout.serialize()});
});

workoutRouter.patch(
  "/:userId/workouts/:workoutId",
  validateIsOwner,
  validatePatchWorkoutRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const workout = await req.user.getWorkoutTemplate(req.params.workoutId);

    if (!workout) {
      return next(new WorkoutNotFoundError(req.user.id, req.params.workoutId));
    }

    workout.name = req.body?.name || workout.name;
    await workout.save();

    return res.status(200).json({data: workout.serialize()});
  },
);

workoutRouter.delete(
  "/:userId/workouts/:workoutId",
  validateIsOwner,
  validateDeleteWorkoutRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const workout = await req.user.getWorkoutTemplate(req.params.workoutId);

    if (!workout) {
      return next(new WorkoutNotFoundError(req.user.id, req.params.workoutId));
    }

    workout.isDeleted = true;
    await workout.save();

    return res.status(202).json();
  },
);

export const workoutApis: ApiGroup = {
  router: workoutRouter,
  pathPrefix: "templates",
};
