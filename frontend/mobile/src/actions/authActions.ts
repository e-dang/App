import {createAction, createAsyncAction} from 'typesafe-actions';
import {AuthToken} from '@src/types';
import {SignUpRequest, SignInRequest, ForgotPasswordRequest, SignOutRequest} from '@api';

export const signUpAsync = createAsyncAction('SIGN_UP_REQUEST', 'SIGN_UP_SUCCESS', 'SIGN_UP_FAILURE', 'SIGN_UP_CANCEL')<
    SignUpRequest,
    AuthToken,
    Error,
    undefined
>();

export const signInAsync = createAsyncAction('SIGN_IN_REQUEST', 'SIGN_IN_SUCCESS', 'SIGN_IN_FAILURE', 'SIGN_IN_CANCEL')<
    SignInRequest,
    AuthToken,
    Error,
    undefined
>();

export const signOut = createAction('SIGN_OUT')<SignOutRequest>();

export const forgotPasswordAsync = createAsyncAction(
    'FORGOT_PASSWORD_REQUEST',
    'FORGOT_PASSWORD_SUCCESS',
    'FORGOT_PASSWORD_FAILURE',
)<ForgotPasswordRequest, string, Error>();
