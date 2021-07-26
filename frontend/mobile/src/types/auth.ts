export type Email = string;
export type Name = string;
export type Password = string;

export interface RegistrationInfo {
    name: Name;
    email: Email;
    password1: Password;
    password2: Password;
}

export interface RegistrationResponse {
    detail: string;
}