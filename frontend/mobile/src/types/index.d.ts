declare module 'redux-persist/lib/*';

export type Email = string;
export type Name = string;
export type Password = string;
export type Token = string;

export interface AuthToken {
    accessToken: Token;
    refreshToken: Token;
}

export interface User {
    id: string;
    email: string;
    phone: string;
    name: string;
}
