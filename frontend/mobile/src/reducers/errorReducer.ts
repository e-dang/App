import {RootAction} from '@actions';
import {getActionName, isPayloadAction, isErrorPayload} from '@utils';
import {Reducer} from 'typesafe-actions';

export interface ErrorState {
    [x: string]: {
        error: string | null;
    };
}

const initialState: ErrorState = {};

export const errorReducer: Reducer<ErrorState, RootAction> = (state: ErrorState = initialState, action: RootAction) => {
    const {type} = action;
    const actionName = getActionName(type);

    if (type.endsWith('_SUCCESS')) {
        return {
            ...state,
            [actionName]: {
                error: null,
            },
        };
    }

    if (isPayloadAction(action) && isErrorPayload(action)) {
        return {
            ...state,
            [actionName]: {
                error: action.payload,
            },
        };
    }

    return {
        ...state,
    };
};
