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

// 2. Bookings
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type PaymentStatus = "pending" | "paid" | "partially_paid" | "refunded" | "failed";

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
  currency: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  created_at: string;
}

export interface AdminPropertyItem {
  id: number;
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
