"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useLanguage } from "@/context/LanguageContext";

export default function BrandPillarsSection() {
  const { t } = useLanguage();

  const pillars = [
    {
      id: "stays",
      title: t.brandPillars.pillar1Title,
      description: t.brandPillars.pillar1Desc,
      icon: (
        <svg
          className="w-6 h-6 text-brand-terracotta"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      link: "/stays?listing_type=rent",
    },
    {
      id: "charters",
      title: t.brandPillars.pillar2Title,
      description: t.brandPillars.pillar2Desc,
      icon: (
        <svg
          className="w-6 h-6 text-brand-terracotta"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      link: "/experiences",
    },
    {
      id: "concierge",
      title: t.brandPillars.pillar3Title,
      description: t.brandPillars.pillar3Desc,
      icon: (
        <svg
          className="w-6 h-6 text-brand-terracotta"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
      link: "#concierge",
    },
  ];

  return (
    <section className="py-20 lg:py-24 px-6 lg:px-12 bg-[#FAF8F5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header with Title and Verification Pill */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 sm:mb-16">
          <div className="max-w-3xl">
            <span className="text-[10px] sm:text-xs uppercase font-bold tracking-[0.2em] sm:tracking-[0.25em] text-brand-terracotta block mb-2 sm:mb-3">
              {t.brandPillars.eyebrow}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown leading-[1.2]">
              {t.brandPillars.title}
            </h2>
            <p className="text-xs sm:text-sm text-brand-brown-muted mt-3 sm:mt-4 font-light leading-relaxed max-w-2xl">
              {t.brandPillars.description}
            </p>
          </div>

          {/* Luxury Badge matching screenshot right side */}
          <div className="shrink-0 flex items-center gap-3.5 px-4 sm:px-5 py-3 rounded-2xl bg-white border border-brand-border/80 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 font-bold shrink-0">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-bold text-brand-brown tracking-tight">
                {t.common.verified}
              </span>
              <span className="block text-[11px] text-brand-brown-muted font-light">
                {t.common.verifiedSub}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Value Proposition Feature Cards with Staggered Entrance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <ScrollReveal
              key={pillar.id}
              animation="fade-up"
              delay={index * 120}
              duration={700}
              className="h-full"
            >
              <Link
                href={pillar.link}
                className="group h-full bg-white p-6 sm:p-8 rounded-3xl border border-brand-border/70 shadow-xs hover:shadow-2xl hover:border-brand-terracotta/30 transition-all duration-500 hover:-translate-y-2 relative flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-brand-sand-light/80 border border-brand-border flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-terracotta/15 transition-all duration-300">
                    {pillar.icon}
                  </div>
                  <h3 className="font-serif text-xl font-bold text-brand-brown mb-3 group-hover:text-brand-terracotta transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-brown-muted font-light leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-brand-border/50 flex items-center justify-between text-xs font-semibold text-brand-terracotta">
                  <span>{t.common.discoverMore}</span>
                  <span className="transform group-hover:translate-x-2 rtl:group-hover:-translate-x-2 transition-transform duration-300">
                    &rarr;
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
