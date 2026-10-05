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

// 3. Properties (Admin View)
export interface AdminPropertyItem {
  id: number;
  reference_number: string;
  slug: string;
  title: string;
  title_en: string;
  title_ar: string | null;
  listing_type: "rent" | "sale";
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  area_sqm: number | null;
  pricing: {
    base_price_cents: number;
    cleaning_fee_cents: number;
    service_fee_cents: number;
    tax_percentage: number;
    currency: string;
    formatted_base_price: string;
  };
  is_available: boolean;
  is_featured: boolean;
  cancellation_policy: string;
  created_at: string;
}

// 4. Staff / Administrative Users
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
