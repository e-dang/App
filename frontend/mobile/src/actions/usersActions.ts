import {createAsyncAction} from 'typesafe-actions';
import {User} from 'src/types';

export const getAuthUserAsync = createAsyncAction(
    'GET_AUTH_USER_REQUEST',
    'GET_AUTH_USER_SUCCESS',
    'GET_AUTH_USER_FAILURE',
)<undefined, User, Error>();
