'use_strict';
import {RootAction} from '@actions/actionTypes';

export interface PendingState {}

const initialState: PendingState = {};

function getActionName(actionType: string) {
    return actionType.split('_').slice(0, -1).join('_');
}

const pendingReducer = (state: PendingState = initialState, action: RootAction) => {
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

export default pendingReducer;