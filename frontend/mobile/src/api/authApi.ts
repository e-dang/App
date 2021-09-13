import {baseApi} from './baseApi';
import {AuthToken, Email, Name, Password, Token, User} from '@src/types';

export interface DetailResponse {
    detail?: string;
}
export interface SignUpRequest {
    name: Name;
    email: Email;
    password1: Password;
    password2: Password;
}

export interface SignInRequest {
    email: Email;
    password: Password;
}

export interface SignOutRequest {
    refresh: Token;
}

export interface ForgotPasswordRequest {
    email: Email;
}

export interface RefreshTokenRequest {
    refresh: Token;
}

export interface TokenResponse extends DetailResponse {
    access_token?: Token;
    refresh_token?: Token;
}

export interface AuthenticationResponse {
    access_token: string;
    refresh_token: string;
    user: User;
}

const extendedApi = baseApi.injectEndpoints({
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

export const {useSignInMutation, useSignUpMutation, useSignOutMutation, useForgotPasswordMutation} = extendedApi;
