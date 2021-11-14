import {ExtractJwt, Strategy, VerifiedCallback} from 'passport-jwt';
import {User} from '@entities';
import {Request} from 'express';
import {config} from '@config';

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.accessTokenPublicKey,
    algorithms: ['RS256'],
    passReqToCallback: true,
};

export const strategy = new Strategy(options, (req: Request, payload: any, done: VerifiedCallback) => {
    User.findOne({
        where: {
            id: payload.userId,
        },
    })
        .then((user) => {
            if (user) {
                req.user = user;
                return done(null, user);
            }
            return done(null, false);
        })
        .catch((err) => {
            return done(err, false);
        });
});
