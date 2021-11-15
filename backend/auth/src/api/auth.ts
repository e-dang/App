import {createJwt, passwordIsValid} from '@auth';
import {User} from '@entities';
import {Request, Response, Router} from 'express';
import {ApiGroup} from './types';
import {body, validationResult} from 'express-validator';
import {PG_UNIQUE_CONSTRAINT_VIOLATION} from '@src/constants';
import {getConnection} from 'typeorm';
import * as passport from 'passport';

const authRouter = Router();

authRouter.post(
    '/signin',
    body('email').isEmail(),
    body('password').isLength({min: 1}),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const user = await User.findOne({email: req.body.email});
        if (!user) {
            return res.status(400).json({error: 'The user with that email and/or password does not exist.'});
        }

        if (passwordIsValid(req.body.password, user.password)) {
            return res.status(200).json(createJwt(user));
        }

        return res.status(400).json({error: 'The user with that email and/or password does not exist.'});
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
    body('name').isLength({min: 1}),
    body('email').isEmail(),
    body('password').isStrongPassword(),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

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

authRouter.post('/token/refresh', async (req: Request, res: Response) => {
    // const payload: any = verifyRefreshToken(req.body.refreshToken);
    //     const user = await User.findOne({
    //         where: {
    //             id: payload.userId,
    //         },
    //     });
    //     if (!user) {
    //         return {errors: ['']};
    //     }
    //     return createJwt(user);
});

export const authApis: ApiGroup = {
    pathPrefix: 'auth',
    router: authRouter,
};
