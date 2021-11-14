import * as express from 'express';
import * as passport from 'passport';
import {strategy} from '@src/passport';
import {authRouter, userRouter} from '@api';

// intialize components
export const app = express();
passport.use(strategy);

// middleware
app.use(express.json());
app.use(passport.initialize());

// add apis
app.use(authRouter);
app.use(userRouter);
