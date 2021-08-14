import {createSelectorHook} from 'react-redux';
import {RootAction} from '@actions';
import {RootState} from '@src/store';

export const useSelector = createSelectorHook<RootState, RootAction>();
