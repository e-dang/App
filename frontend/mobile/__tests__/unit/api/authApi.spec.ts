import fetchMock, {enableFetchMocks} from 'jest-fetch-mock';
enableFetchMocks();
import {ApiResponse, authApi, ForgotPasswordRequest, SignInRequest, SignUpRequest} from '@api';
import {authReducer} from '@store/authSlice';
import {expectCorrectRequest, setupApiStore} from '@tests/unit/utils';
import {AuthToken} from '@src/types';

describe('auth endpoints', () => {
    let storeRef: ReturnType<typeof setupApiStore>;
    let response: ApiResponse<AuthToken>;
    let mockError: Error;

    beforeEach(() => {
        storeRef = setupApiStore(authApi, {auth: authReducer});
        fetchMock.resetMocks();
        response = {
            data: {
                accessToken: 'test-access-token',
            },
        };
        mockError = new Error('Internal Server Error');
    });

    describe('signUp', () => {
        let request: SignUpRequest;

        beforeEach(() => {
            request = {
                name: 'test name',
                email: 'test@demo.com',
                password: 'testpassword123',
            };
        });

        test('request is correct', async () => {
            fetchMock.mockResponse(JSON.stringify({}));

            await storeRef.store.dispatch<any>(authApi.endpoints.signUp.initiate(request));

            expectCorrectRequest('POST', 'auth/signup/');
        });

        test('successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(response));

            const {data} = await storeRef.store.dispatch<any>(authApi.endpoints.signUp.initiate(request));

            expect(data).toStrictEqual(response.data);
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

            expectCorrectRequest('POST', 'auth/signin/');
        });

        test('successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(response));

            const {data} = await storeRef.store.dispatch<any>(authApi.endpoints.signIn.initiate(request));

            expect(data).toStrictEqual(response.data);
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
        test('request is correct', async () => {
            fetchMock.mockResponse(JSON.stringify({}));

            await storeRef.store.dispatch<any>(authApi.endpoints.signOut.initiate());

            expectCorrectRequest('POST', 'auth/signout/');
        });

        test('successful response', async () => {
            const {data} = await storeRef.store.dispatch<any>(authApi.endpoints.signOut.initiate());

            expect(data).toBeUndefined();
        });

        test('unsuccessful response', async () => {
            fetchMock.mockReject(mockError);

            const {
                error: {status, error},
            } = await storeRef.store.dispatch<any>(authApi.endpoints.signOut.initiate());

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

            expectCorrectRequest('POST', 'auth/password/reset/');
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
