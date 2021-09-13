import {ForgotPasswordRequest, SignInRequest, SignOutRequest, SignUpRequest} from '@api';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
    BaseQueryFn,
    createApi,
    FetchArgs,
    fetchBaseQuery,
    FetchBaseQueryError,
} from '@reduxjs/toolkit/dist/query/react';
import {selectAuthToken} from '@selectors';
import {AuthToken, User} from '@src/types';
import {RootState} from '@store';

const BASE_URL = 'https://dev.erickdang.com/api/v1/';

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

const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, {getState}) => {
        const token = selectAuthToken(getState() as RootState);
        if (token) {
            headers.set('Authorization', `Bearer ${token.accessToken}`);
        }
        return headers;
    },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions,
) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        const refreshResult = await baseQuery('token/refresh/', api, extraOptions);

        if (refreshResult.data) {
            api.dispatch(refreshToken(refreshResult.data as string));
            result = await baseQuery(args, api, extraOptions);
        } else {
            api.dispatch(signOut());
        }
    }
    return result;
};

export interface AuthenticationResponse {
    access_token: string;
    refresh_token: string;
    user: User;
}

export const api = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        signIn: builder.mutation<AuthenticationResponse, SignInRequest>({
            query: (credentials) => ({
                url: 'login/',
                method: 'POST',
                body: credentials,
            }),
        }),
        signUp: builder.mutation<AuthenticationResponse, SignUpRequest>({
            query: (credentials) => ({
                url: 'registration/',
                method: 'POST',
                body: credentials,
            }),
        }),
        signOut: builder.mutation<void, SignOutRequest>({
            query: (refreshToken) => ({
                url: 'logout/',
                method: 'POST',
                body: refreshToken,
            }),
        }),
        forgotPassword: builder.mutation<void, ForgotPasswordRequest>({
            query: (email) => ({
                url: 'password/reset/',
                method: 'POST',
                body: email,
            }),
        }),
    }),
});

export const {useSignInMutation, useSignUpMutation, useSignOutMutation, useForgotPasswordMutation} = api;
