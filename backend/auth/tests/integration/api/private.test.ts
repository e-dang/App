import {app} from '@src/app';
import supertest from 'supertest';

describe('private api', () => {
    describe('/health', () => {
        const url = '/health';

        test('returns 200 status code', async () => {
            const res = await supertest(app).get(url).send();

            expect(res.statusCode).toBe(200);
        });
    });
});