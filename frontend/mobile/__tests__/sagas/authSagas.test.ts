import {registerAsync} from '@actions';
import {errorReducer} from '@reducers';
import authSaga from '@sagas';
import {RegistrationInfo} from '@src/types/auth';
import {TimeoutError} from '@utils';
import {expectSaga} from 'redux-saga-test-plan';
import {getType} from 'typesafe-actions';

describe('registerSaga', () => {
    const regInfo: RegistrationInfo = {
        name: 'Test User',
        email: 'testemail@demo.com',
        password1: 'password123',
        password2: 'password123',
    };

    test('registration is successfull', () => {
        return expectSaga(authSaga)
            .withReducer(errorReducer)
            .provide({
                race: () => ({response: null}),
            })
            .put({type: getType(registerAsync.success)})
            .dispatch({type: getType(registerAsync.request), payload: regInfo})
            .hasFinalState({REGISTER: {error: null}})
            .silentRun();
    });

    test('registration fails due to invalid input', () => {
        const error = new Error('Invalid password');
        return expectSaga(authSaga)
            .withReducer(errorReducer)
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
            .withReducer(errorReducer)
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
