export type BudgetPeriodType = "MONTHLY" | "YEARLY";

export interface UpsertBudgetRequest {
  periodType: BudgetPeriodType;
  year: number;
  month?: number;
  limitAmount: string; // send as string to preserve BigDecimal
}

export interface BudgetResponse {
  id?: number;
  periodType: BudgetPeriodType;
  year: number;
  month?: number;
  limitAmount: string;
  createdAt?: string;
  updatedAt?: string;
}
