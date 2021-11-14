import {Router} from 'express';

export interface ApiGroup {
    pathPrefix?: string;
    router: Router;
}
