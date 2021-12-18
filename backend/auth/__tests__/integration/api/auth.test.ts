import {app} from '@src/app';
import supertest from 'supertest';
import {User} from '@entities';
import {decode} from 'jsonwebtoken';
import MockDate from 'mockdate';
import {createPasswordResetToken, dateToSeconds, passwordIsValid} from '@auth';
import {AuthenticationError, InvalidTokenError, SignInError, UserWithEmailAlreadyExistsError} from '@errors';
import nodemailer from 'nodemailer';
import {randomUUID} from 'crypto';
import {mocked} from 'ts-jest/utils';
import {createUser, extractCookies} from './utils';

jest.mock('nodemailer', () => {
    return {
        createTransport: jest.fn().mockReturnValue({
            sendMail: jest.fn(),
        }),
    };
});

const mockedNodeMailer = mocked(nodemailer, true);

/**
 * Test Groups
 *
 * @group integration
 * @group auth
 */

describe('auth apis', () => {
    const name = 'Test User';
    const email = 'email@demo.com';
    const password = 'Mytestpassword123!';

    afterEach(() => {
        MockDate.reset();
    });

    describe('/signup', () => {
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

        test('creates a new User in the database with specified email and name', async () => {
            await supertest(app).post(url).send(signUpData);

            const user = await User.findOne({email});
            expect(user).toBeInstanceOf(User);
            expect(user.email).toBe(email);
            expect(user.name).toBe(name);
        });

        test('creates a new User in the database with correct dateJoined and lastLogin time stamps', async () => {
            await supertest(app).post(url).send(signUpData);

            const user = await User.findOne({email});

            // will cause timeout if not true
            while (dateToSeconds(user.lastLogin) != dateToSeconds(user.dateJoined)) {
                await user.reload();
            }
        });

        test('returns an accessToken with userId in payload', async () => {
            const res = await supertest(app).post(url).send(signUpData);

            const payload: any = decode(res.body.data.accessToken);
            expect(payload.userId).not.toBeUndefined();
            const user = await User.findOne({id: payload.userId});
            expect(user.email).toBe(email);
            expect(user.name).toBe(name);
        });

        test('returns a refreshToken in httpOnly header', async () => {
            const res = await supertest(app).post(url).send(signUpData);

            const cookies = extractCookies(res.headers);
            expect(cookies.rt.flags.HttpOnly).toBe(true);
        });

        test('returns a refreshToken in header with userId in payload', async () => {
            const res = await supertest(app).post(url).send(signUpData);

            const payload: any = decode(extractCookies(res.headers).rt.value);
            expect(payload.userId).not.toBeUndefined();
            const user = await User.findOne({id: payload.userId});
            expect(user.email).toBe(email);
            expect(user.name).toBe(name);
        });

        test('returns a refreshToken in header with tokenVersion in payload', async () => {
            const res = await supertest(app).post(url).send(signUpData);

            const payload: any = decode(extractCookies(res.headers).rt.value);
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
            expect(res.body.errors[0].param).toEqual('password');
            expect(res.body.errors[0].msg).toEqual(
                'The password must be at least 8 characters long, with at least 1 lower case and upper case letter, 1 symbol, and 1 number.',
            );
        });

        test('returns 400 status code when password is not given', async () => {
            const res = await supertest(app).post(url).send({
                email,
                name,
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('password');
            expect(res.body.errors[0].msg).toEqual('This field is required.');
        });

        test('returns 400 status code when email is invalid', async () => {
            const res = await supertest(app).post(url).send({
                name,
                email: 'bad email',
                password,
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('email');
            expect(res.body.errors[0].msg).toEqual('The provided email address is invalid.');
        });

        test('returns 400 status code when email is not given', async () => {
            const res = await supertest(app).post(url).send({
                name,
                password,
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('email');
            expect(res.body.errors[0].msg).toEqual('This field is required.');
        });

        test('returns 400 status code when name is not given', async () => {
            const res = await supertest(app).post(url).send({
                email,
                password,
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('name');
            expect(res.body.errors[0].msg).toEqual('This field is required.');
        });

        test('returns 409 status code when email has already been registered to a user', async () => {
            const res1 = await supertest(app).post(url).send(signUpData);
            const res2 = await supertest(app).post(url).send({email, name: 'Different Name', password});

            expect(res1.statusCode).toBe(201);
            expect(res2.statusCode).toBe(409);
            expect(res2.body).toEqual(new UserWithEmailAlreadyExistsError(email).json);
        });
    });

    describe('/signin', () => {
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

            const payload: any = decode(res.body.data.accessToken);
            expect(payload.userId).not.toBeUndefined();
            expect(user.id).toBe(payload.userId);
        });

        test('returns a refreshToken in httpOnly header', async () => {
            const res = await supertest(app).post(url).send(signInData);

            const cookies = extractCookies(res.headers);
            expect(cookies.rt.flags.HttpOnly).toBe(true);
        });

        test('returns a refreshToken in header with userId in payload', async () => {
            const res = await supertest(app).post(url).send(signInData);

            const payload: any = decode(extractCookies(res.headers).rt.value);
            expect(payload.userId).not.toBeUndefined();
            expect(user.id).toBe(payload.userId);
        });

        test('returns a refreshToken in header with tokenVersion in payload', async () => {
            const res = await supertest(app).post(url).send(signInData);

            const payload: any = decode(extractCookies(res.headers).rt.value);
            expect(payload.tokenVersion).not.toBeUndefined();
            expect(user.tokenVersion).toBe(payload.tokenVersion);
        });

        test('updates last login time for the user', async () => {
            const prevLastLoginTime = new Date(user.lastLogin);
            MockDate.set(prevLastLoginTime.getTime() * 1000 + 2000);
            const res = await supertest(app).post(url).send(signInData);

            await user.reload();
            expect(new Date(user.lastLogin) > prevLastLoginTime).toBe(true);
        });

        test('returns 400 status code when email is missing', async () => {
            const res = await supertest(app).post(url).send({password});

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('email');
            expect(res.body.errors[0].msg).toEqual('This field is required.');
        });

        test('returns 400 status code when password is missing', async () => {
            const res = await supertest(app).post(url).send({email});

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('password');
            expect(res.body.errors[0].msg).toEqual('This field is required.');
        });

        test('returns 400 status code when email is a malformed email address', async () => {
            const res = await supertest(app).post(url).send({email: 'malformed address', password});

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('email');
            expect(res.body.errors[0].msg).toEqual('The provided email address is invalid.');
        });

        test('returns 404 status code when email and password dont match any records in the database', async () => {
            const res = await supertest(app)
                .post(url)
                .send({email, password: password + 'extrachars'});

            expect(res.statusCode).toBe(404);
            expect(res.body).toEqual(new SignInError().json);
        });

        test('returns 404 status code when email does not exist in the database', async () => {
            const res = await supertest(app).post(url).send({email: 'dne@demo.com', password});

            expect(res.statusCode).toBe(404);
            expect(res.body).toEqual(new SignInError().json);
        });
    });

    describe('/signout', () => {
        const url = '/api/v1/auth/signout';
        let accessToken: string;
        let refreshToken: string;

        beforeEach(async () => {
            ({accessToken, refreshToken} = await createUser(app, {email, name, password}));
        });

        test('returns 200 status code on success', async () => {
            const res = await supertest(app).post(url).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(200);
        });

        test("increments user's tokenVersion on success", async () => {
            const res = await supertest(app).post(url).set('Authorization', `Token ${accessToken}`).send();

            const payload: any = decode(refreshToken);
            const user = await User.findOne({email});
            expect(payload.tokenVersion).toBe(user.tokenVersion - 1);
        });

        test('returns 401 status code when access token is not attached to authorization header', async () => {
            const res = await supertest(app).post(url).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 401 status code when access token is expired', async () => {
            const payload: any = decode(accessToken);
            MockDate.set(payload.exp * 1000 + 2000);
            const res = await supertest(app).post(url).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });
    });

    describe('/token/refresh', () => {
        const url = '/api/v1/auth/token/refresh';
        let refreshToken: string;
        let user: User;

        beforeEach(async () => {
            ({user, refreshToken} = await createUser(app, {email, name, password}));
        });

        test('returns 200 status code when successful', async () => {
            const res = await supertest(app)
                .post(url)
                .set('Cookie', [`rt=${refreshToken}`])
                .send();

            expect(res.statusCode).toBe(200);
        });

        test('returns an accessToken with userId in payload', async () => {
            const res = await supertest(app)
                .post(url)
                .set('Cookie', [`rt=${refreshToken}`])
                .send();

            const payload: any = decode(res.body.data.accessToken);
            expect(payload.userId).not.toBeUndefined();
            expect(user.id).toBe(payload.userId);
        });

        test('returns a refreshToken in httpOnly header', async () => {
            const res = await supertest(app)
                .post(url)
                .set('Cookie', [`rt=${refreshToken}`])
                .send();

            const cookies = extractCookies(res.headers);
            expect(cookies.rt.flags.HttpOnly).toBe(true);
        });

        test('returns a refreshToken in header with userId in payload', async () => {
            const res = await supertest(app)
                .post(url)
                .set('Cookie', [`rt=${refreshToken}`])
                .send();

            const payload: any = decode(extractCookies(res.headers).rt.value);
            expect(payload.userId).not.toBeUndefined();
            expect(user.id).toBe(payload.userId);
        });

        test('returns a refreshToken in header with tokenVersion in payload', async () => {
            const res = await supertest(app)
                .post(url)
                .set('Cookie', [`rt=${refreshToken}`])
                .send();

            const payload: any = decode(extractCookies(res.headers).rt.value);
            expect(payload.tokenVersion).not.toBeUndefined();
            expect(user.tokenVersion).toBe(payload.tokenVersion);
        });

        test('returns 400 status code when refresh token is not included in cookies', async () => {
            const res = await supertest(app).post(url).send();

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual(new InvalidTokenError('headers', 'refreshToken').json);
        });

        test('returns 400 status code when refresh token is malformed jwt', async () => {
            const res = await supertest(app).post(url).set('Cookie', ['rt=not a jwt']).send();

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual(new InvalidTokenError('headers', 'refreshToken').json);
        });

        test('returns 400 status code when refresh token signature is invalid', async () => {
            const res = await supertest(app)
                .post(url)
                .set('Cookie', [`rt=${refreshToken} + invalidate`])
                .send();

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual(new InvalidTokenError('headers', 'refreshToken').json);
        });

        test('returns 400 status code when refresh token is expired', async () => {
            const payload: any = decode(refreshToken);
            MockDate.set(payload.exp * 1000 + 2000);
            const res = await supertest(app)
                .post(url)
                .set('Cookie', [`rt=${refreshToken}`])
                .send();

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual(new InvalidTokenError('headers', 'refreshToken').json);
        });

        test('returns 400 status code when refresh token does not have the same tokenVersion as the user', async () => {
            user.tokenVersion++;
            await user.save();
            const res = await supertest(app)
                .post(url)
                .set('Cookie', [`rt=${refreshToken}`])
                .send();

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual(new InvalidTokenError('headers', 'refreshToken').json);
        });
    });

    describe('/password/change', () => {
        const url = '/api/v1/auth/password/change';
        const newPassword = 'RanDomnewpa$$word123123123adiaj!';
        let user: User;
        let accessToken: string;

        beforeEach(async () => {
            ({user, accessToken} = await createUser(app, {email, name, password}));
        });

        test('returns 200 on success', async () => {
            const res = await supertest(app).post(url).set('Authorization', `Token ${accessToken}`).send({
                oldPassword: password,
                newPassword,
                confirmPassword: newPassword,
            });

            expect(res.statusCode).toBe(200);
        });

        test("changes the user's password on success", async () => {
            const res = await supertest(app).post(url).set('Authorization', `Token ${accessToken}`).send({
                oldPassword: password,
                newPassword,
                confirmPassword: newPassword,
            });

            await user.reload();
            const passwordsAreTheSame = passwordIsValid(newPassword, user.password);
            expect(passwordsAreTheSame).toBe(true);
        });

        test('changes the password even if the new password is the same as the old password', async () => {
            const oldPassword = user.password;
            const res = await supertest(app).post(url).set('Authorization', `Token ${accessToken}`).send({
                oldPassword: password,
                newPassword: password,
                confirmPassword: password,
            });

            await user.reload();
            expect(user.password).not.toEqual(oldPassword);
        });

        test('returns 400 status code when oldPassword is missing', async () => {
            const res = await supertest(app).post(url).set('Authorization', `Token ${accessToken}`).send({
                newPassword,
                confirmPassword: newPassword,
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('oldPassword');
            expect(res.body.errors[0].msg).toEqual('This field is required.');
        });

        test('returns 400 status code when newPassword is missing', async () => {
            const res = await supertest(app).post(url).set('Authorization', `Token ${accessToken}`).send({
                oldPassword: password,
                confirmPassword: newPassword,
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('newPassword');
            expect(res.body.errors[0].msg).toEqual('This field is required.');
        });

        test('returns 400 status code when confirmPassword is missing', async () => {
            const res = await supertest(app).post(url).set('Authorization', `Token ${accessToken}`).send({
                oldPassword: password,
                newPassword,
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('confirmPassword');
            expect(res.body.errors[0].msg).toEqual('This field is required.');
        });

        test('returns 400 status code when new password is not a strong password', async () => {
            const res = await supertest(app).post(url).set('Authorization', `Token ${accessToken}`).send({
                oldPassword: password,
                newPassword: 'password123',
                confirmPassword: 'password123',
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('newPassword');
            expect(res.body.errors[0].msg).toEqual(
                'The password must be at least 8 characters long, with at least 1 lower case and upper case letter, 1 symbol, and 1 number.',
            );
        });

        test('returns 400 status code when newPassword and confirmPassword are mismatching', async () => {
            const res = await supertest(app)
                .post(url)
                .set('Authorization', `Token ${accessToken}`)
                .send({
                    oldPassword: password,
                    newPassword,
                    confirmPassword: newPassword + 'awdiajdjjjj',
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('confirmPassword');
            expect(res.body.errors[0].msg).toEqual("Password confirmation doesn't match the password.");
        });

        test('returns 400 status code when old password doesnt match the old password in database', async () => {
            const res = await supertest(app)
                .post(url)
                .set('Authorization', `Token ${accessToken}`)
                .send({
                    oldPassword: password + 'randomchars',
                    newPassword,
                    confirmPassword: newPassword,
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('oldPassword');
            expect(res.body.errors[0].msg).toEqual('The old password is incorrect.');
        });

        test('returns 401 status code when access token is not present', async () => {
            const res = await supertest(app).post(url).send({
                oldPassword: password,
                newPassword,
                confirmPassword: newPassword,
            });

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 401 status code when access token is expired', async () => {
            const payload: any = decode(accessToken);
            MockDate.set(payload.exp * 1000 + 2000);
            const res = await supertest(app).post(url).set('Authorization', `Token ${accessToken}`).send({
                oldPassword: password,
                newPassword,
                confirmPassword: newPassword,
            });

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });
    });

    describe('/password/reset', () => {
        const url = '/api/v1/auth/password/reset';
        let user: User;
        const mockSendMail = mockedNodeMailer.createTransport().sendMail as jest.Mock;

        beforeEach(async () => {
            mockSendMail.mockClear();
            ({user} = await createUser(app, {email, name, password}));
        });

        test('returns 200 status code on success', async () => {
            const res = await supertest(app).post(url).send({email});

            expect(res.statusCode).toBe(200);
        });

        test('sends an email to the user with a link to reset their password that contains the user id and generated token', async () => {
            await supertest(app).post(url).send({email});

            const message = mockSendMail.mock.calls[0][0];
            expect(message.to).toEqual(email);
            expect(message.html).toContain(user.id);
        });

        test('returns 200 status code when no user exists with the given email', async () => {
            const res = await supertest(app).post(url).send({email: 'doesnotexist@demo.com'});

            expect(res.statusCode).toBe(200);
        });

        test('does not send an email when no user has the provided email address', async () => {
            await supertest(app).post(url).send({email: 'doesnotexist@demo.com'});

            expect(mockSendMail.mock.calls.length).toBe(0);
        });

        test('returns 400 status code when email is invalid', async () => {
            const res = await supertest(app).post(url).send({email: 'invalid email address'});

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('email');
            expect(res.body.errors[0].msg).toEqual('The provided email address is invalid.');
        });

        test('returns 400 status code when email is not provided', async () => {
            const res = await supertest(app).post(url).send({});

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('email');
            expect(res.body.errors[0].msg).toEqual('This field is required.');
        });
    });

    describe('/password/reset/confirm', () => {
        const url = '/api/v1/auth/password/reset/confirm';
        let user: User;
        let token: string;
        const newPassword = 'newTestPa$$word123';
        const confirmPassword = newPassword;

        beforeEach(async () => {
            ({user} = await createUser(app, {name, email, password}));
            token = createPasswordResetToken(user);
        });

        test('returns 200 status code on success', async () => {
            const res = await supertest(app).post(url).send({userId: user.id, token, newPassword, confirmPassword});

            expect(res.statusCode).toBe(200);
        });

        test("successful request updates the user's password", async () => {
            await supertest(app).post(url).send({userId: user.id, token, newPassword, confirmPassword});

            await user.reload();
            expect(passwordIsValid(newPassword, user.password)).toBe(true);
        });

        test('returns 400 status code when userId is not provided', async () => {
            const res = await supertest(app).post(url).send({token, newPassword, confirmPassword});

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('userId');
            expect(res.body.errors[0].msg).toEqual('This field is required.');
        });

        test('returns 400 status code when userId is not a uuid', async () => {
            const res = await supertest(app).post(url).send({userId: 'dne-id', token, newPassword, confirmPassword});

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('userId');
            expect(res.body.errors[0].msg).toEqual('The userId must be a uuid.');
        });

        test('returns 400 status code when no user with the specified userId exists', async () => {
            const res = await supertest(app)
                .post(url)
                .send({userId: randomUUID(), token, newPassword, confirmPassword});

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('token');
            expect(res.body.errors[0].msg).toEqual('Invalid token.');
        });

        test('returns 400 status code when token is not provided', async () => {
            const res = await supertest(app).post(url).send({userId: user.id, newPassword, confirmPassword});

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('token');
            expect(res.body.errors[0].msg).toEqual('This field is required.');
        });

        test('returns 400 status code when token is expired', async () => {
            MockDate.set(new Date().getTime() * 1000 + 2000);
            const res = await supertest(app).post(url).send({userId: user.id, token, newPassword, confirmPassword});

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('token');
            expect(res.body.errors[0].msg).toEqual('Expired token.');
        });

        test('returns 400 status code when token has been changed', async () => {
            const res = await supertest(app)
                .post(url)
                .send({userId: user.id, token: token + 'randomchars', newPassword, confirmPassword});

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('token');
            expect(res.body.errors[0].msg).toEqual('Invalid token.');
        });

        test('returns 400 status code after user has already used the token to reset their password', async () => {
            const newPassword2 = newPassword + 'randomchars';
            const res1 = await supertest(app).post(url).send({userId: user.id, token, newPassword, confirmPassword});
            const res2 = await supertest(app)
                .post(url)
                .send({userId: user.id, token, newPassword2, confirmPassword: newPassword2});

            await user.reload();
            expect(res1.statusCode).toBe(200);
            expect(res2.statusCode).toBe(400);
            expect(passwordIsValid(newPassword, user.password)).toBe(true);
            expect(passwordIsValid(newPassword2, user.password)).toBe(false);
        });

        test('returns 400 status code when newPassword is not provided', async () => {
            const res = await supertest(app).post(url).send({userId: user.id, token, confirmPassword});

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('newPassword');
            expect(res.body.errors[0].msg).toEqual('This field is required.');
        });

        test('returns 400 status code when newPassword is not a strong password', async () => {
            const res = await supertest(app)
                .post(url)
                .send({userId: user.id, token, newPassword: 'password123', confirmPassword});

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('newPassword');
            expect(res.body.errors[0].msg).toEqual(
                'The password must be at least 8 characters long, with at least 1 lower case and upper case letter, 1 symbol, and 1 number.',
            );
        });

        test('returns 400 status code when confirmPassword is not provided', async () => {
            const res = await supertest(app).post(url).send({userId: user.id, token, newPassword});

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('confirmPassword');
            expect(res.body.errors[0].msg).toEqual('This field is required.');
        });

        test('returns 400 status code when confirmPassword does not match newPassword', async () => {
            const res = await supertest(app)
                .post(url)
                .send({userId: user.id, token, newPassword, confirmPassword: newPassword + 'mismatch'});

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('confirmPassword');
            expect(res.body.errors[0].msg).toEqual("Password confirmation doesn't match the password.");
        });
    });
});
