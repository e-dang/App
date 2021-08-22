import {all} from 'redux-saga/effects';
import {authFlowSaga, backgroundTaskRoot} from './authSagas';

export * from './authSagas';

export default function* root() {
    yield all([authFlowSaga(backgroundTaskRoot)]);
}
