import {config} from '@config';
import {AccessTokenPayload} from '@src/middleware';
import * as jose from 'jose';

export async function createToken(payload: AccessTokenPayload) {
    return new jose.SignJWT(payload)
        .setProtectedHeader({alg: 'EdDSA', typ: 'JWT'})
        .setIssuedAt()
        .setIssuer('dev.erickdang.com')
        .setAudience('dev.erickdang.com')
        .setExpirationTime('5m')
        .sign(await config.accessTokenPublicKey);
}
