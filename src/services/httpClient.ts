import type { ApiError } from "../types/api";
import type { TokenResponse } from "../types/auth";
import { storage } from "../utils/storage";

const API_PREFIX = "/api/v1";
const AUTH_BASE = `${API_PREFIX}/auth`;

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export class HttpClientError extends Error {
  public status: number;
  public apiError?: ApiError;

  constructor(message: string, status: number, apiError?: ApiError) {
    super(message);
    this.status = status;
    this.apiError = apiError;
  }
}

async function parseApiError(res: Response): Promise<ApiError | undefined> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return undefined;

  try {
    const data = (await res.json()) as ApiError;
    if (data && typeof data.status === "number" && typeof data.message === "string") {
      return data;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

async function refreshTokenOnce(): Promise<TokenResponse> {
  const refreshToken = storage.getRefreshToken();
  if (!refreshToken) throw new Error("Missing refresh token");

  const res = await fetch(`${AUTH_BASE}/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    const apiError = await parseApiError(res);
    throw new HttpClientError(apiError?.message ?? "Refresh failed", res.status, apiError);
  }

  const tokens = (await res.json()) as TokenResponse;
  if (!tokens?.accessToken || !tokens?.refreshToken) throw new Error("Invalid refresh response");

  storage.setTokens(tokens.accessToken, tokens.refreshToken);
  return tokens;
}

function buildHeaders(isJson: boolean): HeadersInit {
  const headers: Record<string, string> = {};
  if (isJson) headers["Content-Type"] = "application/json";

  const token = storage.getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return headers;
}

async function request<T>(
  method: HttpMethod,
  url: string,
  options?: {
    body?: unknown;
    isJson?: boolean;
    retryOn401?: boolean;
    signal?: AbortSignal;
  }
): Promise<T> {
  const isJson = options?.isJson ?? true;

  const res = await fetch(url, {
    method,
    headers: buildHeaders(isJson),
    body: options?.body != null ? (isJson ? JSON.stringify(options.body) : (options.body as any)) : undefined,
    signal: options?.signal,
  });

  if (res.status === 401 && (options?.retryOn401 ?? true)) {
    // Attempt refresh ONCE, then retry original request
    try {
      await refreshTokenOnce();
      return request<T>(method, url, { ...options, retryOn401: false });
    } catch {
      storage.clearTokens();
      // hard redirect (also clears protected UI state)
      window.location.assign("/login");
      throw new HttpClientError("Unauthorized", 401);
    }
  }

  if (!res.ok) {
    const apiError = await parseApiError(res);
    const msg = apiError?.message ?? `Request failed (${res.status})`;
    throw new HttpClientError(msg, res.status, apiError);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    // if backend returns empty or text unexpectedly
    return undefined as T;
  }

  return (await res.json()) as T;
}

export const http = {
  get<T>(path: string) {
    return request<T>("GET", path);
  },
  post<T>(path: string, body?: unknown) {
    return request<T>("POST", path, { body });
  },
  patch<T>(path: string, body?: unknown) {
    return request<T>("PATCH", path, { body });
  },
  put<T>(path: string, body?: unknown) {
    return request<T>("PUT", path, { body });
  },
  delete<T>(path: string) {
    return request<T>("DELETE", path);
  },
};
