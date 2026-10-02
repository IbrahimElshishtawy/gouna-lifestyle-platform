"use client";

import React from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function EventsSection() {
  const { t } = useLanguage();
  const events = t.events.eventsList;

  return (
    <section id="events" className="py-20 lg:py-24 px-6 lg:px-12 bg-white border-t border-brand-border/80">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-2">
            {t.events.eyebrow}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
            {t.events.title}
          </h2>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-2 font-light leading-relaxed">
            {t.events.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-[#FAF8F5] rounded-3xl overflow-hidden border border-brand-border/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
            >
              <div className="relative h-56 overflow-hidden bg-brand-sand">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4">
                  <span className="px-3 py-1 bg-brand-terracotta text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                    {event.date}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-brand-terracotta font-semibold uppercase tracking-wider mb-2">
                    <span>{event.category}</span>
                    <span>•</span>
                    <span className="text-brand-brown-muted normal-case font-normal">
                      {event.location}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-brown mb-2 group-hover:text-brand-terracotta transition-colors">
                    {event.title}
                  </h3>

                  <p className="text-xs text-brand-brown-muted line-clamp-3 font-light leading-relaxed mb-6">
                    {event.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-brown-muted">
                    {event.time}
                  </span>
                  <a
                    href={`https://wa.me/201000000000?text=${encodeURIComponent(
                      `Hello GouNow Concierge, I would like to reserve a spot for "${event.title}".`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                  >
                    {t.events.reserveSpot}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
