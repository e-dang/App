import Client from '@api/client';
import {AuthToken, LoginInfo, LoginResponse, LogoutResponse, RegistrationInfo, RegistrationResponse} from '@src/types';

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
        await AuthApi.client.get<LogoutResponse>('/logout/');
        AuthApi.client.clearAuthToken();
    }
}
