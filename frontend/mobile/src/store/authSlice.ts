import {SignInRequest, SignUpRequest} from '@api';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AuthToken} from '@src/types';
import {ApiResourceState} from './types';
import {createAsyncActionGroup} from './utils';

export interface AuthState extends ApiResourceState {
    token: AuthToken | null;
}

const initialState: AuthState = {
    token: null,
    pending: false,
    lastFetch: null,
    lastError: null,
    error: null,
};

export const signUpAsync = createAsyncActionGroup<SignUpRequest, AuthToken, Error>(
    'SIGN_UP_REQUEST',
    'SIGN_UP_SUCCESS',
    'SIGN_UP_FAILURE',
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(signUpAsync.request, (state) => {
                state.pending = true;
            })
            .addCase(signUpAsync.success, (state, action) => {
                state.pending = false;
                state.token = action.payload;
                state.lastFetch = Date.now();
                state.error = null;
            })
            .addCase(signUpAsync.failure, (state, action: PayloadAction<Error>) => {
                state.pending = false;
                state.lastError = Date.now();
                state.error = action.payload.message;
            });
    },
});

export const authReducer = authSlice.reducer;
