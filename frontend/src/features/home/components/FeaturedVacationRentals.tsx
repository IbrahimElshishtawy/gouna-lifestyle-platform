"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Property } from "@/features/properties/types/property.types";
import { useLanguage } from "@/context/LanguageContext";
import { ChapterTag } from "@/components/ui/MotionPrimitives";
import Card3D from "@/components/ui/Card3D";
import UnitSpatialModal from "@/components/ui/UnitSpatialModal";

interface Props {
  properties: Property[];
}

export default function FeaturedVacationRentals({ properties }: Props) {
  const { t, locale } = useLanguage();
  const isAr = locale === "ar";
  const rentalProperties = properties.filter((p) => p.listing_type === "rent");

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showSpatialModal, setShowSpatialModal] = useState(false);

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
    <>
      <section id="stays" className="py-14 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto scroll-mt-24 border-b border-brand-border/60">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-10 lg:mb-12">
          <div>
            <ChapterTag
              number="CHAPTER 02"
              title={t.vacationRentals.eyebrow}
              subtitle={t.vacationRentals.subtitle}
            />
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown leading-tight">
              {t.vacationRentals.title}
            </h2>
          </div>

          {/* Carousel & View All Controls */}
          <div className="mt-4 sm:mt-6 md:mt-0 flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevProperty}
                aria-label="Previous Stay"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-brand-border bg-white text-brand-brown hover:bg-brand-sand-light hover:border-brand-brown transition-colors flex items-center justify-center cursor-pointer shadow-xs text-sm active:scale-95"
              >
                <span className="rtl:rotate-180 inline-block">&larr;</span>
              </button>
              <button
                onClick={handleNextProperty}
                aria-label="Next Stay"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-brand-border bg-white text-brand-brown hover:bg-brand-sand-light hover:border-brand-brown transition-colors flex items-center justify-center cursor-pointer shadow-xs text-sm active:scale-95"
              >
                <span className="rtl:rotate-180 inline-block">&rarr;</span>
              </button>
            </div>

            <Link
              href="/stays?listing_type=rent"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-terracotta hover:text-brand-terracotta-dark transition-colors group"
            >
              <span>{t.common.viewAll}</span>
              <span className="transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform">
                &rarr;
              </span>
            </Link>
          </div>
        </div>

        {/* Flagship Split Showcase Card (Cinematic 3D Elevation) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border/80 shadow-md hover:shadow-xl overflow-hidden p-3.5 sm:p-7 lg:p-10 mb-8 sm:mb-12 transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
            
            {/* Left Column: Interactive Image Gallery with 3D Depth Trigger */}
            <div className="lg:col-span-7 flex flex-col gap-2.5 sm:gap-3">
              <div className="relative h-[220px] sm:h-[360px] lg:h-[440px] rounded-xl sm:rounded-2xl overflow-hidden bg-brand-sand shadow-inner group">
                <Image
                  src={currentImage.url}
                  alt={activeProperty.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
                />

                {/* Badges Overlay */}
                <div className="absolute top-3 start-3 sm:top-4 sm:start-4 flex flex-wrap gap-1.5 sm:gap-2 z-10">
                  <span className="px-2.5 sm:px-3 py-1 bg-white/95 backdrop-blur-md text-brand-brown text-[10px] sm:text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1 border border-brand-border">
                    <span>★</span> {t.common.topRated}
                  </span>
                  <span className="px-2.5 sm:px-3 py-1 bg-brand-terracotta text-white text-[10px] sm:text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                    {t.common.lagoonAccess}
                  </span>
                </div>

                {/* 3D Spatial Interactive Badge */}
                <button
                  type="button"
                  onClick={() => setShowSpatialModal(true)}
                  aria-label="View 3D Spatial Layout"
                  className="absolute bottom-3 start-3 sm:bottom-4 sm:start-4 z-10 px-3 py-1.5 rounded-full bg-black/70 hover:bg-brand-terracotta backdrop-blur-md border border-white/25 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all duration-300 shadow-lg hover:scale-105 cursor-pointer"
                >
                  <span className="text-sm">📐</span>
                  <span>{isAr ? "استكشف المخطط ثلاثي الأبعاد" : "Interactive 3D Model"}</span>
                </button>

                {/* Photo Counter */}
                <div className="absolute top-3 end-3 sm:top-4 sm:end-4 z-10 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold rounded-full">
                  {selectedImageIndex + 1} / {images.length}
                </div>

                {/* Floating Prev/Next Image Controls */}
                {images.length > 1 && (
                  <div className="absolute inset-y-0 inset-x-2 sm:inset-x-3 flex items-center justify-between pointer-events-none z-10">
                    <button
                      onClick={handlePrevImage}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-md text-brand-brown hover:bg-white flex items-center justify-center pointer-events-auto shadow-md transition-transform hover:scale-105 cursor-pointer"
                      aria-label="Previous photo"
                    >
                      <span className="rtl:rotate-180 inline-block text-xs sm:text-sm">&#10094;</span>
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-md text-brand-brown hover:bg-white flex items-center justify-center pointer-events-auto shadow-md transition-transform hover:scale-105 cursor-pointer"
                      aria-label="Next photo"
                    >
                      <span className="rtl:rotate-180 inline-block text-xs sm:text-sm">&#10095;</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-14 h-10 sm:w-16 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
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

            {/* Right Column: Property Specs & Booking Info */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-4 sm:space-y-6">
              <div>
                {/* Location & Rating Header */}
                <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-brand-terracotta mb-1.5 sm:mb-2">
                  <span>{activeProperty.location?.name || t.common.elGouna}</span>
                  <span className="flex items-center gap-1 text-brand-brown">
                    <span className="text-amber-500">★</span> 4.98 (24 {t.common.readReviews})
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-brand-brown leading-tight mb-2 sm:mb-3">
                  {activeProperty.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-brand-brown-muted font-light leading-relaxed mb-4 sm:mb-6 line-clamp-3">
                  {activeProperty.description}
                </p>

                {/* Specs Pills (Beds, Baths, Guests, Area) */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center py-2.5 sm:py-4 px-2 sm:px-3 bg-brand-sand-light/60 rounded-xl sm:rounded-2xl border border-brand-border/70 mb-4 sm:mb-6">
                  <div>
                    <span className="block text-sm sm:text-lg font-bold text-brand-brown font-mono">
                      {activeProperty.bedrooms}
                    </span>
                    <span className="block text-[9px] sm:text-[10px] uppercase font-semibold text-brand-brown-muted">
                      {t.common.beds}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm sm:text-lg font-bold text-brand-brown font-mono">
                      {activeProperty.bathrooms}
                    </span>
                    <span className="block text-[9px] sm:text-[10px] uppercase font-semibold text-brand-brown-muted">
                      {t.common.baths}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm sm:text-lg font-bold text-brand-brown font-mono">
                      {activeProperty.max_guests}
                    </span>
                    <span className="block text-[9px] sm:text-[10px] uppercase font-semibold text-brand-brown-muted">
                      {t.common.guests}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm sm:text-lg font-bold text-brand-brown font-mono">
                      {activeProperty.area_sqm || 480}
                    </span>
                    <span className="block text-[9px] sm:text-[10px] uppercase font-semibold text-brand-brown-muted">
                      {t.common.bua}
                    </span>
                  </div>
                </div>

                {/* Key Features */}
                <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-xs text-brand-brown">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{t.vacationRentals.feature1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{t.vacationRentals.feature2}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{t.vacationRentals.feature3}</span>
                  </div>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="pt-4 sm:pt-6 border-t border-brand-border/70">
                <div className="flex items-baseline justify-between mb-3 sm:mb-4">
                  <div>
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-brand-brown-muted tracking-wider block">
                      {t.vacationRentals.fromNight}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl sm:text-2xl lg:text-3xl font-bold font-serif text-brand-brown">
                        {activeProperty.price_formatted}
                      </span>
                      <span className="text-[11px] sm:text-xs font-semibold text-brand-brown-muted">
                        {activeProperty.currency === "EGP" ? t.common.currency : activeProperty.currency} {t.common.perNight}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-emerald-200/50">
                    {t.common.instantConfirmation}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <Link
                    href={`/checkout/${activeProperty.slug}`}
                    className="py-2.5 sm:py-3 px-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
                  >
                    {t.vacationRentals.bookThisVilla}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowSpatialModal(true)}
                    className="py-2.5 sm:py-3 px-4 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-colors border border-brand-border flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
                  >
                    <span>📐</span>
                    <span>{isAr ? "المجسم المعماري 3D" : "3D Architecture"}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Secondary 3D Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {rentalProperties.slice(0, 4).map((property, idx) => (
            <Card3D key={property.id} maxTilt={6} glare={true} className="h-full">
              <div
                onClick={() => handleSelectProperty(idx)}
                className={`group h-full bg-white rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 flex flex-col justify-between preserve-3d ${
                  selectedIndex === idx
                    ? "border-brand-terracotta ring-2 ring-brand-terracotta/20 shadow-md"
                    : "border-brand-border hover:shadow-lg"
                }`}
              >
                <div>
                  <div className="relative h-40 sm:h-44 overflow-hidden bg-brand-sand shrink-0">
                    <Image
                      src={property.images[0]?.url || "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80"}
                      alt={property.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div
                      className="absolute top-2.5 start-2.5 transition-transform duration-300"
                      style={{ transform: "translateZ(24px)" }}
                    >
                      <span className="px-2.5 py-0.5 bg-white/95 backdrop-blur-md text-brand-brown text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                        {property.location?.name || t.common.elGouna}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4">
                    <h4
                      className="font-serif text-sm font-bold text-brand-brown line-clamp-1 group-hover:text-brand-terracotta transition-colors mb-1"
                      style={{ transform: "translateZ(16px)" }}
                    >
                      {property.title}
                    </h4>
                    <div
                      className="flex items-center gap-2 text-[11px] text-brand-brown-muted mb-2 font-light"
                      style={{ transform: "translateZ(12px)" }}
                    >
                      <span>{property.bedrooms} {t.common.beds}</span>
                      <span>•</span>
                      <span>{property.bathrooms} {t.common.baths}</span>
                      <span>•</span>
                      <span>{property.max_guests} {t.common.guests}</span>
                    </div>
                  </div>
                </div>

                <div
                  className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-2 border-t border-brand-border/60 flex items-center justify-between"
                  style={{ transform: "translateZ(20px)" }}
                >
                  <div>
                    <span className="text-xs font-bold text-brand-brown">
                      {property.price_formatted}
                    </span>
                    <span className="text-[10px] text-brand-brown-muted ml-1 rtl:mr-1 rtl:ml-0">
                      {property.currency === "EGP" ? t.common.currency : property.currency}{t.common.perNight}
                    </span>
                  </div>

                  <Link
                    href={`/stays/${property.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-bold text-brand-terracotta hover:underline inline-flex items-center gap-1 active:scale-95"
                  >
                    <span>{t.common.viewDetails}</span>
                    <span className="rtl:rotate-180 inline-block">&rarr;</span>
                  </Link>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </section>

      {/* 3D Unit Spatial Modal */}
      <UnitSpatialModal
        property={activeProperty}
        isOpen={showSpatialModal}
        onClose={() => setShowSpatialModal(false)}
      />
    </>
  );
}
