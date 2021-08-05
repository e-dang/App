import Client from '@api/client';
import {AuthToken, DetailResponse, LoginInfo, RegistrationInfo} from '@src/types/auth';

export default class AuthApi {
    static readonly timeout = 10000;
    private static client = Client;

    static async register(registrationInfo: RegistrationInfo): Promise<void> {
        const resp = await AuthApi.client.post<RegistrationInfo, DetailResponse>('/registration/', registrationInfo);

        if (resp.status !== 201) {
            throw new Error(resp.data.detail);
        }

        return;
    }

    static async login(loginInfo: LoginInfo): Promise<AuthToken> {
        const resp = await AuthApi.client.post<LoginInfo, DetailResponse | AuthToken>('/login/', loginInfo);

        if (resp.status !== 200) {
            throw new Error((resp.data as DetailResponse).detail);
        }

        return resp.data as AuthToken;
    }
}
