import { createSlice } from "@reduxjs/toolkit";
import type { ExpenseResponse, ExpenseTotalResponse } from "../../types/expense";
import { createExpenseThunk, fetchExpensesThunk, fetchExpenseTotalThunk } from "./expenseThunks";

type ExpenseState = {
  items: ExpenseResponse[];
  total: ExpenseTotalResponse | null;
  loadingList: boolean;
  loadingTotal: boolean;
  creating: boolean;
  error: string | null;
};

const initialState: ExpenseState = {
  items: [],
  total: null,
  loadingList: false,
  loadingTotal: false,
  creating: false,
  error: null,
};

const slice = createSlice({
  name: "expense",
  initialState,
  reducers: {
    clearExpense(state) {
      state.items = [];
      state.total = null;
      state.loadingList = false;
      state.loadingTotal = false;
      state.creating = false;
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchExpensesThunk.pending, (s) => {
      s.loadingList = true;
      s.error = null;
    });
    b.addCase(fetchExpensesThunk.fulfilled, (s, a) => {
      s.loadingList = false;
      s.items = a.payload;
    });
    b.addCase(fetchExpensesThunk.rejected, (s, a) => {
      s.loadingList = false;
      s.error = a.payload ?? "Failed to load expenses";
    });

    b.addCase(fetchExpenseTotalThunk.pending, (s) => {
      s.loadingTotal = true;
      s.error = null;
    });
    b.addCase(fetchExpenseTotalThunk.fulfilled, (s, a) => {
      s.loadingTotal = false;
      s.total = a.payload;
    });
    b.addCase(fetchExpenseTotalThunk.rejected, (s, a) => {
      s.loadingTotal = false;
      s.error = a.payload ?? "Failed to load total";
    });

    b.addCase(createExpenseThunk.pending, (s) => {
      s.creating = true;
      s.error = null;
    });
    b.addCase(createExpenseThunk.fulfilled, (s, a) => {
      s.creating = false;
      s.items = [a.payload, ...s.items];
    });
    b.addCase(createExpenseThunk.rejected, (s, a) => {
      s.creating = false;
      s.error = a.payload ?? "Failed to create expense";
    });
  },
});

export const expenseActions = slice.actions;
export default slice.reducer;
