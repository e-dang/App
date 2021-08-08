import AsyncStorage from '@react-native-community/async-storage';
import {
    usersReducer,
    UsersState,
    pendingReducer,
    PendingState,
    appReducer,
    AppReducerState,
    errorReducer,
    authReducer,
    AuthState,
} from '@reducers';
import sagas from '@sagas';
import {applyMiddleware, combineReducers, compose, createStore, Dispatch, MiddlewareAPI} from 'redux';
import {PersistConfig, persistReducer, persistStore} from 'redux-persist';
import createSagaMiddleware from 'redux-saga';
import {RootAction} from '@actions';

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

const authPersistConfig: PersistConfig<AuthState, unknown, unknown, unknown> = {
    storage: AsyncStorage,
    key: 'auth',
};

export const reducers = {
    app: persistReducer(appPersistConfig, appReducer),
    users: persistReducer(usersPersistConfig, usersReducer),
    auth: persistReducer(authPersistConfig, authReducer),
    pendingStates: persistReducer(pendingPersistConfig, pendingReducer),
    errorStates: errorReducer,
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

if (__DEV__) {
    const createFlipperDebugger = require('redux-flipper').default;
    middlewares.push(createFlipperDebugger());
}

const enhancers = [applyMiddleware(...middlewares)];

export const store = createStore(rootReducer, compose(...enhancers));

sagaMiddleware.run(sagas);

export const persistor = persistStore(store);

// persistor.purge();
