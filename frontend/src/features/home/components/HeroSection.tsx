"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"rent" | "sale" | "experiences">("rent");
  const [location, setLocation] = useState("all");
  const [checkIn, setCheckIn] = useState("2026-10-24");
  const [checkOut, setCheckOut] = useState("2026-10-31");
  const [guests, setGuests] = useState("4");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "experiences") {
      const params = new URLSearchParams();
      if (location && location !== "all") params.set("location", location);
      router.push(`/experiences?${params.toString()}`);
      return;
    }

    const params = new URLSearchParams();
    params.set("listing_type", activeTab);
    if (location && location !== "all") params.set("location", location);
    if (checkIn && activeTab === "rent") params.set("check_in", checkIn);
    if (checkOut && activeTab === "rent") params.set("check_out", checkOut);
    if (guests && activeTab === "rent") params.set("guests", guests);
    router.push(`/stays?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[680px] lg:min-h-[780px] flex items-center justify-center bg-brand-brown-dark text-white overflow-hidden">
      {/* Background Hero Image with Warm Luxury Dusk Vignette */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=2200&q=85"
          alt="Live the Unrivaled El Gouna Lifestyle"
          fill
          priority
          sizes="100vw"
          className="w-full h-full object-cover object-center scale-[1.02] transform transition-transform duration-1000 ease-out"
        />
        {/* Gradients to match luxury golden hour twilight in screenshot */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-dark/95 via-brand-brown-dark/45 to-black/50" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 lg:py-28 text-center flex flex-col items-center">
        {/* Curated Luxury Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold uppercase tracking-[0.25em] mb-6 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-terracotta animate-pulse" />
          <span>Curated Luxury Experiences • Private Escapes</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#FAF8F5] max-w-4xl leading-[1.1] mb-6 drop-shadow-md">
          Live the Unrivaled <br className="hidden sm:inline" />
          <span className="italic font-normal">El Gouna Lifestyle</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-sm sm:text-base lg:text-lg text-[#E5DCD3] max-w-3xl font-light leading-relaxed mb-10 text-center">
          Where the Red Sea meets understated luxury: bespoke private villas,
          yacht charters, and 24/7 VIP concierge experiences crafted exclusively
          for you.
        </p>

        {/* Floating Search Bar (Card Widget Matching Screenshot) */}
        <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md p-4 sm:p-6 rounded-3xl shadow-2xl border border-white/60 text-brand-brown transition-all duration-300">
          {/* Tab Selector */}
          <div className="flex items-center justify-start gap-2 mb-4 border-b border-brand-border/60 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab("rent")}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "rent"
                  ? "bg-brand-terracotta text-white shadow-xs"
                  : "bg-brand-sand-light text-brand-brown hover:bg-brand-sand/60"
              }`}
            >
              <span>🏡</span>
              <span>Rent a Stay</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("sale")}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "sale"
                  ? "bg-brand-terracotta text-white shadow-xs"
                  : "bg-brand-sand-light text-brand-brown hover:bg-brand-sand/60"
              }`}
            >
              <span>🏛️</span>
              <span>Buy a Property</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("experiences")}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "experiences"
                  ? "bg-brand-terracotta text-white shadow-xs"
                  : "bg-brand-sand-light text-brand-brown hover:bg-brand-sand/60"
              }`}
            >
              <span>⛵</span>
              <span>Experiences</span>
            </button>
          </div>

          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
              {/* Location Input */}
              <div className="p-3 bg-brand-sand-light/60 hover:bg-brand-sand-light rounded-2xl border border-brand-border/80 transition-colors">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                  Location
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">📍</span>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown cursor-pointer"
                  >
                    <option value="all">All of El Gouna</option>
                    <option value="fanadir-bay">Fanadir Bay</option>
                    <option value="abu-tig-marina">Abu Tig Marina</option>
                    <option value="tawila-island">Tawila Island &amp; Lagoons</option>
                    <option value="ancient-sands">Ancient Sands</option>
                    <option value="west-golf">West Golf Lagoons</option>
                    <option value="mangroovy-beach">Mangroovy Beach</option>
                  </select>
                </div>
              </div>

              {/* Check-In / Date */}
              <div className="p-3 bg-brand-sand-light/60 hover:bg-brand-sand-light rounded-2xl border border-brand-border/80 transition-colors">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                  {activeTab === "experiences" ? "Date" : "Check-in"}
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">📅</span>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown cursor-pointer"
                  />
                </div>
              </div>

              {/* Check-Out or Category */}
              {activeTab === "rent" ? (
                <div className="p-3 bg-brand-sand-light/60 hover:bg-brand-sand-light rounded-2xl border border-brand-border/80 transition-colors">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                    Check-out
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">📅</span>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-brand-sand-light/60 hover:bg-brand-sand-light rounded-2xl border border-brand-border/80 transition-colors">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                    {activeTab === "sale" ? "Property Type" : "Experience Type"}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">✨</span>
                    <select
                      className="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown cursor-pointer"
                      defaultValue="all"
                    >
                      <option value="all">
                        {activeTab === "sale"
                          ? "All Real Estate"
                          : "All Activities"}
                      </option>
                      {activeTab === "sale" ? (
                        <>
                          <option value="villas">Lagoon Waterfront Villas</option>
                          <option value="penthouses">Marina Penthouses</option>
                          <option value="islands">Private Island Estates</option>
                        </>
                      ) : (
                        <>
                          <option value="yachts">Private Yacht Charters</option>
                          <option value="safari">Desert Quad Safaris</option>
                          <option value="watersports">Kitesurfing &amp; Diving</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              )}

              {/* Guests / CTA Button */}
              <div className="flex gap-2 items-center">
                <div className="flex-1 p-3 bg-brand-sand-light/60 hover:bg-brand-sand-light rounded-2xl border border-brand-border/80 transition-colors">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                    Guests
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">👥</span>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown cursor-pointer"
                    >
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="4">4 Guests</option>
                      <option value="6">6 Guests</option>
                      <option value="8">8+ Guests</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="h-full px-5 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span className="hidden sm:inline">
                    {activeTab === "rent"
                      ? "Search Stays"
                      : activeTab === "sale"
                      ? "Find Property"
                      : "Search"}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
