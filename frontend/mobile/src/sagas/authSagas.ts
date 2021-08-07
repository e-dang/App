import {AuthApi} from '@api';
import {all, call, put, race, take, takeLatest} from 'redux-saga/effects';
import {loginAsync, registerAsync} from '@actions';
import {timeout} from '@utils';

export function* registerSaga(action: ReturnType<typeof registerAsync.request>) {
    try {
        const {response} = yield race({
            response: call(AuthApi.register, action.payload),
            failed: take(registerAsync.failure),
            timeout: call(timeout, AuthApi.timeout),
        });
        yield put(registerAsync.success(response));
    } catch (error) {
        yield put(registerAsync.failure(error));
    }
}

export function* loginSaga(action: ReturnType<typeof loginAsync.request>) {
    try {
        const {response} = yield race({
            response: call(AuthApi.login, action.payload),
            failed: take(loginAsync.failure),
            timeout: call(timeout, AuthApi.timeout),
        });
        yield put(loginAsync.success(response));
    } catch (error) {
        yield put(loginAsync.failure(error));
    }
}

export function* watchRegister() {
    yield takeLatest(registerAsync.request, registerSaga);
}

export function* watchLogin() {
    yield takeLatest(loginAsync.request, loginSaga);
}

export default function* root() {
    yield all([watchRegister(), watchLogin()]);
}
