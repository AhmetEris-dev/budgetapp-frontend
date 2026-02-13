import { createSlice } from "@reduxjs/toolkit";
import type { AlertResponse, PageResponse } from "../../types/alert";
import { fetchAlertsThunk, markAlertReadThunk } from "./alertThunks";

type AlertState = {
  pageData: PageResponse<AlertResponse> | null;
  loading: boolean;
  marking: Record<number, boolean>;
  error: string | null;
};

const initialState: AlertState = {
  pageData: null,
  loading: false,
  marking: {},
  error: null,
};

const slice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    clearAlerts(state) {
      state.pageData = null;
      state.loading = false;
      state.error = null;
      state.marking = {};
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchAlertsThunk.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(fetchAlertsThunk.fulfilled, (s, a) => {
      s.loading = false;
      s.pageData = a.payload;
    });
    b.addCase(fetchAlertsThunk.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload ?? "Failed to load alerts";
    });

    b.addCase(markAlertReadThunk.pending, (s, a) => {
      const id = a.meta.arg;
      s.marking[id] = true;
      s.error = null;
    });
    b.addCase(markAlertReadThunk.fulfilled, (s, a) => {
      const id = a.meta.arg;
      s.marking[id] = false;
      if (s.pageData) {
        s.pageData.items = s.pageData.items.map((x) => (x.id === id ? { ...x, status: "READ" } : x));
      }
    });
    b.addCase(markAlertReadThunk.rejected, (s, a) => {
      const id = a.meta.arg;
      s.marking[id] = false;
      s.error = a.payload ?? "Failed to mark read";
    });
  },
});

export const alertActions = slice.actions;
export default slice.reducer;
