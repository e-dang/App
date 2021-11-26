import {app} from '@src/app';
import {User} from '@entities';
import supertest from 'supertest';
import {createUser} from './utils';
import {decode} from 'jsonwebtoken';
import MockDate from 'mockdate';
import {AuthenticationError} from '@errors';

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

    afterEach(() => {
        MockDate.reset();
    });

    describe('GET /user', () => {
        test('returns 200 status code on success', async () => {
            const res = await supertest(app).get(url).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(200);
        });

        test('returns the user whose id is contained in the access token', async () => {
            const res = await supertest(app).get(url).set('Authorization', `Token ${accessToken}`).send();

            expect(res.body.data).toEqual(user.serialize());
        });

        test('returns 401 status code if no access token is provided', async () => {
            const res = await supertest(app).get(url).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 401 status code if access token is expired', async () => {
            const payload: any = decode(accessToken);
            MockDate.set(payload.exp * 1000 + 2000);
            const res = await supertest(app).get(url).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 401 status code if access token has been tampered with', async () => {
            const res = await supertest(app)
                .get(url)
                .set('Authorization', `Token ${accessToken + 'adiajwdijo'}`)
                .send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });
    });

    describe('PATCH /user', () => {
        const newName = name + 'random chars';
        const newEmail = 'newemail@demo.com';

        test('returns 200 status code on successful name update', async () => {
            const res = await supertest(app).patch(url).set('Authorization', `Token ${accessToken}`).send({
                name: newName,
            });

            await user.reload();
            expect(res.statusCode).toBe(200);
            expect(user.name).toBe(newName);
            expect(res.body.data.name).toBe(newName);
        });

        test('returns 200 status code on successful email update', async () => {
            const res = await supertest(app).patch(url).set('Authorization', `Token ${accessToken}`).send({
                email: newEmail,
            });

            await user.reload();
            expect(res.statusCode).toBe(200);
            expect(user.email).toBe(newEmail);
            expect(res.body.data.email).toBe(newEmail);
        });

        test('returns 401 status code if no access token is provided', async () => {
            const res = await supertest(app).patch(url).send({
                name: newName,
            });

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 401 status code if access token is expired', async () => {
            const payload: any = decode(accessToken);
            MockDate.set(payload.exp * 1000 + 2000);
            const res = await supertest(app).patch(url).set('Authorization', `Token ${accessToken}`).send({
                name: newName,
            });

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 401 status code if access token has been tampered with', async () => {
            const res = await supertest(app)
                .patch(url)
                .set('Authorization', `Token ${accessToken + 'adiwojaiodj'}`)
                .send({
                    name: newName,
                });

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 400 error when email is malformed', async () => {
            const res = await supertest(app).patch(url).set('Authorization', `Token ${accessToken}`).send({
                email: 'malformed email',
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('email');
            expect(res.body.errors[0].msg).toEqual('The provided email address is invalid.');
        });

        test('returns 400 error when name is an empty string', async () => {
            const res = await supertest(app).patch(url).set('Authorization', `Token ${accessToken}`).send({
                name: '',
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('name');
            expect(res.body.errors[0].msg).toEqual('This field is required.');
        });
    });

    describe('DELETE /user', () => {
        test('returns 202 status code on success', async () => {
            const res = await supertest(app).delete(url).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(202);
        });

        test('sets isActive field on user to false on success', async () => {
            const res = await supertest(app).delete(url).set('Authorization', `Token ${accessToken}`).send();

            await user.reload();
            expect(user.isActive).toBe(false);
        });

        test('returns 401 status code if no access token is provided', async () => {
            const res = await supertest(app).delete(url).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 401 status code if access token is expired', async () => {
            const payload: any = decode(accessToken);
            MockDate.set(payload.exp * 1000 + 2000);
            const res = await supertest(app).delete(url).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 401 status code if access token has been tampered with', async () => {
            const res = await supertest(app)
                .delete(url)
                .set('Authorization', `Token ${accessToken + 'awdioahjdiu29'}`)
                .send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });
    });
});
