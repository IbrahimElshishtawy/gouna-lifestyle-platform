"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { dictionary, Locale } from "@/locales/dictionary";

interface LanguageContextType {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: typeof dictionary.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("gounow_locale") as Locale | null;
    if (saved === "ar" || saved === "en") {
      setLocaleState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("gounow_locale", newLocale);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
  };

  const toggleLocale = () => {
    const next = locale === "en" ? "ar" : "en";
    setLocale(next);
  };

  const dir: "ltr" | "rtl" = locale === "ar" ? "rtl" : "ltr";
  const t = dictionary[locale];

  return (
    <LanguageContext.Provider value={{ locale, dir, setLocale, toggleLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback default if used outside of provider during SSR
    return {
      locale: "en" as Locale,
      dir: "ltr" as "ltr" | "rtl",
      setLocale: () => {},
      toggleLocale: () => {},
      t: dictionary.en,
    };
  }
  return context;
}
