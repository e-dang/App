'use_strict';
import {RootAction} from '@actions';
import {getActionName} from '@utils';

export interface PendingState {
    [x: string]: {
        pending: boolean;
    };
}

const initialState: PendingState = {};

export const pendingReducer = (state: PendingState = initialState, action: RootAction) => {
    const {type} = action;
    const actionName = getActionName(type);

    if (type.endsWith('_REQUEST')) {
        return {
            ...state,
            [actionName]: {
                pending: true,
            },
        };
    }

    if (type.endsWith('_SUCCESS') || type.endsWith('_FAILURE') || type.endsWith('_CANCEL')) {
        return {
            ...state,
            [actionName]: {
                pending: false,
            },
        };
    }

    return {
        ...state,
    };
};
