import Client from '@api/client';
import {AuthToken, LoginInfo, LoginResponse, RegistrationInfo, RegistrationResponse} from '@src/types/auth';

export default class AuthApi {
    static readonly timeout = 10000;
    private static client = Client;

    static async register(registrationInfo: RegistrationInfo): Promise<AuthToken> {
        const resp = await AuthApi.client.post<RegistrationInfo, RegistrationResponse>(
            '/registration/',
            registrationInfo,
        );

        if (resp.status !== 201) {
            throw new Error(resp.data.detail);
        }

        return {token: resp.data.key} as AuthToken;
    }

    static async login(loginInfo: LoginInfo): Promise<AuthToken> {
        const resp = await AuthApi.client.post<LoginInfo, LoginResponse>('/login/', loginInfo);

        if (resp.status !== 200) {
            throw new Error(resp.data.detail);
        }

        return {token: resp.data.key} as AuthToken;
    }
}
