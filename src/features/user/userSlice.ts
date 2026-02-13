import { createSlice } from "@reduxjs/toolkit";
import type { UserResponse } from "../../types/user";
import { fetchMe } from "./userThunks";

type UserState = {
  me: UserResponse | null;
  loading: boolean;
  error: string | null;
};

const initialState: UserState = {
  me: null,
  loading: false,
  error: null,
};

const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUser(state) {
      state.me = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchMe.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(fetchMe.fulfilled, (s, a) => {
      s.loading = false;
      s.me = a.payload;
    });
    b.addCase(fetchMe.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload ?? "Failed to load user";
    });
  },
});

export const userActions = slice.actions;
export default slice.reducer;
