import jose from 'jose';
import fs from 'fs';
import path from 'path';

type CastableType = string | number | boolean;

interface SimpleConstructor<T extends CastableType> {
    (value: any): T;
}

function getConfigValue<T extends CastableType>(name: string, type: SimpleConstructor<T>, _default: T = undefined): T {
    // return value if found in env vars
    if (name in process.env) {
        return castTo(process.env[name], type);
    }

    // otherwise look for files containing value
    const secretsDir = path.join(__dirname, 'secrets');
    if (fs.readdirSync(secretsDir, {encoding: 'utf-8'}).includes(name)) {
        return castTo(fs.readFileSync(path.join(secretsDir, name), {encoding: 'utf-8'}).toString(), type);
    }

    // fall back to default
    if (_default !== undefined) {
        return _default;
    }

    throw new Error(`Please specify a value for the configuration '${name}'.`);
}

function castTo<T extends CastableType>(value: string, type: SimpleConstructor<T>): T {
    if (type.prototype === Boolean.prototype) {
        return type(JSON.parse(value));
    }

    return type(value);
}

const accessTokenAlg = 'EdDSA';

interface Config {
    env: string;
    dbHost: string;
    dbPort: number;
    dbUser: string;
    dbPassword: string;
    dbName: string;
    apiVersion: string;
    allowedHosts: string;
    httpPort: number;
    accessTokenPrivateKey: Promise<jose.KeyLike>;
}

export const config: Config = {
    env: process.env.NODE_ENV,
    dbHost: getConfigValue('dbHost', String),
    dbPort: getConfigValue('dbPort', Number),
    dbUser: getConfigValue('dbUser', String),
    dbPassword: getConfigValue('dbPassword', String),
    dbName: getConfigValue('dbName', String),
    httpPort: getConfigValue('httpPort', Number),
    apiVersion: 'v1',
    allowedHosts: 'https://dev.erickdang.com',
    accessTokenPrivateKey: jose.importPKCS8(getConfigValue('accessTokenPrivate', String), accessTokenAlg),
};
