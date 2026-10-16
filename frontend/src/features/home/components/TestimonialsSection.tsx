"use client";

import React from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function TestimonialsSection() {
  const { t, locale } = useLanguage();
  const isAr = locale === "ar";
  const reviews = t.testimonials.reviews;

  return (
    <section id="testimonials" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[#FAF6F0] to-white border-t border-brand-border/80 relative overflow-hidden scroll-mt-24">
      {/* Background Sand Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply">
        <Image
          src="/assets/images/bg-sand-texture.jpg"
          alt="Texture"
          fill
          className="object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-brand-sand-light/80 border border-brand-sand/80 shadow-xs mb-3">
            <div className="relative w-6 h-6 rounded-full overflow-hidden bg-[#E2CEBC] flex items-center justify-center shadow-inner shrink-0">
              <Image
                src="/assets/images/Feedbacks highlight logo.png"
                alt="Feedbacks"
                fill
                sizes="24px"
                className="object-cover"
              />
            </div>
            <span className="text-xs uppercase font-bold tracking-[0.2em] text-brand-terracotta">
              {t.testimonials.eyebrow}
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
            {t.testimonials.title}
          </h2>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-2 font-light leading-relaxed">
            {t.testimonials.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-brand-border/80 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1 text-amber-500">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="relative w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity">
                    <Image
                      src="/assets/images/Feedback logo.png"
                      alt="Review quote seal"
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-brand-brown leading-relaxed font-light italic mb-6">
                  &ldquo;{review.quote}&rdquo;
                </p>
              </div>

              <div className="pt-5 border-t border-brand-border/60 flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-brand-border shadow-xs">
                  <Image
                    src="/assets/images/icon-review.jpg"
                    alt={review.name}
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <span className="block font-bold text-xs text-brand-brown">
                    {review.name}
                  </span>
                  <span className="block text-[11px] text-brand-brown-muted mt-0.5">
                    {review.origin} &bull; {review.stay}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
