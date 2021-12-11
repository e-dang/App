import {baseApi} from './baseApi';
import {AuthToken} from '@src/types';

export interface SignUpRequest {
    name: string;
    email: string;
    password: string;
}

export interface SignInRequest {
    email: string;
    password: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface AuthenticationResponse {
    data: AuthToken;
}

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        signIn: builder.mutation<AuthenticationResponse, SignInRequest>({
            query: (credentials) => ({
                url: 'auth/signin/',
                method: 'POST',
                body: credentials,
            }),
        }),
        signUp: builder.mutation<AuthenticationResponse, SignUpRequest>({
            query: (credentials) => ({
                url: 'auth/signup/',
                method: 'POST',
                body: credentials,
            }),
        }),
        signOut: builder.mutation<void, void>({
            query: () => ({
                url: 'auth/signout/',
                method: 'POST',
            }),
        }),
        forgotPassword: builder.mutation<void, ForgotPasswordRequest>({
            query: (email) => ({
                url: 'auth/password/reset/',
                method: 'POST',
                body: email,
            }),
        }),
    }),
});

export const {useSignInMutation, useSignUpMutation, useSignOutMutation, useForgotPasswordMutation} = authApi;
