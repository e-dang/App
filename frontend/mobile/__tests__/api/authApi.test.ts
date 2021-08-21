import {
    AuthApi,
    DetailResponse,
    SignUpRequest,
    TokenResponse,
    SignInRequest,
    ForgotPasswordRequest,
    RefreshTokenRequest,
} from '@api';
import Client from '@src/api/client';
import {mock, MockProxy} from 'jest-mock-extended';
import {Response} from '@api/client';
import {AuthToken} from '@src/types';

describe('authApi', () => {
    let client: MockProxy<typeof Client>;
    const regInfo: SignUpRequest = {
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
        const data: TokenResponse = {
            access_token: 'aaajafiuh89q247qy7ea90djkl',
            refresh_token: 'egaihjdfa3it52t-0sfawdljaiofhjjg0',
        };
        client.post.mockResolvedValue({
            data,
            status: 201,
            statusText: 'Created',
        });

        const resp = await AuthApi.signUp(regInfo);

        expect(resp).toEqual({accessToken: data.access_token, refreshToken: data.refresh_token} as AuthToken);
    });

    test('signUp calls setAuthToken on client when response status is 201', async () => {
        const data: TokenResponse = {
            access_token: 'aaajafiuh89q247qy7ea90djkl',
            refresh_token: 'egaihjdfa3it52t-0sfawdljaiofhjjg0',
        };
        client.post.mockResolvedValue({
            data,
            status: 201,
            statusText: 'Created',
        });

        const resp = await AuthApi.signUp(regInfo);

        expect(client.setAuthToken).toHaveBeenCalledWith(resp);
    });

    test('signIn returns AuthToken object when signIn is successful', async () => {
        const signInRequest: SignInRequest = {
            email: 'example@demo.com',
            password: 'password123',
        };
        const data: TokenResponse = {
            access_token: 'aaajafiuh89q247qy7ea90djkl',
            refresh_token: 'egaihjdfa3it52t-0sfawdljaiofhjjg0',
        };
        client.post.mockResolvedValue({
            data,
            status: 200,
            statusText: 'Success',
        });

        const resp = await AuthApi.signIn(signInRequest);

        expect(resp).toEqual({accessToken: data.access_token, refreshToken: data.refresh_token} as AuthToken);
    });

    test('signIn calls setAuthToken on client when signIn is successful', async () => {
        const signInRequest: SignInRequest = {
            email: 'example@demo.com',
            password: 'password123',
        };
        const data: TokenResponse = {
            access_token: 'aaajafiuh89q247qy7ea90djkl',
            refresh_token: 'egaihjdfa3it52t-0sfawdljaiofhjjg0',
        };
        client.post.mockResolvedValue({
            data,
            status: 200,
            statusText: 'Success',
        });

        const resp = await AuthApi.signIn(signInRequest);

        expect(client.setAuthToken).toHaveBeenCalledWith(resp);
    });

    test('signIn throws error when response status is not 200', async () => {
        const signInRequest: SignInRequest = {
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

        await expect(() => AuthApi.signIn(signInRequest)).rejects.toThrowError(data.detail);
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
        const request: ForgotPasswordRequest = {email: 'test@demo.com'};
        const data: DetailResponse = {
            detail: 'Success',
        };
        client.post.mockResolvedValue({
            data,
            status: 200,
            statusText: 'Success',
        });

        const resp = await AuthApi.forgotPassword(request);

        expect(resp).toBe(data.detail);
    });

    test('forgotPassword throws error when unsuccessful', async () => {
        const request: ForgotPasswordRequest = {email: 'test@demo.com'};
        const data: DetailResponse = {
            detail: 'Failure',
        };
        client.post.mockResolvedValue({
            data,
            status: 500,
            statusText: 'Failure',
        });

        await expect(() => AuthApi.forgotPassword(request)).rejects.toThrowError(data.detail);
    });

    test('refreshToken returns new auth token when successful', async () => {
        const request: RefreshTokenRequest = {refresh: 'adnafuihsefiuhawodj'};
        const data: TokenResponse = {
            access_token: 'aaajafiuh89q247qy7ea90djkl',
            refresh_token: 'egaihjdfa3it52t-0sfawdljaiofhjjg0',
        };

        client.post.mockResolvedValue({
            data,
            status: 200,
            statusText: 'Success',
        });

        const resp = await AuthApi.refreshToken(request);

        expect(resp).toEqual({accessToken: data.access_token, refreshToken: data.refresh_token} as AuthToken);
    });

    test('refreshToken calls setAuthToken on client when successful', async () => {
        const request: RefreshTokenRequest = {refresh: 'adnafuihsefiuhawodj'};
        const data: TokenResponse = {
            access_token: 'aaajafiuh89q247qy7ea90djkl',
            refresh_token: 'egaihjdfa3it52t-0sfawdljaiofhjjg0',
        };

        client.post.mockResolvedValue({
            data,
            status: 200,
            statusText: 'Success',
        });

        const resp = await AuthApi.refreshToken(request);

        expect(client.setAuthToken).toHaveBeenCalledWith(resp);
    });

    test('refreshToken throws error when unsuccessful', async () => {
        const request: RefreshTokenRequest = {refresh: 'afme3fhq2389u7aiodjaopdk'};
        const data: TokenResponse = {
            detail: 'Token is invalid or expired',
        };

        client.post.mockResolvedValue({
            data,
            status: 401,
            statusText: 'Failure',
        });

        await expect(() => AuthApi.refreshToken(request)).rejects.toThrowError(data.detail);
    });
});
