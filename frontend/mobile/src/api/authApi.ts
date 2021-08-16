import Client from '@api/client';
import {AuthToken, Email, Name, Password, Token} from '@src/types';

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

export interface ForgotPasswordRequest {
    email: Email;
}

export interface SignUpResponse extends DetailResponse {
    key?: Token;
}

export interface SignInResponse extends DetailResponse {
    key?: Token;
}

export class AuthApi {
    static readonly timeout = 60000;
    private static client = Client;

    static async signUp(request: SignUpRequest): Promise<AuthToken> {
        const resp = await AuthApi.client.post<SignUpRequest, SignUpResponse>('/registration/', request);

        if (resp.status !== 201) {
            throw new Error(resp.data.detail);
        }

        const authToken = {token: resp.data.key} as AuthToken;
        AuthApi.client.setAuthToken(authToken);
        return authToken;
    }

    static async signIn(request: SignInRequest): Promise<AuthToken> {
        const resp = await AuthApi.client.post<SignInRequest, SignInResponse>('/login/', request);

        if (resp.status !== 200) {
            throw new Error(resp.data.detail);
        }

        const authToken = {token: resp.data.key} as AuthToken;
        AuthApi.client.setAuthToken(authToken);
        return authToken;
    }

    static async signOut(): Promise<void> {
        // signOut should never fail on the client side. If something causes the request to fail the backend
        // should invalidate old auth tokens upon successful re-signIn. This is why auth tokens shouldnt be valid
        // for long periods of time
        await AuthApi.client.post<{}, DetailResponse>('/logout/', {});
        AuthApi.client.clearAuthToken();
    }

    static async forgotPassword(request: ForgotPasswordRequest): Promise<string> {
        const resp = await AuthApi.client.post<ForgotPasswordRequest, DetailResponse>('/password/reset/', request);

        if (resp.status !== 200) {
            throw new Error(resp.data.detail);
        }

        return resp.data.detail as string;
    }
}
