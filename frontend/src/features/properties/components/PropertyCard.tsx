"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Property } from "../types/property.types";
import { useLanguage } from "@/context/LanguageContext";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { t } = useLanguage();
  const isRent = property.listing_type === "rent";
  const primaryImage =
    property.images?.find((img) => img.is_primary)?.url ||
    property.images?.[0]?.url ||
    "/assets/images/bg-sand-texture.jpg";

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-brand-border/80 shadow-xs hover:shadow-2xl hover:border-brand-terracotta/30 transition-all duration-500 hover:-translate-y-1.5 flex flex-col">
      {/* Image Container */}
      <div className="relative h-64 sm:h-72 overflow-hidden bg-brand-sand">
        <Image
          src={primaryImage}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-300" />

        {/* Top Floating Badges */}
        <div className="absolute top-4 start-4 flex flex-wrap gap-2 z-10">
          {property.location && (
            <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-brand-brown text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs border border-brand-border/80">
              📍 {property.location.name}
            </span>
          )}
          {property.is_featured && (
            <span className="px-3 py-1 bg-brand-terracotta text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">
              {isRent ? t.propertyCard.featuredStay : t.propertyCard.exclusiveListing}
            </span>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-terracotta">
              {property.category?.name || (isRent ? t.propertyCard.vacationVilla : t.propertyCard.realEstate)}
            </span>
            <span className="text-[10px] font-mono text-brand-brown-muted/80">
              {property.reference_code}
            </span>
          </div>

          <Link href={`/stays/${property.slug}`}>
            <h3 className="font-serif text-xl font-bold text-brand-brown group-hover:text-brand-terracotta transition-colors line-clamp-1">
              {property.title}
            </h3>
          </Link>

          <p className="text-xs text-brand-brown-muted line-clamp-2 mt-2 leading-relaxed font-light">
            {property.description}
          </p>

          {/* Specs Strip */}
          <div className="flex items-center gap-4 text-xs text-brand-brown/80 pt-4 border-t border-brand-border/60 mt-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span>🛏️</span> {property.bedrooms} {t.common.beds}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span>🚿</span> {property.bathrooms} {t.common.baths}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span>👥</span> {property.max_guests} {t.common.guests}
            </span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between pt-5 mt-5 border-t border-brand-border/60">
          <div>
            <span className="text-[10px] text-brand-brown-muted uppercase tracking-wider block">
              {isRent ? t.propertyCard.pricePerNight : t.propertyCard.guidePrice}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-serif font-bold text-brand-brown">
                {property.price_formatted}
              </span>
              <span className="text-[10px] text-brand-brown-muted font-medium">
                {t.common.currency}
                {isRent && ` ${t.common.perNight}`}
              </span>
            </div>
          </div>

          <Link
            href={`/stays/${property.slug}`}
            className="px-5 py-2.5 bg-brand-sand-light hover:bg-brand-terracotta hover:text-white text-brand-brown rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer"
          >
            {isRent ? t.propertyCard.reserve : t.propertyCard.view}
          </Link>
        </div>
      </div>
    </div>
  );
}
