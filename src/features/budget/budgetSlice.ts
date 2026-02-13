import { createSlice } from "@reduxjs/toolkit";
import type { BudgetResponse } from "../../types/budget";
import { getActiveBudgetThunk, upsertBudgetThunk } from "./budgetThunks";

type BudgetState = {
  active: BudgetResponse | null;
  loadingActive: boolean;
  upserting: boolean;
  error: string | null;
};

const initialState: BudgetState = {
  active: null,
  loadingActive: false,
  upserting: false,
  error: null,
};

const slice = createSlice({
  name: "budget",
  initialState,
  reducers: {
    clearBudget(state) {
      state.active = null;
      state.loadingActive = false;
      state.upserting = false;
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(getActiveBudgetThunk.pending, (s) => {
      s.loadingActive = true;
      s.error = null;
    });
    b.addCase(getActiveBudgetThunk.fulfilled, (s, a) => {
      s.loadingActive = false;
      s.active = a.payload;
    });
    b.addCase(getActiveBudgetThunk.rejected, (s, a) => {
      s.loadingActive = false;
      s.error = a.payload ?? "Failed to load active budget";
    });

    b.addCase(upsertBudgetThunk.pending, (s) => {
      s.upserting = true;
      s.error = null;
    });
    b.addCase(upsertBudgetThunk.fulfilled, (s, a) => {
      s.upserting = false;
      s.active = a.payload;
    });
    b.addCase(upsertBudgetThunk.rejected, (s, a) => {
      s.upserting = false;
      s.error = a.payload ?? "Failed to save budget";
    });
  },
});

export const budgetActions = slice.actions;
export default slice.reducer;
