import { apiClient } from "@/lib/api/client";

export interface TicketType {
  id?: number;
  event_id?: number;
  name_en: string;
  name_ar?: string;
  description_en?: string;
  description_ar?: string;
  price_cents?: number;
  price?: number;
  currency?: string;
  capacity?: number;
  sold_count?: number;
  available?: number;
  max_per_order?: number;
  is_active?: boolean;
}

export interface EventScheduleItem {
  id?: number;
  title_en: string;
  title_ar?: string;
  start_time?: string;
  end_time?: string;
  performer_name?: string;
  sort_order?: number;
}

export interface AdminEventItem {
  id: number;
  title_en: string;
  title_ar?: string;
  slug: string;
  category: string;
  organizer?: string;
  event_date: string;
  start_time: string;
  end_time?: string;
  doors_open_time?: string;
  venue_id?: number;
  venue_name?: string;
  venue_address?: string;
  latitude?: number;
  longitude?: number;
  age_restriction?: string;
  dress_code?: string;
  short_description_en?: string;
  short_description_ar?: string;
  description_en?: string;
  description_ar?: string;
  rules_en?: string;
  rules_ar?: string;
  status: "draft" | "published" | "cancelled" | "completed";
  is_ticketed: boolean;
  is_featured: boolean;
  is_published: boolean;
  venue?: { id: number; name_en: string; name_ar?: string; address?: string };
  ticket_types?: TicketType[];
  schedules?: EventScheduleItem[];
  ticket_types_count?: number;
  orders_count?: number;
  tickets_count?: number;
}

export interface EventDashboardData {
  upcoming_events: number;
  today_events: number;
  tickets_sold: number;
  tickets_remaining: number;
  total_checkins: number;
  revenue_egp: number;
  recent_checkins: any[];
}

export interface EventTaxonomies {
  venues: Array<{ id: number; name_en: string; name_ar?: string; venue_type: string; capacity?: number; address?: string }>;
  locations: Array<{ id: number; name_en: string; name_ar?: string; slug: string }>;
  categories: Array<{ id: string; name_en: string; name_ar: string }>;
  statuses: Array<{ id: string; name_en: string; name_ar: string }>;
}

export interface CheckInResult {
  success: boolean;
  result: "success" | "already_used" | "wrong_event" | "cancelled_or_refunded" | "invalid";
  message: string;
  ticket?: {
    id?: number;
    ticket_number: string;
    ticket_tier?: string;
    customer_name: string;
    customer_phone?: string;
    customer_email?: string;
    checked_in_at?: string;
    used_at?: string;
    correct_event?: string;
  };
}

export async function getAdminEvents(params?: {
  q?: string;
  category?: string;
  status?: string;
  venue_id?: number;
  page?: number;
}): Promise<{ data: AdminEventItem[]; meta?: any }> {
  const query = new URLSearchParams();
  if (params?.q) query.append("q", params.q);
  if (params?.category && params.category !== "all") query.append("category", params.category);
  if (params?.status && params.status !== "all") query.append("status", params.status);
  if (params?.venue_id) query.append("venue_id", String(params.venue_id));
  if (params?.page) query.append("page", String(params.page));

  return apiClient<{ data: AdminEventItem[]; meta?: any }>(`/admin/events?${query.toString()}`);
}

export async function getEventDashboard(): Promise<EventDashboardData> {
  const res = await apiClient<{ data: EventDashboardData }>("/admin/events/dashboard");
  return res.data;
}

export async function getEventTaxonomies(): Promise<EventTaxonomies> {
  const res = await apiClient<{ data: EventTaxonomies }>("/admin/events/taxonomies");
  return res.data;
}

export async function getEventById(id: number): Promise<{ data: AdminEventItem; stats: any }> {
  return apiClient<{ data: AdminEventItem; stats: any }>(`/admin/events/${id}`);
}

export async function createAdminEvent(payload: any): Promise<AdminEventItem> {
  const res = await apiClient<{ data: AdminEventItem }>("/admin/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateAdminEvent(id: number, payload: any): Promise<AdminEventItem> {
  const res = await apiClient<{ data: AdminEventItem }>(`/admin/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteAdminEvent(id: number): Promise<void> {
  await apiClient<void>(`/admin/events/${id}`, {
    method: "DELETE",
  });
}

export async function toggleAdminEventStatus(id: number): Promise<{ status: string }> {
  return apiClient<{ status: string }>(`/admin/events/${id}/toggle-status`, {
    method: "PATCH",
  });
}

export async function getEventTickets(id: number): Promise<TicketType[]> {
  const res = await apiClient<{ data: TicketType[] }>(`/admin/events/${id}/tickets`);
  return res.data;
}

export async function saveEventTicketType(id: number, payload: any): Promise<TicketType> {
  const res = await apiClient<{ data: TicketType }>(`/admin/events/${id}/tickets`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteEventTicketType(id: number, ticketTypeId: number): Promise<void> {
  await apiClient<void>(`/admin/events/${id}/tickets/${ticketTypeId}`, {
    method: "DELETE",
  });
}

export async function getEventOrders(id: number, params?: { status?: string; page?: number }): Promise<any> {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.page) query.append("page", String(params.page));

  return apiClient<any>(`/admin/events/${id}/orders?${query.toString()}`);
}

export async function cancelEventOrder(id: number, orderId: number): Promise<any> {
  return apiClient<any>(`/admin/events/${id}/orders/${orderId}/cancel`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function refundEventOrder(id: number, orderId: number): Promise<any> {
  return apiClient<any>(`/admin/events/${id}/orders/${orderId}/refund`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function performTicketCheckin(id: number, payload: {
  ticket_code: string;
  device_info?: string;
}): Promise<CheckInResult> {
  try {
    return await apiClient<CheckInResult>(`/admin/events/${id}/check-in`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (err: any) {
    if (err?.data && typeof err.data === "object") {
      return err.data as CheckInResult;
    }
    return {
      success: false,
      result: "invalid",
      message: err?.message || "Network check-in validation failed.",
    };
  }
}

export async function searchCheckinTickets(id: number, q: string): Promise<any[]> {
  const res = await apiClient<{ data: any[] }>(`/admin/events/${id}/check-in/search?q=${encodeURIComponent(q)}`);
  return res.data || [];
}

export const createEventTicketType = saveEventTicketType;
export const performEventCheckIn = performTicketCheckin;
export const searchEventTicketsForCheckin = searchCheckinTickets;

// ==========================================
// PUBLIC CLIENT-FACING EVENT CONTRACTS & API
// ==========================================

export interface PublicEventItem {
  id: number;
  type: string;
  attributes: {
    slug: string;
    title: string;
    title_en: string;
    title_ar?: string;
    short_description?: string;
    description?: string;
    event_date: string;
    start_time?: string;
    end_time?: string;
    doors_open_time?: string;
    age_restriction?: string;
    dress_code?: string;
    rules?: string;
    venue_name: string;
    venue_address?: string;
    organizer?: string;
    category?: string;
    is_ticketed: boolean;
    is_featured: boolean;
    is_published: boolean;
    cover_url?: string;
    min_price?: number | null;
  };
  relationships?: {
    venue?: { id: number; name: string; address?: string; capacity?: number };
    location?: { id: number; name: string; slug: string };
    ticket_types?: Array<{
      id: number;
      name: string;
      name_en: string;
      name_ar?: string;
      description?: string;
      price: number;
      currency: string;
      available: number;
      max_per_order: number;
    }>;
    schedules?: Array<{
      id: number;
      title: string;
      start_time?: string;
      end_time?: string;
      performer_name?: string;
    }>;
    media?: Array<{
      id: number;
      url: string;
      thumb_url?: string;
      is_primary: boolean;
      order: number;
      title?: string;
      alt_text?: string;
    }>;
  };
}

export async function getPublicEvents(params?: {
  q?: string;
  category?: string;
  page?: number;
}): Promise<{ data: PublicEventItem[]; meta?: any }> {
  try {
    const query = new URLSearchParams();
    if (params?.q) query.append("q", params.q);
    if (params?.category && params.category !== "all") query.append("category", params.category);
    if (params?.page) query.append("page", String(params.page));

    const res = await apiClient<{ data: PublicEventItem[]; meta?: any }>(`/events?${query.toString()}`);
    return res;
  } catch (error) {
    console.warn("Failed to fetch public events from API, falling back to empty list:", error);
    return { data: [] };
  }
}

export async function getPublicEventBySlug(slug: string): Promise<PublicEventItem | null> {
  try {
    const res = await apiClient<{ data: PublicEventItem }>(`/events/${encodeURIComponent(slug)}`);
    return res.data;
  } catch (error) {
    console.warn(`Failed to fetch public event [${slug}]:`, error);
    return null;
  }
}

export async function bookPublicEvent(slug: string, payload: {
  ticket_type_id: number;
  quantity: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  payment_method?: "card" | "instapay" | "cash_on_arrival";
  special_requests?: string;
}): Promise<{
  status: string;
  message: string;
  data: {
    order_number: string;
    event_title: string;
    event_date: string;
    venue_name: string;
    quantity: number;
    total_amount: number;
    currency: string;
    customer_name: string;
    customer_phone: string;
    tickets: Array<{
      ticket_number: string;
      ticket_type: string;
      qr_token: string;
    }>;
  };
}> {
  return apiClient<any>(`/events/${encodeURIComponent(slug)}/book`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function inquirePublicEvent(slug: string, payload: {
  name: string;
  email: string;
  phone: string;
  guests_count?: number;
  message: string;
}): Promise<{ status: string; message: string }> {
  return apiClient<any>(`/events/${encodeURIComponent(slug)}/inquire`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


