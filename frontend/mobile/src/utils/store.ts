import {createSelectorHook} from 'react-redux';
import {PendingState} from '@reducers';
import {RootAction} from '@actions';
import {RootState} from '@src/store';

export const useSelector = createSelectorHook<RootState, RootAction>();
