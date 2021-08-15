import Client from '@api/client';
import {
    AuthToken,
    DetailResponse,
    Email,
    ForgotPasswordRequest,
    LoginInfo,
    LoginResponse,
    RegistrationInfo,
    RegistrationResponse,
} from '@src/types';

export class AuthApi {
    static readonly timeout = 60000;
    private static client = Client;

    static async register(registrationInfo: RegistrationInfo): Promise<AuthToken> {
        const resp = await AuthApi.client.post<RegistrationInfo, RegistrationResponse>(
            '/registration/',
            registrationInfo,
        );

        if (resp.status !== 201) {
            throw new Error(resp.data.detail);
        }

        const authToken = {token: resp.data.key} as AuthToken;
        AuthApi.client.setAuthToken(authToken);
        return authToken;
    }

    static async login(loginInfo: LoginInfo): Promise<AuthToken> {
        const resp = await AuthApi.client.post<LoginInfo, LoginResponse>('/login/', loginInfo);

        if (resp.status !== 200) {
            throw new Error(resp.data.detail);
        }

        const authToken = {token: resp.data.key} as AuthToken;
        AuthApi.client.setAuthToken(authToken);
        return authToken;
    }

    static async logout(): Promise<void> {
        // logout should never fail on the client side. If something causes the request to fail the backend
        // should invalidate old auth tokens upon successful re-login. This is why auth tokens shouldnt be valid
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
