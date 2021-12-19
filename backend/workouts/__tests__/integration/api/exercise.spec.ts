import {User} from '@entities';
import {AuthenticationError} from '@errors';
import {app} from '@src/app';
import {decode} from 'jsonwebtoken';
import supertest from 'supertest';
import {createUserAndToken} from './utils';
import MockDate from 'mockdate';

/**
 * Test Groups
 *
 * @group integration
 * @group exercises
 */

describe('user exercise apis', () => {
    let url: string;
    let user: User;
    let accessToken: string;

    beforeEach(async () => {
        [user, accessToken] = await createUserAndToken();
        url = `/api/v1/${user.id}/exercises`;
    });

    describe('GET /:userId/exercises', () => {
        test('returns 200 status code and all non deleted exercises owned by requesting user on success', async () => {
            await user.addExercises([{name: 'test1'}, {name: 'test2'}]);
            await user.addExercise({name: 'test3'});
            await (await user.addExercise({name: 'test4'})).softRemove();
            await user.reload();
            const res = await supertest(app).get(url).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toEqual(await user.getSerializedExercises());
            const names = res.body.data.map((exercise) => exercise.name).sort();
            expect(names).toEqual(['test1', 'test2', 'test3']);
        });

        test('returns 401 status code if token is expired', async () => {
            const payload: any = decode(accessToken);
            MockDate.set(payload.exp * 1000 + 2000);
            const res = await supertest(app).get(url).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 403 status code if requester is not the owner of the workout', async () => {
            const [_, otherAccessToken] = await createUserAndToken();
            const res = await supertest(app).get(url).set('Authorization', `Token ${otherAccessToken}`).send();

            expect(res.statusCode).toBe(403);
            expect(res.body.errors[0].msg).toEqual('You are not authorized to access this resource.');
        });

        test('returns 401 status code if no access token is provided', async () => {
            const res = await supertest(app).get(url).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });
    });

    describe('POST /:userId/exercises', () => {
        let exerciseData: {
            name: string;
        };

        beforeEach(() => {
            exerciseData = {
                name: 'My test exercise',
            };
        });

        test('returns 201 status code and returns the new exercise for the requesting user on success', async () => {
            const res = await supertest(app).post(url).set('Authorization', `Token ${accessToken}`).send(exerciseData);

            expect(res.statusCode).toBe(201);
            expect(user.getExercise({id: res.body.data.id})).not.toBeUndefined();
        });

        test('returns 400 status code when name field is missing from body', async () => {
            const res = await supertest(app).post(url).set('Authorization', `Token ${accessToken}`).send({});

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('name');
            expect(res.body.errors[0].location).toEqual('body');
            expect(res.body.errors[0].msg).toEqual('This field is required.');
        });

        test('returns 400 status code when name field is blank', async () => {
            const res = await supertest(app).post(url).set('Authorization', `Token ${accessToken}`).send({name: ''});

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('name');
            expect(res.body.errors[0].location).toEqual('body');
            expect(res.body.errors[0].msg).toEqual('This field is required.');
        });

        test('returns 401 status code if token is expired', async () => {
            const payload: any = decode(accessToken);
            MockDate.set(payload.exp * 1000 + 2000);
            const res = await supertest(app).post(url).set('Authorization', `Token ${accessToken}`).send(exerciseData);

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 403 status code if requester is not the owner of the workout', async () => {
            const [_, otherAccessToken] = await createUserAndToken();
            const res = await supertest(app)
                .post(url)
                .set('Authorization', `Token ${otherAccessToken}`)
                .send(exerciseData);

            expect(res.statusCode).toBe(403);
            expect(res.body.errors[0].msg).toEqual('You are not authorized to access this resource.');
        });

        test('returns 401 status code if no access token is provided', async () => {
            const res = await supertest(app).post(url).send(exerciseData);

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });
    });
});
