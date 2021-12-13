import {
    BaseQueryFn,
    createApi,
    FetchArgs,
    fetchBaseQuery,
    FetchBaseQueryError,
} from '@reduxjs/toolkit/dist/query/react';
import {selectAuthToken, selectAuthUserId} from '@selectors';
import {refreshToken, signOut} from '@store/authSlice'; // avoid circular import
import {RootState} from '@store';
import {BaseQueryApi} from '@reduxjs/toolkit/dist/query/baseQueryTypes';

export const BASE_URL = 'https://dev.erickdang.com/api/v1/';

const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, {getState}) => {
        const token = selectAuthToken(getState() as RootState);
        if (token) {
            headers.set('Authorization', `Token ${token.accessToken}`);
        }
        headers.set('Accept', 'application/json');
        return headers;
    },
});

const modifyUrlWithUserId = (args: string | FetchArgs, api: BaseQueryApi) => {
    if (typeof args === 'string') {
        return args;
    }

    if (args.url.includes(':userId')) {
        const userId = selectAuthUserId(api.getState() as RootState);
        if (userId !== undefined) {
            args.url = args.url.replace(':userId', userId);
            return args;
        }
    }

    return args;
};

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions,
) => {
    args = modifyUrlWithUserId(args, api);
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        const refreshResult = await baseQuery('token/refresh/', api, extraOptions);

        if (refreshResult.data) {
            api.dispatch(refreshToken(refreshResult.data as string));
            result = await baseQuery(args, api, extraOptions);
        } else {
            api.dispatch(signOut());
        }
    }
    return result;
};

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    endpoints: () => ({}),
});
