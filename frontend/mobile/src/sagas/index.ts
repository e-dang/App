import {all, call, spawn} from 'redux-saga/effects';
import {authFlowSaga, watchRefreshToken} from './authSagas';
import {backgroundAuthUserSaga, watchGetAuthUserSaga} from './userSagas';

export * from './authSagas';

export function* backgroundTaskRoot() {
    yield all([backgroundAuthUserSaga()]);
}

export function* watchers() {
    const sagas = [watchRefreshToken, watchGetAuthUserSaga];
    yield all(
        sagas.map((saga) =>
            spawn(function* () {
                while (true) {
                    try {
                        yield call(saga);
                        break;
                    } catch (e) {
                        console.log(e);
                    }
                }
            }),
        ),
    );
}

export default function* root() {
    yield all([authFlowSaga(backgroundTaskRoot), watchers()]);
}
