import {AuthApi} from '@api';
import Client from '@src/api/client';
import {mock, MockProxy} from 'jest-mock-extended';
import {Response} from '@api/client';
import {
    AuthToken,
    DetailResponse,
    Email,
    SignInInfo,
    SignInResponse,
    RegistrationInfo,
    RegistrationResponse,
} from '@src/types';

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

    test('signUp throws error when response status is not 201', async () => {
        const data: DetailResponse = {detail: 'Fail'};
        client.post.mockResolvedValue({
            data,
            status: 500,
            statusText: 'Server Error',
        } as Response<DetailResponse>);

        await expect(() => AuthApi.signUp(regInfo)).rejects.toThrowError(data.detail);
    });

    test('signUp returns an AuthToken when response status is 201', async () => {
        const data: RegistrationResponse = {key: 'aaajafiuh89q247qy7ea90djkl'};
        client.post.mockResolvedValue({
            data,
            status: 201,
            statusText: 'Created',
        });

        const resp = await AuthApi.signUp(regInfo);

        expect(resp).toEqual({token: data.key} as AuthToken);
    });

    test('signUp calls setAuthToken on client when response status is 201', async () => {
        const data: RegistrationResponse = {key: 'aaajafiuh89q247qy7ea90djkl'};
        client.post.mockResolvedValue({
            data,
            status: 201,
            statusText: 'Created',
        });

        const resp = await AuthApi.signUp(regInfo);

        expect(client.setAuthToken).toHaveBeenCalledWith(resp);
    });

    test('signIn returns AuthToken object when signIn is successful', async () => {
        const signInInfo: SignInInfo = {
            email: 'example@demo.com',
            password: 'password123',
        };
        const data: SignInResponse = {
            key: '123ahudfiagsefajdopai3r39047',
        };
        client.post.mockResolvedValue({
            data,
            status: 200,
            statusText: 'Success',
        });

        const resp = await AuthApi.signIn(signInInfo);

        expect(resp).toEqual({token: data.key} as AuthToken);
    });

    test('signIn calls setAuthToken on client when signIn is successful', async () => {
        const signInInfo: SignInInfo = {
            email: 'example@demo.com',
            password: 'password123',
        };
        const data: SignInResponse = {
            key: '123ahudfiagsefajdopai3r39047',
        };
        client.post.mockResolvedValue({
            data,
            status: 200,
            statusText: 'Success',
        });

        const resp = await AuthApi.signIn(signInInfo);

        expect(client.setAuthToken).toHaveBeenCalledWith(resp);
    });

    test('signIn throws error when response status is not 200', async () => {
        const signInInfo: SignInInfo = {
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

        await expect(() => AuthApi.signIn(signInInfo)).rejects.toThrowError(data.detail);
    });

    test('signOut resolves to void when signOut is successful', async () => {
        const data: DetailResponse = {
            detail: 'Sign out successful',
        };
        client.post.mockResolvedValue({
            data,
            status: 200,
            statusText: 'Success',
        });

        const resp = await AuthApi.signOut();

        expect(resp).toBe(undefined);
    });

    test('signOut calls clearAuthToken on client when signOut is successful', async () => {
        const data: DetailResponse = {
            detail: 'Sign out successful',
        };
        client.post.mockResolvedValue({
            data,
            status: 200,
            statusText: 'Success',
        });

        await AuthApi.signOut();

        expect(client.clearAuthToken).toHaveBeenCalled();
    });

    test('signOut resolves to void when signOut is not successful', async () => {
        const data: DetailResponse = {
            detail: 'Server error',
        };
        client.post.mockResolvedValue({
            data,
            status: 500,
            statusText: 'Failure',
        });

        const resp = await AuthApi.signOut();

        expect(resp).toBe(undefined);
    });

    test('signOut calls clearAuthToken on client when signOut is not successful', async () => {
        const data: DetailResponse = {
            detail: 'Server error',
        };
        client.post.mockResolvedValue({
            data,
            status: 500,
            statusText: 'Failure',
        });

        await AuthApi.signOut();

        expect(client.clearAuthToken).toHaveBeenCalled();
    });

    test('forgotPassword returns message string when successful', async () => {
        const email: Email = 'test@demo.com';
        const data: DetailResponse = {
            detail: 'Success',
        };
        client.post.mockResolvedValue({
            data,
            status: 200,
            statusText: 'Success',
        });

        const resp = await AuthApi.forgotPassword(email);

        expect(resp).toBe(data.detail);
    });

    test('forgotPassword throws error when unsuccessful', async () => {
        const email: Email = 'test@demo.com';
        const data: DetailResponse = {
            detail: 'Failure',
        };
        client.post.mockResolvedValue({
            data,
            status: 500,
            statusText: 'Failure',
        });

        await expect(() => AuthApi.forgotPassword(email)).rejects.toThrowError(data.detail);
    });
});
