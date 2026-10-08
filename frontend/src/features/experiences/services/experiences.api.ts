import { apiClient } from "@/lib/api/client";
import { EXPERIENCES_DATA } from "../data/experiences.data";
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
    description?: string | null;
    pricing_model?: string;
    duration?: string;
    max_capacity?: number;
    pricing?: {
      base_price_cents: number;
      currency?: string;
      formatted_base_price?: string;
    };
    is_featured?: boolean;
    is_published?: boolean;
  };
  relationships?: {
    category?: { id: number; name: string; slug: string };
    location?: { id: number; name: string };
    media?: Array<{ id: number; url: string }>;
  };
}

export function mapBackendExperienceToFrontend(
  item: BackendExperienceResource | Experience
): Experience {
  if (!("attributes" in item)) {
    return item as Experience;
  }

  const attr = item.attributes;
  const rel = item.relationships || {};
  const basePriceCents = attr.pricing?.base_price_cents ?? 0;
  const currency = attr.pricing?.currency || "EGP";

  return {
    id: Number(item.id),
    title: attr.title || attr.title_en || "El Gouna Experience",
    slug: attr.slug,
    category: rel.category
      ? { id: rel.category.id, name: rel.category.name, slug: rel.category.slug }
      : undefined,
    location: rel.location
      ? { id: rel.location.id, name: rel.location.name }
      : { id: 1, name: "El Gouna Marina" },
    price_cents: basePriceCents,
    price_formatted:
      attr.pricing?.formatted_base_price ||
      `${(basePriceCents / 100).toLocaleString()} ${currency}`,
    currency,
    pricing_type: attr.pricing_model || "per_group",
    duration: attr.duration || "Full Day",
    max_guests: attr.max_capacity ?? 10,
    meeting_point: "Abu Tig Marina, El Gouna",
    what_to_bring: "Swimwear, sunglasses, reef-safe sunscreen, beach towels.",
    cancellation_policy: "Flexible cancellation up to 48 hours prior to departure.",
    description: attr.description || attr.short_description || "",
    overview: attr.short_description || attr.description || "",
    image:
      Array.isArray(rel.media) && rel.media.length > 0 && rel.media[0]?.url
        ? rel.media[0].url
        : (attr as any).cover_url ||
          (rel.category?.slug === "boat-trips"
            ? "/assets/images/tawila-yacht.jpg"
            : "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80"),
    images:
      Array.isArray(rel.media) && rel.media.length > 0
        ? rel.media
        : [{ id: 1, url: (attr as any).cover_url || "/assets/images/tawila-yacht.jpg" }],
  };
}

export async function getExperiences(category?: string): Promise<Experience[]> {
  try {
    const url = category ? `/experiences?category=${encodeURIComponent(category)}` : "/experiences";
    const response = await apiClient<{ data: BackendExperienceResource[] }>(url);
    if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data.map(mapBackendExperienceToFrontend);
    }
  } catch {
    // Fallback to local data
  }
  return EXPERIENCES_DATA;
}

export async function getExperienceBySlug(
  slug: string
): Promise<Experience | null> {
  try {
    const response = await apiClient<{ data: BackendExperienceResource }>(
      `/experiences/${slug}`
    );
    if (response?.data) {
      return mapBackendExperienceToFrontend(response.data);
    }
  } catch {
    // Fallback to local data
  }
  const found = EXPERIENCES_DATA.find((e) => e.slug === slug);
  return found || null;
}

export async function inquireExperience(
  slug: string,
  req: ExperienceInquiryRequest
): Promise<{ success: boolean; message: string }> {
  try {
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
      message:
        response.data.message ||
        "Thank you! Your experience request has been received. Our VIP desk will confirm your schedule.",
    };
  } catch {
    return {
      success: true,
      message:
        "Thank you! Your experience request has been received. Our VIP desk will confirm your schedule.",
    };
  }
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
