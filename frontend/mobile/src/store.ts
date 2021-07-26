import AsyncStorage from '@react-native-community/async-storage';
import appReducer, {AppReducerState} from '@reducers/appReducer';
import usersReducer, {UsersState} from '@reducers/usersReducer';
import sagas from '@sagas/index';
import {applyMiddleware, combineReducers, compose, createStore, Dispatch, MiddlewareAPI} from 'redux';
import {PersistConfig, persistReducer, persistStore} from 'redux-persist';
import createSagaMiddleware from 'redux-saga';
import {RootAction} from '@actions/actionTypes';
import pendingReducer, {PendingState} from '@reducers/pendingReducer';
import {composeWithDevTools} from 'redux-devtools-extension';
import registrationReducer from '@reducers/authReducer';

const appPersistConfig: PersistConfig<AppReducerState, unknown, unknown, unknown> = {
    storage: AsyncStorage,
    key: 'app',
};

const usersPersistConfig: PersistConfig<UsersState, unknown, unknown, unknown> = {
    storage: AsyncStorage,
    key: 'users',
};

const pendingPersistConfig: PersistConfig<PendingState, unknown, unknown, unknown> = {
    storage: AsyncStorage,
    key: 'pendingStates',
};

export const reducers = {
    app: persistReducer(appPersistConfig, appReducer),
    users: persistReducer(usersPersistConfig, usersReducer),
    pendingStates: persistReducer(pendingPersistConfig, pendingReducer),
    registration: registrationReducer,
};

export const rootReducer = combineReducers(reducers);
export type RootState = ReturnType<typeof rootReducer>;

const appMiddleware = (_store: MiddlewareAPI) => (next: Dispatch) => (action: RootAction) => {
    //   var state = store.getState()
    //   switch (action.type) {
    //     case actions.ADD_TASK:
    //       *do something*
    //       break;
    //   }
    next(action);
};

const sagaMiddleware = createSagaMiddleware();

const middlewares = [sagaMiddleware, appMiddleware];
const enhancers = [applyMiddleware(...middlewares)];

export const store = createStore(rootReducer, composeWithDevTools(...enhancers));

sagaMiddleware.run(sagas);

export const persistor = persistStore(store);

// persistor.purge();
