import fetchMock from 'jest-fetch-mock';
import {
    authApi,
    AuthenticationResponse,
    ForgotPasswordRequest,
    SignInRequest,
    SignOutRequest,
    SignUpRequest,
} from '@api';
import {authReducer} from '@store/authSlice';
import {expectCorrectRequest, setupApiStore} from '@tests/utils';
import {User} from '@src/types';

describe('auth endpoints', () => {
    let storeRef: ReturnType<typeof setupApiStore>;
    let response: AuthenticationResponse;
    let mockError: Error;

    beforeEach(() => {
        storeRef = setupApiStore(authApi, {auth: authReducer});
        fetchMock.resetMocks();
        response = {
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            user: {
                url: 'test-url',
                uuid: 'test-id',
                name: 'test-name',
                email: 'test-email',
            } as User,
        };
        mockError = new Error('Internal Server Error');
    });

    describe('signUp', () => {
        let request: SignUpRequest;

        beforeEach(() => {
            request = {
                name: 'test name',
                email: 'test@demo.com',
                password1: 'testpassword123',
                password2: 'testpassword123',
            };
        });

        test('request is correct', async () => {
            fetchMock.mockResponse(JSON.stringify({}));

            await storeRef.store.dispatch<any>(authApi.endpoints.signUp.initiate(request));

            expectCorrectRequest('POST', 'registration/');
        });

        test('successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(response));

            const {data} = await storeRef.store.dispatch<any>(authApi.endpoints.signUp.initiate(request));

            expect(data).toStrictEqual(response);
        });

        test('unsuccessful response', async () => {
            fetchMock.mockReject(mockError);

            const {
                error: {status, error},
            } = await storeRef.store.dispatch<any>(authApi.endpoints.signUp.initiate(request));

            expect(status).toEqual('FETCH_ERROR');
            expect(error).toContain(mockError.message);
        });
    });

    describe('signIn', () => {
        let request: SignInRequest;

        beforeEach(() => {
            request = {
                email: 'test-email',
                password: 'test-password',
            };
        });

        test('request is correct', async () => {
            fetchMock.mockResponse(JSON.stringify({}));

            await storeRef.store.dispatch<any>(authApi.endpoints.signIn.initiate(request));

            expectCorrectRequest('POST', 'login/');
        });

        test('successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(response));

            const {data} = await storeRef.store.dispatch<any>(authApi.endpoints.signIn.initiate(request));

            expect(data).toStrictEqual(response);
        });

        test('unsuccessful response', async () => {
            fetchMock.mockReject(mockError);

            const {
                error: {status, error},
            } = await storeRef.store.dispatch<any>(authApi.endpoints.signIn.initiate(request));

            expect(status).toEqual('FETCH_ERROR');
            expect(error).toContain(mockError.message);
        });
    });

    describe('signOut', () => {
        let request: SignOutRequest;

        beforeEach(() => {
            request = {
                refresh: 'test-refresh-token',
            };
        });

        test('request is correct', async () => {
            fetchMock.mockResponse(JSON.stringify({}));

            await storeRef.store.dispatch<any>(authApi.endpoints.signOut.initiate(request));

            expectCorrectRequest('POST', 'logout/');
        });

        test('successful response', async () => {
            const {data} = await storeRef.store.dispatch<any>(authApi.endpoints.signOut.initiate(request));

            expect(data).toBeUndefined();
        });

        test('unsuccessful response', async () => {
            fetchMock.mockReject(mockError);

            const {
                error: {status, error},
            } = await storeRef.store.dispatch<any>(authApi.endpoints.signOut.initiate(request));

            expect(status).toEqual('FETCH_ERROR');
            expect(error).toContain(mockError.message);
        });
    });

    describe('forgotPassword', () => {
        let request: ForgotPasswordRequest;

        beforeEach(() => {
            request = {
                email: 'test-email',
            };
        });

        test('request is correct', async () => {
            fetchMock.mockResponse(JSON.stringify({}));

            await storeRef.store.dispatch<any>(authApi.endpoints.forgotPassword.initiate(request));

            expectCorrectRequest('POST', 'password/reset/');
        });

        test('successful response', async () => {
            const {data} = await storeRef.store.dispatch<any>(authApi.endpoints.forgotPassword.initiate(request));

            expect(data).toBeUndefined();
        });

        test('unsuccessful response', async () => {
            fetchMock.mockReject(mockError);

            const {
                error: {status, error},
            } = await storeRef.store.dispatch<any>(authApi.endpoints.forgotPassword.initiate(request));

            expect(status).toEqual('FETCH_ERROR');
            expect(error).toContain(mockError.message);
        });
    });
});
