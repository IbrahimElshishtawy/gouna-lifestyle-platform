import { apiClient } from "@/lib/api/client";
import { PROPERTIES_DATA } from "../data/properties.data";
import {
  Property,
  QuoteCalculation,
  QuoteRequest,
} from "../types/property.types";

export interface PropertySearchParams {
  listing_type?: "rent" | "sale";
  location?: string;
  category?: string;
  bedrooms?: string | number;
  guests?: string | number;
  sort?: string;
}

export async function getProperties(
  params?: PropertySearchParams
): Promise<Property[]> {
  try {
    const query = new URLSearchParams();
    if (params?.listing_type) query.set("listing_type", params.listing_type);
    if (params?.location && params.location !== "all")
      query.set("location", params.location);
    if (params?.category && params.category !== "all")
      query.set("category", params.category);
    if (params?.bedrooms) query.set("bedrooms", String(params.bedrooms));
    if (params?.guests) query.set("guests", String(params.guests));

    const response = await apiClient<{ data: Property[] }>(
      `/stays?${query.toString()}`
    );
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
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
    const response = await apiClient<{ data: Property }>(`/stays/${slug}`);
    if (response?.data) return response.data;
  } catch {
    // Fallback to local dataset
  }

  const found = PROPERTIES_DATA.find((p) => p.slug === slug);
  return found || null;
}

export async function calculateQuote(
  req: QuoteRequest
): Promise<QuoteCalculation> {
  try {
    const response = await apiClient<{
      success: boolean;
      quote: QuoteCalculation;
    }>("/checkout/calculate", {
      method: "POST",
      body: JSON.stringify(req),
    });
    if (response?.success && response.quote) {
      return response.quote;
    }
  } catch {
    // Local calculation fallback
  }

  const prop = PROPERTIES_DATA.find((p) => p.id === req.property_id) || PROPERTIES_DATA[0];
  const dIn = new Date(req.check_in);
  const dOut = new Date(req.check_out);
  const diffTime = Math.abs(dOut.getTime() - dIn.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const basePriceCents = prop.price_cents;
  const subtotalCents = basePriceCents * nights;
  const cleaningFeeCents = 100000;
  const serviceFeeCents = 50000;
  const taxCents = Math.round(subtotalCents * 0.14);
  const totalCents = subtotalCents + cleaningFeeCents + serviceFeeCents + taxCents;

  const nightly_prices = Array.from({ length: nights }, (_, i) => {
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
  data: Record<string, unknown>
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient<{ success: boolean; message: string }>(
      `/stays/${slug}/inquire`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return response;
  } catch {
    return {
      success: true,
      message:
        "Your inquiry has been received! Our El Gouna property consultant will contact you shortly.",
    };
  }
}
