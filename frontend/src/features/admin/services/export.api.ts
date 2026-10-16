import { apiClient, getStoredAuthToken } from "@/lib/api/client";

export interface ExportOverviewData {
  properties_count: number;
  bookings_count: number;
  pricing_count: number;
  yachts_count: number;
  experiences_count: number;
  events_count: number;
  users_count: number;
  leads_count: number;
  finances_count: number;
  customers_count: number;
  settings_count: number;
  generated_at: string;
  supported_formats: string[];
  supported_types: string[];
}

export async function getExportOverview(): Promise<ExportOverviewData> {
  const res = await apiClient<{ status: string; data: ExportOverviewData }>("/admin/export/overview");
  return res.data;
}

/**
 * Downloads the exported file (Excel, Word, JSON) directly to client machine.
 */
export async function downloadExportFile(
  format: "excel" | "word" | "json",
  type: string = "all"
): Promise<void> {
  // Determine base API url safely without duplicating /api/v1
  const rawApiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  const cleanBase = rawApiBase.replace(/\/+$/, "");

  const endpointPath = cleanBase.endsWith("/api/v1")
    ? `/admin/export/${format}?type=${encodeURIComponent(type)}`
    : `/api/v1/admin/export/${format}?type=${encodeURIComponent(type)}`;

  const fullUrl = `${cleanBase}${endpointPath}`;

  // Get auth token from central helper and all storage fallback keys
  let token: string | null = getStoredAuthToken();
  if (!token && typeof window !== "undefined") {
    token =
      localStorage.getItem("gounow_auth_token") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("sanctum_token");
  }

  const headers: HeadersInit = {
    Accept: format === "json" ? "application/json" : "*/*",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let errorDetail = `status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson?.message) {
        errorDetail = errJson.message;
      } else if (errJson?.error?.message) {
        errorDetail = errJson.error.message;
      }
    } catch {
      // Non-JSON error body
    }
    throw new Error(`Export request failed: ${errorDetail}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;

  // Determine file extension and filename from header if present
  let ext = "csv";
  if (format === "word") ext = "doc";
  if (format === "json") ext = "json";

  const dateStr = new Date().toISOString().slice(0, 10);
  let filename = `gounow_${type}_${dateStr}.${ext}`;

  const disposition = response.headers.get("content-disposition");
  if (disposition && disposition.includes("filename=")) {
    const match = disposition.match(/filename=["']?([^"';]+)["']?/i);
    if (match && match[1]) {
      filename = match[1].trim();
    }
  }

  a.download = filename;

  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
