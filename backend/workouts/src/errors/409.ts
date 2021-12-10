import {DomainError, DomainErrorDetails} from './base';

class AlreadyExistsError extends DomainError {
    constructor(errors: DomainErrorDetails) {
        super(409, errors);
    }
}
