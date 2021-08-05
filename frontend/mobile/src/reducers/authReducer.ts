'use strict';
import {AuthAction, loginAsync, registerAsync} from '@actions';
import {createReducer} from 'typesafe-actions';

export interface RegistrationState {
    error?: string | null;
}

export interface AuthState {
    token: string | null;
}

const initialState: RegistrationState = {};

const loginInitialState: AuthState = {
    token: null,
};

export const registrationReducer = createReducer<RegistrationState, AuthAction>(initialState)
    .handleAction(registerAsync.success, (state, action) => ({...state, error: null}))
    .handleAction(registerAsync.failure, (state, action) => ({...state, error: action.payload.message}));

export const loginReducer = createReducer<AuthState, AuthAction>(loginInitialState)
    .handleAction(loginAsync.success, (state, action) => ({...state, token: action.payload.token}))
    .handleAction(loginAsync.failure, (state, action) => ({...state, error: action.payload.message}));
