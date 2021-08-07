import {createSelectorHook} from 'react-redux';
import {PendingState} from '@reducers';
import {RootAction} from '@actions';
import {RootState} from '@src/store';

export const useSelector = createSelectorHook<RootState, RootAction>();

export function getPending(obj: PendingState, prop: keyof PendingState) {
    if (obj[prop] === undefined) {
        return false;
    }
    return obj[prop].pending;
}
