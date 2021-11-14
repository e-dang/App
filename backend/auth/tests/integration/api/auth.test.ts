import {app} from '@src/app';
import * as supertest from 'supertest';

describe('auth apis', () => {
    describe('signup', () => {
        const url = '/api/v1/auth/signup';

        test('returns 201 status code on success', async () => {
            const res = await supertest(app).post(url).send({
                name: 'Test User',
                email: 'test@demo.com',
                password: 'mytestpassword123',
            });

            expect(res.statusCode).toBe(201);
        });
    });
});
