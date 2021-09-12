import {createAction, createSlice, Draft, SliceCaseReducers, ValidateSliceCaseReducers} from '@reduxjs/toolkit';
import {AsyncActionGroup, GenericState} from './types';

export function createAsyncActionGroup<TRequest, TSuccess, TFailure>(
    request: string,
    success: string,
    failure: string,
) {
    return {
        request: createAction<TRequest>(request),
        success: createAction<TSuccess>(success),
        failure: createAction<TFailure>(failure),
    } as AsyncActionGroup<TRequest, TSuccess, TFailure>;
}

export const createGenericSlice = <
    TRequest,
    TSuccess,
    TFailure extends Error,
    TState extends GenericState<TSuccess>,
    Reducers extends SliceCaseReducers<GenericState<TSuccess>>
>({
    name = '',
    initialState,
    reducers,
    asyncActionGroup,
}: {
    name: string;
    initialState: TState;
    reducers: ValidateSliceCaseReducers<GenericState<TSuccess>, Reducers>;
    asyncActionGroup: AsyncActionGroup<TRequest, TSuccess, TFailure>;
}) => {
    return createSlice({
        name,
        initialState,
        reducers: {
            ...reducers,
        },
        extraReducers: (builder) => {
            builder
                .addCase(asyncActionGroup.request, (state) => {
                    state.pending = true;
                })
                .addCase(asyncActionGroup.success, (state, action) => {
                    state.pending = false;
                    state.data = action.payload as Draft<TSuccess>;
                    state.lastFetch = Date.now();
                    state.error = null;
                })
                .addCase(asyncActionGroup.failure, (state, action) => {
                    state.pending = false;
                    state.lastError = Date.now();
                    state.error = action.payload.message;
                });
        },
    });
};
