import {by, element} from 'detox';
import {v4 as uuidv4} from 'uuid';
import axios from 'axios';
import {SignInRequest, SignUpRequest} from '@api';

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

    await axios.post('https://dev.erickdang.com/api/v1/auth/signup', data);

    return data;
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
