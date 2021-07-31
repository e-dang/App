import {registerAsync} from '@src/actions/authActions';
import registrationReducer from '@src/reducers/authReducer';
import authSaga from '@src/sagas/authSagas';
import {RegistrationInfo} from '@src/types/auth';
import {TimeoutError} from '@src/utils/errors';
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
            .withReducer(registrationReducer)
            .provide({
                race: () => ({response: null}),
            })
            .put({type: getType(registerAsync.success), payload: null})
            .dispatch({type: getType(registerAsync.request), payload: regInfo})
            .hasFinalState({error: null})
            .silentRun();
    });

    test('registration fails due to invalid input', () => {
        const error = new Error('Invalid password');
        return expectSaga(authSaga)
            .withReducer(registrationReducer)
            .provide({
                race: () => {
                    throw error;
                },
            })
            .put({type: getType(registerAsync.failure), payload: error})
            .dispatch({type: getType(registerAsync.request), payload: regInfo})
            .hasFinalState({error: error.message})
            .silentRun();
    });

    test('registration fails due to timeout', () => {
        const error = new TimeoutError();
        return expectSaga(authSaga)
            .withReducer(registrationReducer)
            .provide({
                race: () => {
                    throw error;
                },
            })
            .put({type: getType(registerAsync.failure), payload: error})
            .dispatch({type: getType(registerAsync.request), payload: regInfo})
            .hasFinalState({error: error.message})
            .silentRun();
    });
});
