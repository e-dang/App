import {
  createJwt,
  createPasswordResetToken,
  hashPassword,
  passwordIsValid,
  RefreshTokenPayload,
  verifyPasswordResetToken,
  verifyRefreshToken,
} from "@auth";
import {User} from "@entities";
import {NextFunction, Request, Response, Router} from "express";
import {PG_UNIQUE_CONSTRAINT_VIOLATION} from "@src/constants";
import {
  InternalError,
  InvalidTokenError,
  SignInError,
  UserNotFoundError,
  UserWithEmailAlreadyExistsError,
} from "@errors";
import {verifyAuthN} from "@src/middleware";
import {
  validateChangePasswordRequest,
  validatePasswordResetConfirmRequest,
  validatePasswordResetRequest,
  validateSignInRequest,
  validateSignUpRequest,
} from "@schemas";
import {sendPasswordResetEmail} from "@emailer";
import {DatabaseError} from "pg-protocol";
import {QueryFailedError} from "typeorm";
import {ApiGroup, AuthenticatedRequest} from "./types";

const authRouter = Router();

authRouter.post("/signin", validateSignInRequest, async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findOne({email: req.body.email});
  if (!user) {
    return next(new SignInError());
  }

  if (passwordIsValid(req.body.password as string, user.password)) {
    user.lastLogin = new Date();
    await user.save();
    const {refreshToken, accessToken} = await createJwt(user);
    return res.status(200).cookie("rt", refreshToken, {httpOnly: true}).json({data: {accessToken}});
  }

  return next(new SignInError());
});

authRouter.post("/signout", verifyAuthN, async (req: AuthenticatedRequest, res: Response) => {
  req.user.tokenVersion++;
  await req.user.save();
  return res.status(200).json();
});

authRouter.post("/signup", validateSignUpRequest, async (req: Request, res: Response, next: NextFunction) => {
  const isQueryFailedError = (err: unknown): err is QueryFailedError & DatabaseError => err instanceof QueryFailedError;

  let user: User;
  try {
    user = await User.createUser(req.body.name as string, req.body.email as string, req.body.password as string);
  } catch (err) {
    if (isQueryFailedError(err)) {
      if (err.detail.includes("(email)=") && err.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
        return next(new UserWithEmailAlreadyExistsError(req.body.email as string));
      }
    }

    return next(new InternalError((err as Error).message));
  }

  const {refreshToken, accessToken} = await createJwt(user);
  return res.status(201).cookie("rt", refreshToken, {httpOnly: true}).json({data: {accessToken}});
});

authRouter.post("/password/reset", validatePasswordResetRequest, async (req: Request, res: Response) => {
  const user = await User.findOne({email: req.body.email});
  if (!user) {
    return res.status(200).json(); // Always return saying it worked so you dont expose User emails
  }

  const token = createPasswordResetToken(user);
  await sendPasswordResetEmail(user, token);
  return res.status(200).json();
});

authRouter.post(
  "/password/reset/confirm",
  validatePasswordResetConfirmRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOne({id: req.body.userId});
    if (!user) {
      // send back token error since letting the sender know that a user with a certain id doesn't exist
      // would leak user id info
      return next(new InvalidTokenError("body", "token"));
    }

    try {
      verifyPasswordResetToken(user, req.body.token as string);
    } catch (err) {
      return next(err);
    }

    user.password = hashPassword(req.body.newPassword as string);
    await user.save();
    return res.status(200).json("Password successfully reset");
  },
);

authRouter.post(
  "/password/change",
  verifyAuthN,
  validateChangePasswordRequest,
  async (req: AuthenticatedRequest, res: Response) => {
    req.user.password = hashPassword(req.body.newPassword as string);
    await req.user.save();
    return res.status(200).json();
  },
);

authRouter.post("/token/refresh", async (req: Request, res: Response, next: NextFunction) => {
  let payload: RefreshTokenPayload;
  try {
    payload = await verifyRefreshToken(req.cookies.rt as string);
  } catch (err) {
    return next(new InvalidTokenError("headers", "refreshToken"));
  }

  const user = await User.findOne({id: payload.userId});

  if (!user) {
    return next(new UserNotFoundError(payload.userId));
  }

  if (user.tokenVersion !== payload.tokenVersion) {
    return next(new InvalidTokenError("headers", "refreshToken"));
  }

  const {refreshToken, accessToken} = await createJwt(user);
  return res.status(200).cookie("rt", refreshToken, {httpOnly: true}).json({data: {accessToken}});
});

export const authApis: ApiGroup = {
  pathPrefix: "auth",
  router: authRouter,
};
