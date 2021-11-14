import {Request, Response, Router} from 'express';

export const userRouter = Router();

// list users
userRouter.get('/users', async (req: Request, res: Response) => {});

// get user
userRouter.get('/users/:id', async (req: Request, res: Response) => {
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
userRouter.put('/users/:id', async (req: Request, res: Response) => {});

// delete user
userRouter.delete('/users/:id', async (req: Request, res: Response) => {});
