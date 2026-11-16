export interface ExperienceCategory {
  id: number;
  name: string;
  name_ar?: string;
  slug: string;
}

export interface Experience {
  id: number;
  title: string;
  title_ar?: string;
  slug: string;
  category?: ExperienceCategory;
  location?: { id: number; name: string; name_ar?: string };
  price_cents: number;
  price_formatted: string;
  currency: string;
  pricing_type?: string;
  duration: string;
  max_guests: number;
  meeting_point: string;
  meeting_point_ar?: string;
  what_to_bring: string;
  what_to_bring_ar?: string;
  cancellation_policy: string;
  cancellation_policy_ar?: string;
  description: string;
  description_ar?: string;
  overview: string;
  overview_ar?: string;
  image: string;
  images?: Array<{ id: number; url: string }>;
}

export interface ExperienceInquiryRequest {
  requested_date: string;
  guests: number;
  pax?: number;
  preferred_time?: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
}
