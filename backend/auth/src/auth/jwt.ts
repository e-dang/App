import {sign, verify} from 'jsonwebtoken';
import {User} from '@entities';
import * as fs from 'fs';
import * as path from 'path';
import {config} from '@config';

const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, '..', '..', 'id_rsa_priv.pem'), 'utf-8');

export function createAccessToken(user: User) {
    return {
        accessToken: sign(
            {
                userId: user.id,
            },
            PRIVATE_KEY,
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
            PRIVATE_KEY,
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
    return verify(token, PRIVATE_KEY);
}
