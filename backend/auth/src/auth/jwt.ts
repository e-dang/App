import {sign, verify} from 'jsonwebtoken';
import {User} from '@entities';
import {config} from '@config';
import {JwtPayload} from 'jsonwebtoken';

interface TokenPayload extends JwtPayload {
    userId: string;
}

export interface AccessTokenPayload extends TokenPayload {}

export interface RefreshTokenPayload extends TokenPayload {
    tokenVersion: number;
}

export function createAccessToken(user: User) {
    const payload: AccessTokenPayload = {
        userId: user.id,
    };

    return {
        accessToken: sign(payload, config.accessTokenPrivateKey, {
            expiresIn: config.jwtAccessTokenExp,
            algorithm: 'RS256',
        }),
    };
}

export function createRefreshToken(user: User) {
    const payload: RefreshTokenPayload = {
        userId: user.id,
        tokenVersion: user.tokenVersion,
    };

    return {
        refreshToken: sign(payload, config.refreshTokenPrivateKey, {
            expiresIn: config.jwtRefreshTokenExp,
        }),
    };
}

export function createJwt(user: User) {
    return {...createAccessToken(user), ...createRefreshToken(user)};
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
    return verify(token, config.refreshTokenPrivateKey, {ignoreExpiration: false}) as RefreshTokenPayload;
}
