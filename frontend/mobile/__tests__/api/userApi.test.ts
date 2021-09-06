import {UserApi, UserResponse} from '@api';
import Client from '@api/client';
import {User} from '@src/types';
import {mock, MockProxy} from 'jest-mock-extended';

describe('user api', () => {
    let client: MockProxy<typeof Client>;

    beforeEach(() => {
        client = mock<typeof Client>();
        UserApi['client'] = client;
    });

    test('getAuthUser returns User object when response status is 200', async () => {
        const data: UserResponse = {user: mock<User>()};
        client.get.mockResolvedValue({
            data,
            status: 200,
            statusText: 'Success',
        });

        const resp = await UserApi.getAuthUser();

        expect(resp).toBe(data.user);
    });

    test('getAuthUser throws error when response status is not 200', async () => {
        const data: UserResponse = {detail: 'Failure'};
        client.get.mockResolvedValue({
            data,
            status: 301,
            statusText: 'Failure',
        });

        await expect(() => UserApi.getAuthUser()).rejects.toThrowError(data.detail);
    });
});
