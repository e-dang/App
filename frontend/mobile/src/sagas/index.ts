import {all} from 'redux-saga/effects';
import {authFlowSaga} from './authSagas';

export * from './authSagas';

export default function* root() {
    yield all([authFlowSaga()]);
}
