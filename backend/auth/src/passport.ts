import {ExtractJwt, Strategy, VerifiedCallback} from 'passport-jwt';
import {readFileSync} from 'fs';
import {join} from 'path';
import {User} from '@entities';
import {Request} from 'express';

const pathToKey = join(__dirname, '..', 'id_rsa_pub.pem');
const PUB_KEY = readFileSync(pathToKey, 'utf8');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: PUB_KEY,
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
