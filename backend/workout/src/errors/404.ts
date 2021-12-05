import {DomainError, DomainErrorDetails} from './base';

class ResourceNotFoundError extends DomainError {
    constructor(errors: DomainErrorDetails) {
        super(404, errors);
    }
}
