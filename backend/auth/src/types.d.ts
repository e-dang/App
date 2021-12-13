import {User} from '@entities';

declare module 'express' {
    export interface Request {
        user?: User;
    }
}
