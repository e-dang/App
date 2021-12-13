process.env.NODE_ENV = process.env.CI ? 'ci' : 'test';

import {config} from '@config';
import {User, Workout} from '@entities';
import {Connection, createConnection, getConnection} from 'typeorm';
import {TransactionalTestContext} from 'typeorm-transactional-tests';

let connection: {[x: string]: Connection} = {};
let transactionalContext: {[x: string]: TransactionalTestContext} = {};

beforeAll(async () => {
    connection[expect.getState().testPath] = await createConnection({
        type: 'postgres',
        host: config.dbHost,
        port: config.dbPort,
        username: config.dbUser,
        password: config.dbPassword,
        database: config.dbName,
        logging: false,
        synchronize: true,
        entities: [User, Workout],
        ssl: config.env == 'ci' ? false : true,
        extra:
            config.env == 'ci'
                ? undefined
                : {
                      ssl: {
                          rejectUnauthorized: false,
                      },
                  },
    });
});

afterAll(async () => {
    await connection[expect.getState().testPath].close();
});

beforeEach(async () => {
    transactionalContext[expect.getState().currentTestName] = new TransactionalTestContext(getConnection());
    await transactionalContext[expect.getState().currentTestName].start();
});

afterEach(async () => {
    await transactionalContext[expect.getState().currentTestName].finish();
});
