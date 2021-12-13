import {DomainError} from '@errors';

export class AuthorizationError extends DomainError {
    constructor() {
        super(403, [{msg: 'You are not authorized to access this resource.', location: 'request'}]);
    }
}
