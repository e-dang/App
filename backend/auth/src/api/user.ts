import {Response, Router} from "express";
import {verifyAuthN} from "@src/middleware";
import {validatePatchUserRequest} from "@schemas";
import {ApiGroup, AuthenticatedRequest} from "./types";

const userRouter = Router();

userRouter.use(verifyAuthN);

// get auth user
userRouter.get("/", (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({data: req.user.serialize()});
});

// update auth user
userRouter.patch("/", validatePatchUserRequest, async (req: AuthenticatedRequest, res: Response) => {
  req.user.name = req.body.name || req.user.name;
  req.user.email = req.body.email || req.user.email;
  await req.user.save();

  return res.status(200).json({data: req.user.serialize()});
});

// delete auth user
userRouter.delete("/", async (req: AuthenticatedRequest, res: Response) => {
  req.user.isActive = false;
  await req.user.save();

  return res.status(202).json();
});

export const userApis: ApiGroup = {
  pathPrefix: "user",
  router: userRouter,
};
