import dotenv from 'dotenv';
import {readFileSync, existsSync, unlinkSync} from 'fs';
import {join} from 'path';

const parsedConfig = dotenv.config({path: __dirname + '/.env'});
if (parsedConfig.error) {
    throw parsedConfig.error;
}

function readKey(filepath: string, _delete: boolean = false) {
    if (!existsSync(filepath)) {
        throw new Error(`The file ${filepath} does not exist.`);
    }

    const key = readFileSync(filepath, 'utf-8');

    // delete the key so its contents exist only in memory
    if (_delete) {
        unlinkSync(filepath);
    }

    return key;
}

function isDevEnv(env: string) {
    return env === 'development' || env === 'test';
}

interface Config {
    env: string;
    dbHost: string;
    dbPort: number;
    dbUser: string;
    dbPassword: string;
    dbName: string;
    passwordHasher: string;
    passwordIterations: number;
    jwtAccessTokenExp: string;
    jwtRefreshTokenExp: string;
    passwordResetTokenAlg: string;
    passwordResetTokenSecret: string;
    passwordResetTokenExp: number;
    emailHost: string;
    emailPort: number;
    emailUser?: string;
    emailPassword?: string;
    accessTokenPrivateKey: string;
    accessTokenPublicKey: string;
    refreshTokenPrivateKey: string;
    httpPort: number;
    apiVersion: string;
    client: string;
}

export const config: Config = {
    env: process.env.NODE_ENV,
    dbHost: process.env.DATABASE_HOST,
    dbPort: parseInt(process.env.DATABASE_PORT),
    dbUser: process.env.DATABASE_USER,
    dbPassword: process.env.DATABASE_PASSWORD,
    dbName: process.env.DATABASE_NAME,
    passwordHasher: process.env.PASSWORD_HASHER,
    passwordIterations: parseInt(process.env.PASSWORD_ITERATIONS),
    jwtAccessTokenExp: process.env.JWT_ACCESS_TOKEN_EXP,
    jwtRefreshTokenExp: process.env.JWT_REFRESH_TOKEN_EXP,
    passwordResetTokenAlg: process.env.PASSWORD_RESET_TOKEN_ALG,
    passwordResetTokenSecret: process.env.PASSWORD_RESET_TOKEN_SECRET,
    passwordResetTokenExp: parseInt(process.env.PASSWORD_RESET_TOKEN_EXP),
    emailHost: process.env.EMAIL_HOST,
    emailPort: parseInt(process.env.EMAIL_PORT),
    emailUser: process.env?.EMAIL_USER,
    emailPassword: process.env?.EMAIL_PASSWORD,
    refreshTokenPrivateKey: readKey(join(__dirname, 'id_rsa_refresh'), !isDevEnv(process.env.NODE_ENV)),
    accessTokenPrivateKey: readKey(join(__dirname, 'id_rsa_access'), !isDevEnv(process.env.NODE_ENV)),
    accessTokenPublicKey: readKey(join(__dirname, 'id_rsa_access.pub')),
    httpPort: parseInt(process.env.HTTP_PORT),
    apiVersion: 'v1',
    client: process.env.CLIENT,
};
