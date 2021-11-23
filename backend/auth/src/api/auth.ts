import {
    createJwt,
    createPasswordResetToken,
    hashPassword,
    passwordIsValid,
    RefreshTokenPayload,
    verifyPasswordResetToken,
    verifyRefreshToken,
} from '@auth';
import {User} from '@entities';
import {NextFunction, Request, Response, Router} from 'express';
import {ApiGroup, AuthenticatedRequest} from './types';
import {PG_UNIQUE_CONSTRAINT_VIOLATION} from '@src/constants';
import {
    InternalError,
    InvalidTokenError,
    SignInError,
    UserNotFoundError,
    UserWithEmailAlreadyExistsError,
} from '@errors';
import {verifyAuthN} from '@src/middleware';
import {
    validateChangePasswordRequest,
    validatePasswordResetConfirmRequest,
    validatePasswordResetRequest,
    validateRefreshTokenRequest,
    validateSignInRequest,
    validateSignUpRequest,
} from '@schemas';
import {sendPasswordResetEmail} from '@src/emailer';

const authRouter = Router();

authRouter.post('/signin', validateSignInRequest, async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return next(new SignInError());
    }

    if (passwordIsValid(req.body.password, user.password)) {
        user.lastLogin = new Date();
        await user.save();
        return res.status(200).json(createJwt(user));
    }

    return next(new SignInError());
});

authRouter.post('/signout', verifyAuthN, async (req: AuthenticatedRequest, res: Response) => {
    req.user.tokenVersion++;
    await req.user.save();
    return res.status(200).json();
});

authRouter.post('/signup', validateSignUpRequest, async (req: Request, res: Response, next: NextFunction) => {
    let user: User;
    try {
        user = await User.createUser(req.body.name, req.body.email, req.body.password);
    } catch (err) {
        if (err.detail.includes('(email)=') && err.code == PG_UNIQUE_CONSTRAINT_VIOLATION) {
            return next(new UserWithEmailAlreadyExistsError(req.body.email));
        }

        return next(new InternalError(err.message));
    }

    return res.status(201).json(createJwt(user));
});

authRouter.post(
    '/password/reset',
    validatePasswordResetRequest,
    async (req: Request, res: Response, next: NextFunction) => {
        const user = await User.findOne({email: req.body.email});
        if (!user) {
            return res.status(200).json(); // Always return saying it worked so you dont expose User emails
        }

        const token = createPasswordResetToken(user);
        await sendPasswordResetEmail(user, token);
        return res.status(200).json();
    },
);

authRouter.post(
    '/password/reset/confirm',
    validatePasswordResetConfirmRequest,
    async (req: Request, res: Response, next: NextFunction) => {
        const user = await User.findOne({id: req.body.userId});
        if (!user) {
            // send back token error since letting the sender know that a user with a certain id doesn't exist
            // would leak user id info
            return next(new InvalidTokenError('body', 'token'));
        }

        try {
            verifyPasswordResetToken(user, req.body.token);
        } catch (err) {
            return next(err);
        }

        user.password = hashPassword(req.body.newPassword);
        await user.save();
        return res.status(200).json('Password successfully reset');
    },
);

authRouter.post(
    '/password/change',
    verifyAuthN,
    validateChangePasswordRequest,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        req.user.password = hashPassword(req.body.newPassword);
        await req.user.save();
        return res.status(200).json();
    },
);

authRouter.post(
    '/token/refresh',
    validateRefreshTokenRequest,
    async (req: Request, res: Response, next: NextFunction) => {
        let payload: RefreshTokenPayload;
        try {
            payload = verifyRefreshToken(req.body.refreshToken);
        } catch (err) {
            return next(new InvalidTokenError('body', 'refreshToken'));
        }

        const user = await User.findOne({id: payload.userId});

        if (!user) {
            return next(new UserNotFoundError(payload.userId));
        } else if (user.tokenVersion != payload.tokenVersion) {
            return next(new InvalidTokenError('body', 'refreshToken'));
        }

        return res.status(200).json(createJwt(user));
    },
);

export const authApis: ApiGroup = {
    pathPrefix: 'auth',
    router: authRouter,
};
