const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface NormalizedApiError {
  status: number;
  message: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
  data?: unknown;
}

export class ApiError extends Error {
  public status: number;
  public code?: string;
  public fieldErrors?: Record<string, string[]>;
  public requestId?: string;
  public data?: unknown;

  constructor(error: NormalizedApiError) {
    super(error.message);
    this.name = "ApiError";
    this.status = error.status;
    this.code = error.code;
    this.fieldErrors = error.fieldErrors;
    this.requestId = error.requestId;
    this.data = error.data;
  }
}

/**
 * In-memory / storage token helpers
 */
const TOKEN_STORAGE_KEY = "gounow_auth_token";

export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage restrictions
  }
}

export interface ApiClientOptions extends RequestInit {
  timeoutMs?: number;
  token?: string | null;
  cacheTtlMs?: number; // e.g. 15000 for 15s in-memory cache on GET
  skipCache?: boolean;
  retries?: number;
}

// In-flight GET promise deduplication to prevent slamming server with duplicate requests
const inFlightRequests = new Map<string, Promise<unknown>>();

// Short-term in-memory cache for high-traffic GET requests
interface CacheRecord {
  data: unknown;
  expiresAt: number;
}
const responseCache = new Map<string, CacheRecord>();

/**
 * High-performance, rate-limit resilient HTTP client with request deduplication,
 * short-term memory caching, and exponential backoff retry.
 */
export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const normalizedEndpoint = endpoint.replace(/\?$/, "");
  const url = normalizedEndpoint.startsWith("http")
    ? normalizedEndpoint
    : `${API_BASE_URL.replace(/\/$/, "")}/${normalizedEndpoint.replace(/^\//, "")}`;

  // Cache & deduplication key for safe idempotent GET requests
  const cacheKey = `${method}:${url}`;
  const now = Date.now();

  // 1. Check in-memory cache if applicable
  if (method === "GET" && !options.skipCache && options.cacheTtlMs && options.cacheTtlMs > 0) {
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.data as T;
    }
  }

  // 2. In-flight request deduplication for GET: return existing promise if identical request is pending
  if (method === "GET" && !options.skipCache && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<T>;
  }

  const executeRequest = async (attempt = 0): Promise<T> => {
    const headers = new Headers(options.headers || {});

    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }

    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    // Attach Authorization header if provided or found in storage
    const token = options.token !== undefined ? options.token : getStoredAuthToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const timeoutMs = options.timeoutMs ?? 10000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        credentials: options.credentials || "include",
        ...options,
        headers,
        signal: options.signal || controller.signal,
      });

      clearTimeout(timeoutId);

      const requestId = response.headers.get("X-Request-ID") || undefined;
      const contentType = response.headers.get("content-type") || "";
      let responseData: unknown = null;

      if (contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Handle Rate Limiting (429) & Temporary Server Hiccups (503) with Backoff Retries
      const maxRetries = options.retries ?? 2;
      if ((response.status === 429 || response.status === 503) && attempt < maxRetries) {
        const retryAfterHeader = response.headers.get("Retry-After");
        const delayMs = retryAfterHeader
          ? parseInt(retryAfterHeader, 10) * 1000
          : Math.min(1000 * Math.pow(2, attempt) + Math.random() * 300, 4000);

        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return executeRequest(attempt + 1);
      }

      if (!response.ok) {
        const errObj = responseData as {
          message?: string;
          errors?: Record<string, string[]>;
          error?: {
            code?: string;
            message?: string;
            details?: Record<string, string[]> | { retry_after?: number };
            request_id?: string;
          };
          meta?: {
            request_id?: string;
          };
        } | null;

        let code = errObj?.error?.code;
        let fieldErrors: Record<string, string[]> | undefined = errObj?.errors;

        if (
          !fieldErrors &&
          errObj?.error?.details &&
          typeof errObj.error.details === "object" &&
          !("retry_after" in errObj.error.details)
        ) {
          fieldErrors = errObj.error.details as Record<string, string[]>;
        }

        let message = errObj?.error?.message || errObj?.message;
        if (!message) {
          switch (response.status) {
            case 400:
              message = "Bad Request. Please verify your input.";
              break;
            case 401:
              message = "Authentication required. Please sign in.";
              break;
            case 403:
              message = "Access denied. You do not have permission to view this resource.";
              break;
            case 404:
              message = "The requested resource was not found.";
              break;
            case 409:
              message = "A conflict occurred. The requested dates or resource might already be booked.";
              break;
            case 422:
              message = "Validation failed. Please correct the highlighted errors.";
              break;
            case 429:
              message = "Too many requests. Please wait a moment before trying again.";
              break;
            case 500:
            case 502:
            case 503:
              message = "Service temporarily unavailable. Please try again shortly.";
              break;
            default:
              message = `Request failed with status ${response.status}`;
          }
        }

        throw new ApiError({
          status: response.status,
          message,
          code,
          fieldErrors,
          requestId: requestId || errObj?.error?.request_id || errObj?.meta?.request_id,
          data: responseData,
        });
      }

      // Populate in-memory cache if TTL is configured
      if (method === "GET" && options.cacheTtlMs && options.cacheTtlMs > 0) {
        responseCache.set(cacheKey, {
          data: responseData,
          expiresAt: Date.now() + options.cacheTtlMs,
        });
      }

      return responseData as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) {
        throw error;
      }

      // Check for abort / timeout
      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError({
          status: 408,
          message: "Request timed out. Please verify your network connection and try again.",
          code: "REQUEST_TIMEOUT",
        });
      }

      throw new ApiError({
        status: 0,
        message: error instanceof Error ? error.message : "Network error. Unable to reach server.",
        code: "NETWORK_ERROR",
        data: error,
      });
    }
  };

  const reqPromise = executeRequest().finally(() => {
    inFlightRequests.delete(cacheKey);
  });

  if (method === "GET" && !options.skipCache) {
    inFlightRequests.set(cacheKey, reqPromise);
  }

  return reqPromise as Promise<T>;
}
