import {createJwt, hashPassword, passwordIsValid, verifyRefreshToken} from '@auth';
import {User} from '@entities';
import {NextFunction, Request, Response, Router} from 'express';
import {ApiGroup, AuthenticatedRequest} from './types';
import {body} from 'express-validator';
import {PG_UNIQUE_CONSTRAINT_VIOLATION} from '@src/constants';
import passport from 'passport';
import {validate} from './schema';
import {
    ExpiredTokenError,
    InvalidOldPasswordError,
    PasswordsMismatchError,
    SignInError,
    UserAlreadyExistsError,
    UserNotFoundError,
} from '@src/errors';

const authRouter = Router();

authRouter.post(
    '/signin',
    validate([body('email').isEmail(), body('password').not().isEmpty()]),
    async (req: Request, res: Response, next: NextFunction) => {
        const user = await User.findOne({email: req.body.email});
        if (!user) {
            return next(new SignInError());
        }

        if (passwordIsValid(req.body.password, user.password)) {
            user.lastLogin = new Date().toUTCString();
            await user.save();
            return res.status(200).json(createJwt(user));
        }

        return next(new SignInError());
    },
);

authRouter.post(
    '/signout',
    passport.authenticate('jwt', {session: false}),
    async (req: AuthenticatedRequest, res: Response) => {
        req.user.tokenVersion++;
        await req.user.save();
        return res.status(200).json();
    },
);

authRouter.post(
    '/signup',
    validate([body('name').not().isEmpty(), body('email').isEmail(), body('password').isStrongPassword()]),
    async (req: Request, res: Response, next: NextFunction) => {
        let user: User;
        try {
            user = await User.createUser(req.body.name, req.body.email, req.body.password);
        } catch (err) {
            if (err.detail.includes('(email)=') && err.code == PG_UNIQUE_CONSTRAINT_VIOLATION) {
                return next(new UserAlreadyExistsError(req.body.email));
            }
        }

        return res.status(201).json(createJwt(user));
    },
);

authRouter.post('/password/reset', async (req: Request, res: Response) => {});

authRouter.post('/password/reset/confirm', async (req: Request, res: Response) => {});

authRouter.post(
    '/password/change',
    passport.authenticate('jwt', {session: false}),
    validate([
        body('oldPassword').not().isEmpty(),
        body('newPassword').isStrongPassword(),
        body('confirmPassword').not().isEmpty(),
    ]),
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!passwordIsValid(req.body.oldPassword, req.user.password)) {
            return next(new InvalidOldPasswordError());
        } else if (req.body.newPassword !== req.body.confirmPassword) {
            return next(new PasswordsMismatchError());
        }

        req.user.password = hashPassword(req.body.newPassword);
        await req.user.save();
        return res.status(200).json();
    },
);

authRouter.post(
    '/token/refresh',
    validate([body('refreshToken').isJWT()]),
    async (req: Request, res: Response, next: NextFunction) => {
        let payload: any;
        try {
            payload = verifyRefreshToken(req.body.refreshToken);
        } catch (err) {
            return next(new ExpiredTokenError());
        }

        const user = await User.findOne({id: payload.userId});

        if (!user) {
            return next(new UserNotFoundError(payload.userId));
        } else if (user.tokenVersion != payload.tokenVersion) {
            return next(new ExpiredTokenError());
        }

        return res.status(200).json(createJwt(user));
    },
);

export const authApis: ApiGroup = {
    pathPrefix: 'auth',
    router: authRouter,
};
