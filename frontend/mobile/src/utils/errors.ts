import {CustomError} from 'ts-custom-error';

export class TimeoutError extends CustomError {
    constructor() {
        super('The request timed out');
    }
}
