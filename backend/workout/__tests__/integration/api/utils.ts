import {config} from '@config';
import * as jose from 'jose';

export async function createToken(userId: string) {
    return new jose.SignJWT({userId})
        .setProtectedHeader({alg: 'EdDSA', typ: 'JWT'})
        .setIssuedAt()
        .setIssuer('dev.erickdang.com')
        .setAudience('dev.erickdang.com')
        .setExpirationTime('5m')
        .sign(await config.accessTokenPublicKey);
}
