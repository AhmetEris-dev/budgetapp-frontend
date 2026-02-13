import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { TokenResponse } from "../../types/auth";
import { storage } from "../../utils/storage";
import { loginThunk, registerThunk } from "./authThunks";


type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  accessToken: storage.getAccessToken(),
  refreshToken: storage.getRefreshToken(),
  loading: false,
  error: null,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokens(state, action: PayloadAction<TokenResponse>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      storage.setTokens(action.payload.accessToken, action.payload.refreshToken);
    },
    loggedOut(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      state.loading = false;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(loginThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(loginThunk.fulfilled, (s, a) => {
      s.loading = false;
      s.accessToken = a.payload.accessToken;
      s.refreshToken = a.payload.refreshToken;
    });
    b.addCase(loginThunk.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload ?? "Login failed";
    });

    b.addCase(registerThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(registerThunk.fulfilled, (s, a) => {
      s.loading = false;
      s.accessToken = a.payload.accessToken;
      s.refreshToken = a.payload.refreshToken;
    });
    b.addCase(registerThunk.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload ?? "Register failed";
    });
  },
});

export const authActions = slice.actions;
export default slice.reducer;
