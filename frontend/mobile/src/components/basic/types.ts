import {SerializedError} from '@reduxjs/toolkit';
import {FetchBaseQueryError} from '@reduxjs/toolkit/dist/query/react';
import {IInputProps} from 'native-base';

export interface InputProps extends IInputProps {
    error?: FetchBaseQueryError | SerializedError;
}
