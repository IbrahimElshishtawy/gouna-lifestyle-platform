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
    const response = await apiClient<{ success: boolean; message: string }>(
      "/inquire",
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
        "Thank you! The GouNow El Gouna Concierge team will get back to you shortly.",
    };
  }
}
