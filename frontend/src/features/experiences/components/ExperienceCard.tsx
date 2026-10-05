"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Experience } from "../types/experience.types";
import { useLanguage } from "@/context/LanguageContext";

interface ExperienceCardProps {
  experience: Experience;
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const { t, locale } = useLanguage();

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-brand-border/80 shadow-xs hover:shadow-2xl hover:border-brand-terracotta/30 transition-all duration-500 hover:-translate-y-1.5 flex flex-col">
      <div className="relative h-64 overflow-hidden bg-brand-sand">
        <Image
          src={experience.image}
          alt={experience.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
        
        <div className="absolute top-4 start-4 z-10">
          <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-brand-brown text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs border border-brand-border/80">
            {experience.category?.name || (locale === "ar" ? "تجربة حصرية" : "Experience")}
          </span>
        </div>
        {experience.duration && (
          <div className="absolute bottom-4 end-4 z-10">
            <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium rounded-full border border-white/20">
              ⏱️ {experience.duration}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-brand-brown-muted">
            <span>📍 {experience.location?.name || t.common.elGouna}</span>
            <span>•</span>
            <span>
              {t.experiences.upToGuests} {experience.max_guests} {t.common.guests}
            </span>
          </div>

          <h3 className="font-serif text-xl font-bold text-brand-brown group-hover:text-brand-terracotta transition-colors line-clamp-1">
            <Link href={`/experiences/${experience.slug}`}>{experience.title}</Link>
          </h3>

          <p className="text-xs text-brand-brown-muted line-clamp-2 leading-relaxed font-light">
            {experience.description}
          </p>
        </div>

        <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-brand-brown-muted block">{t.common.price}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-serif font-bold text-brand-brown">
                {experience.price_formatted}
              </span>
              <span className="text-[10px] text-brand-brown-muted font-medium">
                {t.common.currency}
              </span>
            </div>
            <span className="text-[10px] text-brand-brown-muted block capitalize">
              {experience.pricing_type?.replace(/^\/\s*/, "") || t.common.perGroup}
            </span>
          </div>
          <Link
            href={`/experiences/${experience.slug}`}
            className="px-5 py-2.5 bg-brand-sand-light hover:bg-brand-terracotta hover:text-white text-brand-brown rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer"
          >
            {t.common.explore}
          </Link>
        </div>
      </div>
    </div>
  );
}
