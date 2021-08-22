import {AuthAction, refreshTokenAsync, signInAsync, signUpAsync} from '@actions';
import {AuthToken} from '@src/types';
import {createReducer} from 'typesafe-actions';

export interface AuthState {
    token: AuthToken | null;
}

const authInitialState: AuthState = {
    token: null,
};

export const authReducer = createReducer<AuthState, AuthAction>(authInitialState)
    .handleAction(signUpAsync.success, (state, action) => ({...state, token: action.payload}))
    .handleAction(signInAsync.success, (state, action) => ({...state, token: action.payload}))
    .handleAction(refreshTokenAsync.success, (state, action) => ({...state, token: action.payload}));
