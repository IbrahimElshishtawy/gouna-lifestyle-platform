"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import SafeImage from "@/components/ui/SafeImage";
import { Link } from "@/i18n/routing";
import { Property } from "@/features/properties/types/property.types";
import { useLanguage } from "@/context/LanguageContext";
import UnitSpatialModal from "@/components/ui/UnitSpatialModal";

interface PropertyCardsShowcaseProps {
  properties: Property[];
  title_ar?: string;
  title_en?: string;
  subtitle_ar?: string;
  subtitle_en?: string;
}

export default function PropertyCardsShowcase({
  properties,
  title_ar = "المجموعات العقارية الحصرية",
  title_en = "Exclusive Signature Collections",
  subtitle_ar = "تصفح أرقى الفلل والأجنحة الشاطئية المختارة بعناية في قلب الجونة للإيجار والشراء",
  subtitle_en = "Browse handpicked waterfront villas and estates across El Gouna prime locations",
}: PropertyCardsShowcaseProps) {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [activeListingType, setActiveListingType] = useState<"all" | "rent" | "sale">("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedSpatialProperty, setSelectedSpatialProperty] = useState<Property | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    properties.forEach((p) => {
      if (p.category?.id) {
        const id = String(p.category.id);
        if (!map.has(id)) {
          map.set(id, {
            id,
            name: p.category.name || "Estate",
          });
        }
      }
    });
    return Array.from(map.values());
  }, [properties]);

  // Filter properties
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const matchType =
        activeListingType === "all" || p.listing_type === activeListingType;
      const matchCat =
        activeCategory === "all" ||
        String(p.category?.id) === activeCategory ||
        p.category?.name?.toLowerCase() === activeCategory.toLowerCase();
      return matchType && matchCat;
    });
  }, [properties, activeListingType, activeCategory]);

  return (
    <section id="signature-properties" className="py-20 lg:py-28 bg-[#FAF8F5] relative overflow-hidden">
      {/* Subtle Background Ambience Gradients */}
      <div className="absolute top-0 end-0 w-96 h-96 bg-brand-sand-light/60 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 start-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Header with Title and Segmented Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-terracotta/10 text-brand-terracotta text-xs font-bold uppercase tracking-widest mb-3">
              {isAr ? "نخبة العقارات المختارة" : "Curated Portfolio"}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-brown tracking-tight leading-tight">
              {isAr ? title_ar : title_en}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-brand-brown-muted font-light leading-relaxed">
              {isAr ? subtitle_ar : subtitle_en}
            </p>
          </div>

          {/* Listing Type Toggle Pill (Rent / All / Sale) */}
          <div className="inline-flex p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-brand-border/80 shadow-xs self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveListingType("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeListingType === "all"
                  ? "bg-brand-brown text-white shadow-xs"
                  : "text-brand-brown-muted hover:text-brand-brown"
              }`}
            >
              {isAr ? "الكل" : "All Portfolio"}
            </button>
            <button
              type="button"
              onClick={() => setActiveListingType("rent")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeListingType === "rent"
                  ? "bg-brand-terracotta text-white shadow-xs"
                  : "text-brand-brown-muted hover:text-brand-brown"
              }`}
            >
              {isAr ? "إيجار إجازات" : "Vacation Stays"}
            </button>
            <button
              type="button"
              onClick={() => setActiveListingType("sale")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeListingType === "sale"
                  ? "bg-brand-brown text-white shadow-xs"
                  : "text-brand-brown-muted hover:text-brand-brown"
              }`}
            >
              {isAr ? "للبيع والاستثمار" : "For Sale"}
            </button>
          </div>
        </div>

        {/* Category Pill Sub-filter */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 gounow-scrollbar">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                activeCategory === "all"
                  ? "bg-white text-brand-terracotta border-brand-terracotta shadow-xs"
                  : "bg-white/60 text-brand-brown-muted border-brand-border/70 hover:bg-white hover:border-brand-border"
              }`}
            >
              {isAr ? "كافة المواقع والتصنيفات" : "All Categories"}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-white text-brand-terracotta border-brand-terracotta shadow-xs"
                    : "bg-white/60 text-brand-brown-muted border-brand-border/70 hover:bg-white hover:border-brand-border"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* 21st Grid of Luxury Property Cards */}
        {filteredProperties.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-brand-border my-6">
            <p className="text-sm font-serif font-bold text-brand-brown">
              {isAr ? "لا توجد وحدات تطابق هذا الاختيار حالياً" : "No properties found for this selection"}
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveListingType("all");
                setActiveCategory("all");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-terracotta text-white text-xs font-bold"
            >
              {isAr ? "إعادة ضبط التصفية" : "Reset Filters"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProperties.map((property) => (
              <ShowcaseCard
                key={property.id}
                property={property}
                isAr={isAr}
                onOpenSpatial={() => setSelectedSpatialProperty(property)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Spatial Tour Modal if activated */}
      {selectedSpatialProperty && (
        <UnitSpatialModal
          property={selectedSpatialProperty}
          isOpen={Boolean(selectedSpatialProperty)}
          onClose={() => setSelectedSpatialProperty(null)}
        />
      )}
    </section>
  );
}

interface ShowcaseCardProps {
  property: Property;
  isAr: boolean;
  onOpenSpatial: () => void;
}

function ShowcaseCard({ property, isAr, onOpenSpatial }: ShowcaseCardProps) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const images = property.images?.length
    ? property.images
    : [{ id: 1, url: "/assets/images/hero-villa-dusk.jpg" }];

  const currentImageUrl = images[currentImgIndex]?.url || "/assets/images/hero-villa-dusk.jpg";

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const title = (isAr ? property.title_ar : property.title) || property.title || property.reference_code;
  const locationName = property.location?.name || (isAr ? "الجونة" : "El Gouna");
  const categoryName = property.category?.name || (isAr ? "فيلا فاخرة" : "Luxury Villa");

  return (
    <article className="group bg-white rounded-3xl border border-brand-border/70 overflow-hidden shadow-xs hover:shadow-xl hover:border-brand-terracotta/40 transition-all duration-300 flex flex-col justify-between">
      {/* Top Image Carousel Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-sand-light">
        <SafeImage
          src={currentImageUrl}
          alt={title}
          fill
          fallbackSrc="/assets/images/hero-villa-dusk.jpg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Gradient Overlay for Top Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between pointer-events-none z-10">
          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-brand-brown uppercase tracking-wider shadow-xs">
            {property.listing_type === "sale" ? (isAr ? "للبيع" : "For Sale") : (isAr ? "إيجار إجازات" : "Vacation Stay")}
          </span>

          {property.is_featured && (
            <span className="px-3 py-1 rounded-full bg-brand-terracotta text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
              {isAr ? "وحدة مميزة" : "Featured"}
            </span>
          )}
        </div>

        {/* Navigation Arrows on Hover if Multiple Images */}
        {images.length > 1 && (
          <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-auto">
            <button
              type="button"
              onClick={handlePrevImage}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
              aria-label="Previous Image"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
              aria-label="Next Image"
            >
              ›
            </button>
          </div>
        )}

        {/* Bottom Carousel Indicator Dots & Spatial Tour Button */}
        <div className="absolute bottom-3 inset-x-3.5 flex items-center justify-between z-10">
          <button
            type="button"
            onClick={onOpenSpatial}
            className="px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-medium tracking-wide transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>{isAr ? "جولة مكانية 3D" : "3D Spatial Tour"}</span>
          </button>

          {images.length > 1 && (
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full">
              {images.slice(0, 5).map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImgIndex ? "bg-white w-3" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Body Details */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & Category Sub-label */}
          <div className="flex items-center justify-between text-xs text-brand-brown-muted mb-2 font-medium">
            <span>{locationName}</span>
            <span>{categoryName}</span>
          </div>

          {/* Unit Title */}
          <Link
            href={`/stays/${property.slug}`}
            className="block group-hover:text-brand-terracotta transition-colors"
          >
            <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-brown leading-snug line-clamp-1">
              {title}
            </h3>
          </Link>

          {/* Key Specs Pill Bar */}
          <div className="grid grid-cols-3 gap-2 py-3.5 my-3.5 border-y border-brand-border/60 text-xs text-brand-brown">
            <div className="flex flex-col">
              <span className="text-[10px] text-brand-brown-muted uppercase tracking-wider">{isAr ? "غرف نوم" : "Beds"}</span>
              <span className="font-bold">{property.bedrooms} {isAr ? "غرف" : "Rooms"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-brand-brown-muted uppercase tracking-wider">{isAr ? "حمامات" : "Baths"}</span>
              <span className="font-bold">{property.bathrooms} {isAr ? "حمام" : "Baths"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-brand-brown-muted uppercase tracking-wider">{isAr ? "السعة" : "Guests"}</span>
              <span className="font-bold">{property.max_guests} {isAr ? "أشخاص" : "Guests"}</span>
            </div>
          </div>
        </div>

        {/* Footer: Price & Direct Link */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="block text-[10px] text-brand-brown-muted uppercase tracking-wider">
              {property.listing_type === "sale" ? (isAr ? "سعر العقار" : "Price") : (isAr ? "يبدأ من" : "Starting from")}
            </span>
            <div className="font-serif text-lg font-bold text-brand-terracotta">
              {property.price_formatted || `${property.price_cents / 100} ${property.currency || "EGP"}`}
              {property.listing_type === "rent" && (
                <span className="text-xs font-normal text-brand-brown-muted">
                  {isAr ? " / ليلة" : " / night"}
                </span>
              )}
            </div>
          </div>

          <Link
            href={`/stays/${property.slug}`}
            className="px-4 py-2 rounded-xl bg-brand-sand-light hover:bg-brand-terracotta hover:text-white text-brand-brown text-xs font-bold transition-all shadow-xs"
          >
            {isAr ? "عرض التفاصيل" : "Explore"}
          </Link>
        </div>
      </div>
    </article>
  );
}
