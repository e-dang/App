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

export class ResourceNotFound extends InternalError {
    constructor(message: string) {
        super(404, message);
    }
}

export class SignInError extends ResourceNotFound {
    constructor() {
        super('A user with this email and/or password does not exist.');
    }
}
