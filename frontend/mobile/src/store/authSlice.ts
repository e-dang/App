import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AuthenticationResponse} from '@api';
import {AuthToken, User} from '@src/types';

export interface AuthState {
    user: User | null;
    token: AuthToken | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<AuthenticationResponse>) => {
            state.token = {accessToken: action.payload.access_token, refreshToken: action.payload.refresh_token};
            state.user = action.payload.user;
        },
        refreshToken: (state, action: PayloadAction<string>) => {
            if (state.token !== null) {
                state.token.accessToken = action.payload;
            }
        },
        signOut: (state) => {
            return initialState;
        },
    },
});

export const {setCredentials, refreshToken, signOut} = authSlice.actions;
export const authReducer = authSlice.reducer;
