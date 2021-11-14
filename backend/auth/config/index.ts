import * as dotenv from 'dotenv';

dotenv.config({path: __dirname + '/.env'});

interface Settings {
    dbUrl: string;
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

export const settings: Settings = {
    dbUrl: createDbUrl(),
};
