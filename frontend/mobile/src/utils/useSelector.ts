import {createSelectorHook} from 'react-redux';
import {RootAction} from 'src/actions/actionTypes';
import {RootState} from 'src/store';

export const useSelector = createSelectorHook<RootState, RootAction>();
