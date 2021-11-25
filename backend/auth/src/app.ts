import express, {Request, Response} from 'express';
import passport from 'passport';
import {jwtStrategy} from '@auth';
import {ApiGroup, apis} from '@api';
import {config} from '@config';
import morgan from 'morgan';
import {errorHandler} from './middleware';

function createApiPath(api: ApiGroup) {
    const path = `/api/${config.apiVersion}`;
    if (api.pathPrefix) {
        return `${path}/${api.pathPrefix}`;
    }
    return path;
}

// intialize components
export const app = express();
passport.use(jwtStrategy);

// middleware
app.use(express.json());
app.use(passport.initialize());
if (config.env !== 'test') {
    app.use(morgan('combined'));
}

// add apis
apis.forEach((api) => {
    app.use(createApiPath(api), api.router);
});

// error handlers
app.use(errorHandler);

app.get('/health', async (req: Request, res: Response) => {
    return res.status(200).json();
});
