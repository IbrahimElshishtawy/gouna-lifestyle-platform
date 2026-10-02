"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Property } from "@/features/properties/types/property.types";

interface Props {
  properties: Property[];
}

export default function FeaturedVacationRentals({ properties }: Props) {
  const rentalProperties = properties.filter((p) => p.listing_type === "rent");

  // Selected property for the large split showcase
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const activeProperty = rentalProperties[selectedIndex] || rentalProperties[0];
  const images = activeProperty?.images?.length
    ? activeProperty.images
    : [{ id: 1, url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1400&q=85" }];

  const currentImage = images[selectedImageIndex] || images[0];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleSelectProperty = (index: number) => {
    setSelectedIndex(index);
    setSelectedImageIndex(0);
  };

  const handlePrevProperty = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? rentalProperties.length - 1 : prev - 1
    );
    setSelectedImageIndex(0);
  };

  const handleNextProperty = () => {
    setSelectedIndex((prev) =>
      prev === rentalProperties.length - 1 ? 0 : prev + 1
    );
    setSelectedImageIndex(0);
  };

  if (!activeProperty) return null;

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
        <div>
          <span className="text-[10px] sm:text-xs uppercase font-bold tracking-[0.2em] sm:tracking-[0.25em] text-brand-terracotta block mb-2">
            Handpicked Residences • 100% Exclusive Waterfronts
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown leading-tight">
            Featured Vacation Stays
          </h2>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-2 max-w-2xl font-light leading-relaxed">
            Explore the most coveted villas &amp; waterfront penthouses across El
            Gouna. Every reservation includes complimentary arrival transfer and
            dedicated villa host.
          </p>
        </div>

        {/* Carousel & View All Controls */}
        <div className="mt-4 sm:mt-6 md:mt-0 flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevProperty}
              aria-label="Previous Stay"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-brand-border bg-white text-brand-brown hover:bg-brand-sand-light hover:border-brand-brown transition-colors flex items-center justify-center cursor-pointer shadow-xs text-sm"
            >
              &larr;
            </button>
            <button
              onClick={handleNextProperty}
              aria-label="Next Stay"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-brand-border bg-white text-brand-brown hover:bg-brand-sand-light hover:border-brand-brown transition-colors flex items-center justify-center cursor-pointer shadow-xs text-sm"
            >
              &rarr;
            </button>
          </div>

          <Link
            href="/stays?listing_type=rent"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-terracotta hover:text-brand-terracotta-dark transition-colors group"
          >
            <span>View All</span>
            <span className="transform group-hover:translate-x-1 transition-transform">
              &rarr;
            </span>
          </Link>
        </div>
      </div>

      {/* Flagship Split Showcase Card (Ultra-Luxurious on Mobile) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border/80 shadow-md overflow-hidden p-4 sm:p-8 lg:p-10 mb-8 sm:mb-12 transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Interactive Image Gallery (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="relative h-[250px] sm:h-[380px] lg:h-[440px] rounded-xl sm:rounded-2xl overflow-hidden bg-brand-sand">
              <Image
                src={currentImage.url}
                alt={activeProperty.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-opacity duration-300"
              />

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-brand-brown text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1 border border-brand-border">
                  <span>★</span> Top Rated
                </span>
                <span className="px-3 py-1 bg-brand-terracotta text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                  Lagoon Access
                </span>
              </div>

              {/* Photo Counter */}
              <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-full">
                {selectedImageIndex + 1} / {images.length}
              </div>

              {/* Floating Prev/Next Image Controls */}
              {images.length > 1 && (
                <div className="absolute inset-y-0 inset-x-3 flex items-center justify-between pointer-events-none z-10">
                  <button
                    onClick={handlePrevImage}
                    className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-brand-brown hover:bg-white flex items-center justify-center pointer-events-auto shadow-md transition-transform hover:scale-105 cursor-pointer"
                    aria-label="Previous photo"
                  >
                    &#10094;
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-brand-brown hover:bg-white flex items-center justify-center pointer-events-auto shadow-md transition-transform hover:scale-105 cursor-pointer"
                    aria-label="Next photo"
                  >
                    &#10095;
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnail Navigation Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? "border-brand-terracotta scale-105 shadow-xs"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Property Specs & Booking Info (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
            <div>
              {/* Location & Rating Header */}
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand-terracotta mb-2">
                <span>{activeProperty.location?.name || "Fanadir Bay • El Gouna"}</span>
                <span className="flex items-center gap-1 text-brand-brown">
                  <span className="text-amber-500">★</span> 4.98 (24 reviews)
                </span>
              </div>

              {/* Title */}
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown leading-tight mb-3">
                {activeProperty.title}
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-brand-brown-muted font-light leading-relaxed mb-6">
                {activeProperty.description}
              </p>

              {/* Specs Pills (Beds, Baths, Guests, Area) */}
              <div className="grid grid-cols-4 gap-2 text-center py-4 px-3 bg-brand-sand-light/60 rounded-2xl border border-brand-border/70 mb-6">
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
                    {activeProperty.max_guests}
                  </span>
                  <span className="block text-[10px] uppercase font-semibold text-brand-brown-muted">
                    Guests
                  </span>
                </div>
                <div>
                  <span className="block text-base sm:text-lg font-bold text-brand-brown">
                    {activeProperty.area_sqm || 480}
                  </span>
                  <span className="block text-[10px] uppercase font-semibold text-brand-brown-muted">
                    m² BUA
                  </span>
                </div>
              </div>

              {/* Key Features List with Green Checks */}
              <div className="space-y-2 mb-6 text-xs text-brand-brown">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Heated Infinity Edge Pool &amp; Sunbeds</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Private Deep-Water Jet Ski Jetty &amp; Mooring</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Dedicated Villa Host &amp; Daily Housekeeping</span>
                </div>
              </div>
            </div>

            {/* Price & Actions */}
            <div className="pt-6 border-t border-brand-border/70">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-brown-muted tracking-wider block">
                    From / Night
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-bold font-serif text-brand-brown">
                      {activeProperty.price_formatted}
                    </span>
                    <span className="text-xs font-semibold text-brand-brown-muted">
                      {activeProperty.currency} / night
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50">
                  Instant Confirmation
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <Link
                  href={`/checkout/${activeProperty.slug}`}
                  className="py-3 px-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                  Book This Villa
                </Link>
                <Link
                  href={`/stays/${activeProperty.slug}`}
                  className="py-3 px-4 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-colors border border-brand-border"
                >
                  Contact Host / Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Horizontal Card Track (Matching Screenshot Bottom Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {rentalProperties.slice(0, 4).map((property, idx) => (
          <div
            key={property.id}
            onClick={() => handleSelectProperty(idx)}
            className={`group bg-white rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between ${
              selectedIndex === idx
                ? "border-brand-terracotta ring-2 ring-brand-terracotta/20 shadow-md"
                : "border-brand-border"
            }`}
          >
            <div>
              <div className="relative h-44 overflow-hidden bg-brand-sand">
                <Image
                  src={property.images[0]?.url || "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80"}
                  alt={property.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md text-brand-brown text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                    {property.location?.name || "El Gouna"}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-serif text-sm font-bold text-brand-brown line-clamp-1 group-hover:text-brand-terracotta transition-colors mb-1">
                  {property.title}
                </h4>
                <div className="flex items-center gap-3 text-[11px] text-brand-brown-muted mb-3 font-light">
                  <span>{property.bedrooms} Beds</span>
                  <span>•</span>
                  <span>{property.bathrooms} Baths</span>
                  <span>•</span>
                  <span>{property.max_guests} Guests</span>
                </div>
              </div>
            </div>

            <div className="px-4 pb-4 pt-2 border-t border-brand-border/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-brand-brown">
                  {property.price_formatted}
                </span>
                <span className="text-[10px] text-brand-brown-muted ml-1">
                  {property.currency}/nt
                </span>
              </div>

              <Link
                href={`/stays/${property.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="text-[11px] font-bold text-brand-terracotta hover:underline"
              >
                View Details &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
