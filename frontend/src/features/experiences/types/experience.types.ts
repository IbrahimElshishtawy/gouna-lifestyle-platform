export interface ExperienceCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Experience {
  id: number;
  title: string;
  slug: string;
  category?: ExperienceCategory;
  location?: { id: number; name: string };
  price_cents: number;
  price_formatted: string;
  currency: string;
  pricing_type?: string;
  duration: string;
  max_guests: number;
  meeting_point: string;
  what_to_bring: string;
  cancellation_policy: string;
  description: string;
  overview: string;
  image: string;
  images?: Array<{ id: number; url: string }>;
}

export interface ExperienceInquiryRequest {
  requested_date: string;
  guests: number;
  name: string;
  email: string;
  phone: string;
  message?: string;
}
