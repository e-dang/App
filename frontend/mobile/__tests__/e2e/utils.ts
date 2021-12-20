import {by, element} from 'detox';
import {v4 as uuidv4} from 'uuid';
import axios from 'axios';
import {SignInRequest, SignUpRequest} from '@api';
import {decode} from '@utils';
import {Exercise} from '@src/types';

const BASE_URL = 'https://dev.erickdang.com/api/v1';
const MAILHOG_URL = 'https://mail.dev.erickdang.com/api/v2/search';

export function generateEmail() {
    return `${uuidv4()}@e2etest.com`;
}

export async function createUser(userData: Partial<SignUpRequest> = {}) {
    const data = {
        name: userData.name || 'E2E Test User',
        email: userData.email || generateEmail(),
        password: userData.password || 'Mytestpassword123!',
    };

    const response = await axios.post(`${BASE_URL}/auth/signup`, data);

    return {
        ...data,
        accessToken: response.data.data.accessToken,
        refreshToken: extractCookies(response.headers).rt.value,
    };
}

export async function signOut() {
    await element(by.id('masterSignOut')).tap();
}

export async function checkForEmail(to: string, predicate: (msg: any) => boolean) {
    const messages = await axios.get(MAILHOG_URL, {
        params: {
            kind: 'to',
            query: to,
        },
    });

    messages.data.items.some(predicate);
}

export async function signIn({email, password}: SignInRequest) {
    await element(by.id('signInBtn')).tap();
    element(by.id('emailInput')).typeText(email);
    element(by.id('passwordInput')).typeText(password);
    await element(by.id('signInBtn')).tap();
}

export async function createExercises(accessToken: string, exercises: Partial<Exercise>[]) {
    const payload = decode(accessToken);

    for (let exercise of exercises) {
        await axios.post(`${BASE_URL}/${payload.userId}/exercises`, exercise, {
            headers: {Authorization: `Token ${accessToken}`},
        });
    }
}

interface Cookies {
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

const extractCookies = (headers: any): Cookies => {
    const cookies = headers['set-cookie']; // Cookie[]

    return cookies.reduce((shapedCookies: Cookies, cookieString: string) => {
        const [rawCookie, ...flags] = cookieString.split('; ');
        const [cookieName, value] = rawCookie.split('=');
        return {...shapedCookies, [cookieName]: {value, flags: shapeFlags(flags)}};
    }, {});
};
