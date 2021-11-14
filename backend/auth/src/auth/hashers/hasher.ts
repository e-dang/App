export interface Hasher {
    hashPassword(password: string): string;
    passwordIsValid(password: string, storedPassword: string): boolean;
}

export function parsePassword(storedPassword: string) {
    return storedPassword.split('$');
}

export function getAlgorithm(storedPassword: string) {
    return parsePassword(storedPassword)[0];
}
