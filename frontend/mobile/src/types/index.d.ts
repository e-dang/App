declare module 'redux-persist/lib/*';

export type Email = string;
export type Name = string;
export type Password = string;
export type Token = string;

export interface DetailResponse {
    detail?: string;
}
export interface RegistrationInfo {
    name: Name;
    email: Email;
    password1: Password;
    password2: Password;
}

export interface SignInInfo {
    email: Email;
    password: Password;
}

export interface RegistrationResponse extends DetailResponse {
    key?: Token;
}

export interface SignInResponse extends DetailResponse {
    key?: Token;
}

export interface ForgotPasswordRequest {
    email: Email;
}
export interface AuthToken {
    token: Token;
}

export interface User {
    id: string;
    email: string;
    phone: string;
    name: string;
}
