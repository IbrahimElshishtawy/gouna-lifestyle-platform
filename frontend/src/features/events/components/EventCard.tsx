"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import SafeImage from "@/components/ui/SafeImage";
import Card3D from "@/components/ui/Card3D";
import type { PublicEventItem } from "../services/events.api";

interface EventCardProps {
  event: PublicEventItem;
  locale: string;
}

export default function EventCard({ event, locale }: EventCardProps) {
  const isAr = locale === "ar";
  const { attributes, relationships } = event;

  const title = isAr && attributes.title_ar ? attributes.title_ar : attributes.title_en;
  const description = isAr && attributes.short_description ? attributes.short_description : (attributes.short_description || attributes.description || "");
  const coverUrl = attributes.cover_url || "/assets/images/fanadir-villa.jpg";
  const venue = relationships?.venue?.name || attributes.venue_name || (isAr ? "الجونة" : "El Gouna");

  // Format date
  const dateObj = attributes.event_date ? new Date(attributes.event_date) : null;
  const formattedDate = dateObj
    ? dateObj.toLocaleDateString(isAr ? "ar-EG" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : attributes.event_date;

  const minPrice = attributes.min_price;

  return (
    <Card3D maxTilt={5} glare={true} className="h-full">
      <div className="h-full bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-brand-border/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group preserve-3d">
        <div>
          {/* Cover Image Container */}
          <div className="relative h-52 sm:h-60 overflow-hidden bg-brand-sand shrink-0">
            <SafeImage
              src={coverUrl}
              alt={title}
              fill
              fallbackSrc="/assets/images/fanadir-villa.jpg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

            {/* Date Badge */}
            <div
              className="absolute top-3.5 start-3.5 transition-transform duration-300"
              style={{ transform: "translateZ(20px)" }}
            >
              <span className="px-3 py-1 bg-brand-terracotta text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-md backdrop-blur-md">
                {formattedDate}
              </span>
            </div>

            {/* Category / Featured Badge */}
            <div
              className="absolute top-3.5 end-3.5 flex items-center gap-1.5 transition-transform duration-300"
              style={{ transform: "translateZ(20px)" }}
            >
              {attributes.is_featured && (
                <span className="px-2.5 py-1 bg-[#D4AF37] text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-md">
                  ★ VIP
                </span>
              )}
              {attributes.category && (
                <span className="px-2.5 py-1 bg-black/60 text-[#FAF8F5] text-[10px] font-semibold rounded-full uppercase tracking-wider backdrop-blur-md border border-white/20">
                  {attributes.category}
                </span>
              )}
            </div>

            {/* Timing in lower corner */}
            {attributes.start_time && (
              <div className="absolute bottom-3 start-3.5 text-white text-xs font-medium flex items-center gap-1.5 drop-shadow-md">
                <svg className="w-3.5 h-3.5 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{attributes.start_time}</span>
              </div>
            )}
          </div>

          {/* Event Content */}
          <div className="p-5 sm:p-6 lg:p-7">
            {/* Venue Tag */}
            <div
              className="flex items-center gap-1.5 text-xs text-brand-terracotta font-medium mb-2 transition-transform duration-300"
              style={{ transform: "translateZ(12px)" }}
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{venue}</span>
            </div>

            {/* Title */}
            <h3
              className="font-serif text-lg sm:text-xl font-bold text-brand-brown mb-2.5 line-clamp-2 group-hover:text-brand-terracotta transition-colors leading-snug"
              style={{ transform: "translateZ(16px)" }}
            >
              <Link href={`/events/${attributes.slug}`}>
                {title}
              </Link>
            </h3>

            {/* Short Description */}
            <p
              className="text-xs sm:text-sm text-brand-brown-muted line-clamp-2 font-light leading-relaxed mb-4"
              style={{ transform: "translateZ(10px)" }}
            >
              {description}
            </p>
          </div>
        </div>

        {/* Action & Price Footer */}
        <div
          className="p-5 sm:p-6 lg:p-7 pt-0 flex items-center justify-between border-t border-brand-border/60 mt-auto"
          style={{ transform: "translateZ(18px)" }}
        >
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-brand-brown-muted font-mono">
              {isAr ? "التذاكر تبدأ من" : "Tickets From"}
            </span>
            <span className="text-base sm:text-lg font-bold text-brand-brown font-serif">
              {minPrice ? `${minPrice.toLocaleString()} EGP` : (isAr ? "بدعوة خاصة" : "By Request")}
            </span>
          </div>

          <Link
            href={`/events/${attributes.slug}`}
            className="py-2.5 px-4 sm:px-5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 inline-flex items-center gap-1.5"
          >
            <span>{isAr ? "تفاصيل وحجز" : "Book Event"}</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform ${isAr ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </Card3D>
  );
}
