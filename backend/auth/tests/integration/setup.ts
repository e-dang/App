import {config} from '@config';
import {Connection, createConnection} from 'typeorm';
import {User} from '@entities';
import {TransactionalTestContext} from 'typeorm-transactional-tests';

let connection: Connection;
let transactionalContext: TransactionalTestContext;

beforeAll(async () => {
    connection = await createConnection({
        type: 'postgres',
        host: config.dbHost,
        port: config.dbPort,
        username: config.dbUser,
        password: config.dbPassword,
        database: 'tests',
        dropSchema: true,
        logging: false,
        synchronize: true,
        migrationsRun: true,
        entities: [User],
        ssl: true,
        extra: {
            ssl: {
                rejectUnauthorized: false,
            },
        },
    });
});

afterAll(async () => {
    await connection.close();
});

beforeEach(async () => {
    transactionalContext = new TransactionalTestContext(connection);
    await transactionalContext.start();
});

afterEach(async () => {
    await transactionalContext.finish();
});
