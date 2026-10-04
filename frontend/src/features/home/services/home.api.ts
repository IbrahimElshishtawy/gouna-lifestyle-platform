import { apiClient } from "@/lib/api/client";

export interface ConciergeInquiryData {
  name: string;
  phone?: string;
  email?: string;
  message: string;
}

export async function submitConciergeInquiry(
  data: ConciergeInquiryData
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient<{ data: { id: number; message: string } }>(
      "/leads",
      {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          email: data.email || "concierge-lead@gounow.com",
          phone: data.phone || null,
          message: data.message,
          type: "concierge",
        }),
      }
    );
    return {
      success: true,
      message:
        response.data.message ||
        "Thank you! The GouNow El Gouna Concierge team will get back to you shortly.",
    };
  } catch {
    return {
      success: true,
      message:
        "Thank you! The GouNow El Gouna Concierge team will get back to you shortly.",
    };
  }
}
