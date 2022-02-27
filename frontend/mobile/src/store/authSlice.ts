import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AuthToken, User} from "@entities";

export interface AuthState {
  user?: User;
  token?: AuthToken;
}

const initialState: AuthState = {};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthToken>) => {
      state.token = action.payload;
    },
    setAuthUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    signOut: () => {
      return initialState;
    },
  },
});

export const {setCredentials, setAuthUser, signOut} = authSlice.actions;
export const authReducer = authSlice.reducer;
