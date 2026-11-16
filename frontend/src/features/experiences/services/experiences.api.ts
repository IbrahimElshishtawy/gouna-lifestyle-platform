import { apiClient } from "@/lib/api/client";
import { Experience, ExperienceInquiryRequest } from "../types/experience.types";

interface BackendExperienceResource {
  id: number | string;
  type: string;
  attributes: {
    slug: string;
    title: string;
    title_en?: string;
    title_ar?: string | null;
    short_description?: string | null;
    short_description_en?: string | null;
    short_description_ar?: string | null;
    description?: string | null;
    description_en?: string | null;
    description_ar?: string | null;
    pricing_model?: string;
    duration?: string;
    max_capacity?: number;
    meeting_point?: string | null;
    meeting_point_en?: string | null;
    meeting_point_ar?: string | null;
    what_to_bring?: string | null;
    what_to_bring_en?: string | null;
    what_to_bring_ar?: string | null;
    cancellation_policy?: string | null;
    cancellation_policy_en?: string | null;
    cancellation_policy_ar?: string | null;
    pricing?: {
      base_price_cents: number;
      currency?: string;
      formatted_base_price?: string;
    };
    cover_url?: string | null;
    is_featured?: boolean;
    is_published?: boolean;
  };
  relationships?: {
    category?: { id: number; name: string; name_en?: string; name_ar?: string; slug: string };
    location?: { id: number; name: string; name_en?: string; name_ar?: string };
    media?: Array<{ id: number; url: string }>;
  };
}

export function mapBackendExperienceToFrontend(
  item: BackendExperienceResource
): Experience {
  const attr = item.attributes;
  const rel = item.relationships || {};
  const basePriceCents = attr.pricing?.base_price_cents ?? 0;
  const currency = attr.pricing?.currency || "EGP";

  return {
    id: Number(item.id),
    title: attr.title_en || attr.title || "",
    title_ar: attr.title_ar || undefined,
    slug: attr.slug,
    category: rel.category
      ? {
          id: rel.category.id,
          name: rel.category.name_en || rel.category.name,
          name_ar: rel.category.name_ar,
          slug: rel.category.slug,
        }
      : undefined,
    location: rel.location
      ? {
          id: rel.location.id,
          name: rel.location.name_en || rel.location.name,
          name_ar: rel.location.name_ar,
        }
      : undefined,
    price_cents: basePriceCents,
    price_formatted: (basePriceCents / 100).toLocaleString(),
    currency,
    pricing_type: attr.pricing_model || "per_group",
    duration: attr.duration || "",
    max_guests: attr.max_capacity ?? 0,
    meeting_point: attr.meeting_point_en || attr.meeting_point || "",
    meeting_point_ar: attr.meeting_point_ar || undefined,
    what_to_bring: attr.what_to_bring_en || attr.what_to_bring || "",
    what_to_bring_ar: attr.what_to_bring_ar || undefined,
    cancellation_policy: attr.cancellation_policy_en || attr.cancellation_policy || "",
    cancellation_policy_ar: attr.cancellation_policy_ar || undefined,
    description: attr.description_en || attr.description || attr.short_description_en || attr.short_description || "",
    description_ar: attr.description_ar || attr.short_description_ar || undefined,
    overview: attr.short_description_en || attr.short_description || attr.description_en || attr.description || "",
    overview_ar: attr.short_description_ar || attr.description_ar || undefined,
    image:
      Array.isArray(rel.media) && rel.media.length > 0 && rel.media[0]?.url
        ? rel.media[0].url
        : attr.cover_url || "/assets/images/tawila-yacht.jpg",
    images:
      Array.isArray(rel.media) && rel.media.length > 0
        ? rel.media
        : attr.cover_url
        ? [{ id: 1, url: attr.cover_url }]
        : [],
  };
}

export async function getExperiences(category?: string): Promise<Experience[]> {
  try {
    const url = category
      ? `/experiences?category=${encodeURIComponent(category)}`
      : "/experiences";
    const response = await apiClient<{ data: BackendExperienceResource[] }>(url);
    if (response?.data && Array.isArray(response.data)) {
      return response.data.map(mapBackendExperienceToFrontend);
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch experiences from backend:", err);
    return [];
  }
}

export async function getExperienceBySlug(
  slug: string
): Promise<Experience | null> {
  try {
    const response = await apiClient<{ data: BackendExperienceResource }>(
      `/experiences/${encodeURIComponent(slug)}`
    );
    if (response?.data) {
      return mapBackendExperienceToFrontend(response.data);
    }
    return null;
  } catch {
    return null;
  }
}

export async function inquireExperience(
  slug: string,
  req: ExperienceInquiryRequest
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient<{ data: { id: number; message: string } }>(
    "/leads",
    {
      method: "POST",
      body: JSON.stringify({
        name: req.name,
        email: req.email,
        phone: req.phone,
        message: `Experience Inquiry [${slug}]: Requested Date: ${req.requested_date}, Guests: ${req.guests}. Notes: ${req.message || "None"}`,
        type: "experience",
      }),
    }
  );
  return {
    success: true,
    message: response.data.message,
  };
}

// ---------------- Admin Management Endpoints ----------------

export interface AdminExperienceItem {
  id: number;
  slug: string;
  title_en: string;
  title_ar?: string | null;
  experience_category_id: number;
  location_id?: number | null;
  pricing_model: string;
  base_price_cents: number;
  duration: string;
  max_capacity: number;
  meeting_point_en?: string | null;
  meeting_point_ar?: string | null;
  short_description_en?: string | null;
  short_description_ar?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
  what_to_bring_en?: string | null;
  what_to_bring_ar?: string | null;
  status: "published" | "draft" | "archived";
  is_published: boolean;
  is_featured: boolean;
  category?: { id: number; name_en: string; name_ar: string; slug: string };
  location?: { id: number; name_en: string; name_ar: string; slug: string };
  media?: Array<{ id: number; file_path: string }>;
  cover_url?: string;
}

export async function getAdminExperiences(params?: {
  q?: string;
  category_id?: number;
  status?: string;
}): Promise<{ data: AdminExperienceItem[]; categories: any[]; locations: any[] }> {
  const query = new URLSearchParams();
  if (params?.q) query.set("q", params.q);
  if (params?.category_id) query.set("category_id", String(params.category_id));
  if (params?.status) query.set("status", params.status);

  return apiClient(`/admin/experiences?${query.toString()}`);
}

export async function getExperienceTaxonomies(): Promise<{ categories: any[]; locations: any[] }> {
  return apiClient("/admin/experiences/taxonomies");
}

export async function createAdminExperience(payload: any): Promise<{ success: boolean; data: any; message?: string }> {
  return apiClient("/admin/experiences", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminExperience(id: number, payload: any): Promise<{ success: boolean; data: any; message?: string }> {
  return apiClient(`/admin/experiences/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function toggleAdminExperienceStatus(id: number): Promise<{ success: boolean; data: any; message?: string }> {
  return apiClient(`/admin/experiences/${id}/toggle-status`, {
    method: "PUT",
  });
}

export async function deleteAdminExperience(id: number): Promise<{ success: boolean; message?: string }> {
  return apiClient(`/admin/experiences/${id}`, {
    method: "DELETE",
  });
}

export async function getAdminExperienceById(id: number): Promise<{ success: boolean; data: AdminExperienceItem }> {
  return apiClient(`/admin/experiences/${id}`);
}
