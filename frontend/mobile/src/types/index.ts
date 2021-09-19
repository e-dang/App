export * from './utils';

export type Email = string;
export type Name = string;
export type Password = string;
export type Token = string;
export type URL = string;
export type UUID = string;

export interface AuthToken {
    accessToken: Token;
    refreshToken: Token;
}

export interface User {
    url: URL;
    uuid: UUID;
    name: Name;
    email: Email;
}
