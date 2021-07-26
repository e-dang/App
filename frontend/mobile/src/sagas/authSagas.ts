import AuthApi from '@api/authApi';
import {call, delay, put, race, take, takeLatest} from 'redux-saga/effects';
import {registerAsync} from '@actions/authActions';

export function* registerSaga(action: ReturnType<typeof registerAsync.request>) {
    try {
        yield race({
            response: call(AuthApi.register, action.payload),
            failed: take(registerAsync.failure),
            timeout: delay(60000),
        });
        yield put(registerAsync.success());
    } catch (error) {
        yield put(registerAsync.failure(error));
    }
}

export default function* root() {
    yield takeLatest(registerAsync.request, registerSaga);
}
