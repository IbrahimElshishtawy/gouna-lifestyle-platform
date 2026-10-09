"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import SafeImage from "@/components/ui/SafeImage";
import { useLanguage } from "@/context/LanguageContext";
import { ChapterTag } from "@/components/ui/MotionPrimitives";
import Card3D from "@/components/ui/Card3D";
import EventCard from "@/features/events/components/EventCard";
import { getPublicEvents, type PublicEventItem } from "@/features/events/services/events.api";

interface EventsSectionProps {
  events?: PublicEventItem[];
}

export default function EventsSection({ events = [] }: EventsSectionProps) {
  const { t, locale } = useLanguage();
  const isAr = locale === "ar";
  const staticEvents = t.events.eventsList;

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
        if (isMounted && res.data && res.data.length > 0) {
          setDisplayEvents(res.data);
        }
      })
      .catch((err) => {
        console.warn("Client live fetch for public events fallback:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const hasDynamicEvents = displayEvents && displayEvents.length > 0;

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

        {hasDynamicEvents ? (
          <>
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
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            {staticEvents.map((event) => (
              <Card3D key={event.id} maxTilt={6} glare={true} className="h-full">
                <div className="h-full bg-[#FAF8F5] rounded-2xl sm:rounded-3xl overflow-hidden border border-brand-border/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group preserve-3d">
                  <div>
                    <div className="relative h-48 sm:h-56 overflow-hidden bg-brand-sand shrink-0">
                      <SafeImage
                        src={event.image}
                        alt={event.title}
                        fill
                        fallbackSrc="/assets/images/fanadir-villa.jpg"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div
                        className="absolute top-3.5 start-3.5 transition-transform duration-300"
                        style={{ transform: "translateZ(24px)" }}
                      >
                        <span className="px-3 py-1 bg-brand-terracotta text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                          {event.date}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6 lg:p-7">
                      <div
                        className="flex items-center gap-2 text-[11px] text-brand-terracotta font-semibold uppercase tracking-wider mb-1.5 transition-transform duration-300"
                        style={{ transform: "translateZ(14px)" }}
                      >
                        <span>{event.category}</span>
                        <span>•</span>
                        <span className="text-brand-brown-muted normal-case font-normal">
                          {event.location}
                        </span>
                      </div>

                      <h3
                        className="font-serif text-lg sm:text-xl font-bold text-brand-brown mb-2 group-hover:text-brand-terracotta transition-colors"
                        style={{ transform: "translateZ(18px)" }}
                      >
                        {event.title}
                      </h3>

                      <p
                        className="text-xs text-brand-brown-muted line-clamp-3 font-light leading-relaxed mb-4 sm:mb-6"
                        style={{ transform: "translateZ(12px)" }}
                      >
                        {event.description}
                      </p>
                    </div>
                  </div>

                  <div
                    className="p-4 sm:p-6 lg:p-7 pt-0 flex items-center justify-between border-t border-brand-border/60"
                    style={{ transform: "translateZ(20px)" }}
                  >
                    <span className="text-xs font-semibold text-brand-brown-muted">
                      {event.time}
                    </span>
                    <a
                      href={`https://wa.me/201000000000?text=${encodeURIComponent(
                        `Hello GouNow Concierge, I would like to reserve a spot for "${event.title}".`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3.5 sm:px-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs active:scale-95 cursor-pointer"
                    >
                      {t.events.reserveSpot}
                    </a>
                  </div>
                </div>
              </Card3D>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
