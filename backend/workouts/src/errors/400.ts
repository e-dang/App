import {DomainError, DomainErrorDetails} from './base';

export class ValidationError extends DomainError {
    constructor(errors: DomainErrorDetails) {
        super(400, errors);
    }
}
