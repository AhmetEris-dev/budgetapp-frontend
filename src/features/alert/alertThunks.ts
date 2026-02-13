import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AlertStatus, AlertResponse, PageResponse } from "../../types/alert";
import { http, HttpClientError } from "../../services/httpClient";

export const fetchAlertsThunk = createAsyncThunk<
  PageResponse<AlertResponse>,
  { status?: AlertStatus; page: number; size: number },
  { rejectValue: string }
>("alert/list", async ({ status, page, size }, { rejectWithValue }) => {
  try {
    const q = new URLSearchParams();
    if (status) q.set("status", status);
    q.set("page", String(page));
    q.set("size", String(size));
    return await http.get<PageResponse<AlertResponse>>(`/api/v1/alerts?${q.toString()}`);
  } catch (e) {
    if (e instanceof HttpClientError) return rejectWithValue(e.apiError?.message ?? e.message);
    return rejectWithValue("Failed to load alerts");
  }
});

export const markAlertReadThunk = createAsyncThunk<void, number, { rejectValue: string }>(
  "alert/markRead",
  async (id, { rejectWithValue }) => {
    try {
      await http.patch<void>(`/api/v1/alerts/${id}/read`);
      return;
    } catch (e) {
      if (e instanceof HttpClientError) return rejectWithValue(e.apiError?.message ?? e.message);
      return rejectWithValue("Failed to mark read");
    }
  }
);
