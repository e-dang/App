import Client from '@api/client';
import {AuthToken} from '@src/types';
import {AxiosInstance} from 'axios';
import {mock} from 'jest-mock-extended';

describe('Client', () => {
    const url = 'https://test.url.dne/';
    const data = {};

    test('delete calls delete method on impl with url', async () => {
        Client['impl'] = mock<AxiosInstance>();

        Client.delete(url);

        expect(Client['impl'].delete).toHaveBeenCalledWith(url);
    });

    test('get calls get method on impl with url', async () => {
        Client['impl'] = mock<AxiosInstance>();

        Client.get(url);

        expect(Client['impl'].get).toHaveBeenCalledWith(url);
    });

    test('head calls head method on impl with url', async () => {
        Client['impl'] = mock<AxiosInstance>();

        Client.head(url);

        expect(Client['impl'].head).toHaveBeenCalledWith(url);
    });

    test('post calls post method on impl with url and data', async () => {
        Client['impl'] = mock<AxiosInstance>();

        Client.post(url, data);

        expect(Client['impl'].post).toHaveBeenCalledWith(url, data);
    });

    test('put calls put method on impl with url and data', async () => {
        Client['impl'] = mock<AxiosInstance>();

        Client.put(url, data);

        expect(Client['impl'].put).toHaveBeenCalledWith(url, data);
    });

    test('patch calls patch method on impl with url and data', async () => {
        Client['impl'] = mock<AxiosInstance>();

        Client.patch(url, data);

        expect(Client['impl'].patch).toHaveBeenCalledWith(url, data);
    });

    test('setAuthToken sets impl Authorization header to token', async () => {
        Client['impl'] = mock<AxiosInstance>();
        Client['impl'].defaults = {headers: {}};
        const authToken: AuthToken = {
            accessToken: 'a4efwadfjpaafg99033r',
            refreshToken: 'awdjafaf9ajdwaw.aefimewfhq38awdho',
        };

        Client.setAuthToken(authToken);

        expect(Client['impl'].defaults.headers['Authorization']).toEqual(`Bearer a4efwadfjpaafg99033r`);
    });

    test('clearAuthToken removes Authorization header from impl', async () => {
        Client['impl'] = mock<AxiosInstance>();
        Client['impl'].defaults = {headers: {Authorization: 'stuff'}};

        Client.clearAuthToken();

        expect(Client['impl'].defaults.headers).not.toHaveProperty('Authorization');
    });
});
