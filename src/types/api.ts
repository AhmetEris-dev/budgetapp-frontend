export type ApiValidationErrors = Record<string, string>;

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: ApiValidationErrors;
}
