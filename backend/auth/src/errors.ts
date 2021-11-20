interface ErrorDetail {
    location: 'request';
    msg: string;
}

interface ErrorJson {
    errors: ErrorDetail[];
}

export class InternalError extends Error {
    public statusCode: number;
    public json: ErrorJson;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.json = {
            errors: [
                {
                    location: 'request',
                    msg: this.message,
                },
            ],
        };
    }
}

export class ExpiredTokenError extends InternalError {
    constructor() {
        super(400, 'Token expired.');
    }
}
export class ResourceNotFound extends InternalError {
    constructor(message: string) {
        super(404, message);
    }
}

export class UserNotFoundError extends ResourceNotFound {
    constructor(id: string) {
        super(`A user with the id '${id}' does not exist.`);
    }
}

export class SignInError extends ResourceNotFound {
    constructor() {
        super('A user with this email and/or password does not exist.');
    }
}

export class AlreadyExistsError extends InternalError {
    constructor(message: string) {
        super(409, message);
    }
}

export class UserAlreadyExistsError extends AlreadyExistsError {
    constructor(email: string) {
        super(`A user with the email '${email}' already exists.`);
    }
}

export class InvalidOldPasswordError extends InternalError {
    constructor() {
        super(400, 'Your old password is incorrect. Please enter it again.');
    }
}

export class PasswordsMismatchError extends InternalError {
    constructor() {
        super(400, "Password confirmation doesn't match the password.");
    }
}

export class AuthenticationError extends InternalError {
    constructor() {
        super(401, 'Please signin to continue.');
    }
}
