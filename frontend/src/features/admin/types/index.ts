/**
 * Centralized Admin Types & Domain Contracts for GouNow Platform
 * Matches backend Eloquent models and JSON:API standard structures
 */

export interface PaginatedResponse<T> {
  data: T[];
  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta?: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
    request_id?: string;
    timestamp?: string;
  };
}

export interface SingleResponse<T> {
  data: T;
  message?: string;
  meta?: {
    request_id?: string;
    timestamp?: string;
  };
}

// 1. Dashboard Metrics & Activity
export interface DashboardKPIs {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalProperties: number;
  rentProperties: number;
  saleProperties: number;
  totalRevenueCents: number;
  formattedRevenue: string;
  activeLeads: number;
  activeStaff: number;
}

export interface ActivityLogItem {
  id: number;
  user_id: number | null;
  user_name?: string | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  description: string;
  ip_address: string | null;
  created_at: string;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  recentBookings: AdminBookingItem[];
  recentActivities: ActivityLogItem[];
}

// 2. Bookings & Stays
export type BookingStatus = "draft" | "pending" | "awaiting_payment" | "payment_processing" | "confirmed" | "completed" | "cancelled" | "refunded";
export type PaymentStatus = "unpaid" | "pending" | "partially_paid" | "paid" | "refunded" | "partially_refunded" | "failed";
export type StayStatus = "expected" | "in_house" | "checked_out" | "cancelled";

export interface AdminBookingSummary {
  total: number;
  pending: number;
  confirmed: number;
  active_stays: number;
  completed: number;
  cancelled: number;
}

export interface AdminBookingItem {
  id: number;
  reference: string;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
  bookable: {
    id: number;
    title: string;
    title_ar?: string | null;
    slug: string;
    reference_number?: string;
    type: "property" | "experience" | "vehicle";
  };
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  total_cents: number;
  formatted_total: string;
  amount_paid_cents: number;
  formatted_paid: string;
  amount_remaining_cents?: number;
  formatted_remaining?: string;
  currency: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  stay_status?: StayStatus;
  created_at: string;
}

export interface AdminBookingDetail {
  id: number;
  reference: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  stay_status: StayStatus;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  currency: string;
  financials: {
    subtotal_cents: number;
    cleaning_fee_cents: number;
    service_fee_cents: number;
    tax_cents: number;
    discount_cents: number;
    total_cents: number;
    deposit_cents: number;
    amount_paid_cents: number;
    amount_remaining_cents: number;
    refund_amount_cents: number;
    formatted_subtotal: string;
    formatted_total: string;
    formatted_paid: string;
    formatted_remaining: string;
    formatted_refund: string;
  };
  customer: {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    nationality: string | null;
    country_of_residence: string | null;
    bookings_count: number;
  };
  property: {
    id: number;
    reference_number: string;
    slug: string;
    title_en: string;
    title_ar: string | null;
    compound?: string | null;
    address?: string | null;
    bedrooms: number;
    bathrooms: number;
    max_guests: number;
    area_sqm: number | null;
    primary_image: string;
    location: {
      id: number;
      name_en: string;
      name_ar: string;
    };
    category: {
      id: number;
      name_en: string;
      name_ar: string;
    };
  } | null;
  internal_notes: string | null;
  source: string;
  promo_code: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  transactions: Array<{
    id: number;
    type: string;
    amount_cents: number;
    formatted_amount: string;
    currency: string;
    gateway: string;
    gateway_reference: string | null;
    status: string;
    created_at: string;
  }>;
  timeline: Array<{
    id: number;
    action: string;
    description: string;
    user_name: string;
    created_at: string;
  }>;
}

export interface AdminStayItem {
  id: number;
  reference: string;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
  bookable: {
    id: number;
    title: string;
    title_ar?: string | null;
    reference_number?: string;
    slug: string;
  };
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  stay_status: StayStatus;
  total_cents: number;
  formatted_total: string;
  amount_paid_cents: number;
  formatted_paid: string;
  amount_remaining_cents: number;
  formatted_remaining: string;
}

export interface AdminStaysResponse {
  summary: {
    active_stays_count: number;
    today_checkins_count: number;
    today_checkouts_count: number;
    upcoming_arrivals_count: number;
    upcoming_departures_count: number;
  };
  data: {
    active_stays: AdminStayItem[];
    today_checkins: AdminStayItem[];
    today_checkouts: AdminStayItem[];
    upcoming_arrivals: AdminStayItem[];
    upcoming_departures: AdminStayItem[];
  };
}

export interface AvailabilityBlockItem {
  id: number;
  start_date: string;
  end_date: string;
  status: "blocked" | "maintenance" | "owner_use";
  reason?: string | null;
  type?: "block";
}

export interface SeasonalPriceItem {
  id: number;
  property_id?: number | null;
  name_en: string;
  name_ar?: string | null;
  start_date: string;
  end_date: string;
  price_cents: number;
  formatted_price: string;
  priority: number;
  min_stay_nights?: number | null;
  rule_type?: "season" | "holiday" | "weekend" | "override";
  adjustment_type?: "fixed" | "percentage";
  adjustment_percent?: number | null;
  days_of_week?: string[] | null;
  is_active?: boolean;
  notes?: string | null;
  property?: {
    id: number;
    title_en: string;
    title_ar?: string | null;
    reference_number: string;
  } | null;
}

export interface PropertyCalendarResponse {
  property_id: number;
  reference_number: string;
  year: number;
  base_price_cents: number;
  booked_ranges: Array<{
    id: number;
    reference: string;
    guest_name: string;
    start_date: string;
    end_date: string;
    status: string;
    type: "booking";
  }>;
  blocked_ranges: AvailabilityBlockItem[];
  seasonal_prices: SeasonalPriceItem[];
}

export interface AdminTaxonomiesResponse {
  categories: Array<{ id: number; name_en: string; name_ar: string; slug: string }>;
  locations: Array<{ id: number; name_en: string; name_ar: string; slug: string }>;
  amenities: Array<{ id: number; name_en: string; name_ar: string; group: string; icon: string | null }>;
}

export interface AdminPropertyUnitItem {
  id: number;
  parent_id: number;
  reference_number: string;
  slug: string;
  unit_number: string | null;
  title_en: string;
  title_ar: string | null;
  view: string | null;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  area_sqm: number | null;
  base_price_cents: number;
  currency: string;
  formatted_price: string;
  is_published: boolean;
  is_available: boolean;
  status: "published" | "draft" | "active" | "paused";
  category?: {
    id: number;
    name_en: string;
    name_ar: string;
    slug: string;
  };
  primary_image?: string | null;
  created_at: string | null;
}

export interface AdminPropertyUnitDetail extends AdminPropertyUnitItem {
  parent?: {
    id: number;
    reference_number: string;
    title_en: string;
    title_ar?: string | null;
    slug: string;
    address?: string | null;
    compound?: string | null;
    location?: {
      id: number;
      name_en: string;
      name_ar: string;
    };
  };
  images?: Array<{ id: number; url: string; is_primary: boolean; sort_order: number }>;
  amenities?: Array<{ id: number; name_en: string; name_ar: string; group?: string }>;
  availability_blocks?: AvailabilityBlockItem[];
  seasonal_prices?: SeasonalPriceItem[];
  bookings?: AdminBookingItem[];
}

export interface AdminPropertyItem {
  id: number;
  parent_id?: number | null;
  unit_number?: string | null;
  view?: string | null;
  units_count?: number;
  units?: AdminPropertyUnitItem[];
  reference_number: string;
  slug: string;
  title_en: string;
  title_ar: string | null;
  listing_type: "rent" | "sale";
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  area_sqm: number | null;
  compound?: string | null;
  address?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  map_url?: string | null;
  is_published: boolean;
  is_available: boolean;
  is_featured: boolean;
  status: "published" | "draft" | "active" | "paused";
  base_price_cents: number;
  sale_price_cents: number;
  currency: string;
  formatted_price: string;
  location: {
    id: number;
    name_en: string;
    name_ar: string;
  };
  category: {
    id: number;
    name_en: string;
    name_ar: string;
  };
  primary_image: string;
  created_at: string | null;
}

export interface AdminPropertySummary {
  total: number;
  published: number;
  paused: number;
  rent: number;
  sale: number;
}

// 4. Media Design & Homepage CMS Control
export interface MediaDesignConfig {
  hero: {
    badge_en: string;
    badge_ar: string;
    title_line1_en: string;
    title_line1_ar: string;
    title_line2_en: string;
    title_line2_ar: string;
    subtitle_en: string;
    subtitle_ar: string;
    cta1_text_en: string;
    cta1_text_ar: string;
    cta1_link: string;
    cta2_text_en: string;
    cta2_text_ar: string;
    cta2_link: string;
    background_image: string;
    video_url?: string;
  };
  sections: {
    hero: boolean;
    pillars: boolean;
    vacation_rentals: boolean;
    experiences: boolean;
    diving: boolean;
    sales: boolean;
    testimonials: boolean;
    events: boolean;
    concierge: boolean;
    faq: boolean;
  };
  featured_property_ids: number[];
  announcement: {
    enabled: boolean;
    text_en: string;
    text_ar: string;
    link: string;
  };
}

export interface MediaDesignResponse {
  config: MediaDesignConfig;
  available_properties: Array<{
    id: number;
    reference_number: string;
    title_en: string;
    title_ar: string | null;
    listing_type: "rent" | "sale";
    is_published: boolean;
    is_featured: boolean;
  }>;
}

// 5. Staff / Administrative Users
export interface AdminStaffItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  locale: string;
  is_admin: boolean;
  is_active: boolean;
  roles: string[];
  permissions?: string[];
  two_factor_enabled: boolean;
  last_login_at: string | null;
  last_login_ip: string | null;
  created_at: string;
}

export interface AdminRoleItem {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  is_system: boolean;
  permissions_count?: number;
  permissions?: string[];
}

// 5. VIP Concierge / Leads
export type LeadStatus = "new" | "contacted" | "in_progress" | "converted" | "closed";
export type LeadType = "general" | "concierge" | "property_inquiry" | "experience_inquiry" | "real_estate";

export interface AdminLeadItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  type: LeadType;
  source: string | null;
  message: string;
  status: LeadStatus;
  assigned_to: {
    id: number;
    name: string;
  } | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

// 6. Finances & Payment Transactions
export interface AdminTransactionItem {
  id: number;
  booking_id: number | null;
  booking_reference?: string | null;
  customer_name?: string | null;
  payment_method: string;
  gateway: string;
  gateway_reference: string | null;
  type: "charge" | "refund" | "deposit" | "payout";
  status: "pending" | "successful" | "failed" | "refunded";
  amount_cents: number;
  formatted_amount: string;
  currency: string;
  created_at: string;
}

export interface FinanceSummary {
  totalRevenueCents: number;
  totalRefundsCents: number;
  netRevenueCents: number;
  formattedTotalRevenue: string;
  formattedTotalRefunds: string;
  formattedNetRevenue: string;
  transactionCount: number;
}

// 7. Customers / CRM
export interface AdminCustomerItem {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  nationality: string | null;
  country_of_residence: string | null;
  is_active: boolean;
  bookings_count: number;
  total_spent_cents: number;
  formatted_total_spent: string;
  created_at: string;
}

// 8. Platform Settings
export interface PlatformSettingsMap {
  [key: string]: string | number | boolean | null;
}

// 9. Pricing Engine Types & Contracts
export interface PricingOverviewPropertyItem {
  id: number;
  reference_number: string;
  title_en: string;
  title_ar: string | null;
  base_price_cents: number;
  formatted_base_price: string;
  currency: string;
  min_stay_nights: number;
  cleaning_fee_cents: number;
  service_fee_cents: number;
  tax_percentage: number;
  is_published: boolean;
  active_seasons_count: number;
  location_name: string;
  category_name: string;
}

export interface PricingOverviewRuleItem {
  id: number;
  property_id: number;
  property_title: string;
  property_reference: string;
  name_en: string;
  start_date: string;
  end_date: string;
  price_cents: number;
  formatted_price: string;
  priority: number;
  min_stay_nights: number | null;
}

export interface PricingOverviewResponse {
  summary: {
    total_rent_inventory: number;
    total_active_seasonal_rules: number;
    total_active_discounts: number;
    average_nightly_rate_cents: number;
    formatted_average_nightly_rate: string;
  };
  properties: PricingOverviewPropertyItem[];
  upcoming_rules: PricingOverviewRuleItem[];
}

export interface PricingCalendarDayItem {
  date: string;
  day: number;
  day_of_week: string;
  price_cents: number;
  price_formatted: string;
  season_name: string;
  seasonal_price_id: number | null;
  priority: number;
  min_stay_nights: number;
  is_base_price: boolean;
  currency: string;
}

export interface PricingCalendarMatrixResponse {
  property: {
    id: number;
    reference_number: string;
    title_en: string;
    title_ar: string | null;
    base_price_cents: number;
    formatted_base_price: string;
    currency: string;
    min_stay_nights: number;
  };
  year: number;
  month: number;
  calendar: PricingCalendarDayItem[];
}

export interface NightlyPriceBreakdownItem {
  price_cents: number;
  seasonal_price_id: number | null;
  season_name: string | null;
  is_base_price: boolean;
  priority: number;
  min_stay_nights: number | null;
  night_date: string;
  day_of_week: string;
  currency: string;
  price_formatted: string;
}

export interface PriceQuoteBreakdown {
  nights: number;
  nightly_prices: NightlyPriceBreakdownItem[];
  subtotal_cents: number;
  subtotal_formatted: string;
  cleaning_fee_cents: number;
  service_fee_cents: number;
  discount_cents: number;
  discount_id: number | null;
  promo_code: string | null;
  tax_percentage: number;
  tax_cents: number;
  total_cents: number;
  total_formatted: string;
  deposit_cents: number;
  amount_remaining_cents: number;
  currency: string;
  min_stay_required: number;
  property_min_stay: number;
  seasonal_min_stay_override: number | null;
  satisfies_min_stay: boolean;
}

export interface PriceQuoteExplanation {
  base_nightly_rate: string;
  nights_count: number;
  subtotal: string;
  cleaning_fee: string;
  service_fee: string;
  discount: string;
  tax: string;
  final_total: string;
  deposit_required: string;
  min_stay_check: {
    required: number;
    actual: number;
    satisfied: boolean;
    message: string;
  };
}

export interface PricePreviewResponse {
  success: boolean;
  property: {
    id: number;
    reference_number: string;
    title_en: string;
    currency: string;
  };
  quote: PriceQuoteBreakdown;
  explanation: PriceQuoteExplanation;
}

export interface SeasonalOverlapItem {
  season_id: number;
  season_name: string;
  existing_priority: number;
  new_priority: number;
  overlap_start: string;
  overlap_end: string;
  existing_price_cents: number;
  outcome: "new_rule_wins" | "existing_rule_wins" | "equal_priority";
  message: string;
}

export interface SeasonalOverlapResponse {
  has_overlap: boolean;
  conflicts_count: number;
  overlaps: SeasonalOverlapItem[];
}

export interface AdminDiscountItem {
  id: number;
  name_en: string;
  name_ar?: string | null;
  code: string | null;
  type: "percentage" | "fixed";
  value: number;
  currency?: string | null;
  applies_to_all: boolean;
  min_stay_nights?: number | null;
  min_booking_amount_cents?: number | null;
  max_uses?: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export interface LocationParseResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  source?: string;
  formatted_coordinates?: string;
  map_url?: string;
  message?: string;
}

