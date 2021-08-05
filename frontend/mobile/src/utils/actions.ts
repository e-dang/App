import {PayloadAction} from 'typesafe-actions';

export function getActionName(actionType: string) {
    return actionType.split('_').slice(0, -1).join('_');
}

export function isPayloadAction<P>(action: any): action is PayloadAction<string, P> {
    return action.payload !== undefined;
}
