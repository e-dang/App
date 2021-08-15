import Client from '@api/client';
import {AuthToken, Email, Name, Password, Token} from '@src/types';

export interface DetailResponse {
    detail?: string;
}
export interface SignUpInfo {
    name: Name;
    email: Email;
    password1: Password;
    password2: Password;
}

export interface SignInInfo {
    email: Email;
    password: Password;
}

export interface SignUpResponse extends DetailResponse {
    key?: Token;
}

export interface SignInResponse extends DetailResponse {
    key?: Token;
}

export interface ForgotPasswordRequest {
    email: Email;
}

export class AuthApi {
    static readonly timeout = 60000;
    private static client = Client;

    static async signUp(signUpInfo: SignUpInfo): Promise<AuthToken> {
        const resp = await AuthApi.client.post<SignUpInfo, SignUpResponse>('/registration/', signUpInfo);

        if (resp.status !== 201) {
            throw new Error(resp.data.detail);
        }

        const authToken = {token: resp.data.key} as AuthToken;
        AuthApi.client.setAuthToken(authToken);
        return authToken;
    }

    static async signIn(signInInfo: SignInInfo): Promise<AuthToken> {
        const resp = await AuthApi.client.post<SignInInfo, SignInResponse>('/login/', signInInfo);

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

    static async forgotPassword(email: Email): Promise<string> {
        const resp = await AuthApi.client.post<ForgotPasswordRequest, DetailResponse>('/password/reset/', {email});

        if (resp.status !== 200) {
            throw new Error(resp.data.detail);
        }

        return resp.data.detail as string;
    }
}
