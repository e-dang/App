import {getAuthUserAsync} from '@actions';
import {UserApi} from '@api';
import {createAuthApiSaga} from '@utils';
import {delay, put, takeLeading} from 'redux-saga/effects';

export const getAuthUserSaga = createAuthApiSaga(getAuthUserAsync, UserApi.getAuthUser, UserApi.timeout);

export function* backgroundAuthUserSaga() {
    while (true) {
        yield put(getAuthUserAsync.request());
        yield delay(60000);
    }
}

export function* watchGetAuthUserSaga() {
    yield takeLeading(getAuthUserAsync.request, getAuthUserSaga);
}
