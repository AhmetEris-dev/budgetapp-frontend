import type { ApiError } from "../types/api";

export function getApiErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return "Unexpected error";
}

export function isApiError(x: unknown): x is ApiError {
  return (
    !!x &&
    typeof x === "object" &&
    "status" in x &&
    "message" in x &&
    typeof (x as any).status === "number"
  );
}
