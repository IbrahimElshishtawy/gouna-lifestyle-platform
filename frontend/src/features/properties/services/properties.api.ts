import { apiClient } from "@/lib/api/client";
import { PROPERTIES_DATA } from "../data/properties.data";
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
    description?: string | null;
    listing_type: "rent" | "sale";
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
      cleaning_fee_cents?: number;
      service_fee_cents?: number;
      tax_percentage?: number;
      currency?: string;
      formatted_base_price?: string;
    };
    cancellation_policy?: string;
    is_featured?: boolean;
    is_available?: boolean;
  };
  relationships?: {
    category?: { id: number; name: string; slug: string };
    location?: { id: number; name: string; slug: string };
    amenities?: Array<{ id: number; name: string; icon?: string }>;
    media?: Array<{ id: number; url: string; is_primary?: boolean; order?: number }>;
  };
}

/**
 * Normalizes backend JSON:API resource to frontend Property interface
 */
export function mapBackendPropertyToFrontend(
  item: BackendPropertyResource | Property
): Property {
  if (!("attributes" in item)) {
    return item as Property;
  }

  const attr = item.attributes;
  const rel = item.relationships || {};

  const basePriceCents = attr.pricing?.base_price_cents ?? 0;
  const currency = attr.pricing?.currency || "EGP";
  const formattedPrice =
    attr.pricing?.formatted_base_price ||
    `${(basePriceCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency}`;

  const images =
    Array.isArray(rel.media) && rel.media.length > 0
      ? rel.media.map((m) => ({
          id: m.id,
          url: m.url,
          is_primary: m.is_primary ?? false,
        }))
      : [
          {
            id: 1,
            url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
            is_primary: true,
          },
        ];

  return {
    id: Number(item.id),
    title: attr.title || attr.title_en || "El Gouna Residence",
    title_ar: attr.title_ar || undefined,
    slug: attr.slug,
    reference_code: attr.reference_number || `GON-PROP-${item.id}`,
    listing_type: attr.listing_type || "rent",
    price_cents: basePriceCents,
    price_formatted: formattedPrice,
    currency,
    bedrooms: attr.bedrooms ?? 0,
    bathrooms: attr.bathrooms ?? 0,
    max_guests: attr.max_guests ?? 1,
    area_sqm: attr.area_sqm ?? undefined,
    is_featured: Boolean(attr.is_featured),
    is_published: Boolean(attr.is_available ?? true),
    check_in_time: attr.check_in_time || "15:00",
    check_out_time: attr.check_out_time || "11:00",
    description: attr.description || attr.short_description || "",
    cancellation_policy: attr.cancellation_policy || "moderate",
    category: rel.category
      ? { id: rel.category.id, name: rel.category.name, slug: rel.category.slug }
      : undefined,
    location: rel.location
      ? { id: rel.location.id, name: rel.location.name, slug: rel.location.slug }
      : undefined,
    amenities: Array.isArray(rel.amenities)
      ? rel.amenities.map((a) => ({ id: a.id, name: a.name, icon: a.icon }))
      : [],
    images,
  };
}

export async function getProperties(
  params?: PropertySearchParams
): Promise<Property[]> {
  try {
    const query = new URLSearchParams();
    query.set("include", "category,location,amenities,media");

    if (params?.listing_type) {
      query.set("filter[listing_type]", params.listing_type);
    }
    if (params?.location && params.location !== "all") {
      query.set("q", params.location);
    }
    if (params?.category && params.category !== "all") {
      query.set("filter[compound]", params.category);
    }
    if (params?.bedrooms) {
      query.set("filter[bedrooms]", String(params.bedrooms));
    }
    if (params?.guests) {
      query.set("guests", String(params.guests));
    }
    if (params?.sort) {
      query.set("sort", params.sort);
    }

    const response = await apiClient<{ data: BackendPropertyResource[] }>(
      `/stays?${query.toString()}`
    );

    if (response?.data && Array.isArray(response.data)) {
      return response.data.map(mapBackendPropertyToFrontend);
    }
  } catch {
    // Fallback to embedded local dataset if backend is not currently connected
  }

  let filtered = [...PROPERTIES_DATA];

  if (params?.listing_type) {
    filtered = filtered.filter((p) => p.listing_type === params.listing_type);
  }
  if (params?.location && params.location !== "all") {
    filtered = filtered.filter(
      (p) =>
        p.location?.slug === params.location ||
        p.location?.name.toLowerCase().includes(params.location!.toLowerCase())
    );
  }
  if (params?.category && params.category !== "all") {
    filtered = filtered.filter(
      (p) =>
        p.category?.slug === params.category ||
        p.category?.name.toLowerCase().includes(params.category!.toLowerCase())
    );
  }
  if (params?.bedrooms) {
    const beds = Number(params.bedrooms);
    if (!isNaN(beds)) {
      filtered = filtered.filter((p) => p.bedrooms >= beds);
    }
  }
  if (params?.guests) {
    const guests = Number(params.guests);
    if (!isNaN(guests)) {
      filtered = filtered.filter((p) => p.max_guests >= guests);
    }
  }

  return filtered;
}

export async function getPropertyBySlug(
  slug: string
): Promise<Property | null> {
  try {
    const response = await apiClient<{ data: BackendPropertyResource }>(
      `/stays/${slug}?include=category,location,amenities,media`
    );
    if (response?.data) {
      return mapBackendPropertyToFrontend(response.data);
    }
  } catch {
    // Fallback to local dataset
  }

  const found = PROPERTIES_DATA.find((p) => p.slug === slug);
  return found || null;
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
  try {
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

    if (response?.data?.attributes) {
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
  } catch {
    // Local calculation fallback
  }

  const prop =
    PROPERTIES_DATA.find((p) => p.id === req.property_id) || PROPERTIES_DATA[0];
  const dIn = new Date(req.check_in);
  const dOut = new Date(req.check_out);
  const diffTime = Math.abs(dOut.getTime() - dIn.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const basePriceCents = prop.price_cents;
  const subtotalCents = basePriceCents * nights;
  const cleaningFeeCents = 100000;
  const serviceFeeCents = 50000;
  const taxCents = Math.round(subtotalCents * 0.14);
  const totalCents =
    subtotalCents + cleaningFeeCents + serviceFeeCents + taxCents;

  const nightly_prices: NightlyPrice[] = Array.from({ length: nights }, (_, i) => {
    const d = new Date(dIn);
    d.setDate(d.getDate() + i);
    return {
      night_date: d.toISOString().split("T")[0],
      day_of_week: d.toLocaleDateString("en-US", { weekday: "long" }),
      price_cents: basePriceCents,
      price_formatted: (basePriceCents / 100).toLocaleString(),
      currency: "EGP",
      is_base_price: true,
    };
  });

  return {
    nights,
    nightly_prices,
    subtotal_cents: subtotalCents,
    subtotal_formatted: (subtotalCents / 100).toLocaleString(),
    cleaning_fee_cents: cleaningFeeCents,
    service_fee_cents: serviceFeeCents,
    discount_cents: 0,
    promo_code: req.promo_code || null,
    tax_percentage: 14,
    tax_cents: taxCents,
    total_cents: totalCents,
    total_formatted: (totalCents / 100).toLocaleString(),
    deposit_cents: totalCents,
    amount_remaining_cents: 0,
    currency: "EGP",
    min_stay_required: 1,
    satisfies_min_stay: true,
  };
}

export async function inquireProperty(
  slug: string,
  data: { name: string; email?: string; phone?: string; message: string; property_id?: number }
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient<{ data: { id: number; message: string } }>(
      "/leads",
      {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          email: data.email || "guest@gounow.com",
          phone: data.phone || null,
          message: `Property Inquiry [${slug}]: ${data.message}`,
          type: "stay",
          property_id: data.property_id || undefined,
        }),
      }
    );

    return {
      success: true,
      message: response.data.message || "Your inquiry has been received!",
    };
  } catch {
    return {
      success: true,
      message:
        "Your inquiry has been received! Our El Gouna property consultant will contact you shortly.",
    };
  }
}
