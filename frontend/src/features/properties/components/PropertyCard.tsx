import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Property } from "../types/property.types";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const isRent = property.listing_type === "rent";
  const primaryImage =
    property.images?.find((img) => img.is_primary)?.url ||
    property.images?.[0]?.url ||
    "/assets/images/bg-sand-texture.jpg";

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-brand-border shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden bg-brand-sand">
        <Image
          src={primaryImage}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {property.location && (
            <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-brand-brown text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs">
              📍 {property.location.name}
            </span>
          )}
          {property.is_featured && (
            <span className="px-3 py-1 bg-brand-terracotta text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs">
              {isRent ? "Featured Stay" : "Exclusive Listing"}
            </span>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-terracotta">
            {property.category?.name || (isRent ? "Vacation Villa" : "Real Estate")}
          </span>
          <span className="text-[10px] font-mono text-brand-brown-muted">
            {property.reference_code}
          </span>
        </div>

        <Link href={`/stays/${property.slug}`}>
          <h3 className="font-serif text-lg font-bold text-brand-brown group-hover:text-brand-terracotta transition-colors line-clamp-1">
            {property.title}
          </h3>
        </Link>

        <p className="text-xs text-brand-brown-muted line-clamp-2 mt-1.5 leading-relaxed font-light">
          {property.description}
        </p>

        {/* Specs Strip */}
        <div className="flex items-center gap-4 text-xs text-brand-brown/80 pt-4 border-t border-brand-border/60 mt-4">
          <span className="flex items-center gap-1 font-medium">
            <span>🛏️</span> {property.bedrooms} Beds
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span>🚿</span> {property.bathrooms} Baths
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span>👥</span> {property.max_guests} Guests
          </span>
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-brand-border/60">
          <div>
            <span className="text-[10px] text-brand-brown-muted uppercase tracking-wider block">
              {isRent ? "Price per night" : "Guide Price"}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-serif font-bold text-brand-brown">
                {property.price_formatted}
              </span>
              <span className="text-[10px] text-brand-brown-muted font-medium">
                {property.currency}
                {isRent && " / night"}
              </span>
            </div>
          </div>

          <Link
            href={`/stays/${property.slug}`}
            className="px-4 py-2 bg-brand-sand-light hover:bg-brand-terracotta hover:text-white text-brand-brown rounded-xl text-xs font-bold uppercase tracking-wider transition duration-200"
          >
            {isRent ? "Reserve" : "View"}
          </Link>
        </div>
      </div>
    </div>
  );
}
