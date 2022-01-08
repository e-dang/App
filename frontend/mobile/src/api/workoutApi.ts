import {Workout} from "@entities";
import {ApiListResponse, ApiResponse} from "./types";
import {baseApi} from "./baseApi";

export interface CreateWorkoutRequest {
  name: string;
  notes: string;
}

const taggedBaseApi = baseApi.enhanceEndpoints({addTagTypes: ["Workout"]});

export const workoutApi = taggedBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    listWorkouts: builder.query<ApiListResponse<Workout>, void>({
      query: () => ({
        url: ":userId/workouts/",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [...result.data.map(({id}) => ({type: "Workout" as const, id})), {type: "Workout", id: "LIST"}]
          : [{type: "Workout", id: "LIST"}],
    }),
    createWorkout: builder.mutation<Workout, CreateWorkoutRequest>({
      query: (workout) => ({
        url: ":userId/workouts/",
        method: "POST",
        body: workout,
      }),
      transformResponse: (response: ApiResponse<Workout>) => response.data,
      invalidatesTags: [{type: "Workout", id: "LIST"}],
    }),
  }),
});

export const {useListWorkoutsQuery, useCreateWorkoutMutation} = workoutApi;
