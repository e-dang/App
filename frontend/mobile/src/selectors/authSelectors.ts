import {createSelector} from 'reselect';
import {RootState} from '@src/store';
import {AuthState} from '@reducers';

export const selectAuthState = (state: RootState) => state.auth;

export const selectAuthToken = createSelector(selectAuthState, (authState: AuthState) => authState.token);
