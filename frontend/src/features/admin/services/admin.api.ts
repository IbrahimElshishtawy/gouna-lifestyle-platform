import { apiClient } from "@/lib/api/client";
import type {
  SingleResponse,
  PaginatedResponse,
  DashboardData,
  AdminBookingItem,
  AdminStaffItem,
  AdminRoleItem,
  AdminLeadItem,
  AdminTransactionItem,
  FinanceSummary,
  AdminCustomerItem,
  ActivityLogItem,
  PlatformSettingsMap,
} from "../types";

/**
 * 1. Dashboard Command Center
 */
export async function getDashboardMetrics(): Promise<DashboardData> {
  const res = await apiClient<SingleResponse<DashboardData>>("/admin/dashboard");
  return res.data;
}

/**
 * 2. Bookings Management
 */
export async function getAdminBookings(params?: {
  status?: string;
  page?: number;
}): Promise<PaginatedResponse<AdminBookingItem>> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", params.page.toString());

  const qs = query.toString();
  return apiClient<PaginatedResponse<AdminBookingItem>>(`/admin/bookings${qs ? `?${qs}` : ""}`);
}

export async function updateBookingStatus(
  id: number,
  status: "confirmed" | "cancelled" | "completed"
): Promise<{ success: boolean; message: string }> {
  return apiClient<{ success: boolean; message: string }>(`/admin/bookings/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function refundBooking(
  id: number,
  amountCents?: number,
  reason?: string
): Promise<{ success: boolean; message: string }> {
  return apiClient<{ success: boolean; message: string }>(`/admin/bookings/${id}/refund`, {
    method: "POST",
    body: JSON.stringify({ amount_cents: amountCents, reason }),
  });
}

/**
 * 3. Staff & Administrative Users
 */
export async function getAdminStaff(): Promise<{ staff: AdminStaffItem[]; roles: AdminRoleItem[] }> {
  const res = await apiClient<SingleResponse<{ staff: AdminStaffItem[]; roles: AdminRoleItem[] }>>("/admin/users");
  return res.data;
}

export async function createAdminStaff(payload: {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: string;
}): Promise<SingleResponse<AdminStaffItem>> {
  return apiClient<SingleResponse<AdminStaffItem>>("/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminStaff(
  id: number,
  payload: Partial<AdminStaffItem>
): Promise<SingleResponse<AdminStaffItem>> {
  return apiClient<SingleResponse<AdminStaffItem>>(`/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminStaff(id: number): Promise<{ success: boolean }> {
  return apiClient<{ success: boolean }>(`/admin/users/${id}`, {
    method: "DELETE",
  });
}

/**
 * 4. VIP Concierge & Leads
 */
export async function getAdminConciergeLeads(params?: {
  status?: string;
  type?: string;
  page?: number;
}): Promise<PaginatedResponse<AdminLeadItem>> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.type) query.set("type", params.type);
  if (params?.page) query.set("page", params.page.toString());

  const qs = query.toString();
  return apiClient<PaginatedResponse<AdminLeadItem>>(`/admin/concierge${qs ? `?${qs}` : ""}`);
}

export async function updateConciergeStatus(
  id: number,
  status: string,
  notes?: string
): Promise<SingleResponse<AdminLeadItem>> {
  return apiClient<SingleResponse<AdminLeadItem>>(`/admin/concierge/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status, admin_notes: notes }),
  });
}

export async function assignConciergeLead(
  id: number,
  userId: number
): Promise<SingleResponse<AdminLeadItem>> {
  return apiClient<SingleResponse<AdminLeadItem>>(`/admin/concierge/${id}/assign`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
}

/**
 * 5. Finances & Payment Transactions
 */
export async function getAdminFinances(params?: {
  page?: number;
  type?: string;
  status?: string;
}): Promise<PaginatedResponse<AdminTransactionItem>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());
  if (params?.type) query.set("type", params.type);
  if (params?.status) query.set("status", params.status);

  const qs = query.toString();
  return apiClient<PaginatedResponse<AdminTransactionItem>>(`/admin/finances${qs ? `?${qs}` : ""}`);
}

export async function getAdminFinanceSummary(): Promise<FinanceSummary> {
  const res = await apiClient<SingleResponse<FinanceSummary>>("/admin/finances/summary");
  return res.data;
}

/**
 * 6. Customers / CRM
 */
export async function getAdminCustomers(params?: {
  page?: number;
  search?: string;
}): Promise<PaginatedResponse<AdminCustomerItem>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());
  if (params?.search) query.set("search", params.search);

  const qs = query.toString();
  return apiClient<PaginatedResponse<AdminCustomerItem>>(`/admin/customers${qs ? `?${qs}` : ""}`);
}

/**
 * 7. Settings & Audit Logs
 */
export async function getAdminSettings(): Promise<PlatformSettingsMap> {
  const res = await apiClient<SingleResponse<PlatformSettingsMap>>("/admin/settings");
  return res.data;
}

export async function updateAdminSettings(
  settings: Record<string, string | number | boolean | null>
): Promise<{ success: boolean; message: string }> {
  return apiClient<{ success: boolean; message: string }>("/admin/settings", {
    method: "PUT",
    body: JSON.stringify({ settings }),
  });
}

export async function getAdminAuditLogs(params?: {
  page?: number;
}): Promise<PaginatedResponse<ActivityLogItem>> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());

  const qs = query.toString();
  return apiClient<PaginatedResponse<ActivityLogItem>>(`/admin/audit-logs${qs ? `?${qs}` : ""}`);
}

/**
 * 8. Properties & Units Management (Pause / Resume Display & Status)
 */
export async function getAdminProperties(params?: {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
}): Promise<PaginatedResponse<import("../types").AdminPropertyItem> & { summary: import("../types").AdminPropertySummary }> {
  const query = new URLSearchParams();
  if (params?.type) query.set("type", params.type);
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", params.page.toString());

  const qs = query.toString();
  return apiClient<PaginatedResponse<import("../types").AdminPropertyItem> & { summary: import("../types").AdminPropertySummary }>(
    `/admin/properties${qs ? `?${qs}` : ""}`
  );
}

export async function togglePropertyStatus(
  id: number,
  is_published?: boolean
): Promise<{ success: boolean; message: string; data: { id: number; reference_number: string; is_published: boolean; status: string } }> {
  return apiClient<{ success: boolean; message: string; data: { id: number; reference_number: string; is_published: boolean; status: string } }>(
    `/admin/properties/${id}/toggle-status`,
    {
      method: "PUT",
      body: JSON.stringify(typeof is_published === "boolean" ? { is_published } : {}),
    }
  );
}

export async function updateAdminProperty(
  id: number,
  payload: Record<string, unknown>
): Promise<{ success: boolean; message: string }> {
  return apiClient<{ success: boolean; message: string }>(`/admin/properties/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * 9. Media Design & Homepage CMS Control
 */
export async function getMediaDesignConfig(): Promise<import("../types").MediaDesignResponse> {
  const res = await apiClient<SingleResponse<import("../types").MediaDesignResponse>>("/admin/media-design");
  return res.data;
}

export async function updateMediaDesignConfig(
  payload: Partial<import("../types").MediaDesignConfig>
): Promise<{ success: boolean; message: string; data: import("../types").MediaDesignConfig }> {
  return apiClient<{ success: boolean; message: string; data: import("../types").MediaDesignConfig }>("/admin/media-design", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

