import * as dotenv from 'dotenv';

dotenv.config({path: __dirname + '/.env'});

interface Config {
    dbUrl: string;
    passwordHasher: string;
    passwordIterations: number;
    jwtAccessTokenExp: string;
    jwtRefreshTokenExp: string;
    httpPort: number;
}

const createDbUrl = () => {
    const dbType = process.env.DATABASE_TYPE;
    const dbHost = process.env.DATABASE_HOST;
    const dbPort = process.env.DATABASE_PORT;
    const dbUser = process.env.DATABASE_USER;
    const dbPassword = process.env.DATABASE_PASSWORD;
    const dbName = process.env.DATABASE_NAME;
    return `${dbType}://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
};

export const config: Config = {
    dbUrl: createDbUrl(),
    passwordHasher: process.env.PASSWORD_HASHER,
    passwordIterations: parseInt(process.env.PASSWORD_ITERATIONS),
    jwtAccessTokenExp: process.env.JWT_ACCESS_TOKEN_EXP,
    jwtRefreshTokenExp: process.env.JWT_REFRESH_TOKEN_EXP,
    httpPort: parseInt(process.env.HTTP_PORT),
};
