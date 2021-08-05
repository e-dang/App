import {AuthAction, loginAsync, registerAsync} from '@actions';
import {createReducer} from 'typesafe-actions';

export interface AuthState {
    token: string | null;
}

const loginInitialState: AuthState = {
    token: null,
};

export const loginReducer = createReducer<AuthState, AuthAction>(loginInitialState).handleAction(
    loginAsync.success,
    (state, action) => ({...state, token: action.payload.token}),
);
