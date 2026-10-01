import React from "react";
import Link from "next/link";
import PropertyCard from "@/features/properties/components/PropertyCard";
import { getProperties } from "@/features/properties/services/properties.api";

interface Props {
  searchParams: Promise<{
    listing_type?: "rent" | "sale";
    location?: string;
    category?: string;
    bedrooms?: string;
    guests?: string;
    sort?: string;
  }>;
}

export default async function StaysPage({ searchParams }: Props) {
  const params = await searchParams;
  const listingType = params.listing_type || "rent";
  const isRent = listingType === "rent";

  const properties = await getProperties({
    listing_type: listingType,
    location: params.location,
    category: params.category,
    bedrooms: params.bedrooms,
    guests: params.guests,
    sort: params.sort,
  });

  return (
    <div className="bg-[#FAF8F5]">
      {/* Top Header & Filter Banner */}
      <div className="bg-white border-b border-brand-border py-10 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-2">
              El Gouna Accommodations &amp; Living
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
              {isRent ? "Curated Vacation Rentals" : "Prime Real Estate For Sale"}
            </h1>
            <p className="text-xs sm:text-sm text-brand-brown-muted leading-relaxed font-light mt-2">
              {isRent
                ? "Discover private lagoon waterfront villas, heated swimming pools, and signature marina residences."
                : "Explore prestigious architectural villas, sea-view estates, and investment opportunities in El Gouna."}
            </p>
          </div>

          {/* Filter Bar */}
          <div className="mt-8 bg-brand-sand-card p-5 rounded-3xl border border-brand-border shadow-xs">
            <form method="GET" action="/stays" className="space-y-4">
              {/* Listing Type Toggle & Sort */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
                {/* Type Tabs */}
                <div className="flex items-center gap-2">
                  <Link
                    href="/stays?listing_type=rent"
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                      isRent
                        ? "bg-brand-terracotta text-white shadow-xs"
                        : "bg-brand-sand-light text-brand-brown hover:bg-brand-sand/50"
                    }`}
                  >
                    Vacation Rentals
                  </Link>
                  <Link
                    href="/stays?listing_type=sale"
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                      !isRent
                        ? "bg-brand-terracotta text-white shadow-xs"
                        : "bg-brand-sand-light text-brand-brown hover:bg-brand-sand/50"
                    }`}
                  >
                    Properties For Sale
                  </Link>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-brand-brown-muted">Sort by:</span>
                  <select
                    name="sort"
                    defaultValue={params.sort || "featured"}
                    className="bg-white border border-brand-border rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none"
                  >
                    <option value="featured">Featured First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <input type="hidden" name="listing_type" value={listingType} />

                {/* Location */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                    Location
                  </label>
                  <select
                    name="location"
                    defaultValue={params.location || "all"}
                    className="w-full text-xs bg-white border border-brand-border rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="all">All Locations</option>
                    <option value="abu-tig-marina">Abu Tig Marina</option>
                    <option value="fanadir-bay">Fanadir Bay</option>
                    <option value="mangroovy-beach">Mangroovy &amp; Kite Beach</option>
                    <option value="west-golf">West Golf</option>
                    <option value="tawila-island">Tawila Island</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    defaultValue={params.category || "all"}
                    className="w-full text-xs bg-white border border-brand-border rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="luxury-villas">Luxury Villas</option>
                    <option value="waterfront-chalets">Waterfront Chalets</option>
                    <option value="marina-apartments">Marina Apartments</option>
                    <option value="signature-villas">Signature Real Estate</option>
                  </select>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                    Bedrooms
                  </label>
                  <select
                    name="bedrooms"
                    defaultValue={params.bedrooms || ""}
                    className="w-full text-xs bg-white border border-brand-border rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="">Any</option>
                    <option value="2">2+ Beds</option>
                    <option value="3">3+ Beds</option>
                    <option value="4">4+ Beds</option>
                    <option value="5">5+ Beds</option>
                  </select>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                    Min Guests
                  </label>
                  <select
                    name="guests"
                    defaultValue={params.guests || ""}
                    className="w-full text-xs bg-white border border-brand-border rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="">Any</option>
                    <option value="2">2+ Guests</option>
                    <option value="4">4+ Guests</option>
                    <option value="6">6+ Guests</option>
                    <option value="8">8+ Guests</option>
                  </select>
                </div>

                {/* Submit & Reset */}
                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    Filter
                  </button>
                  <Link
                    href={`/stays?listing_type=${listingType}`}
                    className="p-2.5 text-brand-brown-muted hover:text-brand-brown rounded-xl border border-brand-border text-xs text-center bg-white"
                    title="Reset Filters"
                  >
                    ✕
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Main Results Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex items-center justify-between mb-8">
          <span className="text-xs text-brand-brown-muted font-medium">
            Showing <strong className="text-brand-brown">{properties.length}</strong>{" "}
            {isRent ? "vacation stays" : "properties for sale"} in El Gouna
          </span>
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-brand-border text-center max-w-lg mx-auto">
            <span className="text-4xl block mb-3">🏖️</span>
            <h3 className="font-serif text-lg font-bold text-brand-brown mb-1">
              No Properties Found
            </h3>
            <p className="text-xs text-brand-brown-muted mb-6">
              Try adjusting your filter criteria or view all vacation rentals.
            </p>
            <Link
              href="/stays?listing_type=rent"
              className="px-5 py-2.5 bg-brand-terracotta text-white rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Reset Filters
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
