export * from './utils';

export interface AuthToken {
    accessToken: string;
    refreshToken: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
}
