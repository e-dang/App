import * as jose from 'jose';
import fs from 'fs';
import path from 'path';

interface Secrets {
    [x: string]: string;
}

function readSecrets() {
    const secrets: Secrets = {};
    fs.readdirSync(path.join(__dirname, 'secrets'), {encoding: 'utf-8'}).forEach((file) => {
        secrets[file] = fs.readFileSync(path.join(__dirname, 'secrets', file)).toString();
    });

    return secrets;
}

const accessTokenAlg = 'EdDSA';
const secrets = readSecrets();

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
    refreshTokenPrivateKey: Uint8Array;
    accessTokenPrivateKey: Promise<jose.KeyLike>;
    accessTokenPublicKey: Promise<jose.KeyLike>;
    accessTokenAlg: string;
    refreshTokenAlg: string;
    jwtIssuer: string;
    jwtAudience: string;
    httpPort: number;
    apiVersion: string;
    allowedHosts: string;
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
    refreshTokenPrivateKey: new TextEncoder().encode(secrets.refresh_token_secret),
    accessTokenPrivateKey: jose.importPKCS8(secrets.access_token_private, accessTokenAlg),
    accessTokenPublicKey: jose.importSPKI(secrets.access_token_public, accessTokenAlg),
    accessTokenAlg: accessTokenAlg,
    refreshTokenAlg: 'HS512',
    jwtIssuer: 'dev.erickdang.com',
    jwtAudience: 'dev.erickdang.com',
    httpPort: parseInt(process.env.HTTP_PORT),
    apiVersion: 'v1',
    allowedHosts: 'https://dev.erickdang.com',
    client: process.env.CLIENT,
};
