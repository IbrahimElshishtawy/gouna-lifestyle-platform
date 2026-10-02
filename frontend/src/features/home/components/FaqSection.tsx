"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function FaqSection() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = t.faq.items;

  return (
    <section className="py-20 px-6 lg:px-12 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-2">
          {t.faq.eyebrow}
        </span>
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
