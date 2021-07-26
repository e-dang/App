import Client from '@api/client';
import {RegistrationInfo, RegistrationResponse} from '@src/types/auth';

export default class AuthApi {
    private static client = Client;

    static async register(registrationInfo: RegistrationInfo): Promise<void> {
        const resp = await AuthApi.client.post<RegistrationInfo, RegistrationResponse>(
            '/registration/',
            registrationInfo,
        );

        if (resp.status !== 201) {
            throw new Error(resp.data.detail);
        }

        return;
    }
}
