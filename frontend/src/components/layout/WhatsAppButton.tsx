"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function WhatsAppButton() {
  const { locale } = useLanguage();

  return (
    <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 transition-all">
      <a
        href="https://wa.me/201000000000?text=Hello%20GouNow,%20I%20am%20interested%20in%20luxury%20stays%20and%20experiences%20in%20El%20Gouna"
        target="_blank"
        rel="noopener noreferrer"
        data-ga-event="contact_whatsapp_floating"
        data-ga-item="floating_widget"
        data-ga-category="concierge"
        className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group border border-emerald-400/30"
      >
        <span className="text-xl">💬</span>
        <div className="text-left rtl:text-right hidden sm:block">
          <span className="block text-[10px] uppercase font-bold tracking-wider text-emerald-200">
            {locale === "ar" ? "كونسيرج 24/7" : "24/7 Concierge"}
          </span>
          <span className="block text-xs font-semibold">
            {locale === "ar" ? "مكتب واتساب المباشر" : "WhatsApp Desk"}
          </span>
        </div>
      </a>
    </div>
  );
}
