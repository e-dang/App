import AuthApi from '@api/authApi';
import Client from '@src/api/client';
import {mock, MockProxy} from 'jest-mock-extended';
import {Response} from '@api/client';
import {RegistrationInfo, RegistrationResponse} from '@src/types/auth';

describe('authApi', () => {
    let client: MockProxy<typeof Client>;
    const regInfo: RegistrationInfo = {
        name: 'test name',
        email: 'example@demo.com',
        password1: 'testpassword1',
        password2: 'testpassword2',
    };

    beforeEach(() => {
        client = mock<typeof Client>();
        AuthApi['client'] = client;
    });

    test('register throws error when response status is not 201', async () => {
        const data: RegistrationResponse = {detail: 'Fail'};
        client.post.mockResolvedValue({
            data,
            status: 500,
            statusText: 'Server Error',
        } as Response<RegistrationResponse>);

        await expect(() => AuthApi.register(regInfo)).rejects.toThrowError(data.detail);
    });

    test('register returns void when response status is 201', async () => {
        const data: RegistrationResponse = {detail: 'verification email sent'};
        client.post.mockResolvedValue({
            data,
            status: 201,
            statusText: 'Created',
        });

        const resp = await AuthApi.register(regInfo);

        expect(resp).toBeUndefined();
    });
});
