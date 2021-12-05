import {User} from '@entities';
import {Request, Router} from 'express';

export interface ApiGroup {
    pathPrefix?: string;
    router: Router;
}

export interface AuthenticatedRequest extends Request {
    user: User;
}
