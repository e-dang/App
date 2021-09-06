'use strict';
import {getAuthUserAsync, UsersAction} from '@actions';
import {User} from '@src/types';
import {createReducer} from 'typesafe-actions';

export interface UsersState {
    authUser?: User;
}

const initialState: UsersState = {};

export const usersReducer = createReducer<UsersState, UsersAction>(initialState).handleAction(
    getAuthUserAsync.success,
    (state, action) => ({...state, authUser: action.payload}),
);
