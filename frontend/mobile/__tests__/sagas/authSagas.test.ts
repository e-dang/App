import {loginAsync, registerAsync} from '@actions';
import {authReducer, errorReducer} from '@reducers';
import authSaga from '@sagas';
import {AuthToken, LoginInfo, RegistrationInfo} from '@src/types';
import {TimeoutError} from '@utils';
import {expectSaga} from 'redux-saga-test-plan';
import {getType} from 'typesafe-actions';

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
            return expectSaga(authSaga)
                .withReducer(errorReducer, {REGISTER: {error: 'Failure'}})
                .provide({
                    race: () => ({response: token}),
                })
                .put({type: getType(registerAsync.success), payload: token})
                .dispatch({type: getType(registerAsync.request), payload: regInfo})
                .hasFinalState({REGISTER: {error: null}})
                .silentRun();
        });

        test('registration is successfull sets auth state token', () => {
            return expectSaga(authSaga)
                .withReducer(authReducer, {token: null})
                .provide({
                    race: () => ({response: token}),
                })
                .put({type: getType(registerAsync.success), payload: token})
                .dispatch({type: getType(registerAsync.request), payload: regInfo})
                .hasFinalState({token: token.token})
                .silentRun();
        });

        test('registration fails due to invalid input', () => {
            const error = new Error('Invalid password');
            return expectSaga(authSaga)
                .withReducer(errorReducer, {REGISTER: {error: null}})
                .provide({
                    race: () => {
                        throw error;
                    },
                })
                .put({type: getType(registerAsync.failure), payload: error.message})
                .dispatch({type: getType(registerAsync.request), payload: regInfo})
                .hasFinalState({REGISTER: {error: error.message}})
                .silentRun();
        });

        test('registration fails due to timeout', () => {
            const error = new TimeoutError();
            return expectSaga(authSaga)
                .withReducer(errorReducer, {REGISTER: {error: null}})
                .provide({
                    race: () => {
                        throw error;
                    },
                })
                .put({type: getType(registerAsync.failure), payload: error.message})
                .dispatch({type: getType(registerAsync.request), payload: regInfo})
                .hasFinalState({REGISTER: {error: error.message}})
                .silentRun();
        });
    });

    describe('loginSaga', () => {
        const loginInfo: LoginInfo = {
            email: 'example@demo.com',
            password: 'mytestpassword123',
        };

        test('when login is successful it sets auth state token', () => {
            return expectSaga(authSaga)
                .withReducer(authReducer)
                .provide({
                    race: () => ({response: token}),
                })
                .put({type: getType(loginAsync.success), payload: token})
                .dispatch({type: getType(loginAsync.request), payload: loginInfo})
                .hasFinalState({token: token.token})
                .silentRun();
        });

        test('when login is successful it clears error state', () => {
            return expectSaga(authSaga)
                .withReducer(errorReducer, {LOGIN: {error: 'Failure'}})
                .provide({
                    race: () => ({response: token}),
                })
                .put({type: getType(loginAsync.success), payload: token})
                .dispatch({type: getType(loginAsync.request), payload: loginInfo})
                .hasFinalState({LOGIN: {error: null}})
                .silentRun();
        });

        test('when login fails due to invalid input it sets error state to error message', () => {
            const error = new Error('Incorrect password');
            return expectSaga(authSaga)
                .withReducer(errorReducer, {LOGIN: {error: null}})
                .provide({
                    race: () => {
                        throw error;
                    },
                })
                .put({type: getType(loginAsync.failure), payload: error.message})
                .dispatch({type: getType(loginAsync.request), payload: loginInfo})
                .hasFinalState({LOGIN: {error: error.message}})
                .silentRun();
        });

        test('when login fails due to timeout it sets error to error message', () => {
            const error = new TimeoutError();
            return expectSaga(authSaga)
                .withReducer(errorReducer, {LOGIN: {error: null}})
                .provide({
                    race: () => {
                        throw error;
                    },
                })
                .put({type: getType(loginAsync.failure), payload: error.message})
                .dispatch({type: getType(loginAsync.request), payload: loginInfo})
                .hasFinalState({LOGIN: {error: error.message}})
                .silentRun();
        });
    });
});
