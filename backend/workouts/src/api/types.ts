import {User} from '@entities';
import {AccessTokenPayload} from '@src/middleware';
import {Router, Request} from 'express';

export interface ApiGroup {
    pathPrefix?: string;
    router: Router;
}

export interface AuthenticatedRequest extends Request {
    user: User;
    tokenPayload: AccessTokenPayload;
}
