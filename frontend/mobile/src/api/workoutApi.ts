import {CreateWorkoutTemplateForm, WorkoutTemplate} from "@entities";
import {ApiListResponse, ApiResponse} from "./types";
import {baseApi} from "./baseApi";

const taggedBaseApi = baseApi.enhanceEndpoints({addTagTypes: ["WorkoutTemplate"]});

export const workoutApi = taggedBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    listWorkoutTemplates: builder.query<ApiListResponse<WorkoutTemplate>, void>({
      query: () => ({
        url: "templates/:userId/workouts/",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({id}) => ({type: "WorkoutTemplate" as const, id})),
              {type: "WorkoutTemplate", id: "LIST"},
            ]
          : [{type: "WorkoutTemplate", id: "LIST"}],
    }),
    createWorkoutTemplate: builder.mutation<WorkoutTemplate, CreateWorkoutTemplateForm>({
      query: (workout) => ({
        url: "templates/:userId/workouts/",
        method: "POST",
        body: workout,
      }),
      transformResponse: (response: ApiResponse<WorkoutTemplate>) => response.data,
      invalidatesTags: [{type: "WorkoutTemplate", id: "LIST"}],
    }),
  }),
});

export const {useListWorkoutTemplatesQuery, useCreateWorkoutTemplateMutation} = workoutApi;
