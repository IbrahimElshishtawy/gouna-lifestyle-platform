import React from "react";
import Link from "next/link";
import PropertyCard from "@/features/properties/components/PropertyCard";
import { Property } from "@/features/properties/types/property.types";

interface Props {
  properties: Property[];
}

export default function FeaturedVacationRentals({ properties }: Props) {
  const rentalProperties = properties
    .filter((p) => p.listing_type === "rent")
    .slice(0, 6);

  return (
    <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-2">
            Vacation Stays
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
            Curated Vacation Rentals
          </h2>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-2 max-w-xl font-light">
            Discover private lagoon waterfront villas, heated swimming pools,
            and signature marina residences.
          </p>
        </div>

        <Link
          href="/stays?listing_type=rent"
          className="mt-6 md:mt-0 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-terracotta hover:text-brand-terracotta-dark transition-colors group"
        >
          <span>View All Vacation Rentals</span>
          <span className="transform group-hover:translate-x-1 transition-transform">
            &rarr;
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rentalProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}
