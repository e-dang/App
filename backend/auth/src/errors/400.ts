import {DomainError, DomainErrorDetails} from './base';
import {ValidationError as ExpressValidationError, Location} from 'express-validator';

export class ValidationError extends DomainError {
    constructor(errors: DomainErrorDetails) {
        super(400, errors);
    }
}

export class InvalidTokenError extends ValidationError {
    constructor(location: Location, param: string) {
        super([
            {
                location,
                param,
                msg: 'Invalid token.',
                value: undefined,
            } as ExpressValidationError,
        ]);
    }
}
