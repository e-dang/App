import 'reflect-metadata';
import {config} from '@config';
import {createConnection} from 'typeorm';
import * as express from 'express';
import {User} from '@entities';
import * as passport from 'passport';
import {strategy} from './passport';
import {authRouter, userRouter} from '@api';

createConnection({
    type: 'postgres', // WHY MUST I HARDCODE STUPID ASS TYPESCRIPT
    url: config.dbUrl,
    synchronize: true,
    logging: false,
    entities: [User],
    ssl: true,
    extra: {
        ssl: {
            rejectUnauthorized: false,
        },
    },
})
    .then(async (connection) => {
        // intialize components
        const app = express();
        passport.use(strategy);

        // middleware
        app.use(express.json());
        app.use(passport.initialize());

        // add apis
        app.use(authRouter);
        app.use(userRouter);

        // start express server
        app.listen(config.httpPort);

        console.log('Express server has started on port 3000');
    })
    .catch((error) => console.log(error));
