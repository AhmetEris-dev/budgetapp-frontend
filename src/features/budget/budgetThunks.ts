import { createAsyncThunk } from "@reduxjs/toolkit";
import type { BudgetPeriodType, BudgetResponse, UpsertBudgetRequest } from "../../types/budget";
import { http, HttpClientError } from "../../services/httpClient";

export const upsertBudgetThunk = createAsyncThunk<BudgetResponse, UpsertBudgetRequest, { rejectValue: string }>(
  "budget/upsert",
  async (payload, { rejectWithValue }) => {
    try {
      return await http.post<BudgetResponse>("/api/v1/budgets", payload);
    } catch (e) {
      if (e instanceof HttpClientError) return rejectWithValue(e.apiError?.message ?? e.message);
      return rejectWithValue("Failed to save budget");
    }
  }
);

export const getActiveBudgetThunk = createAsyncThunk<
  BudgetResponse,
  { periodType: BudgetPeriodType; year: number; month?: number },
  { rejectValue: string }
>("budget/getActive", async (params, { rejectWithValue }) => {
  try {
    const q = new URLSearchParams();
    q.set("periodType", params.periodType);
    q.set("year", String(params.year));
    if (params.month != null) q.set("month", String(params.month));
    return await http.get<BudgetResponse>(`/api/v1/budgets/active?${q.toString()}`);
  } catch (e) {
    if (e instanceof HttpClientError) return rejectWithValue(e.apiError?.message ?? e.message);
    return rejectWithValue("Failed to load active budget");
  }
});
