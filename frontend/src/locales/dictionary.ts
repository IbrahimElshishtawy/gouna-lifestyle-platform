import enMessages from "@/messages/en.json";
import arMessages from "@/messages/ar.json";

export type Locale = "en" | "ar";

export const dictionary = {
  en: enMessages,
  ar: arMessages,
} as const;

export type Dictionary = typeof dictionary.en;
