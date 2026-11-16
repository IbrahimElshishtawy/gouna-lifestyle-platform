"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getPublicTaxonomies,
  PublicSiteSettings,
  PublicTaxonomiesResponse,
  TaxonomyItem,
} from "@/features/home/services/home.api";

interface SiteSettingsContextType {
  settings: PublicSiteSettings | null;
  locations: TaxonomyItem[];
  propertyCategories: TaxonomyItem[];
  experienceCategories: TaxonomyItem[];
  eventCategories: string[];
  whatsappDigits: string;
  buildWhatsAppUrl: (text?: string) => string;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: null,
  locations: [],
  propertyCategories: [],
  experienceCategories: [],
  eventCategories: [],
  whatsappDigits: "",
  buildWhatsAppUrl: () => "#",
});

export function SiteSettingsProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: PublicTaxonomiesResponse | null;
}) {
  const [data, setData] = useState<PublicTaxonomiesResponse | null>(initialData ?? null);

  useEffect(() => {
    if (!data) {
      getPublicTaxonomies()
        .then((res) => {
          if (res) setData(res);
        })
        .catch(() => {});
    }
  }, [data]);

  const rawWhatsapp = data?.settings?.whatsapp_number || data?.settings?.phone || "";
  const whatsappDigits = rawWhatsapp.replace(/\D/g, "");

  const buildWhatsAppUrl = (text?: string) => {
    if (!whatsappDigits) return "#concierge";
    return text
      ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(text)}`
      : `https://wa.me/${whatsappDigits}`;
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        settings: data?.settings ?? null,
        locations: data?.locations ?? [],
        propertyCategories: data?.property_categories ?? [],
        experienceCategories: data?.experience_categories ?? [],
        eventCategories: data?.event_categories ?? [],
        whatsappDigits,
        buildWhatsAppUrl,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
