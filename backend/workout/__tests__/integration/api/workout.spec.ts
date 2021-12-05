import {app} from '@src/app';
import {randomUUID} from 'crypto';
import supertest from 'supertest';
import {User, Workout} from '@entities';
import MockDate from 'mockdate';
import {decode} from 'jsonwebtoken';
import {AuthenticationError, WorkoutNotFoundError} from '@errors';
import {createToken} from './utils';

describe('workout apis', () => {
    const url = 'api/v1/workout';
    let uuid: string;
    let accessToken: string;
    let user: User;

    beforeEach(async () => {
        uuid = randomUUID();
        accessToken = await createToken(uuid);
        user = await User.findOne(uuid);
    });

    afterEach(() => {
        MockDate.reset();
    });

    describe('GET /workout', () => {
        test('returns the workouts owned by the requesting user and 200 status code', async () => {
            const res = await supertest(app).get(url).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(user.workouts);
        });

        test('does not return deleted workouts for requesting user', async () => {
            const res = await supertest(app).get(url).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(200);
            // expect(res.body.data)
        });

        test('returns 401 status code if token is expired', async () => {
            const payload: any = decode(accessToken);
            MockDate.set(payload.exp * 1000 + 2000);
            const res = await supertest(app).get(url).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 401 status code if no access token is provided', async () => {
            const res = await supertest(app).get(url).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });
    });

    describe('GET /workout/<id>', () => {
        let detailUrl: string;
        let workout: Workout;

        beforeEach(async () => {
            workout = new Workout();
            workout.owner = user;
            await workout.save();
            user.workouts = [workout];
            await user.save();
            detailUrl = `${url}/${workout.id}`;
        });

        test('returns the detail of the specified workout owned by the requesting user and a 200 status code', async () => {
            const res = await supertest(app).get(detailUrl).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toEqual(workout.serialize());
        });

        test('returns 404 status code if no workout with that id exists', async () => {
            const wrongUuid = randomUUID();
            const res = await supertest(app)
                .get(`${url}/${wrongUuid}`)
                .set('Authorization', `Token ${accessToken}`)
                .send();

            expect(res.statusCode).toBe(404);
            expect(res.body).toEqual(new WorkoutNotFoundError(user.id, wrongUuid).json);
        });

        test('returns 404 status code if the workout has been deleted', async () => {
            workout.isDeleted = true;
            await workout.save();
            const res = await supertest(app).get(detailUrl).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(404);
            expect(res.body).toEqual(new WorkoutNotFoundError(user.id, workout.id).json);
        });

        test('returns 401 status code if token is expired', async () => {
            const payload: any = decode(accessToken);
            MockDate.set(payload.exp * 1000 + 2000);
            const res = await supertest(app).get(detailUrl).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 401 status code if no access token is provided', async () => {
            const res = await supertest(app).get(detailUrl).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });
    });

    describe('POST /workout', () => {
        let workoutData: {
            name: string;
        };

        beforeEach(() => {
            workoutData = {
                name: 'test workout',
            };
        });

        test('creates and returns the new workout for the requesting user and a 201 status code', async () => {
            const res = await supertest(app).post(url).set('Authorization', `Token ${accessToken}`).send(workoutData);

            expect(res.statusCode).toBe(201);
            await user.reload();
            const newWorkout = user.workouts.find((workout) => workout.id === res.body.data.id);
            expect(newWorkout).not.toBeUndefined();
        });

        test('returns 401 status code if token is expired', async () => {
            const payload: any = decode(accessToken);
            MockDate.set(payload.exp * 1000 + 2000);
            const res = await supertest(app).post(url).set('Authorization', `Token ${accessToken}`).send(workoutData);

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 401 status code if no access token is provided', async () => {
            const res = await supertest(app).post(url).send(workoutData);

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });
    });

    describe('PATCH /workout/<id>', () => {
        let detailUrl: string;
        let workout: Workout;
        const newName = 'test workout2';

        beforeEach(async () => {
            workout = new Workout();
            workout.name = 'test workout1';
            workout.owner = user;
            await workout.save();
            user.workouts = [workout];
            await user.save();
            detailUrl = `${url}/${workout.id}`;
        });

        test('updates the specified workout belonging to the requesting user and returns a 200 status code', async () => {
            const res = await supertest(app)
                .patch(detailUrl)
                .set('Authorization', `Token ${accessToken}`)
                .send({name: newName});

            await workout.reload();
            expect(res.statusCode).toBe(200);
            expect(workout.name).toEqual(newName);
        });

        test('returns 404 status code if a workout with the specified id does not exist for that user ', async () => {
            const res = await supertest(app)
                .patch(`${url}/${randomUUID()}`)
                .set('Authorization', `Token ${accessToken}`)
                .send({name: newName});

            expect(res.statusCode).toBe(404);
            expect(res.body).toEqual(new WorkoutNotFoundError(user.id, workout.id).json);
        });

        test('returns 401 status code if token is expired', async () => {
            const payload: any = decode(accessToken);
            MockDate.set(payload.exp * 1000 + 2000);
            const res = await supertest(app).patch(url).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 401 status code if no access token is provided', async () => {
            const res = await supertest(app).patch(url).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });
    });

    describe('DELETE /workout/<id>', () => {
        let detailUrl: string;
        let workout: Workout;

        beforeEach(async () => {
            workout = new Workout();
            workout.owner = user;
            await workout.save();
            user.workouts = [workout];
            await user.save();
            detailUrl = `${url}/${workout.id}`;
        });

        test('sets isDeleted to true for the workout with the specified id belonging to the requesting user and returns a 202 status code', async () => {
            const res = await supertest(app).delete(detailUrl).set('Authorization', `Token ${accessToken}`).send();

            await workout.reload();
            expect(res.statusCode).toBe(202);
            expect(workout.isDeleted).toBe(true);
        });

        test('returns 404 status code if no workout with that id exists', async () => {
            const res = await supertest(app)
                .delete(`${url}/${randomUUID()}`)
                .set('Authorization', `Token ${accessToken}`)
                .send();

            expect(res.statusCode).toBe(404);
            expect(res.body).toEqual(new WorkoutNotFoundError(user.id, workout.id).json);
        });

        test('returns 401 status code if token is expired', async () => {
            const payload: any = decode(accessToken);
            MockDate.set(payload.exp * 1000 + 2000);
            const res = await supertest(app).delete(url).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 401 status code if no access token is provided', async () => {
            const res = await supertest(app).delete(url).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });
    });
});
