export interface PropertyCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Location {
  id: number;
  name: string;
  slug: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon?: string;
}

export interface PropertyImage {
  id: number;
  url: string;
  is_primary?: boolean;
  alt?: string;
}

export interface Property {
  id: number;
  title: string;
  title_ar?: string;
  slug: string;
  reference_code: string;
  listing_type: "rent" | "sale";
  price_cents: number;
  price_formatted: string;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  area_sqm?: number;
  is_featured: boolean;
  is_published: boolean;
  check_in_time: string;
  check_out_time: string;
  description: string;
  cancellation_policy: string;
  payment_rules?: string;
  category?: PropertyCategory;
  location?: Location;
  amenities?: Amenity[];
  images: PropertyImage[];
}

export interface NightlyPrice {
  night_date: string;
  day_of_week: string;
  price_cents: number;
  price_formatted: string;
  currency: string;
  is_base_price?: boolean;
}

export interface QuoteCalculation {
  nights: number;
  nightly_prices: NightlyPrice[];
  subtotal_cents: number;
  subtotal_formatted: string;
  cleaning_fee_cents: number;
  service_fee_cents: number;
  discount_cents: number;
  promo_code?: string | null;
  tax_percentage: number;
  tax_cents: number;
  total_cents: number;
  total_formatted: string;
  deposit_cents: number;
  amount_remaining_cents: number;
  currency: string;
  satisfies_min_stay: boolean;
  min_stay_required: number;
}

export interface QuoteRequest {
  property_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  promo_code?: string;
}
