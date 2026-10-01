"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Property } from "@/features/properties/types/property.types";

interface Props {
  properties: Property[];
}

export default function FeaturedSales({ properties }: Props) {
  const saleProperties = properties.filter((p) => p.listing_type === "sale");

  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeProperty = saleProperties[selectedIndex] || saleProperties[0];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? saleProperties.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === saleProperties.length - 1 ? 0 : prev + 1));
  };

  if (!activeProperty) return null;

  return (
    <section className="py-20 lg:py-24 px-6 lg:px-12 bg-white border-t border-brand-border/80">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-2">
              Exclusive Real Estate • Waterfront Investments
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
              Properties For Sale
            </h2>
            <p className="text-xs sm:text-sm text-brand-brown-muted mt-2 max-w-2xl font-light leading-relaxed">
              Exceptional freehold and leasehold properties in prime El Gouna
              locations. Fully vetted legal status and high projected rental
              yields.
            </p>
          </div>

          <div className="mt-6 md:mt-0 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Previous Property"
                className="w-10 h-10 rounded-full border border-brand-border bg-white text-brand-brown hover:bg-brand-sand-light hover:border-brand-brown transition-colors flex items-center justify-center cursor-pointer shadow-xs"
              >
                &larr;
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Property"
                className="w-10 h-10 rounded-full border border-brand-border bg-white text-brand-brown hover:bg-brand-sand-light hover:border-brand-brown transition-colors flex items-center justify-center cursor-pointer shadow-xs"
              >
                &rarr;
              </button>
            </div>

            <Link
              href="/stays?listing_type=sale"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-terracotta hover:text-brand-terracotta-dark transition-colors group"
            >
              <span>View All Properties</span>
              <span className="transform group-hover:translate-x-1 transition-transform">
                &rarr;
              </span>
            </Link>
          </div>
        </div>

        {/* Flagship Split Showcase Card (Matching Screenshot Tawila Villa) */}
        <div className="bg-[#FAF8F5] rounded-3xl border border-brand-border/80 shadow-md overflow-hidden p-6 sm:p-8 lg:p-10 mb-12 transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Property Visuals (7 cols) */}
            <div className="lg:col-span-7">
              <div className="relative h-[340px] sm:h-[440px] rounded-2xl overflow-hidden bg-brand-sand">
                <Image
                  src={activeProperty.images[0]?.url || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=85"}
                  alt={activeProperty.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-opacity duration-300"
                />

                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                  <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-brand-brown text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1 border border-brand-border">
                    <span>🏛️</span> Exclusive Listing
                  </span>
                  <span className="px-3 py-1 bg-brand-terracotta text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                    Lagoon Frontage
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 z-10 px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-medium rounded-xl flex items-center gap-2">
                  <span>📍</span>
                  <span>{activeProperty.location?.name || "Tawila Lagoons • El Gouna"}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Investment & Property Specs (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand-terracotta mb-2">
                  <span>{activeProperty.category?.name || "Signature Real Estate"}</span>
                  <span className="flex items-center gap-1 text-brand-brown">
                    <span className="text-amber-500">★</span> 4.95 Rating
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown leading-tight mb-3">
                  {activeProperty.title}
                </h3>

                <p className="text-xs sm:text-sm text-brand-brown-muted font-light leading-relaxed mb-6">
                  {activeProperty.description}
                </p>

                {/* Specs Grid */}
                <div className="grid grid-cols-4 gap-2 text-center py-4 px-3 bg-white rounded-2xl border border-brand-border/70 mb-6 shadow-xs">
                  <div>
                    <span className="block text-base sm:text-lg font-bold text-brand-brown">
                      {activeProperty.bedrooms}
                    </span>
                    <span className="block text-[10px] uppercase font-semibold text-brand-brown-muted">
                      Beds
                    </span>
                  </div>
                  <div>
                    <span className="block text-base sm:text-lg font-bold text-brand-brown">
                      {activeProperty.bathrooms}
                    </span>
                    <span className="block text-[10px] uppercase font-semibold text-brand-brown-muted">
                      Baths
                    </span>
                  </div>
                  <div>
                    <span className="block text-base sm:text-lg font-bold text-brand-brown">
                      {activeProperty.area_sqm || 450}
                    </span>
                    <span className="block text-[10px] uppercase font-semibold text-brand-brown-muted">
                      m² BUA
                    </span>
                  </div>
                  <div>
                    <span className="block text-base sm:text-lg font-bold text-brand-brown">
                      750
                    </span>
                    <span className="block text-[10px] uppercase font-semibold text-brand-brown-muted">
                      m² Plot
                    </span>
                  </div>
                </div>

                {/* Investment Highlights */}
                <div className="space-y-2 mb-6 text-xs text-brand-brown">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Direct Lagoon Frontage with Private Beach &amp; Pontoon</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Fully Furnished by Award-Winning European Interior Designer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>High Rental Yield Potential (11.4% Projected ROI)</span>
                  </div>
                </div>
              </div>

              {/* Price & Consultation CTA */}
              <div className="pt-6 border-t border-brand-border/70">
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-brown-muted tracking-wider block">
                      Asking Price
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-bold font-serif text-brand-brown">
                        {activeProperty.price_formatted}
                      </span>
                      <span className="text-xs font-semibold text-brand-brown-muted">
                        {activeProperty.currency}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-brand-terracotta bg-brand-terracotta/10 px-2.5 py-1 rounded-full border border-brand-terracotta/20">
                    Payment Plans Available
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`https://wa.me/201000000000?text=${encodeURIComponent(
                      `Hello GouNow Real Estate, I would like to schedule a private VIP viewing for ${activeProperty.title}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Request Viewing
                  </a>
                  <Link
                    href={`/stays/${activeProperty.slug}`}
                    className="py-3 px-4 bg-white hover:bg-brand-sand-light text-brand-brown rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-colors border border-brand-border"
                  >
                    Download Brochure
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Real Estate Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {saleProperties.slice(0, 3).map((property, idx) => (
            <div
              key={property.id}
              onClick={() => setSelectedIndex(idx)}
              className={`group bg-white rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between ${
                selectedIndex === idx
                  ? "border-brand-terracotta ring-2 ring-brand-terracotta/20 shadow-md"
                  : "border-brand-border"
              }`}
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-brand-sand">
                  <Image
                    src={property.images[0]?.url || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"}
                    alt={property.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md text-brand-brown text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                      {property.location?.name || "El Gouna"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h4 className="font-serif text-base font-bold text-brand-brown line-clamp-1 group-hover:text-brand-terracotta transition-colors mb-2">
                    {property.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-brand-brown-muted mb-4 font-light">
                    <span>{property.bedrooms} Beds</span>
                    <span>•</span>
                    <span>{property.bathrooms} Baths</span>
                    <span>•</span>
                    <span>{property.area_sqm || 450} m² BUA</span>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-3 border-t border-brand-border/60 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-brand-brown font-serif">
                    {property.price_formatted}
                  </span>
                  <span className="text-[11px] text-brand-brown-muted ml-1">
                    {property.currency}
                  </span>
                </div>

                <Link
                  href={`/stays/${property.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-bold text-brand-terracotta hover:underline"
                >
                  View Details &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
