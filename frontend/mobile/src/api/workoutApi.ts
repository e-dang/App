import {Workout} from '@src/types';
import {ApiResponse} from './authApi';
import {baseApi} from './baseApi';

export const workoutApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        listWorkouts: builder.query<ApiResponse<Workout[]>, string>({
            query: (userId) => ({
                url: `${userId}/workouts/`,
                method: 'GET',
            }),
        }),
    }),
});

export const {useListWorkoutsQuery} = workoutApi;
