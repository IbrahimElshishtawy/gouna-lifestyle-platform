"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Property } from "../types/property.types";
import { useLanguage } from "@/context/LanguageContext";
import Card3D from "@/components/ui/Card3D";
import UnitSpatialModal from "@/components/ui/UnitSpatialModal";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { t, locale } = useLanguage();
  const isAr = locale === "ar";
  const isRent = property.listing_type === "rent";
  const [showSpatialModal, setShowSpatialModal] = useState(false);

  const primaryImage =
    property.images?.find((img) => img.is_primary)?.url ||
    property.images?.[0]?.url ||
    "/assets/images/bg-sand-texture.jpg";

  return (
    <>
      <Card3D maxTilt={7} glare={true} className="h-full">
        <div className="h-full bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-brand-border/80 shadow-xs hover:shadow-2xl hover:border-brand-terracotta/40 transition-all duration-500 flex flex-col preserve-3d group">
          
          {/* Image Container with 3D Depth Layer */}
          <div className="relative h-52 sm:h-64 lg:h-72 overflow-hidden bg-brand-sand shrink-0">
            <Image
              src={primaryImage}
              alt={property.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-75 transition-opacity duration-300" />

            {/* Top Floating 3D Badges (Z: 28px) */}
            <div
              className="absolute top-3.5 start-3.5 sm:top-4 sm:start-4 flex flex-wrap gap-1.5 sm:gap-2 z-10 transition-transform duration-300 group-hover:translate-z-24"
              style={{ transform: "translateZ(26px)" }}
            >
              {property.location && (
                <span className="px-2.5 sm:px-3 py-1 bg-white/95 backdrop-blur-md text-brand-brown text-[9px] sm:text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm border border-brand-border/80 flex items-center gap-1">
                  <span>📍</span>
                  <span className="truncate max-w-[120px]">{property.location.name}</span>
                </span>
              )}
              {property.is_featured && (
                <span className="px-2.5 sm:px-3 py-1 bg-brand-terracotta text-white text-[9px] sm:text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                  {isRent ? t.propertyCard.featuredStay : t.propertyCard.exclusiveListing}
                </span>
              )}
            </div>

            {/* 3D Model Interactive Trigger Badge */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowSpatialModal(true);
              }}
              aria-label="Open 3D Spatial Layout"
              className="absolute bottom-3 start-3 sm:bottom-3.5 sm:start-3.5 z-10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-black/65 hover:bg-brand-terracotta backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-[11px] font-semibold flex items-center gap-1.5 transition-all duration-300 shadow-md group-hover:scale-105 cursor-pointer"
              style={{ transform: "translateZ(30px)" }}
            >
              <span className="text-xs">📐</span>
              <span>{isAr ? "مجسم 3D" : "3D Spatial"}</span>
            </button>
          </div>

          {/* Content Body with 3D Depth Elevation */}
          <div className="p-4 sm:p-6 lg:p-7 flex-1 flex flex-col justify-between">
            <div>
              {/* Category & Reference Code */}
              <div
                className="flex items-baseline justify-between mb-1.5 sm:mb-2 transition-transform duration-300"
                style={{ transform: "translateZ(14px)" }}
              >
                <span className="text-[10px] uppercase font-bold tracking-[0.18em] text-brand-terracotta truncate">
                  {property.category?.name || (isRent ? t.propertyCard.vacationVilla : t.propertyCard.realEstate)}
                </span>
                <span className="text-[10px] font-mono text-brand-brown-muted/70 shrink-0 ml-2 rtl:mr-2 rtl:ml-0">
                  {property.reference_code}
                </span>
              </div>

              {/* Title */}
              <Link href={`/stays/${property.slug}`}>
                <h3
                  className="font-serif text-lg sm:text-xl font-bold text-brand-brown group-hover:text-brand-terracotta transition-colors line-clamp-1 leading-snug"
                  style={{ transform: "translateZ(20px)" }}
                >
                  {property.title}
                </h3>
              </Link>

              {/* Description */}
              <p
                className="text-xs text-brand-brown-muted line-clamp-2 mt-1.5 sm:mt-2 leading-relaxed font-light"
                style={{ transform: "translateZ(12px)" }}
              >
                {property.description}
              </p>

              {/* Specs Strip */}
              <div
                className="flex items-center gap-2.5 sm:gap-4 text-xs text-brand-brown/80 pt-3 sm:pt-4 border-t border-brand-border/60 mt-3 sm:mt-4 transition-transform duration-300"
                style={{ transform: "translateZ(18px)" }}
              >
                <span className="flex items-center gap-1 font-medium whitespace-nowrap text-[11px] sm:text-xs">
                  <span>🛏️</span> {property.bedrooms} {t.common.beds}
                </span>
                <span className="flex items-center gap-1 font-medium whitespace-nowrap text-[11px] sm:text-xs">
                  <span>🚿</span> {property.bathrooms} {t.common.baths}
                </span>
                <span className="flex items-center gap-1 font-medium whitespace-nowrap text-[11px] sm:text-xs">
                  <span>👥</span> {property.max_guests} {t.common.guests}
                </span>
              </div>
            </div>

            {/* Price & Action Row */}
            <div
              className="flex items-center justify-between pt-4 sm:pt-5 mt-4 sm:mt-5 border-t border-brand-border/60 transition-transform duration-300"
              style={{ transform: "translateZ(24px)" }}
            >
              <div>
                <span className="text-[9px] sm:text-[10px] text-brand-brown-muted uppercase tracking-wider block">
                  {isRent ? t.propertyCard.pricePerNight : t.propertyCard.guidePrice}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl font-serif font-bold text-brand-brown">
                    {property.price_formatted}
                  </span>
                  <span className="text-[10px] text-brand-brown-muted font-medium">
                    {t.common.currency}
                    {isRent && ` ${t.common.perNight}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Link
                  href={`/stays/${property.slug}`}
                  className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-brand-sand-light hover:bg-brand-terracotta hover:text-white text-brand-brown rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer whitespace-nowrap active:scale-[0.97]"
                >
                  {isRent ? t.propertyCard.reserve : t.propertyCard.view}
                </Link>
              </div>
            </div>
          </div>

        </div>
      </Card3D>

      {/* 3D Unit Spatial Modal */}
      <UnitSpatialModal
        property={property}
        isOpen={showSpatialModal}
        onClose={() => setShowSpatialModal(false)}
      />
    </>
  );
}
