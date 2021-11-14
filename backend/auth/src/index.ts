import 'reflect-metadata';
import {config} from '@config';
import {createConnection} from 'typeorm';
import {User} from '@entities';
import {app} from '@src/app';

createConnection({
    type: 'postgres', // WHY MUST I HARDCODE STUPID ASS TYPESCRIPT
    url: config.dbUrl,
    synchronize: true,
    logging: false,
    entities: [User],
    ssl: true,
    extra: {
        ssl: {
            rejectUnauthorized: false,
        },
    },
})
    .then(async (connection) => {
        // start express server
        app.listen(config.httpPort);

        console.log('Express server has started on port 3000');
    })
    .catch((error) => console.log(error));
