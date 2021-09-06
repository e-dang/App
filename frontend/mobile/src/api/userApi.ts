import {DetailResponse} from '@api';
import {User} from '@src/types';
import Client from './client';

export interface UserResponse extends DetailResponse {
    user?: User;
}

export class UserApi {
    static readonly timeout = 60000;
    private static client = Client;

    static async getAuthUser() {
        const resp = await UserApi.client.get<UserResponse>('/user/');

        if (resp.status !== 200) {
            throw new Error(resp.data.detail);
        }

        return resp.data.user as User;
    }
}
