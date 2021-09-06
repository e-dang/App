import {refreshTokenAsync} from '@actions';
import {AuthApi} from '@api';
import {Buffer} from 'buffer';
import {selectAuthToken} from '@selectors';
import {AuthToken} from '@src/types';
import {AnyAction} from 'redux';
import {call, put, race, select, take} from 'redux-saga/effects';
import {EmptyActionCreator, getType, PayloadActionCreator} from 'typesafe-actions';
import {isPayloadAction} from './actions';
import {timeout} from './async';

export interface ApiRaceResult<T> {
    response: T;
    timeout: null;
}

export interface AsyncActionGroup<
    T1 extends string,
    P1,
    T2 extends string,
    P2,
    T3 extends string,
    P3,
    T4 extends string
> {
    request: EmptyActionCreator<T1> | PayloadActionCreator<T1, P1>;
    success: EmptyActionCreator<T2> | PayloadActionCreator<T2, P2>;
    failure: EmptyActionCreator<T3> | PayloadActionCreator<T3, P3>;
    cancel?: EmptyActionCreator<T4>;
}

export type PromiseCreatorFunction<P, T> = ((payload: P) => Promise<T>) | (() => Promise<T>);

export function createAsyncSagaCreator<A, B, C>(preHook: () => Generator<A, B, C>) {
    function createAsyncSaga<T1 extends string, P1, T2 extends string, P2, T3 extends string, P3, T4 extends string>(
        asyncActionGroup: AsyncActionGroup<T1, P1, T2, P2, T3, P3, T4>,
        promiseCreator: PromiseCreatorFunction<P1, P2>,
        timeoutDuration: number,
    ) {
        return function* saga(action: ReturnType<typeof asyncActionGroup.request>) {
            yield call(preHook);

            try {
                const {response}: ApiRaceResult<P2> = isPayloadAction<P1>(action)
                    ? yield race({
                          response: call(promiseCreator, action.payload),
                          timeout: call(timeout, timeoutDuration),
                      })
                    : yield race({
                          response: call(promiseCreator),
                          timeout: call(timeout, timeoutDuration),
                      });

                yield put(asyncActionGroup.success(response));
                return true;
            } catch (e) {
                yield put(asyncActionGroup.failure(e as P3));
                return false;
            }
        };
    }

    return createAsyncSaga;
}

export function* refreshTokenSagaProducer() {
    const token: AuthToken = yield select(selectAuthToken);
    const isValid: boolean = yield call(tokenIsValid, token);
    if (!isValid) {
        yield put(refreshTokenAsync.request({refresh: token.refreshToken}));
        const action: AnyAction = yield take([refreshTokenAsync.success, refreshTokenAsync.failure]);

        if (action.type === getType(refreshTokenAsync.failure)) {
            throw action.payload;
        }
    }
}

export function* refreshTokenSagaConsumer(action: ReturnType<typeof refreshTokenAsync.request>) {
    const token: AuthToken = yield select(selectAuthToken);
    const isValid: boolean = yield call(tokenIsValid, token);
    if (isValid) {
        yield put(refreshTokenAsync.success(token));
        return;
    }

    try {
        const {response}: ApiRaceResult<AuthToken> = yield race({
            response: call(AuthApi.refreshToken, action.payload),
            timeout: call(timeout, AuthApi.timeout),
        });
        yield put(refreshTokenAsync.success(response));
    } catch (e) {
        yield put(refreshTokenAsync.failure(e as Error));
    }
}

export function tokenIsValid(token: AuthToken) {
    const tokenParts = token.accessToken.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    const currTime = new Date().getTime() / 1000; // convert to seconds

    // must have more than 1 second to be valid
    if (payload.exp - currTime <= 1) {
        return false;
    }
    return true;
}

export const createApiSaga = createAsyncSagaCreator(function* () {
    return;
});
export const createAuthApiSaga = createAsyncSagaCreator(refreshTokenSagaProducer);
