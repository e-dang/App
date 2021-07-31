import AuthApi from '@api/authApi';
import {call, put, race, take, takeLatest} from 'redux-saga/effects';
import {registerAsync} from '@actions/authActions';
import {timeout} from '@src/utils/async';

export function* registerSaga(action: ReturnType<typeof registerAsync.request>) {
    try {
        yield race({
            response: call(AuthApi.register, action.payload),
            failed: take(registerAsync.failure),
            timeout: call(timeout, AuthApi.timeout),
        });
        yield put(registerAsync.success());
    } catch (error) {
        yield put(registerAsync.failure(error));
    }
}

export default function* root() {
    yield takeLatest(registerAsync.request, registerSaga);
}
