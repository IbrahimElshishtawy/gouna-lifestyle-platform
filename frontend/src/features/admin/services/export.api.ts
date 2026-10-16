import { apiClient } from "@/lib/api/client";

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
  const endpoint = `/api/v1/admin/export/${format}?type=${encodeURIComponent(type)}`;

  // Determine base API url
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const fullUrl = `${apiBase.replace(/\/+$/, "")}${endpoint}`;

  // Get auth token if stored
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("auth_token") || localStorage.getItem("sanctum_token");
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
    credentials: "omit",
  });

  if (!response.ok) {
    throw new Error(`Export request failed with status: ${response.status}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;

  // Determine file extension
  let ext = "csv";
  if (format === "word") ext = "doc";
  if (format === "json") ext = "json";

  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `gounow_${type}_${dateStr}.${ext}`;

  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
