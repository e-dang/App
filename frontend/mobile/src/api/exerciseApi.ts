import {Exercise} from '@src/types';
import {ApiResponse} from './authApi';
import {baseApi} from './baseApi';

export interface CreateExerciseRequest {
    name: string;
}

const taggedBaseApi = baseApi.enhanceEndpoints({addTagTypes: ['Exercise']});

export const exerciseApi = taggedBaseApi.injectEndpoints({
    endpoints: (builder) => ({
        listExercises: builder.query<ApiResponse<Exercise[]>, void>({
            query: () => ({
                url: ':userId/workouts/',
                method: 'GET',
            }),
            providesTags: (result) =>
                result
                    ? [...result.data.map(({id}) => ({type: 'Exercise' as const, id})), {type: 'Exercise', id: 'LIST'}]
                    : [{type: 'Exercise', id: 'LIST'}],
        }),
        createExercise: builder.mutation<Exercise, CreateExerciseRequest>({
            query: (workout) => ({
                url: ':userId/workouts/',
                method: 'POST',
                body: workout,
            }),
            transformResponse: (response: ApiResponse<Exercise>) => response.data,
            invalidatesTags: [{type: 'Exercise', id: 'LIST'}],
        }),
    }),
});

export const {useListExercisesQuery, useCreateExerciseMutation} = exerciseApi;
