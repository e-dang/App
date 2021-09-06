import {getAuthUserAsync} from '@actions';
import {UserApi} from '@api';
import {errorReducer, usersReducer} from '@reducers';
import {backgroundAuthUserSaga, getAuthUserSaga} from '@sagas/userSagas';
import {User} from '@src/types';
import {refreshTokenSagaProducer, timeout} from '@utils';
import {mock} from 'jest-mock-extended';
import {expectSaga} from 'redux-saga-test-plan';
import {throwError} from 'redux-saga-test-plan/providers';
import {call, race} from 'redux-saga/effects';

describe('userSagas', () => {
    describe('getAuthUserSaga', () => {
        test('when api call is successful it sets authUser in user state to the returned user', () => {
            const response = mock<User>();
            const raceObj = {response: call(UserApi.getAuthUser), timeout: call(timeout, UserApi.timeout)};

            return expectSaga(getAuthUserSaga, getAuthUserAsync.request())
                .withReducer(usersReducer, {})
                .provide([
                    [call(refreshTokenSagaProducer), undefined],
                    [race(raceObj), {response}],
                ])
                .race(raceObj)
                .put(getAuthUserAsync.success(response))
                .returns(true)
                .hasFinalState({authUser: response})
                .silentRun();
        });

        test('when api call fails it sets the error state to the detail response', () => {
            const error = new Error('Failure');
            const raceObj = {response: call(UserApi.getAuthUser), timeout: call(timeout, UserApi.timeout)};
            return expectSaga(getAuthUserSaga, getAuthUserAsync.request())
                .withReducer(errorReducer, {})
                .provide([
                    [call(refreshTokenSagaProducer), undefined],
                    [race(raceObj), throwError(error)],
                ])
                .race(raceObj)
                .put(getAuthUserAsync.failure(error))
                .returns(false)
                .hasFinalState({GET_AUTH_USER: {error: error.message}})
                .silentRun();
        });
    });

    describe('backgroundAuthUserSaga', () => {
        test('dispatches getAuthUserAsync request action once per time interval', () => {
            return expectSaga(backgroundAuthUserSaga).put(getAuthUserAsync.request()).delay(60000).silentRun();
        });
    });
});
