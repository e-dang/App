'use strict';
import {setStoreState, AppAction} from '@actions';
import {createReducer} from 'typesafe-actions';

export interface AppReducerState {
    version: string;
}

const initialState: AppReducerState = {
    version: '1.0.0',
};

export const appReducer = createReducer<AppReducerState, AppAction>(initialState).handleAction(
    setStoreState,
    (state, action) => Object.assign({}, initialState, state, action.payload),
);
