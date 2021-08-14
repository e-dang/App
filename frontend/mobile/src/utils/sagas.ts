import {call, put, race} from 'redux-saga/effects';
import {EmptyActionCreator, PayloadActionCreator} from 'typesafe-actions';
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

export function createAsyncSaga<T1 extends string, P1, T2 extends string, P2, T3 extends string, P3, T4 extends string>(
    asyncActionGroup: AsyncActionGroup<T1, P1, T2, P2, T3, P3, T4>,
    promiseCreator: PromiseCreatorFunction<P1, P2>,
    timeoutDuration: number,
) {
    return function* saga(action: ReturnType<typeof asyncActionGroup.request>) {
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
            yield put(asyncActionGroup.failure(e));
            return false;
        }
    };
}
