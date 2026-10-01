import React from "react";
import Link from "next/link";

export default function BrandPillarsSection() {
  const pillars = [
    {
      id: "stays",
      title: "Curated Private Stays",
      description:
        "Direct lagoon access villas, ultra-luxury townhomes, private pools & panoramic sunset views with daily housekeeping and private chef on demand.",
      icon: (
        <svg
          className="w-6 h-6 text-brand-terracotta"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      link: "/stays?listing_type=rent",
    },
    {
      id: "charters",
      title: "Tailored Yacht Charters",
      description:
        "Bespoke full-day or sunset cruises. Catered dining, professional skippers & deep-sea exploration around pristine Red Sea islands.",
      icon: (
        <svg
          className="w-6 h-6 text-brand-terracotta"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      link: "/experiences",
    },
    {
      id: "concierge",
      title: "24/7 Concierge on Demand",
      description:
        "Reservations at coveted dining spots, private airport transfers, in-villa spa treatments, and seamless VIP itinerary management.",
      icon: (
        <svg
          className="w-6 h-6 text-brand-terracotta"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
      link: "#concierge",
    },
  ];

  return (
    <section className="py-20 lg:py-24 px-6 lg:px-12 bg-[#FAF8F5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header with Title and Verification Pill */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div className="max-w-3xl">
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-3">
              A Curated Lifestyle Ecosystem
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown leading-[1.2]">
              Where Bohemian Serenity Meets Effortless Coastal Luxury
            </h2>
            <p className="text-xs sm:text-sm text-brand-brown-muted mt-4 font-light leading-relaxed max-w-2xl">
              GouNow is an independent hospitality and real estate platform
              dedicated exclusively to the elite life in El Gouna. Every villa
              is privately inspected and vetted, every yacht captain is
              rigorously licensed, and our concierge team is on the ground in
              town 24/7 to ensure flawless execution.
            </p>
          </div>

          {/* Luxury Badge matching screenshot right side */}
          <div className="shrink-0 flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-white border border-brand-border/80 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 font-bold">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-bold text-brand-brown tracking-tight">
                100% Vetted &amp; Verified
              </span>
              <span className="block text-[11px] text-brand-brown-muted font-light">
                Direct Owners &amp; Licensed Skippers
              </span>
            </div>
          </div>
        </div>

        {/* 3 Value Proposition Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar) => (
            <Link
              key={pillar.id}
              href={pillar.link}
              className="group bg-white p-8 rounded-3xl border border-brand-border/70 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-brand-sand-light/80 border border-brand-border flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-terracotta/10 transition-transform duration-300">
                  {pillar.icon}
                </div>
                <h3 className="font-serif text-xl font-bold text-brand-brown mb-3 group-hover:text-brand-terracotta transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-brand-brown-muted font-light leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-brand-border/50 flex items-center justify-between text-xs font-semibold text-brand-terracotta">
                <span>Discover More</span>
                <span className="transform group-hover:translate-x-1.5 transition-transform duration-300">
                  &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
