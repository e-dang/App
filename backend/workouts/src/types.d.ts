import {User} from '@entities';
import {AccessTokenPayload} from './middleware';

declare module 'express' {
    export interface Request {
        user?: User;
        tokenPayload?: AccessTokenPayload;
    }
}
