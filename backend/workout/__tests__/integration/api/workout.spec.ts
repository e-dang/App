import {app} from '@src/app';
import {randomUUID} from 'crypto';
import supertest from 'supertest';
import {User, Workout} from '@entities';
import MockDate from 'mockdate';
import {decode} from 'jsonwebtoken';
import {AuthenticationError, WorkoutNotFoundError} from '@errors';
import {createToken} from './utils';

/**
 * Workout APIs
 *
 * @group integration
 * @group workout
 */

async function createUserAndToken(): Promise<[User, string]> {
    const userId = randomUUID();
    const accessToken = await createToken({userId, roles: ['user']});
    const user = await User.create({id: userId}).save();
    return [user, accessToken];
}

async function createAdminUserAndToken(): Promise<[User, string]> {
    const userId = randomUUID();
    const accessToken = await createToken({userId, roles: ['admin']});
    const user = await User.create({id: userId}).save();
    return [user, accessToken];
}

describe('admin workout apis', () => {
    const url = '/api/v1/workouts/';
    let user: User;
    let accessToken: string;
    let adminUser: User;
    let adminAccessToken: string;

    beforeEach(async () => {
        [user, accessToken] = await createUserAndToken();
        [adminUser, adminAccessToken] = await createAdminUserAndToken();
    });

    afterEach(() => {
        MockDate.reset();
    });

    describe('GET /workouts', () => {
        test('returns all workouts in the database and 200 status code', async () => {
            const workouts1 = await user.addWorkouts([{name: 'test1'}, {name: 'test2'}]);
            const workouts2 = await adminUser.addWorkouts([{name: 'test2'}, {name: 'test3'}]);
            const workoutIds = [...workouts1, ...workouts2].map((workout) => workout.id);

            const res = await supertest(app).get(url).set('Authorization', `Token ${adminAccessToken}`).send();

            expect(res.statusCode).toBe(200);
            const retWorkoutIds = res.body.data.map((workout) => workout.id);
            expect(new Set(retWorkoutIds)).toEqual(new Set(workoutIds));
        });

        test('returns 401 status code if token is expired', async () => {
            const payload: any = decode(adminAccessToken);
            MockDate.set(payload.exp * 1000 + 2000);
            const res = await supertest(app).get(url).set('Authorization', `Token ${adminAccessToken}`).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 401 status code if no access token is provided', async () => {
            const res = await supertest(app).get(url).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 403 status code if requester is not an admin user', async () => {
            const res = await supertest(app).get(url).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(403);
            expect(res.body.errors[0].msg).toEqual('You are not authorized to access this resource.');
        });
    });
});

describe('user workout apis', () => {
    let url: string;
    let accessToken: string;
    let user: User;

    beforeEach(async () => {
        [user, accessToken] = await createUserAndToken();
        url = `/api/v1/workouts/${user.id}`;
    });

    afterEach(() => {
        MockDate.reset();
    });

    describe('GET /workouts/:userId', () => {
        test('returns only the workouts owned by the requesting user and 200 status code', async () => {
            await user.addWorkouts([{name: 'test1'}, {name: 'test2'}]);
            await user.reload();
            const res = await supertest(app).get(url).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toEqual(await user.getSerializedWorkouts());
        });

        // test('does not return deleted workouts for requesting user', async () => {
        //     const res = await supertest(app).get(url).set('Authorization', `Token ${accessToken}`).send();

        //     expect(res.statusCode).toBe(200);
        // expect(res.body.data)
        // });

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

    describe('GET /workouts/:userId/:workoutId', () => {
        let detailUrl: string;
        let workout: Workout;

        beforeEach(async () => {
            workout = await user.addWorkout({name: 'test workout'});
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

        test('returns 400 status code when workoutId is not a valid uuid', async () => {
            const res = await supertest(app).get(`${url}/1`).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('workoutId');
            expect(res.body.errors[0].msg).toEqual('Invalid id.');
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

        test('returns 403 status code if requester is not the owner of the workout', async () => {
            const [_, otherAccessToken] = await createUserAndToken();
            const res = await supertest(app).get(detailUrl).set('Authorization', `Token ${otherAccessToken}`).send();

            expect(res.statusCode).toBe(403);
            expect(res.body.errors[0].msg).toEqual('You are not authorized to access this resource.');
        });

        test('returns 401 status code if no access token is provided', async () => {
            const res = await supertest(app).get(detailUrl).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });
    });

    describe('POST /workouts/:userId', () => {
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
            expect(user.getWorkout(res.body.data.id)).not.toBeUndefined();
        });

        // test('automatically assigns a generic name to workout if name is not provided', async () => {

        // })

        test('returns 401 status code if token is expired', async () => {
            const payload: any = decode(accessToken);
            MockDate.set(payload.exp * 1000 + 2000);
            const res = await supertest(app).post(url).set('Authorization', `Token ${accessToken}`).send(workoutData);

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
            const res = await supertest(app).post(url).send(workoutData);

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });
    });

    describe('PATCH /workouts/:userId/:workoutId', () => {
        let detailUrl: string;
        let workout: Workout;
        const newName = 'test workout2';

        beforeEach(async () => {
            workout = await user.addWorkout({name: 'oldname'});
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

        test('returns 400 status code when name is an empty string', async () => {
            const res = await supertest(app)
                .patch(detailUrl)
                .set('Authorization', `Token ${accessToken}`)
                .send({name: ''});

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('name');
            expect(res.body.errors[0].msg).toEqual('The name cannot be blank.');
        });

        test('returns 400 status code when workoutId is not a uuid', async () => {
            const res = await supertest(app)
                .patch(`${url}/1`)
                .set('Authorization', `Token ${accessToken}`)
                .send({name: newName});

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('workoutId');
            expect(res.body.errors[0].msg).toEqual('Invalid id.');
        });

        test('returns 404 status code if a workout with the specified id does not exist for that user ', async () => {
            const wrongId = randomUUID();
            const res = await supertest(app)
                .patch(`${url}/${wrongId}`)
                .set('Authorization', `Token ${accessToken}`)
                .send({name: newName});

            expect(res.statusCode).toBe(404);
            expect(res.body).toEqual(new WorkoutNotFoundError(user.id, wrongId).json);
        });

        test('returns 401 status code if token is expired', async () => {
            const payload: any = decode(accessToken);
            MockDate.set(payload.exp * 1000 + 2000);
            const res = await supertest(app).patch(detailUrl).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 401 status code if no access token is provided', async () => {
            const res = await supertest(app).patch(detailUrl).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 403 status code if requester is not the owner of the workout', async () => {
            const [_, otherAccessToken] = await createUserAndToken();
            const res = await supertest(app).get(url).set('Authorization', `Token ${otherAccessToken}`).send();

            expect(res.statusCode).toBe(403);
            expect(res.body.errors[0].msg).toEqual('You are not authorized to access this resource.');
        });
    });

    describe('DELETE /workouts/:userId/:workoutId', () => {
        let detailUrl: string;
        let workout: Workout;

        beforeEach(async () => {
            workout = await user.addWorkout({name: 'workout1'});
            detailUrl = `${url}/${workout.id}`;
        });

        test('sets isDeleted to true for the workout with the specified id belonging to the requesting user and returns a 202 status code', async () => {
            const res = await supertest(app).delete(detailUrl).set('Authorization', `Token ${accessToken}`).send();

            await workout.reload();
            expect(res.statusCode).toBe(202);
            expect(workout.isDeleted).toBe(true);
        });

        test('returns 400 status code when workoutId is not a uuid', async () => {
            const res = await supertest(app).delete(`${url}/1`).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].param).toEqual('workoutId');
            expect(res.body.errors[0].msg).toEqual('Invalid id.');
        });

        test('returns 404 status code if no workout with that id exists', async () => {
            const wrongId = randomUUID();
            const res = await supertest(app)
                .delete(`${url}/${wrongId}`)
                .set('Authorization', `Token ${accessToken}`)
                .send();

            expect(res.statusCode).toBe(404);
            expect(res.body).toEqual(new WorkoutNotFoundError(user.id, wrongId).json);
        });

        test('returns 401 status code if token is expired', async () => {
            const payload: any = decode(accessToken);
            MockDate.set(payload.exp * 1000 + 2000);
            const res = await supertest(app).delete(detailUrl).set('Authorization', `Token ${accessToken}`).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 401 status code if no access token is provided', async () => {
            const res = await supertest(app).delete(detailUrl).send();

            expect(res.statusCode).toBe(401);
            expect(res.body).toEqual(new AuthenticationError().json);
        });

        test('returns 403 status code if requester is not the owner of the workout', async () => {
            const [_, otherAccessToken] = await createUserAndToken();
            const res = await supertest(app).get(detailUrl).set('Authorization', `Token ${otherAccessToken}`).send();

            expect(res.statusCode).toBe(403);
            expect(res.body.errors[0].msg).toEqual('You are not authorized to access this resource.');
        });
    });
});
