import {DomainError, DomainErrorDetails} from './base';

class AlreadyExistsError extends DomainError {
    constructor(errors: DomainErrorDetails) {
        super(409, errors);
    }
}

export class UserWithEmailAlreadyExistsError extends AlreadyExistsError {
    constructor(email: string) {
        super([
            {msg: `A user with the email '${email}' already exists.`, location: 'body', param: 'email', value: email},
        ]);
    }
}
