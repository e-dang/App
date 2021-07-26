'use strict';
import {registerAsync} from '@src/actions/authActions';
import {AuthAction} from 'src/actions/actionTypes';
import {createReducer} from 'typesafe-actions';

export interface RegistrationState {
    error?: string | null;
}

const initialState: RegistrationState = {};

const registrationReducer = createReducer<RegistrationState, AuthAction>(initialState)
    .handleAction(registerAsync.success, (state, action) => ({...state, error: null}))
    .handleAction(registerAsync.failure, (state, action) => ({...state, error: action.payload.message}));

export default registrationReducer;
