import {AuthToken, User} from "@src/types";
import {baseApi} from "./baseApi";

export interface ApiResponse<T> {
  data: T;
}
export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signIn: builder.mutation<AuthToken, SignInRequest>({
      query: (credentials) => ({
        url: "auth/signin/",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<AuthToken>) => response.data,
    }),
    signUp: builder.mutation<AuthToken, SignUpRequest>({
      query: (credentials) => ({
        url: "auth/signup/",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<AuthToken>) => response.data,
    }),
    signOut: builder.mutation<void, void>({
      query: () => ({
        url: "auth/signout/",
        method: "POST",
      }),
    }),
    forgotPassword: builder.mutation<void, ForgotPasswordRequest>({
      query: (email) => ({
        url: "auth/password/reset/",
        method: "POST",
        body: email,
      }),
    }),
    getAuthUser: builder.query<User, void>({
      query: () => ({
        url: "user/",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<User>) => response.data,
    }),
  }),
});

export const {
  useSignInMutation,
  useSignUpMutation,
  useSignOutMutation,
  useForgotPasswordMutation,
  useLazyGetAuthUserQuery,
} = authApi;
