import {createSelector} from 'reselect';
import {RootState} from '@src/store';
import {AuthState} from '@reducers';
import {AuthToken} from '@src/types';
import {Buffer} from 'buffer';

export const selectAuthState = (state: RootState) => state.auth;

export const selectAuthToken = createSelector(selectAuthState, (authState: AuthState) => authState.token);

export const isAuthTokenValid = createSelector(selectAuthToken, (token: AuthToken | null) => {
    if (token === null) {
        return false;
    }

    const tokenParts = token.accessToken.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    const currTime = new Date().getTime() / 1000; // convert to seconds

    // must have more than 1 second to be valid
    if (payload.exp - currTime <= 1) {
        return false;
    }

    return true;
});
