import {app} from '@src/app';
import {User} from '@entities';
import * as supertest from 'supertest';
import {createUser} from './utils';
import {decode} from 'jsonwebtoken';
import MockDate from 'mockdate';

describe('user apis', () => {
    const url = '/api/v1/user';
    const name = 'Test User';
    const email = 'email@demo.com';
    const password = 'Mytestpassword123!';
    let user: User;
    let accessToken: string;

    beforeEach(async () => {
        const retVal = await createUser(app, email, name, password);
        user = retVal.user;
        accessToken = retVal.accessToken;
    });

    describe('GET /user', () => {
        test('returns 200 status code on success', async () => {
            const res = await supertest(app).get(url).set('Authorization', `Bearer ${accessToken}`).send();

            expect(res.statusCode).toBe(200);
        });

        test('returns the user whose id is contained in the access token', async () => {
            const res = await supertest(app).get(url).set('Authorization', `Bearer ${accessToken}`).send();

            expect(res.body.data).toEqual(JSON.stringify(user));
        });

        test('returns 401 status code if no access token is provided', async () => {
            const res = await supertest(app).get(url).send();

            expect(res.statusCode).toBe(401);
        });

        test('returns 401 status code if access token is expired', async () => {
            const payload: any = decode(accessToken);
            MockDate.set(payload.exp * 1000 + 2000);
            const res = await supertest(app).get(url).set('Authorization', `Bearer ${accessToken}`).send();

            expect(res.statusCode).toBe(401);
        });
    });
});
