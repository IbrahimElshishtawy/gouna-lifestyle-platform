"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();
  const [listingType, setListingType] = useState<"rent" | "sale">("rent");
  const [location, setLocation] = useState("all");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("listing_type", listingType);
    if (location && location !== "all") params.set("location", location);
    if (checkIn) params.set("check_in", checkIn);
    if (checkOut) params.set("check_out", checkOut);
    if (guests) params.set("guests", guests);
    router.push(`/stays?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center justify-center bg-slate-900 text-white overflow-hidden">
      {/* Background Image with Dark Vignette */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=2000&q=85"
          alt="Luxury Villa El Gouna"
          fill
          priority
          className="w-full h-full object-cover object-center scale-105 transform motion-safe:animate-pulse-subtle"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-dark/95 via-black/40 to-black/60 backdrop-blur-[1px]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center flex flex-col items-center">
        {/* Editorial Sub-badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold uppercase tracking-[0.25em] mb-6 gsap-hero-badge">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-terracotta"></span>
          Red Sea Luxury Destination
        </div>

        {/* Hero Title */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#FAF8F5] max-w-4xl leading-[1.1] mb-6 drop-shadow-sm gsap-hero-title">
          Bespoke Stays &amp; Experiences in El Gouna
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg text-[#E5DCD3] max-w-2xl font-light leading-relaxed mb-10 gsap-hero-desc">
          Curated collection of private waterfront lagoon villas, yacht
          expeditions, and desert adventures tailored to discerning travelers.
        </p>

        {/* Floating Search Bar (Card Widget) */}
        <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl shadow-2xl border border-brand-border text-brand-brown gsap-hero-search">
          {/* Tab Selector */}
          <div className="flex items-center justify-start gap-2 mb-4 border-b border-brand-border/60 pb-3">
            <button
              type="button"
              onClick={() => setListingType("rent")}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                listingType === "rent"
                  ? "bg-brand-terracotta text-white shadow-xs"
                  : "bg-brand-sand-light text-brand-brown hover:bg-brand-sand/50"
              }`}
            >
              Vacation Rentals
            </button>
            <button
              type="button"
              onClick={() => setListingType("sale")}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                listingType === "sale"
                  ? "bg-brand-terracotta text-white shadow-xs"
                  : "bg-brand-sand-light text-brand-brown hover:bg-brand-sand/50"
              }`}
            >
              Real Estate For Sale
            </button>
          </div>

          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
              {/* Location */}
              <div className="p-3 bg-brand-sand-light/60 rounded-2xl border border-brand-border/80">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                  Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown cursor-pointer"
                >
                  <option value="all">All of El Gouna</option>
                  <option value="abu-tig-marina">Abu Tig Marina</option>
                  <option value="fanadir-bay">Fanadir Bay</option>
                  <option value="mangroovy-beach">Mangroovy &amp; Kite Beach</option>
                  <option value="west-golf">West Golf Lagoons</option>
                  <option value="tawila-island">Tawila Island</option>
                </select>
              </div>

              {/* Check-in */}
              <div className="p-3 bg-brand-sand-light/60 rounded-2xl border border-brand-border/80">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                  {listingType === "rent" ? "Check-in" : "Preferred Date"}
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown cursor-pointer"
                />
              </div>

              {/* Check-out or Guests */}
              <div className="p-3 bg-brand-sand-light/60 rounded-2xl border border-brand-border/80">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                  {listingType === "rent" ? "Check-out" : "Viewing Time"}
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown cursor-pointer"
                />
              </div>

              {/* Guests & Submit */}
              <div className="flex gap-2 items-center">
                <div className="flex-1 p-3 bg-brand-sand-light/60 rounded-2xl border border-brand-border/80">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown cursor-pointer"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="6">6+ Guests</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="h-full px-6 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer"
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
