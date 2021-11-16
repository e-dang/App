import {User} from '@entities';
import {Request, Response, Router} from 'express';
import {ApiGroup} from './types';
import * as passport from 'passport';

const userRouter = Router();

// get auth user
userRouter.get('/', passport.authenticate('jwt', {session: false}), async (req: Request, res: Response) => {
    const user = await User.findOne({id: (req.user as User).id});
    if (!user) {
        return res.status(404).json({error: 'That user no longer exists.'});
    }

    return res.status(200).json({data: JSON.stringify(user)});
});

// update auth user
userRouter.patch('/', passport.authenticate('jwt', {session: false}), async (req: Request, res: Response) => {
    const user = await User.findOne({id: (req.user as User).id});
    if (!user) {
        return res.status(404).json({error: 'That user no longer exists.'});
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    await user.save();

    return res.status(200).json({data: user});
});

// delete auth user
userRouter.delete('/', async (req: Request, res: Response) => {
    return res.status(202).json({});
});

export const userApis: ApiGroup = {
    pathPrefix: 'user',
    router: userRouter,
};
