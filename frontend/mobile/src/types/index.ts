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

export interface Workout {
    id: string;
    name: string;
    createdAt: string;
    lastUpdatedAt: string;
}
