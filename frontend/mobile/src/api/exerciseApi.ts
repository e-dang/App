import {Exercise, exerciseAdapter} from "@entities";
import {EntityState} from "@reduxjs/toolkit";
import {ApiListResponse, ApiResponse} from "./types";
import {baseApi} from "./baseApi";

export interface CreateExerciseRequest {
  name: string;
}

const taggedBaseApi = baseApi.enhanceEndpoints({addTagTypes: ["Exercise"]});

export const exerciseApi = taggedBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    listExercises: builder.query<EntityState<Exercise>, void>({
      query: () => ({
        url: ":userId/exercises/",
        method: "GET",
      }),
      transformResponse: (response: ApiListResponse<Exercise>) =>
        exerciseAdapter.addMany(exerciseAdapter.getInitialState(), response.data),
      providesTags: (result) =>
        result
          ? [...result.ids.map((id) => ({type: "Exercise" as const, id})), {type: "Exercise", id: "LIST"}]
          : [{type: "Exercise", id: "LIST"}],
    }),
    createExercise: builder.mutation<EntityState<Exercise>, CreateExerciseRequest>({
      query: (exercise) => ({
        url: ":userId/exercises/",
        method: "POST",
        body: exercise,
      }),
      transformResponse: (response: ApiResponse<Exercise>) =>
        exerciseAdapter.addOne(exerciseAdapter.getInitialState(), response.data),
      invalidatesTags: [{type: "Exercise", id: "LIST"}],
    }),
  }),
});

export const {useListExercisesQuery, useCreateExerciseMutation} = exerciseApi;
