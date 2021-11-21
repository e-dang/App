import {User} from '@entities';
import crypto from 'crypto';
import base32 from 'hi-base32';

function generateTokenHash(user: User, timestamp: string) {
    const alg = 'sha256';
    const secret = 'secret';
    const data = createHashData(user, timestamp);
    return crypto.createHmac(alg, secret).update(data).digest('hex');
}

function createHashData(user: User, timestamp: string) {
    const lastLoginSeconds = Math.floor(user.lastLogin.getTime() / 1000); // convert to seconds
    return `${user.id}${user.password}${lastLoginSeconds}${timestamp}`;
}

function joinToken(timestamp: string, hash: string) {
    return `${timestamp}-${hash}`;
}

function splitToken(token: string) {
    return token.split('-');
}

export function verifyPasswordResetToken(user: User, token: string) {
    const [b36TimeStamp, hash] = splitToken(token);
    const timeStamp = parseInt(base32.decode(b36TimeStamp));
    const currentTime = Math.floor(new Date().getTime() / 1000); // convert to seconds

    if (currentTime - timeStamp > 3600) {
        return false;
    } else if (hash !== generateTokenHash(user, b36TimeStamp)) {
        return false;
    }

    return true;
}

export function createPasswordResetToken(user: User) {
    const currentTime = Math.floor(new Date().getTime() / 1000); // convert to seconds
    const currentTimeb36 = base32.encode(currentTime.toString());
    const hash = generateTokenHash(user, currentTimeb36);
    return joinToken(currentTimeb36, hash);
}
