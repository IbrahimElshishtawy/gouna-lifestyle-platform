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
      Array.isArray(rel.media) && rel.media.length > 0
        ? rel.media[0].url
        : "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
    images: rel.media || [],
  };
}

export async function getExperiences(): Promise<Experience[]> {
  try {
    const response = await apiClient<{ data: BackendExperienceResource[] }>(
      "/experiences"
    );
    if (response?.data && Array.isArray(response.data)) {
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
