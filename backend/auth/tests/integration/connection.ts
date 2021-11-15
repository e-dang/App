import {createConnection, getConnection} from 'typeorm';
import {User} from '@entities';
import {config} from '@config';

const connection = {
    async create() {
        await createConnection({
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
    },

    async close() {
        await getConnection().close();
    },

    async clear() {
        const connection = getConnection();
        const entities = connection.entityMetadatas;

        entities.forEach(async (entity) => {
            const repository = connection.getRepository(entity.name);
            try {
                await repository.query(`DELETE FROM ${entity.tableName}`);
            } catch (err) {
                // catch error where no data in table
            }
        });
    },
};

export default connection;
