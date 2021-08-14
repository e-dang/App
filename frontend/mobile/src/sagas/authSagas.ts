import {AuthApi} from '@api';
import {call, cancel, fork, delay, take} from 'redux-saga/effects';
import {loginAsync, logout, registerAsync} from '@actions';
import {createAsyncSaga} from '@utils';
import {getType} from 'typesafe-actions';
import {persistor} from '@src/store';
import {Task} from 'redux-saga';
import {AnyAction} from 'redux';

export const registerSaga = createAsyncSaga(registerAsync, AuthApi.register, AuthApi.timeout);
export const loginSaga = createAsyncSaga(loginAsync, AuthApi.login, AuthApi.timeout);

export function* backgroundTask() {
    while (true) {
        console.log('stuff');
        yield delay(2000);
    }
}

export function* authFlowSaga() {
    while (true) {
        const action: AnyAction = yield take([registerAsync.request, loginAsync.request]);

        let successful: boolean;
        if (action.type === getType(registerAsync.request)) {
            successful = yield call(registerSaga, action as ReturnType<typeof registerAsync.request>);
        } else {
            successful = yield call(loginSaga, action as ReturnType<typeof loginAsync.request>);
        }

        if (!successful) {
            continue;
        }
        const task: Task = yield fork(backgroundTask);

        yield take(logout);
        yield call(AuthApi.logout);
        yield cancel(task);
        yield call(persistor.purge);
    }
}
