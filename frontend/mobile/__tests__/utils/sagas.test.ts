import {refreshTokenAsync} from '@actions';
import {AuthApi} from '@api';
import {isAuthTokenValid, selectAuthToken} from '@selectors';
import {AuthToken} from '@src/types';
import {refreshTokenSagaConsumer, refreshTokenSagaProducer, timeout} from '@utils';
import {mock} from 'jest-mock-extended';
import {expectSaga} from 'redux-saga-test-plan';
import {throwError} from 'redux-saga-test-plan/providers';
import {call, race, select} from 'redux-saga/effects';
import {authReducer} from '@reducers';

describe('saga utils', () => {
    const token: AuthToken = {
        accessToken:
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjI5NTc3MzM4LCJqdGkiOiIzMmZmZjliODFlZTA0YjY4ODk0MmIwZjQ2NjY5ZjBmMCIsInVzZXJfaWQiOjd9.-gGrjt78TsZW4aT0-_YCOYxkDTvykeuA4o1OIyfgnz8',
        refreshToken:
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTYyOTY2MzQzOCwianRpIjoiNzZiOGNkZjNjNzM4NGJlOGFmY2QzM2M3MmMwOWYzM2QiLCJ1c2VyX2lkIjo3fQ.9QZ9-B3QzqAtfttbgWVrtP9rxxvhhl-bpHoi6ITDF-w',
    };
    const requestAction = refreshTokenAsync.request({refresh: token.refreshToken});

    describe('refreshTokenSagaProducer', () => {
        test('if token is valid it immediately returns', () => {
            return expectSaga(refreshTokenSagaProducer)
                .provide([[select(isAuthTokenValid), true]])
                .select(isAuthTokenValid)
                .returns(undefined)
                .silentRun();
        });

        test('if token is invalid it dispatches refresh token request and waits for success', () => {
            const newToken: AuthToken = {
                accessToken: '',
                refreshToken: '',
            };
            return expectSaga(refreshTokenSagaProducer)
                .provide([
                    [select(isAuthTokenValid), false],
                    [select(selectAuthToken), token],
                ])
                .select(isAuthTokenValid)
                .select(selectAuthToken)
                .put(requestAction)
                .take([refreshTokenAsync.success, refreshTokenAsync.failure])
                .dispatch(refreshTokenAsync.success(newToken))
                .silentRun();
        });

        test('if token is invalid and refresh token request fails it throws an error', () => {
            // mock out console error because test still writes to it when it passes because of thrown error
            const console = global.console.error;
            global.console.error = jest.fn();

            const error = new Error('failure');
            return expectSaga(refreshTokenSagaProducer)
                .provide([
                    [select(isAuthTokenValid), false],
                    [select(selectAuthToken), token],
                ])
                .select(isAuthTokenValid)
                .select(selectAuthToken)
                .put(requestAction)
                .take([refreshTokenAsync.success, refreshTokenAsync.failure])
                .dispatch(refreshTokenAsync.failure(error))
                .throws(error)
                .silentRun()
                .finally(() => (global.console.error = console));
        });
    });

    describe('refreshTokenSagaConsumer', () => {
        test('if token is valid it immediately dispatches success with the token and returns', () => {
            return expectSaga(refreshTokenSagaConsumer, requestAction)
                .withReducer(authReducer, {token})
                .provide([
                    [select(isAuthTokenValid), true],
                    [select(selectAuthToken), token],
                ])
                .select(isAuthTokenValid)
                .select(selectAuthToken)
                .put(refreshTokenAsync.success(token))
                .returns(undefined)
                .hasFinalState({token})
                .silentRun();
        });

        test('if token is invalid it calls refreshToken on auth api and dispatches the new auth token in a success action', () => {
            const response = mock<AuthToken>();
            const raceObj = {
                response: call(AuthApi.refreshToken, requestAction.payload),
                timeout: call(timeout, AuthApi.timeout),
            };
            return expectSaga(refreshTokenSagaConsumer, requestAction)
                .withReducer(authReducer, {token})
                .provide([
                    [select(isAuthTokenValid), false],
                    [race(raceObj), {response}],
                ])
                .select(isAuthTokenValid)
                .race(raceObj)
                .put(refreshTokenAsync.success(response))
                .returns(undefined)
                .hasFinalState({token: response})
                .silentRun();
        });

        test('if token is invalid and the call refreshToken on auth api fails, it dispatches failure with the api error', () => {
            const error = new Error('Failure');
            const raceObj = {
                response: call(AuthApi.refreshToken, requestAction.payload),
                timeout: call(timeout, AuthApi.timeout),
            };
            return expectSaga(refreshTokenSagaConsumer, requestAction)
                .provide([
                    [select(isAuthTokenValid), false],
                    [race(raceObj), throwError(error)],
                ])
                .select(isAuthTokenValid)
                .race(raceObj)
                .put(refreshTokenAsync.failure(error))
                .returns(undefined)
                .silentRun();
        });
    });
});
