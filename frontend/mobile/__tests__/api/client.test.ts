import Client from '@api/client';
import {AxiosInstance} from 'axios';
import {mock} from 'jest-mock-extended';

describe('Client', () => {
    const url = 'https://test.url.dne/';
    const data = {};

    it('delete calls delete method on impl with url', async () => {
        Client['impl'] = mock<AxiosInstance>();

        Client.delete(url);

        expect(Client['impl'].delete).toHaveBeenCalledWith(url);
    });

    it('get calls get method on impl with url', async () => {
        Client['impl'] = mock<AxiosInstance>();

        Client.get(url);

        expect(Client['impl'].get).toHaveBeenCalledWith(url);
    });

    it('head calls head method on impl with url', async () => {
        Client['impl'] = mock<AxiosInstance>();

        Client.head(url);

        expect(Client['impl'].head).toHaveBeenCalledWith(url);
    });

    it('post calls post method on impl with url and data', async () => {
        Client['impl'] = mock<AxiosInstance>();

        Client.post(url, data);

        expect(Client['impl'].post).toHaveBeenCalledWith(url, data);
    });

    it('put calls put method on impl with url and data', async () => {
        Client['impl'] = mock<AxiosInstance>();

        Client.put(url, data);

        expect(Client['impl'].put).toHaveBeenCalledWith(url, data);
    });

    it('patch calls patch method on impl with url and data', async () => {
        Client['impl'] = mock<AxiosInstance>();

        Client.patch(url, data);

        expect(Client['impl'].patch).toHaveBeenCalledWith(url, data);
    });
});
