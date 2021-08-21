import axios from 'axios';
import {ROOT_URL} from '@api/constants';
import {AuthToken} from '@src/types';

export interface Response<T> {
    data: T;
    status: number;
    statusText: string;
}

export default class Client {
    private static impl = axios.create({
        baseURL: ROOT_URL,
    });

    static async delete<T>(url: string): Promise<Response<T>> {
        const {data, status, statusText} = await Client.impl.delete(url);
        return {
            data,
            status,
            statusText,
        } as Response<T>;
    }

    static async get<T>(url: string): Promise<Response<T>> {
        const {data, status, statusText} = await Client.impl.get(url);
        return {
            data,
            status,
            statusText,
        } as Response<T>;
    }

    static async head<T>(url: string): Promise<Response<T>> {
        const {data, status, statusText} = await Client.impl.head(url);
        return {
            data,
            status,
            statusText,
        } as Response<T>;
    }

    static async post<T, U>(url: string, data?: T): Promise<Response<U>> {
        const resp = await Client.impl.post(url, data);
        return {
            data: resp.data,
            status: resp.status,
            statusText: resp.statusText,
        } as Response<U>;
    }

    static async put<T, U>(url: string, data?: T): Promise<Response<U>> {
        const resp = await Client.impl.put(url, data);
        return {
            data: resp.data,
            status: resp.status,
            statusText: resp.statusText,
        } as Response<U>;
    }

    static async patch<T, U>(url: string, data?: T): Promise<Response<U>> {
        const resp = await Client.impl.patch(url, data);
        return {
            data: resp.data,
            status: resp.status,
            statusText: resp.statusText,
        } as Response<U>;
    }

    static setAuthToken(token: AuthToken) {
        Client.impl.defaults.headers['Authorization'] = `Bearer ${token.accessToken}`;
    }

    static clearAuthToken() {
        delete Client.impl.defaults.headers['Authorization'];
    }
}
