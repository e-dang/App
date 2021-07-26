import {ActionType} from 'typesafe-actions';
import * as appActions from './appActions';
import * as usersActions from './usersActions';
import * as authActions from './authActions';

export type AppAction = ActionType<typeof appActions>;
export type UsersAction = ActionType<typeof usersActions>;
export type AuthAction = ActionType<typeof authActions>;

export type RootAction = AppAction | UsersAction | AuthAction;
