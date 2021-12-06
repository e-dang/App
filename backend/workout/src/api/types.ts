import {User} from '@entities';
import {Router, Request} from 'express';

export interface ApiGroup {
    pathPrefix?: string;
    router: Router;
}

export interface AuthenticatedRequest extends Request {
    user: User;
}
