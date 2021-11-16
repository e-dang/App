import express from 'express';
import passport from 'passport';
import {strategy} from '@src/passport';
import {ApiGroup, apis} from '@api';
import {config} from '@config';
import morgan from 'morgan';

function createApiPath(api: ApiGroup) {
    const path = `/api/${config.apiVersion}`;
    if (api.pathPrefix) {
        return `${path}/${api.pathPrefix}`;
    }
    return path;
}

// intialize components
export const app = express();
passport.use(strategy);

// middleware
app.use(express.json());
app.use(passport.initialize());
app.use(morgan('combined'));

// add apis
apis.forEach((api) => {
    app.use(createApiPath(api), api.router);
});
