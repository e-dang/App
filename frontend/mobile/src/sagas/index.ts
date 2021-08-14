import {all} from 'redux-saga/effects';
import users from './usersSagas';
import {authFlowSaga} from './authSagas';

export * from './authSagas';

export default function* root() {
    yield all([users(), authFlowSaga()]);
}
