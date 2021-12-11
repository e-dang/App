import {createSlice, PayloadAction} from '@reduxjs/toolkit';
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
        setCredentials: (state, action: PayloadAction<AuthToken>) => {
            state.token = action.payload;
        },
        setAuthUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        refreshToken: (state, action: PayloadAction<string>) => {
            if (state.token !== null) {
                state.token.accessToken = action.payload;
            }
        },
        signOut: (_) => {
            return initialState;
        },
    },
});

export const {setCredentials, setAuthUser, refreshToken, signOut} = authSlice.actions;
export const authReducer = authSlice.reducer;
