import { apiClient } from "@/lib/api/client";

export interface ConciergeInquiryData {
  name: string;
  phone?: string;
  email: string;
  message: string;
}

export interface PublicFaqItem {
  id: number;
  group: string;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  sort_order: number;
}

export interface TaxonomyItem {
  id: number;
  name_en: string;
  name_ar: string;
  slug: string;
}

export interface PublicSiteSettings {
  site_name: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  address: string;
  google_maps_url: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  linkedin_url: string;
  default_checkin_time: string;
  default_checkout_time: string;
  default_deposit_percentage: number;
}

export interface PublicTaxonomiesResponse {
  locations: TaxonomyItem[];
  property_categories: TaxonomyItem[];
  experience_categories: TaxonomyItem[];
  event_categories: string[];
  settings: PublicSiteSettings;
  counts: {
    properties: number;
    experiences: number;
    events: number;
  };
}

export async function submitConciergeInquiry(
  data: ConciergeInquiryData
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient<{ data: { id: number; message: string } }>(
    "/leads",
    {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message,
        type: "concierge",
      }),
    }
  );
  return {
    success: true,
    message: response.data.message,
  };
}

export async function getPublicFaqs(): Promise<PublicFaqItem[]> {
  try {
    const res = await apiClient<{ data: PublicFaqItem[] }>("/faqs");
    return Array.isArray(res?.data) ? res.data : [];
  } catch (err) {
    console.error("Failed to fetch FAQs from backend:", err);
    return [];
  }
}

export async function getPublicTaxonomies(): Promise<PublicTaxonomiesResponse | null> {
  try {
    const res = await apiClient<{ data: PublicTaxonomiesResponse }>("/taxonomies", {
      cacheTtlMs: 30000,
    });
    return res?.data || null;
  } catch (err) {
    console.error("Failed to fetch taxonomies from backend:", err);
    return null;
  }
}
