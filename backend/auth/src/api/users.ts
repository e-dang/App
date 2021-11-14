import {Request, Response, Router} from 'express';
import {ApiGroup} from './types';

const userRouter = Router();

// list users
userRouter.get('/', async (req: Request, res: Response) => {});

// get user
userRouter.get('/:id', async (req: Request, res: Response) => {
    // try {
    //     const user = await User.findOne({
    //         where: {
    //             id: request.params.id,
    //         },
    //     });
    //     if (user === undefined) {
    //         return {status: 404};
    //     }
    //     return user;
    // } catch (err) {
    //     return {status: 404};
    // }
});

// update user
userRouter.put('/:id', async (req: Request, res: Response) => {});

// delete user
userRouter.delete('/:id', async (req: Request, res: Response) => {});

export const userApis: ApiGroup = {
    pathPrefix: 'users',
    router: userRouter,
};
