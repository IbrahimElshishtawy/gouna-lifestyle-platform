import { apiClient } from "@/lib/api/client";

export interface YachtPackage {
  id?: number;
  name_en: string;
  name_ar?: string;
  description_en?: string;
  description_ar?: string;
  duration_hours: number;
  capacity?: number;
  price_cents: number;
  price?: number;
  inclusions_en?: string[];
  inclusions_ar?: string[];
  exclusions_en?: string[];
  exclusions_ar?: string[];
  status?: string;
}

export interface YachtAddon {
  id?: number;
  name_en: string;
  name_ar?: string;
  description_en?: string;
  description_ar?: string;
  price_cents: number;
  price?: number;
  pricing_model: string;
  max_quantity?: number;
  is_available?: boolean;
}

export interface YachtAvailabilityBlock {
  id: number;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  status: "blocked" | "maintenance" | "booked" | "unavailable";
  reason?: string;
  creator?: { name: string };
}

export interface AdminYachtItem {
  id: number;
  name_en: string;
  name_ar?: string;
  slug: string;
  yacht_type: string;
  category: string;
  brand?: string;
  model?: string;
  year?: number;
  length_ft?: number;
  capacity: number;
  crew_capacity: number;
  cabins: number;
  bathrooms: number;
  owner_partner_name?: string;
  owner_partner_contact?: string;
  pricing_model: "hourly" | "half_day" | "full_day" | "per_trip";
  base_price_cents: number;
  base_price?: number;
  currency: string;
  weekend_price_cents?: number;
  weekend_price?: number;
  extra_hour_price_cents?: number;
  extra_hour_price?: number;
  security_deposit_cents?: number;
  min_duration_hours: number;
  marina_berth?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  map_url?: string;
  rules_en?: string;
  rules_ar?: string;
  cancellation_policy_en?: string;
  cancellation_policy_ar?: string;
  cover_image?: string;
  cover_url?: string;
  gallery?: string[];
  is_featured: boolean;
  status: "draft" | "pending_approval" | "active" | "suspended" | "maintenance" | "inactive" | "archived";
  location?: { id: number; name_en: string; name_ar?: string; slug: string };
  packages?: YachtPackage[];
  addons?: YachtAddon[];
  availability_blocks?: YachtAvailabilityBlock[];
  packages_count?: number;
  availability_blocks_count?: number;
  bookings_count?: number;
}

export interface YachtDashboardData {
  total_yachts: number;
  active_yachts: number;
  maintenance_yachts: number;
  pending_approval: number;
  booked_today: number;
  revenue_egp: number;
  upcoming_bookings: any[];
}

export interface YachtTaxonomies {
  locations: Array<{ id: number; name_en: string; name_ar?: string; slug: string }>;
  yacht_types: Array<{ id: string; name_en: string; name_ar: string }>;
  categories: Array<{ id: string; name_en: string; name_ar: string }>;
  pricing_models: Array<{ id: string; name_en: string; name_ar: string }>;
  statuses: Array<{ id: string; name_en: string; name_ar: string }>;
}

export async function getAdminYachts(params?: {
  q?: string;
  yacht_type?: string;
  category?: string;
  status?: string;
  page?: number;
}): Promise<{ data: AdminYachtItem[]; meta?: any }> {
  const query = new URLSearchParams();
  if (params?.q) query.append("q", params.q);
  if (params?.yacht_type) query.append("yacht_type", params.yacht_type);
  if (params?.category) query.append("category", params.category);
  if (params?.status && params.status !== "all") query.append("status", params.status);
  if (params?.page) query.append("page", String(params.page));

  const res = await apiClient.get<any>(`/admin/yachts?${query.toString()}`);
  return res;
}

export async function getYachtDashboard(): Promise<YachtDashboardData> {
  const res = await apiClient.get<any>("/admin/yachts/dashboard");
  return res.data;
}

export async function getYachtTaxonomies(): Promise<YachtTaxonomies> {
  const res = await apiClient.get<any>("/admin/yachts/taxonomies");
  return res.data;
}

export async function getYachtById(id: number): Promise<AdminYachtItem> {
  const res = await apiClient.get<any>(`/admin/yachts/${id}`);
  return res.data;
}

export async function createAdminYacht(payload: any): Promise<AdminYachtItem> {
  const res = await apiClient.post<any>("/admin/yachts", payload);
  return res.data;
}

export async function updateAdminYacht(id: number, payload: any): Promise<AdminYachtItem> {
  const res = await apiClient.put<any>(`/admin/yachts/${id}`, payload);
  return res.data;
}

export async function deleteAdminYacht(id: number): Promise<void> {
  await apiClient.delete<any>(`/admin/yachts/${id}`);
}

export async function toggleAdminYachtStatus(id: number): Promise<{ status: string }> {
  const res = await apiClient.patch<any>(`/admin/yachts/${id}/toggle-status`);
  return res;
}

export async function getYachtAvailability(id: number): Promise<any> {
  const res = await apiClient.get<any>(`/admin/yachts/${id}/availability`);
  return res.data;
}

export async function addYachtAvailabilityBlock(id: number, payload: {
  start_date: string;
  end_date: string;
  status: string;
  reason?: string;
}): Promise<any> {
  const res = await apiClient.post<any>(`/admin/yachts/${id}/availability-blocks`, payload);
  return res;
}

export async function removeYachtAvailabilityBlock(id: number, blockId: number): Promise<void> {
  await apiClient.delete<any>(`/admin/yachts/${id}/availability-blocks/${blockId}`);
}

export async function addYachtPackage(id: number, payload: any): Promise<any> {
  const res = await apiClient.post<any>(`/admin/yachts/${id}/packages`, payload);
  return res.data;
}

export async function deleteYachtPackage(id: number, packageId: number): Promise<void> {
  await apiClient.delete<any>(`/admin/yachts/${id}/packages/${packageId}`);
}

export async function addYachtAddon(id: number, payload: any): Promise<any> {
  const res = await apiClient.post<any>(`/admin/yachts/${id}/addons`, payload);
  return res.data;
}

export async function deleteYachtAddon(id: number, addonId: number): Promise<void> {
  await apiClient.delete<any>(`/admin/yachts/${id}/addons/${addonId}`);
}

export async function getYachtBookings(id: number): Promise<any> {
  const res = await apiClient.get<any>(`/admin/yachts/${id}/bookings`);
  return res;
}
