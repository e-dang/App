import {Exercise} from "@entities";
import {validateCreateExerciseRequest} from "@schemas";
import {validateIsOwner, verifyAuthN} from "@src/middleware";
import {Response, Router} from "express";
import {DeepPartial} from "typeorm";
import {ApiGroup, AuthenticatedRequest} from "./types";

const exerciseRouter = Router();

exerciseRouter.use(verifyAuthN);

exerciseRouter.get("/:userId/exercises", validateIsOwner, async (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({data: await req.user.getSerializedExercises()});
});

exerciseRouter.post(
  "/:userId/exercises",
  validateIsOwner,
  validateCreateExerciseRequest,
  async (req: AuthenticatedRequest, res: Response) => {
    const exercise = await req.user.addExercise(req.body as DeepPartial<Exercise>);
    return res.status(201).json({data: exercise.serialize()});
  },
);

export const exerciseApi: ApiGroup = {
  router: exerciseRouter,
};
