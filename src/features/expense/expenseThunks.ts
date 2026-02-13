import { createAsyncThunk } from "@reduxjs/toolkit";
import type { CreateExpenseRequest, ExpenseResponse, ExpenseTotalResponse } from "../../types/expense";
import { http, HttpClientError } from "../../services/httpClient";

export const createExpenseThunk = createAsyncThunk<ExpenseResponse, CreateExpenseRequest, { rejectValue: string }>(
  "expense/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await http.post<ExpenseResponse>("/api/v1/expenses", payload);
    } catch (e) {
      if (e instanceof HttpClientError) return rejectWithValue(e.apiError?.message ?? e.message);
      return rejectWithValue("Failed to create expense");
    }
  }
);

export const fetchExpensesThunk = createAsyncThunk<
  ExpenseResponse[],
  { start: string; end: string },
  { rejectValue: string }
>("expense/list", async ({ start, end }, { rejectWithValue }) => {
  try {
    const q = new URLSearchParams({ start, end });
    return await http.get<ExpenseResponse[]>(`/api/v1/expenses?${q.toString()}`);
  } catch (e) {
    if (e instanceof HttpClientError) return rejectWithValue(e.apiError?.message ?? e.message);
    return rejectWithValue("Failed to load expenses");
  }
});

export const fetchExpenseTotalThunk = createAsyncThunk<
  ExpenseTotalResponse,
  { start: string; end: string },
  { rejectValue: string }
>("expense/total", async ({ start, end }, { rejectWithValue }) => {
  try {
    const q = new URLSearchParams({ start, end });
    return await http.get<ExpenseTotalResponse>(`/api/v1/expenses/total?${q.toString()}`);
  } catch (e) {
    if (e instanceof HttpClientError) return rejectWithValue(e.apiError?.message ?? e.message);
    return rejectWithValue("Failed to load total");
  }
});
