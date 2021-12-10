import 'reflect-metadata';
import {config} from '@config';
import {createConnection} from 'typeorm';
import {User, Workout} from '@entities';
import {app} from '@src/app';

createConnection({
    type: 'postgres', // WHY MUST I HARDCODE STUPID ASS TYPESCRIPT
    host: config.dbHost,
    port: config.dbPort,
    username: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
    synchronize: true,
    logging: false,
    entities: [User, Workout],
    ssl: true,
    extra: {
        ssl: {
            rejectUnauthorized: false,
        },
    },
})
    .then(async (connection) => {
        app.listen(config.httpPort);

        console.log('Express server has started on port 3000');
    })
    .catch((error) => console.log(error));
