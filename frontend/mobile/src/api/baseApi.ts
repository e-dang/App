import {
    BaseQueryFn,
    createApi,
    FetchArgs,
    fetchBaseQuery,
    FetchBaseQueryError,
} from '@reduxjs/toolkit/dist/query/react';
import {selectAuthToken} from '@selectors';
import {refreshToken, signOut} from '@store/authSlice'; // avoid circular import
import {RootState} from '@store';

export const BASE_URL = 'https://dev.erickdang.com/api/v1/';

const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, {getState}) => {
        const token = selectAuthToken(getState() as RootState);
        if (token) {
            headers.set('Authorization', `Bearer ${token.accessToken}`);
        }
        headers.set('Accept', 'application/json');
        return headers;
    },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions,
) => {
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
