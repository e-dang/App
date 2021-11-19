import {User} from '@entities';
import {Response, Router} from 'express';
import {ApiGroup, AuthenticatedRequest} from './types';
import passport from 'passport';

const userRouter = Router();

userRouter.use(passport.authenticate('jwt', {session: false}));

// get auth user
userRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findOne({id: req.user.id});
    if (!user) {
        return res.status(404).json({error: 'That user no longer exists.'});
    }

    return res.status(200).json({data: user.serialize()});
});

// update auth user
userRouter.patch('/', async (req: AuthenticatedRequest, res: Response) => {
    req.user.name = req.body.name || req.user.name;
    req.user.email = req.body.email || req.user.email;
    await req.user.save();

    return res.status(200).json({data: req.user.serialize()});
});

// delete auth user
userRouter.delete('/', async (req: AuthenticatedRequest, res: Response) => {
    req.user.isActive = false;
    await req.user.save();

    return res.status(202).json();
});

export const userApis: ApiGroup = {
    pathPrefix: 'user',
    router: userRouter,
};
