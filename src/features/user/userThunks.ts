import { createAsyncThunk } from "@reduxjs/toolkit";
import type { UserResponse } from "../../types/user";
import { http, HttpClientError } from "../../services/httpClient";

export const fetchMe = createAsyncThunk<UserResponse, void, { rejectValue: string }>(
  "user/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      return await http.get<UserResponse>("/api/v1/users/me");
    } catch (e) {
      if (e instanceof HttpClientError) return rejectWithValue(e.apiError?.message ?? e.message);
      return rejectWithValue("Failed to load user");
    }
  }
);
