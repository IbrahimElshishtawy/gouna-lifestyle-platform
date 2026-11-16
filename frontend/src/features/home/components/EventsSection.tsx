"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { useLanguage } from "@/context/LanguageContext";
import { ChapterTag } from "@/components/ui/MotionPrimitives";
import EventCard from "@/features/events/components/EventCard";
import { getPublicEvents, type PublicEventItem } from "@/features/events/services/events.api";

interface EventsSectionProps {
  events?: PublicEventItem[];
}

export default function EventsSection({ events = [] }: EventsSectionProps) {
  const { t, locale } = useLanguage();
  const isAr = locale === "ar";

  const [displayEvents, setDisplayEvents] = useState<PublicEventItem[]>(events);

  useEffect(() => {
    if (events && events.length > 0) {
      setDisplayEvents(events);
    }
  }, [events]);

  useEffect(() => {
    let isMounted = true;
    getPublicEvents()
      .then((res) => {
        if (isMounted && res.data) {
          setDisplayEvents(res.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  if (!displayEvents || displayEvents.length === 0) {
    return null;
  }

  return (
    <section id="events" className="py-14 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-12 bg-white border-t border-brand-border/80 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12 lg:mb-16">
          <div>
            <ChapterTag
              number="CHAPTER 04"
              title={t.events.eyebrow}
              subtitle={t.events.subtitle}
            />
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown leading-tight">
              {t.events.title}
            </h2>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-brand-border bg-[#FAF8F5] hover:bg-brand-sand text-xs font-bold uppercase tracking-wider text-brand-brown transition-all hover:scale-105 shrink-0"
          >
            <span>{isAr ? "استكشف كل الفعاليات والحفلات" : "Explore All Events & Parties"}</span>
            <svg className="w-3.5 h-3.5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
          {displayEvents.slice(0, 6).map((event) => (
            <EventCard key={event.id} event={event} locale={locale} />
          ))}
        </div>

        <div className="mt-12 sm:mt-16 text-center">
          <Link
            href="/events"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
          >
            <span>{isAr ? "عرض جميع الحفلات والفعاليات في الجونة" : "Explore All Events & Parties in El Gouna"}</span>
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
