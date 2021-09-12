import {ActionCreatorWithOptionalPayload, ActionCreatorWithPayload} from '@reduxjs/toolkit';

export interface ApiResourceState {
    // a flag to check whether currently fetching data
    pending: boolean;

    // timestamp of last successful fetch
    lastFetch: number | null;

    // timestamp of last error
    lastError: number | null;

    // the type of error that occured
    error: string | null;
}

export interface GenericState<T> extends ApiResourceState {
    data: T | null;
}

export interface AsyncActionGroup<TRequest, TSuccess, TFailure> {
    request: ActionCreatorWithOptionalPayload<TRequest>;
    success: ActionCreatorWithPayload<TSuccess>;
    failure: ActionCreatorWithPayload<TFailure>;
}
