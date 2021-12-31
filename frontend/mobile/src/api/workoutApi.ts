import {Workout, workoutAdapter} from "@entities";
import {EntityState} from "@reduxjs/toolkit";
import {ApiListResponse, ApiResponse} from "./types";
import {baseApi} from "./baseApi";

export interface CreateWorkoutRequest {
  name: string;
  notes: string;
}

const taggedBaseApi = baseApi.enhanceEndpoints({addTagTypes: ["Workout"]});

export const workoutApi = taggedBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    listWorkouts: builder.query<EntityState<Workout>, void>({
      query: () => ({
        url: ":userId/workouts/",
        method: "GET",
      }),
      transformResponse: (response: ApiListResponse<Workout>) =>
        workoutAdapter.addMany(workoutAdapter.getInitialState(), response.data),
      providesTags: (result) =>
        result
          ? [...result.ids.map((id) => ({type: "Workout" as const, id})), {type: "Workout", id: "LIST"}]
          : [{type: "Workout", id: "LIST"}],
    }),
    createWorkout: builder.mutation<EntityState<Workout>, CreateWorkoutRequest>({
      query: (workout) => ({
        url: ":userId/workouts/",
        method: "POST",
        body: workout,
      }),
      transformResponse: (response: ApiResponse<Workout>) =>
        workoutAdapter.addOne(workoutAdapter.getInitialState(), response.data),
      invalidatesTags: [{type: "Workout", id: "LIST"}],
    }),
  }),
});

export const {useListWorkoutsQuery, useCreateWorkoutMutation} = workoutApi;
