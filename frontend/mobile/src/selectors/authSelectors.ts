import {createSelector} from 'reselect';
import {RootState, AuthState} from '@store';
import {decode} from '@utils';

export const selectAuthState = (state: RootState) => state.auth;

export const selectAuthToken = createSelector(selectAuthState, (authState: AuthState) => authState.token);

export const selectAuthUser = createSelector(selectAuthState, (authState: AuthState) => authState.user);

export const selectAuthUserId = createSelector(selectAuthUser, (user: AuthState['user']) => user?.id);

export const isAuthTokenValid = createSelector(selectAuthToken, (token: AuthState['token']) => {
    if (token === undefined) {
        return false;
    }

    const payload = decode(token.accessToken);
    const currTime = new Date().getTime() / 1000; // convert to seconds

    // must have more than 1 second to be valid
    if (payload.exp - currTime <= 1) {
        return false;
    }

    return true;
});
