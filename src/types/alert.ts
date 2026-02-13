export type AlertStatus = "ACTIVE" | "READ";
export type AlertType = "BUDGET_EXCEEDED" | "CRITICAL" | "WARNING";

export interface AlertResponse {
  id: number;
  status: AlertStatus;
  type: AlertType;
  message: string;
  createdAt: string;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
