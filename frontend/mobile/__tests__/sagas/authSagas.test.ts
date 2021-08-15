import {forgotPasswordAsync, loginAsync, logout, registerAsync} from '@actions';
import {authReducer, errorReducer} from '@reducers';
import {registerSaga, loginSaga, authFlowSaga, backgroundTask, forgotPasswordSaga} from '@sagas';
import {AuthToken, LoginInfo, RegistrationInfo} from '@src/types';
import {timeout, TimeoutError} from '@utils';
import {expectSaga} from 'redux-saga-test-plan';
import {call, fork} from 'redux-saga/effects';
import {createMockTask} from '@redux-saga/testing-utils';
import {AuthApi} from '@api';
import {persistor} from '@src/store';

jest.mock('../../src/store', () => ({
    __esModule: true,
    persistor: {
        purge: jest.fn(),
    },
}));

describe('authSagas', () => {
    const token: AuthToken = {token: 'aiwodjafgjdka12408adfahjd'};
    const loginInfo: LoginInfo = {
        email: 'example@demo.com',
        password: 'mytestpassword123',
    };
    const regInfo: RegistrationInfo = {
        name: 'Test User',
        email: 'testemail@demo.com',
        password1: 'password123',
        password2: 'password123',
    };

    describe('registerSaga', () => {
        const registerObj = {response: call(AuthApi.register, regInfo), timeout: call(timeout, AuthApi.timeout)};

        test('registration is successfull clears error state', () => {
            return expectSaga(registerSaga, registerAsync.request(regInfo))
                .withReducer(errorReducer, {REGISTER: {error: 'Failure'}})
                .provide({
                    race: () => ({response: token}),
                })
                .race(registerObj)
                .put(registerAsync.success(token))
                .hasFinalState({REGISTER: {error: null}})
                .returns(true)
                .silentRun();
        });

        test('registration is successfull sets auth state token', () => {
            return expectSaga(registerSaga, registerAsync.request(regInfo))
                .withReducer(authReducer, {token: null})
                .provide({
                    race: () => ({response: token}),
                })
                .race(registerObj)
                .put(registerAsync.success(token))
                .hasFinalState({token: token})
                .returns(true)
                .silentRun();
        });

        test('registration fails due to invalid input', () => {
            const error = new Error('Invalid password');
            return expectSaga(registerSaga, registerAsync.request(regInfo))
                .withReducer(errorReducer, {REGISTER: {error: null}})
                .provide({
                    race: () => {
                        throw error;
                    },
                })
                .race(registerObj)
                .put(registerAsync.failure(error))
                .hasFinalState({REGISTER: {error: error.message}})
                .returns(false)
                .silentRun();
        });

        test('registration fails due to timeout', () => {
            const error = new TimeoutError();
            return expectSaga(registerSaga, registerAsync.request(regInfo))
                .withReducer(errorReducer, {REGISTER: {error: null}})
                .provide({
                    race: () => {
                        throw error;
                    },
                })
                .race(registerObj)
                .put(registerAsync.failure(error))
                .hasFinalState({REGISTER: {error: error.message}})
                .returns(false)
                .silentRun();
        });
    });

    describe('loginSaga', () => {
        const loginRace = {response: call(AuthApi.login, loginInfo), timeout: call(timeout, AuthApi.timeout)};

        test('when login is successful it sets auth state token', () => {
            return expectSaga(loginSaga, loginAsync.request(loginInfo))
                .withReducer(authReducer)
                .provide({
                    race: () => ({response: token}),
                })
                .race(loginRace)
                .put(loginAsync.success(token))
                .hasFinalState({token: token})
                .returns(true)
                .silentRun();
        });

        test('when login is successful it clears error state', () => {
            return expectSaga(loginSaga, loginAsync.request(loginInfo))
                .withReducer(errorReducer, {LOGIN: {error: 'Failure'}})
                .provide({
                    race: () => ({response: token}),
                })
                .race(loginRace)
                .put(loginAsync.success(token))
                .hasFinalState({LOGIN: {error: null}})
                .returns(true)
                .silentRun();
        });

        test('when login fails due to invalid input it sets error state to error message', () => {
            const error = new Error('Incorrect password');
            return expectSaga(loginSaga, loginAsync.request(loginInfo))
                .withReducer(errorReducer, {LOGIN: {error: null}})
                .provide({
                    race: () => {
                        throw error;
                    },
                })
                .race(loginRace)
                .put(loginAsync.failure(error))
                .hasFinalState({LOGIN: {error: error.message}})
                .returns(false)
                .silentRun();
        });

        test('when login fails due to timeout it sets error to error message', () => {
            const error = new TimeoutError();

            return expectSaga(loginSaga, loginAsync.request(loginInfo))
                .withReducer(errorReducer, {LOGIN: {error: null}})
                .provide({
                    race: () => {
                        throw error;
                    },
                })
                .race(loginRace)
                .put(loginAsync.failure(error))
                .hasFinalState({LOGIN: {error: error.message}})
                .returns(false)
                .silentRun();
        });
    });

    describe('forgotPasswordSaga', () => {
        const forgotPasswordRace = {
            response: call(AuthApi.forgotPassword, loginInfo.email),
            timeout: call(timeout, AuthApi.timeout),
        };

        test('when forgot password is successful it clears error state', () => {
            const msg = 'Email sent';
            return expectSaga(forgotPasswordSaga, forgotPasswordAsync.request(loginInfo.email))
                .withReducer(errorReducer, {FORGOT_PASSWORD: {error: 'Failure'}})
                .provide({
                    race: () => ({response: msg}),
                })
                .race(forgotPasswordRace)
                .put(forgotPasswordAsync.success(msg))
                .hasFinalState({FORGOT_PASSWORD: {error: null}})
                .returns(true)
                .silentRun();
        });

        test('when forgot password fails it sets error state to Error message', () => {
            const error = new Error('Network error');
            return expectSaga(forgotPasswordSaga, forgotPasswordAsync.request(loginInfo.email))
                .withReducer(errorReducer, {FORGOT_PASSWORD: {error: null}})
                .provide({
                    race: () => {
                        throw error;
                    },
                })
                .race(forgotPasswordRace)
                .put(forgotPasswordAsync.failure(error))
                .hasFinalState({FORGOT_PASSWORD: {error: error.message}})
                .returns(false)
                .silentRun();
        });

        test('when forgot password fails due to timeout it sets error state to Error message', () => {
            const error = new TimeoutError();
            return expectSaga(forgotPasswordSaga, forgotPasswordAsync.request(loginInfo.email))
                .withReducer(errorReducer, {FORGOT_PASSWORD: {error: null}})
                .provide({
                    race: () => {
                        throw error;
                    },
                })
                .race(forgotPasswordRace)
                .put(forgotPasswordAsync.failure(error))
                .hasFinalState({FORGOT_PASSWORD: {error: error.message}})
                .returns(false)
                .silentRun();
        });
    });

    describe('authFlowSaga', () => {
        const requestActions = [registerAsync.request, loginAsync.request, forgotPasswordAsync.request];

        test('after successful registration, background tasks are started, and waits for logout', () => {
            const action = registerAsync.request(regInfo);
            return expectSaga(authFlowSaga)
                .provide([
                    [call(registerSaga, action), true],
                    [fork(backgroundTask), createMockTask()],
                    [call(AuthApi.logout), undefined],
                    [call(persistor.purge), undefined],
                ])
                .take(requestActions)
                .call(registerSaga, action)
                .fork(backgroundTask)
                .take(logout)
                .call(AuthApi.logout)
                .call(persistor.purge)
                .take(requestActions)
                .dispatch(action)
                .dispatch(logout())
                .silentRun();
        });

        test('after successful login, background tasks are started, and waits for logout', () => {
            const action = loginAsync.request(loginInfo);
            return expectSaga(authFlowSaga)
                .provide([
                    [call(loginSaga, action), true],
                    [fork(backgroundTask), createMockTask()],
                    [call(AuthApi.logout), undefined],
                    [call(persistor.purge), undefined],
                ])
                .take(requestActions)
                .call(loginSaga, action)
                .fork(backgroundTask)
                .take(logout)
                .call(AuthApi.logout)
                .call(persistor.purge)
                .take(requestActions)
                .dispatch(action)
                .dispatch(logout())
                .silentRun();
        });

        test('after successful password reset, the saga waits for user to make an auth request action', () => {
            const action = forgotPasswordAsync.request(loginInfo.email);
            return expectSaga(authFlowSaga)
                .provide([[call(forgotPasswordSaga, action), true]])
                .take(requestActions)
                .call(forgotPasswordSaga, action)
                .take(requestActions)
                .dispatch(action)
                .silentRun();
        });
    });
});
