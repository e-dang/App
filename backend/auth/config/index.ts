import * as jose from 'jose';
import fs from 'fs';
import path from 'path';

export interface PartialConfigs {
    [x: string]: string;
}

function sourceConfigs() {
    const secrets: PartialConfigs = {};

    fs.readdirSync(path.join(__dirname, 'secrets'), {encoding: 'utf-8'}).forEach((file) => {
        if (file in process.env) {
            // use environment variable override
            secrets[file] = process.env[file];
        } else {
            // read mounted configs
            secrets[file] = fs.readFileSync(path.join(__dirname, 'secrets', file), {encoding: 'utf-8'}).toString();
        }
    });

    return secrets;
}

const accessTokenAlg = 'EdDSA';
const sourcedConfigs = sourceConfigs();

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
    dbHost: sourcedConfigs.dbHost,
    dbPort: parseInt(sourcedConfigs.dbPort),
    dbUser: sourcedConfigs.dbUser,
    dbPassword: sourcedConfigs.dbPassword,
    dbName: sourcedConfigs.dbName,
    passwordHasher: sourcedConfigs.passwordHasher,
    passwordIterations: parseInt(sourcedConfigs.passwordIters),
    jwtAccessTokenExp: sourcedConfigs.accessTokenExp,
    jwtRefreshTokenExp: sourcedConfigs.refreshTokenExp,
    passwordResetTokenAlg: sourcedConfigs.passwordResetTokenAlg,
    passwordResetTokenSecret: sourcedConfigs.passwordResetTokenSecret,
    passwordResetTokenExp: parseInt(sourcedConfigs.passwordResetTokenExp),
    emailHost: sourcedConfigs.emailHost,
    emailPort: parseInt(sourcedConfigs.emailPort),
    emailUser: sourcedConfigs?.emailUser,
    emailPassword: sourcedConfigs?.emailPassword,
    refreshTokenPrivateKey: new TextEncoder().encode(sourcedConfigs.refreshTokenSecret),
    accessTokenPrivateKey: jose.importPKCS8(sourcedConfigs.accessTokenPrivate, accessTokenAlg),
    accessTokenPublicKey: jose.importSPKI(sourcedConfigs.accessTokenPublic, accessTokenAlg),
    accessTokenAlg: accessTokenAlg,
    refreshTokenAlg: 'HS512',
    jwtIssuer: 'dev.erickdang.com',
    jwtAudience: 'dev.erickdang.com',
    httpPort: parseInt(sourcedConfigs.httpPort),
    apiVersion: 'v1',
    allowedHosts: 'https://dev.erickdang.com',
    client: sourcedConfigs.client,
};

// export const config: Config = {
//     env: process.env.NODE_ENV,
//     dbHost: process.env.DATABASE_HOST,
//     dbPort: parseInt(process.env.DATABASE_PORT),
//     dbUser: process.env.DATABASE_USER,
//     dbPassword: process.env.DATABASE_PASSWORD,
//     dbName: process.env.DATABASE_NAME,
//     passwordHasher: process.env.PASSWORD_HASHER,
//     passwordIterations: parseInt(process.env.PASSWORD_ITERATIONS),
//     jwtAccessTokenExp: process.env.JWT_ACCESS_TOKEN_EXP,
//     jwtRefreshTokenExp: process.env.JWT_REFRESH_TOKEN_EXP,
//     passwordResetTokenAlg: process.env.PASSWORD_RESET_TOKEN_ALG,
//     passwordResetTokenSecret: process.env.PASSWORD_RESET_TOKEN_SECRET,
//     passwordResetTokenExp: parseInt(process.env.PASSWORD_RESET_TOKEN_EXP),
//     emailHost: process.env.EMAIL_HOST,
//     emailPort: parseInt(process.env.EMAIL_PORT),
//     emailUser: process.env?.EMAIL_USER,
//     emailPassword: process.env?.EMAIL_PASSWORD,
//     refreshTokenPrivateKey: new TextEncoder().encode(sourcedConfigs.refresh_token_secret as string),
//     accessTokenPrivateKey: jose.importPKCS8(sourcedConfigs.access_token_private as string, accessTokenAlg),
//     accessTokenPublicKey: jose.importSPKI(sourcedConfigs.access_token_public as string, accessTokenAlg),
//     accessTokenAlg: accessTokenAlg,
//     refreshTokenAlg: 'HS512',
//     jwtIssuer: 'dev.erickdang.com',
//     jwtAudience: 'dev.erickdang.com',
//     httpPort: parseInt(process.env.HTTP_PORT),
//     apiVersion: 'v1',
//     allowedHosts: 'https://dev.erickdang.com',
//     client: process.env.CLIENT,
// };
