import {sign, verify} from 'jsonwebtoken';
import {User} from '@entities';
import {config} from '@config';

export function createAccessToken(user: User) {
    return {
        accessToken: sign(
            {
                userId: user.id,
            },
            config.accessTokenPrivateKey,
            {
                expiresIn: config.jwtAccessTokenExp,
                algorithm: 'RS256',
            },
        ),
    };
}

export function createRefreshToken(user: User) {
    return {
        refreshToken: sign(
            {
                userId: user.id,
                tokenVersion: user.tokenVersion,
            },
            config.refreshTokenPrivateKey,
            {
                expiresIn: config.jwtRefreshTokenExp,
            },
        ),
    };
}

export function createJwt(user: User) {
    return {...createAccessToken(user), ...createRefreshToken(user)};
}

export function verifyRefreshToken(token: string) {
    return verify(token, config.refreshTokenPrivateKey, {ignoreExpiration: false});
}
