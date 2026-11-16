import { apiClient } from "@/lib/api/client";
import {
  Property,
  QuoteCalculation,
  QuoteRequest,
  NightlyPrice,
} from "../types/property.types";

export interface PropertySearchParams {
  listing_type?: "rent" | "sale";
  location?: string;
  category?: string;
  bedrooms?: string | number;
  guests?: string | number;
  sort?: string;
  min_price?: number;
  max_price?: number;
}

interface BackendPropertyResource {
  id: number | string;
  type: string;
  attributes: {
    reference_number?: string;
    slug: string;
    title?: string;
    title_en?: string;
    title_ar?: string | null;
    short_description?: string | null;
    short_description_en?: string | null;
    short_description_ar?: string | null;
    description?: string | null;
    description_en?: string | null;
    description_ar?: string | null;
    listing_type: "rent" | "sale" | "both";
    bedrooms: number;
    bathrooms: number;
    max_guests: number;
    area_sqm?: number | null;
    compound?: string | null;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    min_stay_nights?: number;
    max_stay_nights?: number;
    check_in_time?: string;
    check_out_time?: string;
    pricing?: {
      base_price_cents: number;
      sale_price_cents?: number | null;
      cleaning_fee_cents?: number;
      service_fee_cents?: number;
      tax_percentage?: number;
      currency?: string;
      formatted_base_price?: string;
      formatted_sale_price?: string | null;
    };
    payment_requirement?: string;
    deposit_percentage?: number | null;
    cancellation_policy?: string;
    cancellation_policy_text_en?: string | null;
    cancellation_policy_text_ar?: string | null;
    house_rules_en?: string | null;
    house_rules_ar?: string | null;
    is_featured?: boolean;
    is_available?: boolean;
    cover_url?: string;
    gallery_urls?: string[];
  };
  relationships?: {
    category?: { id: number; name: string; name_en?: string; name_ar?: string; slug: string };
    location?: { id: number; name: string; name_en?: string; name_ar?: string; slug: string };
    amenities?: Array<{ id: number; name: string; name_en?: string; name_ar?: string; icon?: string }>;
    media?: Array<{ id: number; url: string; is_primary?: boolean; order?: number; alt_text?: string }>;
  };
}

/**
 * Normalizes backend JSON:API resource to frontend Property interface
 */
export function mapBackendPropertyToFrontend(
  item: BackendPropertyResource
): Property {
  const attr = item.attributes;
  const rel = item.relationships || {};

  const basePriceCents = attr.pricing?.base_price_cents ?? 0;
  const salePriceCents = attr.pricing?.sale_price_cents ?? null;
  const currency = attr.pricing?.currency || "EGP";

  const effectiveCents =
    attr.listing_type === "sale" && salePriceCents ? salePriceCents : basePriceCents;

  const formattedPrice =
    attr.listing_type === "sale" && attr.pricing?.formatted_sale_price
      ? attr.pricing.formatted_sale_price
      : (effectiveCents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 });

  const formattedSalePrice = salePriceCents
    ? (salePriceCents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })
    : null;

  const cleanUrl = (u?: string | null): string => {
    if (!u) return "/assets/images/hero-villa-dusk.jpg";
    const nested = u.match(/\/storage\/(https?:\/\/.*)/i);
    return nested ? nested[1] : u;
  };

  const images =
    Array.isArray(rel.media) && rel.media.length > 0
      ? rel.media.map((m) => ({
          id: m.id,
          url: cleanUrl(m.url),
          is_primary: m.is_primary ?? false,
          alt: m.alt_text,
        }))
      : Array.isArray(attr.gallery_urls) && attr.gallery_urls.length > 0
      ? attr.gallery_urls.map((u, idx) => ({
          id: idx + 1,
          url: cleanUrl(u),
          is_primary: idx === 0,
        }))
      : attr.cover_url
      ? [
          {
            id: 1,
            url: cleanUrl(attr.cover_url),
            is_primary: true,
          },
        ]
      : [];

  return {
    id: Number(item.id),
    title: attr.title || attr.title_en || "",
    title_ar: attr.title_ar || undefined,
    slug: attr.slug,
    reference_code: attr.reference_number || `GON-PROP-${item.id}`,
    listing_type: attr.listing_type || "rent",
    price_cents: basePriceCents,
    price_formatted: formattedPrice,
    sale_price_cents: salePriceCents,
    sale_price_formatted: formattedSalePrice,
    currency,
    bedrooms: attr.bedrooms ?? 0,
    bathrooms: attr.bathrooms ?? 0,
    max_guests: attr.max_guests ?? 1,
    area_sqm: attr.area_sqm ?? undefined,
    is_featured: Boolean(attr.is_featured),
    is_published: Boolean(attr.is_available ?? true),
    check_in_time: attr.check_in_time || "15:00",
    check_out_time: attr.check_out_time || "11:00",
    description: attr.description_en || attr.description || attr.short_description_en || attr.short_description || "",
    description_ar: attr.description_ar || attr.short_description_ar || undefined,
    cancellation_policy: attr.cancellation_policy || "",
    cancellation_policy_text_en: attr.cancellation_policy_text_en ?? null,
    cancellation_policy_text_ar: attr.cancellation_policy_text_ar ?? null,
    house_rules_en: attr.house_rules_en ?? null,
    house_rules_ar: attr.house_rules_ar ?? null,
    payment_requirement: attr.payment_requirement,
    deposit_percentage: attr.deposit_percentage ?? null,
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
          slug: rel.location.slug,
        }
      : undefined,
    amenities: Array.isArray(rel.amenities)
      ? rel.amenities.map((a) => ({
          id: a.id,
          name: a.name_en || a.name,
          name_ar: a.name_ar,
          icon: a.icon,
        }))
      : [],
    images,
  };
}

function mapSortToBackend(sort?: string): string | undefined {
  if (!sort || sort === "featured") return "-is_featured,-created_at";
  if (sort === "price_asc") return "base_price_cents";
  if (sort === "price_desc") return "-base_price_cents";
  return sort;
}

export async function getProperties(
  params?: PropertySearchParams
): Promise<Property[]> {
  try {
    const query = new URLSearchParams();
    query.set("include", "category,location,amenities,media");
    query.set("per_page", "50");

    if (params?.listing_type) {
      query.set("listing_type", params.listing_type);
    }
    if (params?.location && params.location !== "all") {
      query.set("location", params.location);
    }
    if (params?.category && params.category !== "all") {
      query.set("category", params.category);
    }
    if (params?.bedrooms) {
      query.set("min_bedrooms", String(params.bedrooms));
    }
    if (params?.guests) {
      query.set("guests", String(params.guests));
    }
    if (params?.min_price) {
      query.set("min_price", String(params.min_price));
    }
    if (params?.max_price) {
      query.set("max_price", String(params.max_price));
    }
    const mappedSort = mapSortToBackend(params?.sort);
    if (mappedSort) {
      query.set("sort", mappedSort);
    }

    const response = await apiClient<{ data: BackendPropertyResource[] }>(
      `/stays?${query.toString()}`
    );

    if (response?.data && Array.isArray(response.data)) {
      return response.data.map(mapBackendPropertyToFrontend);
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch properties from backend:", err);
    return [];
  }
}

export async function getPropertyBySlug(
  slug: string
): Promise<Property | null> {
  try {
    const response = await apiClient<{ data: BackendPropertyResource }>(
      `/stays/${encodeURIComponent(slug)}?include=category,location,amenities,media`
    );
    if (response?.data) {
      return mapBackendPropertyToFrontend(response.data);
    }
    return null;
  } catch {
    return null;
  }
}

interface BackendQuoteResponse {
  data: {
    type: string;
    attributes: {
      property_id: number;
      check_in: string;
      check_out: string;
      nights: number;
      guests: number;
      pricing: {
        nightly_rate_cents: number;
        subtotal_cents: number;
        cleaning_fee_cents: number;
        service_fee_cents: number;
        tax_cents: number;
        discount_cents: number;
        total_cents: number;
        deposit_cents: number;
        currency: string;
      };
      breakdown?: Array<{
        night_date: string;
        day_of_week: string;
        price_cents: number;
        price_formatted: string;
        currency: string;
        is_base_price?: boolean;
      }>;
    };
  };
}

export async function calculateQuote(
  req: QuoteRequest
): Promise<QuoteCalculation> {
  const response = await apiClient<BackendQuoteResponse>("/checkout/quote", {
    method: "POST",
    body: JSON.stringify({
      property_id: req.property_id,
      check_in: req.check_in,
      check_out: req.check_out,
      guests: req.guests,
      promo_code: req.promo_code || null,
    }),
  });

  const attr = response.data.attributes;
  const p = attr.pricing;
  const currency = p.currency || "EGP";

  const nightlyPrices: NightlyPrice[] = (attr.breakdown || []).map((b) => ({
    night_date: b.night_date,
    day_of_week: b.day_of_week,
    price_cents: b.price_cents,
    price_formatted: b.price_formatted,
    currency: b.currency || currency,
    is_base_price: b.is_base_price,
  }));

  return {
    nights: attr.nights,
    nightly_prices: nightlyPrices,
    subtotal_cents: p.subtotal_cents,
    subtotal_formatted: (p.subtotal_cents / 100).toLocaleString(undefined, {
      minimumFractionDigits: 2,
    }),
    cleaning_fee_cents: p.cleaning_fee_cents,
    service_fee_cents: p.service_fee_cents,
    discount_cents: p.discount_cents,
    promo_code: req.promo_code || null,
    tax_percentage: 14,
    tax_cents: p.tax_cents,
    total_cents: p.total_cents,
    total_formatted: (p.total_cents / 100).toLocaleString(undefined, {
      minimumFractionDigits: 2,
    }),
    deposit_cents: p.deposit_cents,
    amount_remaining_cents: Math.max(0, p.total_cents - p.deposit_cents),
    currency,
    min_stay_required: 1,
    satisfies_min_stay: true,
  };
}

export async function inquireProperty(
  slug: string,
  data: { name: string; email: string; phone?: string; message: string; property_id?: number }
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient<{ data: { id: number; message: string } }>(
    "/leads",
    {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: `Property Inquiry [${slug}]: ${data.message}`,
        type: "stay",
        property_id: data.property_id || undefined,
      }),
    }
  );

  return {
    success: true,
    message: response.data.message,
  };
}

export interface AlternativeProperty {
  id: number;
  slug: string;
  title_en: string;
  title_ar: string;
  cover_image: string;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  compound?: string | null;
  location: {
    name_en: string;
    name_ar: string;
  };
  price_formatted: string;
  base_price_cents: number;
}

export interface AvailabilityCheckResponse {
  is_available: boolean;
  conflict_type?: string;
  reason?: string;
  message_en: string;
  message_ar: string;
  quote?: {
    nights: number;
    nightly_rate_cents: number;
    subtotal_cents: number;
    subtotal_formatted: string;
    cleaning_fee_cents: number;
    service_fee_cents: number;
    tax_cents: number;
    discount_cents: number;
    total_cents: number;
    total_formatted: string;
    currency: string;
  } | null;
  alternatives?: AlternativeProperty[];
}

export interface PropertyCalendarAvailability {
  property_id: number;
  slug: string;
  min_stay_nights: number;
  max_stay_nights: number;
  unavailable_dates: Record<
    string,
    { status: string; booking_reference?: string; reason?: string }
  >;
}

export async function checkPropertyAvailability(
  slug: string,
  params: {
    check_in: string;
    check_out: string;
    guests?: number;
    promo_code?: string;
  }
): Promise<AvailabilityCheckResponse> {
  return apiClient<AvailabilityCheckResponse>(
    `/stays/${encodeURIComponent(slug)}/check-availability`,
    {
      method: "POST",
      body: JSON.stringify(params),
    }
  );
}

export async function getPropertyAvailabilityCalendar(
  slug: string
): Promise<PropertyCalendarAvailability | null> {
  try {
    return await apiClient<PropertyCalendarAvailability>(
      `/stays/${encodeURIComponent(slug)}/availability`,
      { method: "GET" }
    );
  } catch {
    return null;
  }
}
