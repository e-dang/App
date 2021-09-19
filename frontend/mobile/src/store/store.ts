import {configureStore} from '@reduxjs/toolkit';
import {authReducer, AuthState} from './authSlice';
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
import {AnyAction, combineReducers} from 'redux';
import {baseApi} from '@api';

const authPersistConfig: PersistConfig<AuthState, unknown, unknown, unknown> = {
    storage: AsyncStorage,
    key: 'auth',
};

export const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    [baseApi.reducerPath]: baseApi.reducer,
});

const wrappedReducer: typeof rootReducer = (state: any, action: AnyAction) => {
    if (action.type === 'signOut') {
        persistor.purge();
        return rootReducer(undefined, action);
    }

    return rootReducer(state, action);
};

const middlewares = [baseApi.middleware];

export const store = configureStore({
    reducer: wrappedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(middlewares),
    devTools: __DEV__,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
