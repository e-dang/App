import {createJwt, hashPassword, passwordIsValid} from '@auth';
import {User} from '@entities';
import {Request, Response, Router} from 'express';
import {ApiGroup} from './types';
import {body, validationResult} from 'express-validator';

const authRouter = Router();

authRouter.post('/signin', async (req: Request, res: Response) => {
    const user = await User.findOne({where: {email: req.body.email}});
    if (passwordIsValid(req.body.password, user.password)) {
        return res.status(200).json(createJwt(user));
    }
    return res.status(401);
});

authRouter.post('/signout', async (req: Request, res: Response) => {
    // if (!req.user) {
    //     return res.status(404);
    // }
    // await getConnection()
    //     .getRepository(User)
    //     .increment({id: (req.user as User).id}, 'tokenVersion', 1);
    // return res.status(200);
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

        const hashedPassword = hashPassword(req.body.password);

        let user = new User();
        user.email = req.body.email;
        user.name = req.body.name;
        user.password = hashedPassword;
        user.lastLogin = new Date().toUTCString();
        user.isActive = true;
        user = await user.save();

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
