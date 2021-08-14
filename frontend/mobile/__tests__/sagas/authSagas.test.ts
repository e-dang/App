import {loginAsync, logout, registerAsync} from '@actions';
import {authReducer, errorReducer} from '@reducers';
import {registerSaga, loginSaga, authFlow, backgroundTask} from '@sagas';
import {AuthToken, LoginInfo, RegistrationInfo} from '@src/types';
import {timeout, TimeoutError} from '@utils';
import {expectSaga} from 'redux-saga-test-plan';
import {call, fork} from 'redux-saga/effects';
import {getType} from 'typesafe-actions';
import {createMockTask} from '@redux-saga/testing-utils';
import {AuthApi} from '@api';

jest.mock('../../src/store', () => ({
    __esModule: true,
    persistor: {
        purge: jest.fn(),
    },
}));

describe('authSagas', () => {
    const token: AuthToken = {token: 'aiwodjafgjdka12408adfahjd'};

    describe('registerSaga', () => {
        const regInfo: RegistrationInfo = {
            name: 'Test User',
            email: 'testemail@demo.com',
            password1: 'password123',
            password2: 'password123',
        };

        test('registration is successfull clears error state', () => {
            return expectSaga(registerSaga, registerAsync.request(regInfo))
                .withReducer(errorReducer, {REGISTER: {error: 'Failure'}})
                .provide({
                    race: () => ({response: token}),
                })
                .race({response: call(AuthApi.register, regInfo), timeout: call(timeout, AuthApi.timeout)})
                .put({type: getType(registerAsync.success), payload: token})
                .dispatch({type: getType(registerAsync.request), payload: regInfo})
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
                .race({response: call(AuthApi.register, regInfo), timeout: call(timeout, AuthApi.timeout)})
                .put({type: getType(registerAsync.success), payload: token})
                .dispatch({type: getType(registerAsync.request), payload: regInfo})
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
                .race({response: call(AuthApi.register, regInfo), timeout: call(timeout, AuthApi.timeout)})
                .put({type: getType(registerAsync.failure), payload: error})
                .dispatch({type: getType(registerAsync.request), payload: regInfo})
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
                .race({response: call(AuthApi.register, regInfo), timeout: call(timeout, AuthApi.timeout)})
                .put({type: getType(registerAsync.failure), payload: error})
                .dispatch({type: getType(registerAsync.request), payload: regInfo})
                .hasFinalState({REGISTER: {error: error.message}})
                .returns(false)
                .silentRun();
        });
    });

    describe('loginSaga', () => {
        const loginInfo: LoginInfo = {
            email: 'example@demo.com',
            password: 'mytestpassword123',
        };

        test('when login is successful it sets auth state token', () => {
            return expectSaga(loginSaga, loginAsync.request(loginInfo))
                .withReducer(authReducer)
                .provide({
                    race: () => ({response: token}),
                })
                .race({response: call(AuthApi.login, loginInfo), timeout: call(timeout, AuthApi.timeout)})
                .put({type: getType(loginAsync.success), payload: token})
                .dispatch({type: getType(loginAsync.request), payload: loginInfo})
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
                .race({response: call(AuthApi.login, loginInfo), timeout: call(timeout, AuthApi.timeout)})
                .put({type: getType(loginAsync.success), payload: token})
                .dispatch({type: getType(loginAsync.request), payload: loginInfo})
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
                .race({response: call(AuthApi.login, loginInfo), timeout: call(timeout, AuthApi.timeout)})
                .put({type: getType(loginAsync.failure), payload: error})
                .dispatch({type: getType(loginAsync.request), payload: loginInfo})
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
                .race({response: call(AuthApi.login, loginInfo), timeout: call(timeout, AuthApi.timeout)})
                .put({type: getType(loginAsync.failure), payload: error})
                .dispatch({type: getType(loginAsync.request), payload: loginInfo})
                .hasFinalState({LOGIN: {error: error.message}})
                .returns(false)
                .silentRun();
        });
    });
});

describe('authFlow', () => {
    test('after successful registration, background tasks are started, and waits for logout', () => {
        const regInfo: RegistrationInfo = {
            name: 'Test User',
            email: 'testemail@demo.com',
            password1: 'password123',
            password2: 'password123',
        };
        const action = registerAsync.request(regInfo);
        return expectSaga(authFlow)
            .provide([
                [call(registerSaga, action), true],
                [fork(backgroundTask), createMockTask()],
            ])
            .take([registerAsync.request, loginAsync.request])
            .call(registerSaga, action)
            .fork(backgroundTask)
            .take(logout)
            .dispatch(action)
            .dispatch(logout())
            .silentRun();
    });

    test('after successful login, background tasks are started, and waits for logout', () => {
        const loginInfo: LoginInfo = {
            email: 'example@demo.com',
            password: 'mytestpassword123',
        };
        const action = loginAsync.request(loginInfo);
        return expectSaga(authFlow)
            .provide([
                [call(loginSaga, action), true],
                [fork(backgroundTask), createMockTask()],
            ])
            .take([registerAsync.request, loginAsync.request])
            .call(loginSaga, action)
            .fork(backgroundTask)
            .take(logout)
            .dispatch(action)
            .dispatch(logout())
            .silentRun();
    });
});
