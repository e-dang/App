import fs from 'fs';
import path from 'path';

export interface PartialConfigs {
    [x: string]: string;
}

function sourceConfigs() {
    const secrets: PartialConfigs = {};

    fs.readdirSync(path.join(__dirname, 'secrets'), {encoding: 'utf-8'}).forEach((file) => {
        const fileStats = fs.lstatSync(path.join(__dirname, 'secrets', file));
        if ((fileStats.isFile() || fileStats.isSymbolicLink()) && file.substr(0, 2) !== '..') {
            if (file in process.env) {
                // use environment variable override
                secrets[file] = process.env[file];
            } else {
                // read mounted configs
                secrets[file] = fs.readFileSync(path.join(__dirname, 'secrets', file), {encoding: 'utf-8'}).toString();
            }
        }
    });

    return secrets;
}

const sourcedConfigs = sourceConfigs();

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
}

export const config: Config = {
    env: process.env.NODE_ENV,
    dbHost: sourcedConfigs.dbHost,
    dbPort: parseInt(sourcedConfigs.dbPort),
    dbUser: sourcedConfigs.dbUser,
    dbPassword: sourcedConfigs.dbPassword,
    dbName: sourcedConfigs.dbName,
    httpPort: parseInt(sourcedConfigs.httpPort),
    apiVersion: 'v1',
    allowedHosts: 'https://dev.erickdang.com',
};
