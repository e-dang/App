import {createAction, createAsyncAction} from 'typesafe-actions';
import {AuthToken, Email, LoginInfo, RegistrationInfo} from '@src/types';

export const registerAsync = createAsyncAction(
    ['REGISTER_REQUEST', (registrationInfo: RegistrationInfo) => registrationInfo],
    ['REGISTER_SUCCESS', (resp: AuthToken) => resp],
    ['REGISTER_FAILURE', (err: Error) => err],
    'REGISTER_CANCEL',
)();

export const loginAsync = createAsyncAction(
    ['LOGIN_REQUEST', (loginInfo: LoginInfo) => loginInfo],
    ['LOGIN_SUCCESS', (resp: AuthToken) => resp],
    ['LOGIN_FAILURE', (err: Error) => err],
    'LOGIN_CANCEL',
)();

export const logout = createAction('LOGOUT')();

export const forgotPasswordAsync = createAsyncAction(
    ['FORGOT_PASSWORD_REQUEST', (email: Email) => email],
    ['FORGOT_PASSWORD_SUCCESS', (msg: string) => msg],
    ['FORGOT_PASSWORD_FAILURE', (err: Error) => err],
)();
