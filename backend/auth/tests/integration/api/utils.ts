import {User} from '@entities';
import supertest from 'supertest';
import {Express} from 'express';

export const createUser = async (app: Express, email: string, name: string, password: string) => {
    const res = await supertest(app).post('/api/v1/auth/signup').send({email, name, password});
    const user = await User.findOne({email});
    return {
        user,
        refreshToken: res.body.refreshToken,
        accessToken: res.body.accessToken,
    };
};
