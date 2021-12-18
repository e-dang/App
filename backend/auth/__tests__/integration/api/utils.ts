import {User} from '@entities';
import supertest from 'supertest';
import {Express} from 'express';

export const createUser = async (app: Express, email: string, name: string, password: string) => {
    const res = await supertest(app).post('/api/v1/auth/signup').send({email, name, password});
    const user = await User.findOne({email});
    return {
        user,
        refreshToken: res.body.data.refreshToken,
        accessToken: res.body.data.accessToken,
    };
};

export interface Cookies {
    [x: string]: {
        value: string;
        flags: {
            [x: string]: string | boolean;
        };
    };
}

// https://gist.github.com/the-vampiire/a564af41ed0ce8eb7c30dbe6c0f627d8
const shapeFlags = (flags: any) =>
    flags.reduce((shapedFlags: any, flag: any) => {
        const [flagName, rawValue] = flag.split('=');
        // edge case where a cookie has a single flag and "; " split results in trailing ";"
        const value = rawValue ? rawValue.replace(';', '') : true;
        return {...shapedFlags, [flagName]: value};
    }, {});

export const extractCookies = (headers: any): Cookies => {
    const cookies = headers['set-cookie']; // Cookie[]

    return cookies.reduce((shapedCookies: any, cookieString: any) => {
        const [rawCookie, ...flags] = cookieString.split('; ');
        const [cookieName, value] = rawCookie.split('=');
        return {...shapedCookies, [cookieName]: {value, flags: shapeFlags(flags)}};
    }, {});
};
