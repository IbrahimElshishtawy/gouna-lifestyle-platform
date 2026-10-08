import { apiClient } from "@/lib/api/client";

export interface AdminVenueItem {
  id: number;
  name_en: string;
  name_ar?: string;
  slug: string;
  venue_type: string;
  capacity?: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  map_url?: string;
  description_en?: string;
  description_ar?: string;
  facilities?: string[];
  cover_image?: string;
  status: "active" | "inactive" | "maintenance";
  location?: { id: number; name_en: string; name_ar?: string; slug: string };
  events_count?: number;
}

export async function getAdminVenues(params?: {
  q?: string;
  venue_type?: string;
  status?: string;
  page?: number;
}): Promise<{ data: AdminVenueItem[]; meta?: any }> {
  const query = new URLSearchParams();
  if (params?.q) query.append("q", params.q);
  if (params?.venue_type) query.append("venue_type", params.venue_type);
  if (params?.status && params.status !== "all") query.append("status", params.status);
  if (params?.page) query.append("page", String(params.page));

  const res = await apiClient.get<any>(`/admin/venues?${query.toString()}`);
  return res;
}

export async function createAdminVenue(payload: any): Promise<AdminVenueItem> {
  const res = await apiClient.post<any>("/admin/venues", payload);
  return res.data;
}

export async function updateAdminVenue(id: number, payload: any): Promise<AdminVenueItem> {
  const res = await apiClient.put<any>(`/admin/venues/${id}`, payload);
  return res.data;
}

export async function deleteAdminVenue(id: number): Promise<void> {
  await apiClient.delete<any>(`/admin/venues/${id}`);
}
