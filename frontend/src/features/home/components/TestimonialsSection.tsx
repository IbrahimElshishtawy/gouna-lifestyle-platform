"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function TestimonialsSection() {
  const { t } = useLanguage();
  const reviews = t.testimonials.reviews;

  return (
    <section className="py-20 lg:py-24 px-6 lg:px-12 bg-[#FAF8F5] border-t border-brand-border/80">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-2">
            {t.testimonials.eyebrow}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
            {t.testimonials.title}
          </h2>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-2 font-light leading-relaxed">
            {t.testimonials.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-8 rounded-3xl border border-brand-border/80 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 text-amber-500 mb-4 text-sm">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-brand-brown leading-relaxed font-light italic mb-6">
                  &ldquo;{review.quote}&rdquo;
                </p>
              </div>

              <div className="pt-5 border-t border-brand-border/60">
                <span className="block font-bold text-xs text-brand-brown">
                  {review.name}
                </span>
                <span className="block text-[11px] text-brand-brown-muted mt-0.5">
                  {review.origin} &bull; {review.stay}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
