import {User} from '@entities';
import supertest from 'supertest';
import {Express} from 'express';
import axios from 'axios';
import {config} from '@config';

const MAILHOG_URL = `${config.emailHost}:8025`;
// const MAILHOG_URL = `http://${config.emailHost}:8025`;

export const createUser = async (app: Express, email: string, name: string, password: string) => {
    const res = await supertest(app).post('/api/v1/auth/signup').send({email, name, password});
    const user = await User.findOne({email});
    return {
        user,
        refreshToken: res.body.data.refreshToken,
        accessToken: res.body.data.accessToken,
    };
};

export async function filterEmails(to: string, predicate: (msg) => boolean) {
    const messages = await axios.get(`${MAILHOG_URL}/api/v2/search`, {
        params: {
            kind: 'to',
            query: to,
        },
    });

    return messages.data.items.filter(predicate);
}
