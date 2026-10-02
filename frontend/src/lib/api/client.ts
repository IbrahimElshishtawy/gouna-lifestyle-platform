const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // If no backend URL configured and not an absolute URL, throw immediately to trigger local data fallback
  if (!API_BASE_URL && !endpoint.startsWith("http")) {
    throw new ApiError("Backend API URL not configured; using local data fallback.");
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(url, {
      credentials: options.credentials || "include",
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type") || "";
    let responseData: unknown = null;

    if (contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      const errorData = responseData as {
        message?: string;
        error?: {
          code?: string;
          message?: string;
          details?: Record<string, string[]>;
          request_id?: string;
        };
      } | null;

      const errorMessage = errorData?.error?.message
        || errorData?.message
        || `Request failed with status ${response.status}`;

      throw new ApiError(
        errorMessage,
        response.status,
        responseData
      );
    }

    return responseData as T;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
