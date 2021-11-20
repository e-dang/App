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

export const strategy = new Strategy(options, async (req: Request, payload: any, done: VerifiedCallback) => {
    let user: User;
    try {
        user = await User.findOne({id: payload.userId});
    } catch (err) {
        return done(err, false);
    }

    if (!user) {
        return done(null, false);
    }

    req.user = user;
    return done(null, user);
});
