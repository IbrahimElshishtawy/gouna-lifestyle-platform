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
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.943.514 1.785.78 2.796.78h.005c3.18 0 5.767-2.587 5.768-5.766.001-3.182-2.585-5.767-5.773-5.767zm3.375 8.16c-.14.394-.808.753-1.121.794-.312.041-.703.064-2.146-.532-1.748-.724-2.884-2.483-2.973-2.6-.088-.117-.714-.95-.714-1.812s.449-1.286.609-1.464c.16-.178.349-.223.465-.223.116 0 .233.001.335.006.107.006.251-.041.393.3.145.349.494 1.205.538 1.293.044.088.073.19.015.306-.058.117-.087.19-.174.292-.087.102-.184.228-.263.307-.087.087-.178.182-.077.356.102.175.452.747.97 1.208.667.594 1.229.778 1.404.865.174.087.276.073.378-.044.102-.117.436-.51.553-.685.116-.175.233-.146.393-.087.16.058 1.019.48 1.194.568.174.087.291.131.335.204.043.073.043.423-.097.817z" />
              </svg>
              <span>{t("contactConcierge")}</span>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
