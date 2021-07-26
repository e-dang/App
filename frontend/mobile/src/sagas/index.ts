import {all} from 'redux-saga/effects';
import users from './usersSagas';
import auth from './authSagas';

export default function* root() {
    yield all([users(), auth()]);
}
