"use client";

import React, { createContext, useContext, useEffect, useTransition } from "react";
import { useLocale } from "next-intl";
// Query string is read at click time via window.location.search to prevent CSR suspense bailout during static builds
import { dictionary, Locale } from "@/locales/dictionary";
import { useRouter, usePathname } from "@/i18n/routing";

interface LanguageContextType {
  locale: Locale;
  dir: "ltr" | "rtl";
  isRtl: boolean;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: typeof dictionary.en;
  isPending: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const currentLocale = (useLocale() as Locale) || initialLocale || "en";
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const isRtl = currentLocale === "ar";
  const dir: "ltr" | "rtl" = isRtl ? "rtl" : "ltr";
  const t = (dictionary[currentLocale] || dictionary.en) as typeof dictionary.en;

  useEffect(() => {
    // Keep html attributes synchronized
    document.documentElement.lang = currentLocale;
    document.documentElement.dir = dir;
    try {
      localStorage.setItem("gounow_locale", currentLocale);
    } catch {
      // Storage unavailable in some private windows
    }
  }, [currentLocale, dir]);

  const setLocale = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;
    startTransition(() => {
      try {
        localStorage.setItem("gounow_locale", newLocale);
      } catch {
        // ignore
      }
      const query = typeof window !== "undefined" && window.location.search ? window.location.search.replace(/^\?/, "") : "";
      const targetPath = query ? `${pathname}?${query}` : pathname;
      router.replace(targetPath, { locale: newLocale });
    });
  };

  const toggleLocale = () => {
    const next = currentLocale === "en" ? "ar" : "en";
    setLocale(next);
  };

  return (
    <LanguageContext.Provider
      value={{
        locale: currentLocale,
        dir,
        isRtl,
        setLocale,
        toggleLocale,
        t,
        isPending,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      locale: "en" as Locale,
      dir: "ltr" as "ltr" | "rtl",
      isRtl: false,
      setLocale: () => {},
      toggleLocale: () => {},
      t: dictionary.en,
      isPending: false,
    };
  }
  return context;
}

