import {baseApi} from './baseApi';
import {Email, Name, Password, Token, User} from '@src/types';

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

export interface AuthenticationResponse {
    access_token: Token;
    refresh_token: Token;
    user: User;
}

export const authApi = baseApi.injectEndpoints({
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

export const {useSignInMutation, useSignUpMutation, useSignOutMutation, useForgotPasswordMutation} = authApi;
