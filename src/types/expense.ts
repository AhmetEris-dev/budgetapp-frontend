export type ExpenseType = "NORMAL" | "REFUND" | "ADJUSTMENT";

export interface CreateExpenseRequest {
  amount: string;
  expenseDate: string; // YYYY-MM-DD
  title: string;
  description?: string;
  type: ExpenseType;
}

export interface ExpenseResponse {
  id: number;
  userId?: number;
  amount: string;
  expenseDate: string;
  title: string;
  description?: string | null;
  type: ExpenseType;
  createdAt?: string;
}

export interface ExpenseTotalResponse {
  start: string;
  end: string;
  total: string;
}
