import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/user/userSlice";
import budgetReducer from "../features/budget/budgetSlice";
import expenseReducer from "../features/expense/expenseSlice";
import alertReducer from "../features/alert/alertSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    budget: budgetReducer,
    expense: expenseReducer,
    alert: alertReducer,
  },
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
