import { createAsyncThunk } from "@reduxjs/toolkit";
import type { LoginRequest, RegisterRequest, TokenResponse } from "../../types/auth";
import { http, HttpClientError } from "../../services/httpClient";
import { storage } from "../../utils/storage";

const AUTH_BASE = "/api/v1/auth";

function persistTokens(tokens: TokenResponse) {
  storage.setTokens(tokens.accessToken, tokens.refreshToken);
}

export const loginThunk = createAsyncThunk<TokenResponse, LoginRequest, { rejectValue: string }>(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const tokens = await http.post<TokenResponse>(`${AUTH_BASE}/login`, payload);
      persistTokens(tokens);
      return tokens;
    } catch (e) {
      if (e instanceof HttpClientError) return rejectWithValue(e.apiError?.message ?? e.message);
      return rejectWithValue("Login failed");
    }
  }
);

export const registerThunk = createAsyncThunk<TokenResponse, RegisterRequest, { rejectValue: string }>(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const tokens = await http.post<TokenResponse>(`${AUTH_BASE}/register`, payload);
      persistTokens(tokens);
      return tokens;
    } catch (e) {
      if (e instanceof HttpClientError) return rejectWithValue(e.apiError?.message ?? e.message);
      return rejectWithValue("Register failed");
    }
  }
);
