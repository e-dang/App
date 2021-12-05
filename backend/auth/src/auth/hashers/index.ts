import {getAlgorithm, Hasher} from './hasher';
import {config} from '@config';
import {PBKDF2} from './pbkdf2';

interface Hashers {
    [x: string]: Hasher;
}

const hashers: Hashers = {
    [PBKDF2.alg]: new PBKDF2(),
};

const hasher = hashers[config.passwordHasher];

export function hashPassword(password: string) {
    return hasher.hashPassword(password);
}

export function passwordIsValid(password: string, storedPassword: string) {
    const alg = getAlgorithm(storedPassword);
    return hashers[alg].passwordIsValid(password, storedPassword);
}
