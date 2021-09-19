import {FetchBaseQueryError} from '@reduxjs/toolkit/dist/query/react';

export interface Obj {
    [x: string]: any;
}

export const isObj = (x: unknown): x is Obj => !!x && !!(x as Obj);

export const isFetchBaseQueryError = (error: any): error is FetchBaseQueryError => error && 'status' in error;
