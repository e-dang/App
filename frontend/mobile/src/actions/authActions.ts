import {createAsyncAction} from 'typesafe-actions';
import {AuthToken, LoginInfo, RegistrationInfo} from '@src/types/auth';

export const registerAsync = createAsyncAction(
    ['REGISTER_REQUEST', (registrationInfo: RegistrationInfo) => registrationInfo],
    ['REGISTER_SUCCESS', (resp: AuthToken) => resp],
    ['REGISTER_FAILURE', (err: Error) => err.message],
    'REGISTER_CANCEL',
)();

export const loginAsync = createAsyncAction(
    ['LOGIN_REQUEST', (loginInfo: LoginInfo) => loginInfo],
    ['LOGIN_SUCCESS', (resp: AuthToken) => resp],
    ['LOGIN_FAILURE', (err: Error) => err.message],
    'LOGIN_CANCEL',
)();
