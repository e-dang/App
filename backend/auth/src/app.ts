import * as express from 'express';
import * as passport from 'passport';
import {strategy} from '@src/passport';
import {ApiGroup, apis} from '@api';
import {config} from '@config';

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

// add apis
apis.forEach((api) => {
    app.use(createApiPath(api), api.router);
});
