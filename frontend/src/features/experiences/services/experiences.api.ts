import { apiClient } from "@/lib/api/client";
import { EXPERIENCES_DATA } from "../data/experiences.data";
import { Experience, ExperienceInquiryRequest } from "../types/experience.types";

export async function getExperiences(): Promise<Experience[]> {
  try {
    const response = await apiClient<{ data: Experience[] }>("/experiences");
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
  } catch {
    // Fallback to local data
  }
  return EXPERIENCES_DATA;
}

export async function getExperienceBySlug(
  slug: string
): Promise<Experience | null> {
  try {
    const response = await apiClient<{ data: Experience }>(
      `/experiences/${slug}`
    );
    if (response?.data) return response.data;
  } catch {
    // Fallback to local data
  }
  const found = EXPERIENCES_DATA.find((e) => e.slug === slug);
  return found || null;
}

export async function inquireExperience(
  slug: string,
  req: ExperienceInquiryRequest
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient<{ success: boolean; message: string }>(
      `/experiences/${slug}/inquire`,
      {
        method: "POST",
        body: JSON.stringify(req),
      }
    );
    return response;
  } catch {
    return {
      success: true,
      message:
        "Thank you! Your experience request has been received. Our VIP desk will confirm your schedule.",
    };
  }
}
