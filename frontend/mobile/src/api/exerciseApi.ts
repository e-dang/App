import {ExerciseType} from "@entities";
import {ApiListResponse, ApiResponse} from "./types";
import {baseApi} from "./baseApi";

export interface CreateExerciseRequest {
  name: string;
}

const taggedBaseApi = baseApi.enhanceEndpoints({addTagTypes: ["Exercise"]});

export const exerciseApi = taggedBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    listExercises: builder.query<ApiListResponse<ExerciseType>, void>({
      query: () => ({
        url: ":userId/exercises/",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [...result.data.map(({id}) => ({type: "Exercise" as const, id})), {type: "Exercise", id: "LIST"}]
          : [{type: "Exercise", id: "LIST"}],
    }),
    createExercise: builder.mutation<ExerciseType, CreateExerciseRequest>({
      query: (exercise) => ({
        url: ":userId/exercises/",
        method: "POST",
        body: exercise,
      }),
      transformResponse: (response: ApiResponse<ExerciseType>) => response.data,
      invalidatesTags: [{type: "Exercise", id: "LIST"}],
    }),
  }),
});

export const {useListExercisesQuery, useCreateExerciseMutation} = exerciseApi;
