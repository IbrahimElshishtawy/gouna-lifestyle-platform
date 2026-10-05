"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Experience } from "../types/experience.types";
import { useLanguage } from "@/context/LanguageContext";
import Card3D from "@/components/ui/Card3D";

interface ExperienceCardProps {
  experience: Experience;
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const { t, locale } = useLanguage();
  const isAr = locale === "ar";

  return (
    <Card3D maxTilt={7} glare={true} className="h-full">
      <div className="h-full bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-brand-border/80 shadow-xs hover:shadow-2xl hover:border-brand-terracotta/40 transition-all duration-500 flex flex-col preserve-3d group">
        
        {/* Image Container with 3D Depth */}
        <div className="relative h-48 sm:h-60 lg:h-64 overflow-hidden bg-brand-sand shrink-0">
          <Image
            src={experience.image}
            alt={experience.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-75 transition-opacity duration-300" />
          
          {/* Top Floating 3D Category Badge */}
          <div
            className="absolute top-3.5 start-3.5 sm:top-4 sm:start-4 z-10 transition-transform duration-300"
            style={{ transform: "translateZ(26px)" }}
          >
            <span className="px-2.5 sm:px-3 py-1 bg-white/95 backdrop-blur-md text-brand-brown text-[9px] sm:text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm border border-brand-border/80">
              {experience.category?.name || (isAr ? "تجربة حصرية" : "Exclusive Experience")}
            </span>
          </div>

          {/* Duration Badge */}
          {experience.duration && (
            <div
              className="absolute bottom-3 end-3 sm:bottom-3.5 sm:end-3.5 z-10 transition-transform duration-300"
              style={{ transform: "translateZ(22px)" }}
            >
              <span className="px-2.5 sm:px-3 py-1 bg-black/65 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-medium rounded-full border border-white/20">
                ⏱️ {experience.duration}
              </span>
            </div>
          )}
        </div>

        {/* Content Body with 3D Depth Layers */}
        <div className="p-4 sm:p-6 lg:p-7 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <div
              className="flex items-center gap-2 text-[11px] sm:text-xs text-brand-brown-muted transition-transform duration-300"
              style={{ transform: "translateZ(14px)" }}
            >
              <span className="truncate">📍 {experience.location?.name || t.common.elGouna}</span>
              <span>•</span>
              <span className="shrink-0">
                {t.experiences.upToGuests} {experience.max_guests} {t.common.guests}
              </span>
            </div>

            <h3
              className="font-serif text-lg sm:text-xl font-bold text-brand-brown group-hover:text-brand-terracotta transition-colors line-clamp-1 leading-snug"
              style={{ transform: "translateZ(20px)" }}
            >
              <Link href={`/experiences/${experience.slug}`}>{experience.title}</Link>
            </h3>

            <p
              className="text-xs text-brand-brown-muted line-clamp-2 leading-relaxed font-light"
              style={{ transform: "translateZ(12px)" }}
            >
              {experience.description}
            </p>
          </div>

          {/* Price & Action Row */}
          <div
            className="pt-3 sm:pt-4 border-t border-brand-border/60 flex items-center justify-between transition-transform duration-300"
            style={{ transform: "translateZ(24px)" }}
          >
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-brown-muted block">
                {t.common.price}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-serif font-bold text-brand-brown">
                  {experience.price_formatted}
                </span>
                <span className="text-[10px] text-brand-brown-muted font-medium">
                  {t.common.currency}
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-brand-brown-muted block capitalize truncate">
                {experience.pricing_type?.replace(/^\/\s*/, "") || t.common.perGroup}
              </span>
            </div>

            <Link
              href={`/experiences/${experience.slug}`}
              className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-brand-sand-light hover:bg-brand-terracotta hover:text-white text-brand-brown rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer whitespace-nowrap active:scale-[0.97]"
            >
              {t.common.explore}
            </Link>
          </div>
        </div>

      </div>
    </Card3D>
  );
}
