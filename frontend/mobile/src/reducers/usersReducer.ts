'use strict';
import {fetchUserAsync, setUser, UsersAction} from '@actions';
import {User} from '@src/types';
import {createReducer} from 'typesafe-actions';

export interface UsersState {
    user?: User;
}

const initialState: UsersState = {};

export const usersReducer = createReducer<UsersState, UsersAction>(initialState)
    .handleAction(fetchUserAsync.success, (state, action) => ({...state, user: action.payload}))
    .handleAction(setUser, (state, action) => ({...state, user: action.payload}));
