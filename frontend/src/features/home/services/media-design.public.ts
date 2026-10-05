import { apiClient } from "@/lib/api/client";
import type { MediaDesignConfig } from "@/features/admin/types";

export async function getPublicMediaDesignConfig(): Promise<MediaDesignConfig | null> {
  try {
    const res = await apiClient<{ data: MediaDesignConfig }>("/settings/media-design");
    return res.data;
  } catch {
    return null;
  }
}
