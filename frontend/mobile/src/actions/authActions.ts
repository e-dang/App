import {createAsyncAction} from 'typesafe-actions';
import {RegistrationInfo} from '@src/types/auth';

export const registerAsync = createAsyncAction(
    ['REGISTER_REQUEST', (registrationInfo: RegistrationInfo) => registrationInfo],
    'REGISTER_SUCCESS',
    ['REGISTER_FAILURE', (err: Error) => err.message],
    'REGISTER_CANCEL',
)();
