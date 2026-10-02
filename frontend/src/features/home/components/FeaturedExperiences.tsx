"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Experience } from "@/features/experiences/types/experience.types";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  experiences: Experience[];
}

export default function FeaturedExperiences({ experiences }: Props) {
  const { t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeExperience = experiences[selectedIndex] || experiences[0];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? experiences.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === experiences.length - 1 ? 0 : prev + 1));
  };

  if (!activeExperience) return null;

  return (
    <section className="py-20 lg:py-24 px-6 lg:px-12 bg-white border-t border-brand-border/80">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-2">
              {t.experiences.eyebrow}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
              {t.experiences.title}
            </h2>
            <p className="text-xs sm:text-sm text-brand-brown-muted mt-2 max-w-2xl font-light leading-relaxed">
              {t.experiences.subtitle}
            </p>
          </div>

          <div className="mt-6 md:mt-0 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Previous Experience"
                className="w-10 h-10 rounded-full border border-brand-border bg-white text-brand-brown hover:bg-brand-sand-light hover:border-brand-brown transition-colors flex items-center justify-center cursor-pointer shadow-xs"
              >
                <span className="rtl:rotate-180 inline-block">&larr;</span>
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Experience"
                className="w-10 h-10 rounded-full border border-brand-border bg-white text-brand-brown hover:bg-brand-sand-light hover:border-brand-brown transition-colors flex items-center justify-center cursor-pointer shadow-xs"
              >
                <span className="rtl:rotate-180 inline-block">&rarr;</span>
              </button>
            </div>

            <Link
              href="/experiences"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-terracotta hover:text-brand-terracotta-dark transition-colors group"
            >
              <span>{t.common.viewAll}</span>
              <span className="transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform">
                &rarr;
              </span>
            </Link>
          </div>
        </div>

        {/* Flagship Split Showcase Card */}
        <div className="bg-[#FAF8F5] rounded-3xl border border-brand-border/80 shadow-md overflow-hidden p-6 sm:p-8 lg:p-10 mb-12 transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Experience Imagery (7 cols) */}
            <div className="lg:col-span-7">
              <div className="relative h-[340px] sm:h-[440px] rounded-2xl overflow-hidden bg-brand-sand">
                <Image
                  src={activeExperience.image || "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1400&q=85"}
                  alt={activeExperience.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-opacity duration-300"
                />

                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 flex flex-wrap gap-2 z-10">
                  <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-brand-brown text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1 border border-brand-border">
                    <span>⚓</span> {t.experiences.vipCharter}
                  </span>
                  <span className="px-3 py-1 bg-brand-terracotta text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                    {t.experiences.allInclusive}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4 z-10 px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-medium rounded-xl flex items-center gap-2">
                  <span>📍</span>
                  <span>{activeExperience.location?.name || t.common.elGouna}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Specs & Reservation (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand-terracotta mb-2">
                  <span>{activeExperience.category?.name || t.experiences.vipCharter}</span>
                  <span className="flex items-center gap-1 text-brand-brown">
                    <span className="text-amber-500">★</span> 5.0 (38 {t.common.readReviews})
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown leading-tight mb-3">
                  {activeExperience.title}
                </h3>

                <p className="text-xs sm:text-sm text-brand-brown-muted font-light leading-relaxed mb-6">
                  {activeExperience.description}
                </p>

                {/* Specs Grid */}
                <div className="grid grid-cols-3 gap-2 text-center py-4 px-3 bg-white rounded-2xl border border-brand-border/70 mb-6 shadow-xs">
                  <div>
                    <span className="block text-base sm:text-lg font-bold text-brand-brown">
                      {activeExperience.max_guests}
                    </span>
                    <span className="block text-[10px] uppercase font-semibold text-brand-brown-muted">
                      {t.common.maxGuests}
                    </span>
                  </div>
                  <div>
                    <span className="block text-base sm:text-lg font-bold text-brand-brown">
                      {activeExperience.duration}
                    </span>
                    <span className="block text-[10px] uppercase font-semibold text-brand-brown-muted">
                      {t.common.duration}
                    </span>
                  </div>
                  <div>
                    <span className="block text-base sm:text-lg font-bold text-brand-brown">
                      {t.experiences.fullCrew}
                    </span>
                    <span className="block text-[10px] uppercase font-semibold text-brand-brown-muted">
                      {t.experiences.crewDesc}
                    </span>
                  </div>
                </div>

                {/* Perks Checklist */}
                <div className="space-y-2 mb-6 text-xs text-brand-brown">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{t.experiences.feature1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{t.experiences.feature2}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{t.experiences.feature3}</span>
                  </div>
                </div>
              </div>

              {/* Price & Action CTA */}
              <div className="pt-6 border-t border-brand-border/70">
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-brown-muted tracking-wider block">
                      {t.experiences.charterPricing}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-bold font-serif text-brand-brown">
                        {activeExperience.price_formatted}
                      </span>
                      <span className="text-xs font-semibold text-brand-brown-muted">
                        {activeExperience.currency === "EGP" ? t.common.currency : activeExperience.currency} {activeExperience.pricing_type}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50">
                    {t.experiences.vipFastTrack}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`/experiences/${activeExperience.slug}`}
                    className="py-3 px-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {t.experiences.reserveCharter}
                  </Link>
                  <Link
                    href={`/experiences/${activeExperience.slug}`}
                    className="py-3 px-4 bg-white hover:bg-brand-sand-light text-brand-brown rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-colors border border-brand-border"
                  >
                    {t.experiences.viewItinerary}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Track Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiences.slice(0, 4).map((exp, idx) => (
            <div
              key={exp.id}
              onClick={() => setSelectedIndex(idx)}
              className={`group bg-white rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between ${
                selectedIndex === idx
                  ? "border-brand-terracotta ring-2 ring-brand-terracotta/20 shadow-md"
                  : "border-brand-border"
              }`}
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-brand-sand">
                  <Image
                    src={exp.image}
                    alt={exp.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
                    <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md text-brand-brown text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                      {exp.category?.name || t.experiences.title}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="font-serif text-sm font-bold text-brand-brown line-clamp-1 group-hover:text-brand-terracotta transition-colors mb-1">
                    {exp.title}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-brand-brown-muted mb-3 font-light">
                    <span>{exp.duration}</span>
                    <span>•</span>
                    <span>{t.experiences.upToGuests} {exp.max_guests} {t.common.guests}</span>
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-brand-border/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-brand-brown">
                    {exp.price_formatted}
                  </span>
                  <span className="text-[10px] text-brand-brown-muted ml-1 rtl:mr-1 rtl:ml-0">
                    {exp.currency === "EGP" ? t.common.currency : exp.currency}
                  </span>
                </div>

                <Link
                  href={`/experiences/${exp.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] font-bold text-brand-terracotta hover:underline inline-flex items-center gap-1"
                >
                  <span>{t.common.viewDetails}</span>
                  <span className="rtl:rotate-180 inline-block">&rarr;</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
