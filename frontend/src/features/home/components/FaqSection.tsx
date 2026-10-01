"use client";

import React, { useState } from "react";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What are the standard check-in and check-out times?",
      a: "Standard check-in begins at 15:00 (3:00 PM) and check-out is by 11:00 AM. Early check-in and late departures can be coordinated with the GouNow Concierge desk subject to calendar availability.",
    },
    {
      q: "Are the private swimming pools heated during winter?",
      a: "Yes. All featured luxury vacation villas in our signature portfolio include temperature-controlled heated swimming pools active from November through April at no supplementary charge.",
    },
    {
      q: "Can you arrange private airport transfers from Hurghada Airport (HRG)?",
      a: "Certainly. We provide seamless VIP door-to-door chauffeured transfers in premium Mercedes V-Class vans and executive sedans directly from Hurghada International Airport (HRG) to your villa doorstep in El Gouna (approx. 25-30 minutes).",
    },
    {
      q: "How does the booking deposit and payment schedule operate?",
      a: "For vacation rentals, you may choose at checkout to pay in full or reserve with an upfront deposit (30% to 50%), with the remaining balance due prior to arrival. We accept Visa, Mastercard, and direct bank transfers.",
    },
    {
      q: "Do you offer private boat trips and bespoke yacht excursions?",
      a: "Yes, our maritime desk operates private luxury motor yachts ranging from 38ft to 80ft departing from Abu Tig Marina for day voyages to Tawila Island, dolphin reef sanctuaries, and sunset champagne cruises.",
    },
  ];

  return (
    <section className="py-20 px-6 lg:px-12 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-2">
          Help &amp; Information
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-brand-brown-muted mt-2 font-light">
          Essential details regarding villa stays, experiences, and VIP
          services in El Gouna.
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
                className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
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
