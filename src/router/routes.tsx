import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import BudgetPage from "../features/budget/pages/BudgetPage";
import ExpensesPage from "../features/expense/pages/ExpensesPage";
import { AppShell } from "../shared/layout/AppShell";
import { AuthShell } from "../shared/layout/AuthShell";
import { storage } from "../utils/storage";

export function AppRoutes() {
  const isAuthed = !!storage.getAccessToken();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* PUBLIC (Auth) */}
      <Route element={<AuthShell />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* PROTECTED (App) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          {/* Alerts artık drawer'da; route gereksiz */}
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={isAuthed ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}
