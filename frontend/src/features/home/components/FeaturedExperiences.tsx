"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Experience } from "@/features/experiences/types/experience.types";
import { useLanguage } from "@/context/LanguageContext";
import { ChapterTag } from "@/components/ui/MotionPrimitives";
import Card3D from "@/components/ui/Card3D";

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
    <section id="experiences" className="py-14 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-12 bg-white border-t border-brand-border/80 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-10 lg:mb-12">
          <div>
            <ChapterTag
              number="CHAPTER 03"
              title={t.experiences.eyebrow}
              subtitle={t.experiences.subtitle}
            />
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown leading-tight">
              {t.experiences.title}
            </h2>
          </div>

          <div className="mt-4 sm:mt-6 md:mt-0 flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Previous Experience"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-brand-border bg-white text-brand-brown hover:bg-brand-sand-light hover:border-brand-brown transition-colors flex items-center justify-center cursor-pointer shadow-xs active:scale-95 text-sm"
              >
                <span className="rtl:rotate-180 inline-block">&larr;</span>
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Experience"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-brand-border bg-white text-brand-brown hover:bg-brand-sand-light hover:border-brand-brown transition-colors flex items-center justify-center cursor-pointer shadow-xs active:scale-95 text-sm"
              >
                <span className="rtl:rotate-180 inline-block">&rarr;</span>
              </button>
            </div>

            <Link
              href="/experiences"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-terracotta hover:text-brand-terracotta-dark transition-colors group"
            >
              <span>{t.common.viewAll}</span>
              <span className="transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform">
                &rarr;
              </span>
            </Link>
          </div>
        </div>

        {/* Flagship Split Showcase Card */}
        <div className="bg-[#FAF8F5] rounded-2xl sm:rounded-3xl border border-brand-border/80 shadow-md hover:shadow-xl overflow-hidden p-3.5 sm:p-7 lg:p-10 mb-8 sm:mb-12 transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
            
            {/* Left Column: Experience Imagery (7 cols) */}
            <div className="lg:col-span-7">
              <div className="relative h-[220px] sm:h-[360px] lg:h-[440px] rounded-xl sm:rounded-2xl overflow-hidden bg-brand-sand group">
                <Image
                  src={activeExperience.image || "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1400&q=85"}
                  alt={activeExperience.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
                />

                {/* Badges Overlay */}
                <div className="absolute top-3 start-3 sm:top-4 sm:start-4 flex flex-wrap gap-1.5 sm:gap-2 z-10">
                  <span className="px-2.5 sm:px-3 py-1 bg-white/95 backdrop-blur-md text-brand-brown text-[10px] sm:text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1.5 border border-brand-border">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-terracotta" />
                    <span>{t.experiences.vipCharter}</span>
                  </span>
                  <span className="px-2.5 sm:px-3 py-1 bg-brand-terracotta text-white text-[10px] sm:text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                    {t.experiences.allInclusive}
                  </span>
                </div>

                <div className="absolute bottom-3 end-3 sm:bottom-4 sm:end-4 z-10 px-2.5 sm:px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium rounded-xl flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-white/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{activeExperience.location?.name || t.common.elGouna}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Specs & Reservation (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-4 sm:space-y-6">
              <div>
                <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-brand-terracotta mb-1.5 sm:mb-2">
                  <span>{activeExperience.category?.name || t.experiences.vipCharter}</span>
                  <span className="flex items-center gap-1.5 text-brand-brown">
                    <svg className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>5.0 (38 {t.common.readReviews})</span>
                  </span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-brand-brown leading-tight mb-2 sm:mb-3">
                  {activeExperience.title}
                </h3>

                <p className="text-xs sm:text-sm text-brand-brown-muted font-light leading-relaxed mb-4 sm:mb-6 line-clamp-3">
                  {activeExperience.description}
                </p>

                {/* Specs Grid */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center py-2.5 sm:py-4 px-2 sm:px-3 bg-white rounded-xl sm:rounded-2xl border border-brand-border/70 mb-4 sm:mb-6 shadow-xs">
                  <div>
                    <span className="block text-sm sm:text-lg font-bold text-brand-brown font-mono">
                      {activeExperience.max_guests}
                    </span>
                    <span className="block text-[9px] sm:text-[10px] uppercase font-semibold text-brand-brown-muted">
                      {t.common.maxGuests}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm sm:text-lg font-bold text-brand-brown font-mono">
                      {activeExperience.duration}
                    </span>
                    <span className="block text-[9px] sm:text-[10px] uppercase font-semibold text-brand-brown-muted">
                      {t.common.duration}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm sm:text-lg font-bold text-brand-brown font-mono">
                      {t.experiences.fullCrew}
                    </span>
                    <span className="block text-[9px] sm:text-[10px] uppercase font-semibold text-brand-brown-muted">
                      {t.experiences.crewDesc}
                    </span>
                  </div>
                </div>

                {/* Perks Checklist */}
                <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-xs text-brand-brown">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t.experiences.feature1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t.experiences.feature2}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t.experiences.feature3}</span>
                  </div>
                </div>
              </div>

              {/* Price & Action CTA */}
              <div className="pt-4 sm:pt-6 border-t border-brand-border/70">
                <div className="flex items-baseline justify-between mb-3 sm:mb-4">
                  <div>
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-brand-brown-muted tracking-wider block">
                      {t.experiences.charterPricing}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl sm:text-2xl lg:text-3xl font-bold font-serif text-brand-brown">
                        {activeExperience.price_formatted}
                      </span>
                      <span className="text-[11px] sm:text-xs font-semibold text-brand-brown-muted">
                        {activeExperience.currency === "EGP" ? t.common.currency : activeExperience.currency} {activeExperience.pricing_type}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-emerald-200/50">
                    {t.experiences.vipFastTrack}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <Link
                    href={`/experiences/${activeExperience.slug}`}
                    className="py-2.5 sm:py-3 px-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
                  >
                    {t.experiences.reserveCharter}
                  </Link>
                  <Link
                    href={`/experiences/${activeExperience.slug}`}
                    className="py-2.5 sm:py-3 px-4 bg-white hover:bg-brand-sand-light text-brand-brown rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-colors border border-brand-border active:scale-[0.98]"
                  >
                    {t.experiences.viewItinerary}
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Secondary Track Cards with 3D Tilt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {experiences.slice(0, 4).map((exp, idx) => (
            <Card3D key={exp.id} maxTilt={6} glare={true} className="h-full">
              <div
                onClick={() => setSelectedIndex(idx)}
                className={`group h-full bg-white rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 flex flex-col justify-between preserve-3d ${
                  selectedIndex === idx
                    ? "border-brand-terracotta ring-2 ring-brand-terracotta/20 shadow-md"
                    : "border-brand-border hover:shadow-lg"
                }`}
              >
                <div>
                  <div className="relative h-40 sm:h-44 overflow-hidden bg-brand-sand shrink-0">
                    <Image
                      src={exp.image}
                      alt={exp.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div
                      className="absolute top-2.5 start-2.5 transition-transform duration-300"
                      style={{ transform: "translateZ(24px)" }}
                    >
                      <span className="px-2.5 py-0.5 bg-white/95 backdrop-blur-md text-brand-brown text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                        {exp.category?.name || t.experiences.title}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4">
                    <h4
                      className="font-serif text-sm font-bold text-brand-brown line-clamp-1 group-hover:text-brand-terracotta transition-colors mb-1"
                      style={{ transform: "translateZ(16px)" }}
                    >
                      {exp.title}
                    </h4>
                    <div
                      className="flex items-center gap-2 text-[11px] text-brand-brown-muted mb-2 font-light"
                      style={{ transform: "translateZ(12px)" }}
                    >
                      <span>{exp.duration}</span>
                      <span>•</span>
                      <span>{t.experiences.upToGuests} {exp.max_guests} {t.common.guests}</span>
                    </div>
                  </div>
                </div>

                <div
                  className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-2 border-t border-brand-border/60 flex items-center justify-between"
                  style={{ transform: "translateZ(20px)" }}
                >
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
                    className="text-[11px] font-bold text-brand-terracotta hover:underline inline-flex items-center gap-1 active:scale-95"
                  >
                    <span>{t.common.viewDetails}</span>
                    <span className="rtl:rotate-180 inline-block">&rarr;</span>
                  </Link>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
    </section>
  );
}
