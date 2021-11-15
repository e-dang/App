import {app} from '@src/app';
import * as supertest from 'supertest';
import {User} from '@entities';
import {decode} from 'jsonwebtoken';

describe('auth apis', () => {
    const name = 'Test User';
    const email = 'email@demo.com';
    const password = 'Mytestpassword123!';

    describe('signup', () => {
        const url = '/api/v1/auth/signup';
        const signUpData = {
            name,
            email,
            password,
        };

        test('returns 201 status code on success', async () => {
            const res = await supertest(app).post(url).send(signUpData);

            expect(res.statusCode).toBe(201);
        });

        test('creates a new User in the database', async () => {
            await supertest(app).post(url).send(signUpData);

            const user = await User.findOne({email});
            expect(user).toBeInstanceOf(User);
            expect(user.email).toBe(email);
            expect(user.name).toBe(name);
        });

        test('returns an accessToken with userId in payload', async () => {
            const res = await supertest(app).post(url).send(signUpData);

            const payload: any = decode(res.body.accessToken);
            expect(payload.userId).not.toBeUndefined();
            const user = await User.findOne({id: payload.userId});
            expect(user.email).toBe(email);
            expect(user.name).toBe(name);
        });

        test('returns a refreshToken with userId in payload', async () => {
            const res = await supertest(app).post(url).send(signUpData);

            const payload: any = decode(res.body.refreshToken);
            expect(payload.userId).not.toBeUndefined();
            const user = await User.findOne({id: payload.userId});
            expect(user.email).toBe(email);
            expect(user.name).toBe(name);
        });

        test('returns a refreshToken with tokenVersion in payload', async () => {
            const res = await supertest(app).post(url).send(signUpData);

            const payload: any = decode(res.body.refreshToken);
            expect(payload.tokenVersion).not.toBeUndefined();
            const user = await User.findOne({email});
            expect(user.tokenVersion).toBe(payload.tokenVersion);
        });

        test('returns 400 status code when password is too common', async () => {
            const res = await supertest(app).post(url).send({
                name,
                email,
                password: 'password123',
            });

            expect(res.statusCode).toBe(400);
        });

        test('returns 400 status code when email is invalid', async () => {
            const res = await supertest(app).post(url).send({
                name,
                email: 'bad email',
                password,
            });

            expect(res.statusCode).toBe(400);
        });

        test('returns 400 status code when name is not given', async () => {
            const res = await supertest(app).post(url).send({
                email,
                password,
            });

            expect(res.statusCode).toBe(400);
        });

        // test('returns XXX when email is already in use', async () => {

        // });
    });

    describe('signin', () => {
        const url = '/api/v1/auth/signin';
        let user: User;
        const signInData = {
            email,
            password,
        };

        beforeEach(async () => {
            user = await User.createUser(name, email, password);
        });

        test('returns 200 status code on success', async () => {
            const res = await supertest(app).post(url).send(signInData);

            expect(res.statusCode).toBe(200);
        });

        test('returns an accessToken with userId in payload', async () => {
            const res = await supertest(app).post(url).send(signInData);

            const payload: any = decode(res.body.accessToken);
            expect(payload.userId).not.toBeUndefined();
            expect(user.id).toBe(payload.userId);
        });

        test('returns a refreshToken with userId in payload', async () => {
            const res = await supertest(app).post(url).send(signInData);

            const payload: any = decode(res.body.refreshToken);
            expect(payload.userId).not.toBeUndefined();
            expect(user.id).toBe(payload.userId);
        });

        test('returns a refreshToken with tokenVersion in payload', async () => {
            const res = await supertest(app).post(url).send(signInData);

            const payload: any = decode(res.body.refreshToken);
            expect(payload.tokenVersion).not.toBeUndefined();
            expect(user.tokenVersion).toBe(payload.tokenVersion);
        });

        test('returns 400 status code when email is missing', async () => {
            const res = await supertest(app).post(url).send({password});

            expect(res.statusCode).toBe(400);
        });

        test('returns 400 status code when password is missing', async () => {
            const res = await supertest(app).post(url).send({email});

            expect(res.statusCode).toBe(400);
        });

        test('returns 400 status code when email and password dont match', async () => {
            const res = await supertest(app).post(url).send({email, password: 'wrongpassword'});

            expect(res.statusCode).toBe(400);
        });

        test('returns 400 status code when email does not exist in the database', async () => {
            const res = await supertest(app).post(url).send({email: 'dne@demo.com', password});

            expect(res.statusCode).toBe(400);
        });
    });
});
