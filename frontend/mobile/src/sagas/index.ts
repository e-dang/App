import {all} from 'redux-saga/effects';
import users from './usersSagas';
import {authFlow} from './authSagas';

export * from './authSagas';

export default function* root() {
    yield all([users(), authFlow()]);
}
