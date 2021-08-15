import {createAction, createAsyncAction} from 'typesafe-actions';
import {AuthToken, Email, SignInInfo, RegistrationInfo} from '@src/types';

export const registerAsync = createAsyncAction(
    ['REGISTER_REQUEST', (registrationInfo: RegistrationInfo) => registrationInfo],
    ['REGISTER_SUCCESS', (resp: AuthToken) => resp],
    ['REGISTER_FAILURE', (err: Error) => err],
    'REGISTER_CANCEL',
)();

export const signInAsync = createAsyncAction(
    ['SIGN_IN_REQUEST', (signInInfo: SignInInfo) => signInInfo],
    ['SIGN_IN_SUCCESS', (resp: AuthToken) => resp],
    ['SIGN_IN_FAILURE', (err: Error) => err],
    'SIGN_IN_CANCEL',
)();

export const logout = createAction('LOGOUT')();

export const forgotPasswordAsync = createAsyncAction(
    ['FORGOT_PASSWORD_REQUEST', (email: Email) => email],
    ['FORGOT_PASSWORD_SUCCESS', (msg: string) => msg],
    ['FORGOT_PASSWORD_FAILURE', (err: Error) => err],
)();
