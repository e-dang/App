import {createAction, createAsyncAction} from 'typesafe-actions';
import {User} from 'src/types';

export const fetchUserAsync = createAsyncAction(
    ['USER_FETCH_REQUEST', (userID: string) => userID],
    ['USER_FETCH_SUCCESS', (res: User) => res],
    ['USER_FETCH_FAILURE', (err: Error) => err.message],
    'USER_FETCH_CANCEL',
)();

export const setUser = createAction('USER_SET', (user?: User) => user)();
