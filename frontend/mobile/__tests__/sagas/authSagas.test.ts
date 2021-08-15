import {forgotPasswordAsync, signInAsync, signOut, signUpAsync} from '@actions';
import {authReducer, errorReducer} from '@reducers';
import {signUpSaga, signInSaga, authFlowSaga, backgroundTask, forgotPasswordSaga} from '@sagas';
import {AuthToken, SignInInfo, RegistrationInfo} from '@src/types';
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
    const signInInfo: SignInInfo = {
        email: 'example@demo.com',
        password: 'mytestpassword123',
    };
    const regInfo: RegistrationInfo = {
        name: 'Test User',
        email: 'testemail@demo.com',
        password1: 'password123',
        password2: 'password123',
    };

    describe('signUpSaga', () => {
        const signUpObj = {response: call(AuthApi.signUp, regInfo), timeout: call(timeout, AuthApi.timeout)};

        test('registration is successfull clears error state', () => {
            return expectSaga(signUpSaga, signUpAsync.request(regInfo))
                .withReducer(errorReducer, {SIGN_UP: {error: 'Failure'}})
                .provide({
                    race: () => ({response: token}),
                })
                .race(signUpObj)
                .put(signUpAsync.success(token))
                .hasFinalState({SIGN_UP: {error: null}})
                .returns(true)
                .silentRun();
        });

        test('registration is successfull sets auth state token', () => {
            return expectSaga(signUpSaga, signUpAsync.request(regInfo))
                .withReducer(authReducer, {token: null})
                .provide({
                    race: () => ({response: token}),
                })
                .race(signUpObj)
                .put(signUpAsync.success(token))
                .hasFinalState({token: token})
                .returns(true)
                .silentRun();
        });

        test('registration fails due to invalid input', () => {
            const error = new Error('Invalid password');
            return expectSaga(signUpSaga, signUpAsync.request(regInfo))
                .withReducer(errorReducer, {SIGN_UP: {error: null}})
                .provide({
                    race: () => {
                        throw error;
                    },
                })
                .race(signUpObj)
                .put(signUpAsync.failure(error))
                .hasFinalState({SIGN_UP: {error: error.message}})
                .returns(false)
                .silentRun();
        });

        test('registration fails due to timeout', () => {
            const error = new TimeoutError();
            return expectSaga(signUpSaga, signUpAsync.request(regInfo))
                .withReducer(errorReducer, {SIGN_UP: {error: null}})
                .provide({
                    race: () => {
                        throw error;
                    },
                })
                .race(signUpObj)
                .put(signUpAsync.failure(error))
                .hasFinalState({SIGN_UP: {error: error.message}})
                .returns(false)
                .silentRun();
        });
    });

    describe('signInSaga', () => {
        const signInRace = {response: call(AuthApi.signIn, signInInfo), timeout: call(timeout, AuthApi.timeout)};

        test('when signIn is successful it sets auth state token', () => {
            return expectSaga(signInSaga, signInAsync.request(signInInfo))
                .withReducer(authReducer)
                .provide({
                    race: () => ({response: token}),
                })
                .race(signInRace)
                .put(signInAsync.success(token))
                .hasFinalState({token: token})
                .returns(true)
                .silentRun();
        });

        test('when signIn is successful it clears error state', () => {
            return expectSaga(signInSaga, signInAsync.request(signInInfo))
                .withReducer(errorReducer, {SIGN_IN: {error: 'Failure'}})
                .provide({
                    race: () => ({response: token}),
                })
                .race(signInRace)
                .put(signInAsync.success(token))
                .hasFinalState({SIGN_IN: {error: null}})
                .returns(true)
                .silentRun();
        });

        test('when signIn fails due to invalid input it sets error state to error message', () => {
            const error = new Error('Incorrect password');
            return expectSaga(signInSaga, signInAsync.request(signInInfo))
                .withReducer(errorReducer, {SIGN_IN: {error: null}})
                .provide({
                    race: () => {
                        throw error;
                    },
                })
                .race(signInRace)
                .put(signInAsync.failure(error))
                .hasFinalState({SIGN_IN: {error: error.message}})
                .returns(false)
                .silentRun();
        });

        test('when signIn fails due to timeout it sets error to error message', () => {
            const error = new TimeoutError();

            return expectSaga(signInSaga, signInAsync.request(signInInfo))
                .withReducer(errorReducer, {SIGN_IN: {error: null}})
                .provide({
                    race: () => {
                        throw error;
                    },
                })
                .race(signInRace)
                .put(signInAsync.failure(error))
                .hasFinalState({SIGN_IN: {error: error.message}})
                .returns(false)
                .silentRun();
        });
    });

    describe('forgotPasswordSaga', () => {
        const forgotPasswordRace = {
            response: call(AuthApi.forgotPassword, signInInfo.email),
            timeout: call(timeout, AuthApi.timeout),
        };

        test('when forgot password is successful it clears error state', () => {
            const msg = 'Email sent';
            return expectSaga(forgotPasswordSaga, forgotPasswordAsync.request(signInInfo.email))
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
            return expectSaga(forgotPasswordSaga, forgotPasswordAsync.request(signInInfo.email))
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
            return expectSaga(forgotPasswordSaga, forgotPasswordAsync.request(signInInfo.email))
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
        const requestActions = [signUpAsync.request, signInAsync.request, forgotPasswordAsync.request];

        test('after successful registration, background tasks are started, and waits for signOut', () => {
            const action = signUpAsync.request(regInfo);
            return expectSaga(authFlowSaga)
                .provide([
                    [call(signUpSaga, action), true],
                    [fork(backgroundTask), createMockTask()],
                    [call(AuthApi.signOut), undefined],
                    [call(persistor.purge), undefined],
                ])
                .take(requestActions)
                .call(signUpSaga, action)
                .fork(backgroundTask)
                .take(signOut)
                .call(AuthApi.signOut)
                .call(persistor.purge)
                .take(requestActions)
                .dispatch(action)
                .dispatch(signOut())
                .silentRun();
        });

        test('after successful signIn, background tasks are started, and waits for signOut', () => {
            const action = signInAsync.request(signInInfo);
            return expectSaga(authFlowSaga)
                .provide([
                    [call(signInSaga, action), true],
                    [fork(backgroundTask), createMockTask()],
                    [call(AuthApi.signOut), undefined],
                    [call(persistor.purge), undefined],
                ])
                .take(requestActions)
                .call(signInSaga, action)
                .fork(backgroundTask)
                .take(signOut)
                .call(AuthApi.signOut)
                .call(persistor.purge)
                .take(requestActions)
                .dispatch(action)
                .dispatch(signOut())
                .silentRun();
        });

        test('after successful password reset, the saga waits for user to make an auth request action', () => {
            const action = forgotPasswordAsync.request(signInInfo.email);
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
