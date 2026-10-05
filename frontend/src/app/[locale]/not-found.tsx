"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-brand-brown">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-32 pb-20 px-6 lg:px-12 text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <span className="inline-block px-3 py-1 bg-brand-terracotta/10 text-brand-terracotta text-xs font-bold uppercase tracking-[0.2em] rounded-full">
            {t("badge")}
          </span>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-brand-brown">
            {t("title")}
          </h1>

          <p className="text-sm sm:text-base text-brand-brown-muted leading-relaxed font-light">
            {t("description")}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="px-6 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm"
            >
              {t("returnHome")}
            </Link>
            <Link
              href="/stays"
              className="px-6 py-3.5 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl text-xs font-bold uppercase tracking-wider transition border border-brand-border"
            >
              {t("exploreStays")}
            </Link>
            <a
              href="https://wa.me/201000000000?text=Hello%20GouNow%20Concierge,%20I%20need%20help%20finding%20a%20page"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2"
            >
              <span>💬</span> {t("contactConcierge")}
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
