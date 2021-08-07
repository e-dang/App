import {AuthApi} from '@api';
import Client from '@src/api/client';
import {mock, MockProxy} from 'jest-mock-extended';
import {Response} from '@api/client';
import {
    AuthToken,
    DetailResponse,
    LoginInfo,
    LoginResponse,
    RegistrationInfo,
    RegistrationResponse,
} from '@src/types/auth';

describe('authApi', () => {
    let client: MockProxy<typeof Client>;
    const regInfo: RegistrationInfo = {
        name: 'test name',
        email: 'example@demo.com',
        password1: 'testpassword123',
        password2: 'testpassword123',
    };

    beforeEach(() => {
        client = mock<typeof Client>();
        AuthApi['client'] = client;
    });

    test('register throws error when response status is not 201', async () => {
        const data: DetailResponse = {detail: 'Fail'};
        client.post.mockResolvedValue({
            data,
            status: 500,
            statusText: 'Server Error',
        } as Response<DetailResponse>);

        await expect(() => AuthApi.register(regInfo)).rejects.toThrowError(data.detail);
    });

    test('register returns an AuthToken when response status is 201', async () => {
        const data: RegistrationResponse = {key: 'aaajafiuh89q247qy7ea90djkl'};
        client.post.mockResolvedValue({
            data,
            status: 201,
            statusText: 'Created',
        });

        const resp = await AuthApi.register(regInfo);

        expect(resp).toEqual({token: data.key} as AuthToken);
    });

    test('login returns AuthToken object when login is successful', async () => {
        const loginInfo: LoginInfo = {
            email: 'example@demo.com',
            password: 'password123',
        };
        const data: LoginResponse = {
            key: '123ahudfiagsefajdopai3r39047',
        };
        client.post.mockResolvedValue({
            data,
            status: 200,
            statusText: 'Success',
        });

        const resp = await AuthApi.login(loginInfo);

        expect(resp).toEqual({token: data.key} as AuthToken);
    });

    test('login throws error when response status is not 200', async () => {
        const loginInfo: LoginInfo = {
            email: 'dne@dne.com',
            password: 'password123',
        };
        const data: DetailResponse = {
            detail: 'failure',
        };

        client.post.mockResolvedValue({
            data,
            status: 400,
            statusText: 'Failure',
        });

        await expect(() => AuthApi.login(loginInfo)).rejects.toThrowError(data.detail);
    });
});
