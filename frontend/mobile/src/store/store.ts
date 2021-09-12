import {configureStore} from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import {authReducer, AuthState} from './authSlice';
import sagas from '@sagas';
import AsyncStorage from '@react-native-community/async-storage';
import {
    PersistConfig,
    persistReducer,
    persistStore,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import {combineReducers} from 'redux';

const authPersistConfig: PersistConfig<AuthState, unknown, unknown, unknown> = {
    storage: AsyncStorage,
    key: 'auth',
};

export const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
});

const sagaMiddleware = createSagaMiddleware();

const middlewares = [sagaMiddleware];

if (__DEV__) {
    const createFlipperDebugger = require('redux-flipper').default;
    middlewares.push(createFlipperDebugger());
}

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: false,
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(middlewares),
    devTools: __DEV__,
});

sagaMiddleware.run(sagas);

export const persistor = persistStore(store);

persistor.purge();

export type RootState = ReturnType<typeof store.getState>;
