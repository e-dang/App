import {User} from '@entities';
import {NextFunction, Request, Response, Router} from 'express';
import {ApiGroup} from './types';
import * as passport from 'passport';

const userRouter = Router();

userRouter.use(passport.authenticate('jwt', {session: false}));

// get auth user
userRouter.get('/', async (req: Request, res: Response) => {
    const user = await User.findOne({id: (req.user as User).id});
    if (!user) {
        return res.status(404).json({error: 'That user no longer exists.'});
    }

    return res.status(200).json({data: user.serialize()});
});

// update auth user
userRouter.patch('/', async (req: Request, res: Response) => {
    const user = await User.findOne({id: (req.user as User).id});
    if (!user) {
        return res.status(404).json({error: 'That user no longer exists.'});
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    await user.save();

    return res.status(200).json({data: user.serialize()});
});

// delete auth user
userRouter.delete('/', async (req: Request, res: Response) => {
    const user = await User.findOne({id: (req.user as User).id});
    if (!user) {
        return res.status(404).json({error: 'That user no longer exists.'});
    }

    user.isActive = false;
    await user.save();

    return res.status(202).json();
});

export const userApis: ApiGroup = {
    pathPrefix: 'user',
    router: userRouter,
};
