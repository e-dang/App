import {config} from '@config';
import {DomainError} from './base';

export class InternalError extends DomainError {
    constructor(message: string) {
        let msg: string;
        if (config.env === 'test' || config.env === 'development') {
            msg = message;
        } else {
            msg = 'Internal server error.';
        }
        super(500, [{msg, location: 'request'}]);
    }
}
