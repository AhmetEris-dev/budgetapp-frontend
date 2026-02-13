import type { AlertType } from "../types/alert";
import type { ExpenseType } from "../types/expense";
import type { BudgetPeriodType } from "../types/budget";

export function alertTypeLabel(t: AlertType): string {
  switch (t) {
    case "BUDGET_EXCEEDED":
      return "Bütçe Aşıldı";
    case "CRITICAL":
      return "Kritik";
    case "WARNING":
      return "Uyarı";
    default:
      return t;
  }
}

export function expenseTypeLabel(t: ExpenseType): string {
  switch (t) {
    case "NORMAL":
      return "Normal";
    case "REFUND":
      return "İade";
    case "ADJUSTMENT":
      return "Düzeltme";
    default:
      return t;
  }
}

export function budgetPeriodTypeLabel(t: BudgetPeriodType): string {
  switch (t) {
    case "MONTHLY":
      return "Aylık";
    case "YEARLY":
      return "Yıllık";
    default:
      return t;
  }
}
