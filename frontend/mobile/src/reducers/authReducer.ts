import {AuthAction, loginAsync, registerAsync} from '@actions';
import {Token} from '@src/types/auth';
import {createReducer} from 'typesafe-actions';

export interface AuthState {
    token: Token | null;
}

const authInitialState: AuthState = {
    token: null,
};

export const authReducer = createReducer<AuthState, AuthAction>(authInitialState)
    .handleAction(registerAsync.success, (state, action) => ({...state, token: action.payload.token}))
    .handleAction(loginAsync.success, (state, action) => ({...state, token: action.payload.token}));
