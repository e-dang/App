import {createJwt, passwordIsValid, verifyRefreshToken} from '@auth';
import {User} from '@entities';
import {NextFunction, Request, Response, Router} from 'express';
import {ApiGroup} from './types';
import {body} from 'express-validator';
import {PG_UNIQUE_CONSTRAINT_VIOLATION} from '@src/constants';
import {getConnection} from 'typeorm';
import passport from 'passport';
import {validate} from './schema';
import {SignInError} from '@src/errors';

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

authRouter.post('/signout', passport.authenticate('jwt', {session: false}), async (req: Request, res: Response) => {
    await getConnection()
        .getRepository(User)
        .increment({id: (req.user as User).id}, 'tokenVersion', 1);

    return res.status(200).json();
});

authRouter.post(
    '/signup',
    validate([body('name').not().isEmpty(), body('email').isEmail(), body('password').isStrongPassword()]),
    async (req: Request, res: Response) => {
        let user: User;
        try {
            user = await User.createUser(req.body.name, req.body.email, req.body.password);
        } catch (err) {
            if (err.detail.includes('(email)=') && err.code == PG_UNIQUE_CONSTRAINT_VIOLATION) {
                return res.status(409).json({error: 'A user with that email has already been registered.'});
            }
        }

        return res.status(201).json(createJwt(user));
    },
);

authRouter.post('/password/reset', async (req: Request, res: Response) => {});

authRouter.post('/password/reset/confirm', async (req: Request, res: Response) => {});

authRouter.post('/password/change', async (req: Request, res: Response) => {});

authRouter.post('/token/refresh', validate([body('refreshToken').isJWT()]), async (req: Request, res: Response) => {
    let payload: any;
    try {
        payload = verifyRefreshToken(req.body.refreshToken);
    } catch (err) {
        return res.status(400).json({errors: 'This jwt is no longer valid'});
    }

    const user = await User.findOne({id: payload.userId});

    if (!user) {
        return res.status(400).json({errors: 'This user no longer exists.'});
    } else if (user.tokenVersion != payload.tokenVersion) {
        return res.status(400).json({errors: 'This token has been revoked.'});
    }

    return res.status(200).json(createJwt(user));
});

export const authApis: ApiGroup = {
    pathPrefix: 'auth',
    router: authRouter,
};
