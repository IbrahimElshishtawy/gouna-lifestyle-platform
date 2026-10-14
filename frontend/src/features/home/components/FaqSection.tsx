"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function FaqSection() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = t.faq.items;

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto scroll-mt-24">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-sand-light/80 border border-brand-sand/80 shadow-xs mb-3">
          <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 border border-brand-terracotta/40">
            <Image
              src="/assets/images/icon-question.jpg"
              alt="FAQ Help Icon"
              width={16}
              height={16}
              className="object-cover"
            />
          </div>
          <span className="text-xs uppercase font-bold tracking-[0.2em] text-brand-terracotta">
            {t.faq.eyebrow}
          </span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
          {t.faq.title}
        </h2>
        <p className="text-xs sm:text-sm text-brand-brown-muted mt-2 font-light">
          {t.faq.subtitle}
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl border border-brand-border overflow-hidden transition-shadow shadow-xs"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full text-left rtl:text-right p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
              >
                <span className="font-serif text-sm sm:text-base font-bold text-brand-brown">
                  {faq.q}
                </span>
                <span
                  className={`text-brand-terracotta text-lg transform transition-transform duration-200 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs text-brand-brown-muted leading-relaxed font-light border-t border-brand-border/40 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
