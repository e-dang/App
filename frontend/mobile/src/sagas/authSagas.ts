import {AuthApi} from '@api';
import {call, cancel, fork, delay, take} from 'redux-saga/effects';
import {forgotPasswordAsync, loginAsync, logout, registerAsync} from '@actions';
import {createAsyncSaga} from '@utils';
import {getType} from 'typesafe-actions';
import {persistor} from '@src/store';
import {Task} from 'redux-saga';
import {AnyAction} from 'redux';

export const registerSaga = createAsyncSaga(registerAsync, AuthApi.register, AuthApi.timeout);
export const loginSaga = createAsyncSaga(loginAsync, AuthApi.login, AuthApi.timeout);
export const forgotPasswordSaga = createAsyncSaga(forgotPasswordAsync, AuthApi.forgotPassword, AuthApi.timeout);

export function* backgroundTask() {
    while (true) {
        console.log('stuff');
        yield delay(60000);
    }
}

export function* authFlowSaga() {
    while (true) {
        const action: AnyAction = yield take([registerAsync.request, loginAsync.request, forgotPasswordAsync.request]);

        let shouldContinue: boolean;
        if (action.type === getType(registerAsync.request)) {
            shouldContinue = yield call(registerSaga, action as ReturnType<typeof registerAsync.request>);
        } else if (action.type === getType(loginAsync.request)) {
            shouldContinue = yield call(loginSaga, action as ReturnType<typeof loginAsync.request>);
        } else {
            yield call(forgotPasswordSaga, action as ReturnType<typeof forgotPasswordAsync.request>);
            shouldContinue = false;
        }

        if (!shouldContinue) {
            continue;
        }
        const task: Task = yield fork(backgroundTask);

        yield take(logout);
        yield cancel(task);
        yield call(AuthApi.logout);
        yield call(persistor.purge);
    }
}
