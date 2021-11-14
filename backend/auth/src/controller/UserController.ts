import {NextFunction, Request, Response} from 'express';
import {User} from '../entity/User';

export class UserController {
    async all(request: Request, response: Response, next: NextFunction) {
        return User.find();
    }

    async one(request: Request, response: Response, next: NextFunction) {
        return User.findOne(request.params.id);
    }

    async save(request: Request, response: Response, next: NextFunction) {
        return User.save(request.body);
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let userToRemove = await User.findOne(request.params.id);
        await User.remove(userToRemove);
    }
}

class AuthController {
    async signIn(req: Request, resp: Response, next: NextFunction) {}

    async signOut(req: Request, resp: Response, next: NextFunction) {}

    async signUp(req: Request, resp: Response, next: NextFunction) {}

    async forgotPassword(req: Request, resp: Response, next: NextFunction) {}

    async changePassword(req: Request, resp: Response, next: NextFunction) {}
}
