import {AuthApi} from '@api';
import {call, cancel, fork, delay, take} from 'redux-saga/effects';
import {forgotPasswordAsync, signInAsync, signOut, signUpAsync} from '@actions';
import {createAsyncSaga} from '@utils';
import {ActionType, getType} from 'typesafe-actions';
import {persistor} from '@src/store';
import {Task} from 'redux-saga';
import {AnyAction} from 'redux';

export const signUpSaga = createAsyncSaga(signUpAsync, AuthApi.signUp, AuthApi.timeout);
export const signInSaga = createAsyncSaga(signInAsync, AuthApi.signIn, AuthApi.timeout);
export const forgotPasswordSaga = createAsyncSaga(forgotPasswordAsync, AuthApi.forgotPassword, AuthApi.timeout);

export function* backgroundTask() {
    while (true) {
        console.log('stuff');
        yield delay(60000);
    }
}

export function* authFlowSaga() {
    while (true) {
        const action: AnyAction = yield take([signUpAsync.request, signInAsync.request, forgotPasswordAsync.request]);

        let shouldContinue: boolean;
        if (action.type === getType(signUpAsync.request)) {
            shouldContinue = yield call(signUpSaga, action as ReturnType<typeof signUpAsync.request>);
        } else if (action.type === getType(signInAsync.request)) {
            shouldContinue = yield call(signInSaga, action as ReturnType<typeof signInAsync.request>);
        } else {
            yield call(forgotPasswordSaga, action as ReturnType<typeof forgotPasswordAsync.request>);
            shouldContinue = false;
        }

        if (!shouldContinue) {
            continue;
        }
        const task: Task = yield fork(backgroundTask);

        const signOutAction: ActionType<typeof signOut> = yield take(signOut);
        yield cancel(task);
        yield call(AuthApi.signOut, signOutAction.payload);
        yield call(persistor.purge);
    }
}
