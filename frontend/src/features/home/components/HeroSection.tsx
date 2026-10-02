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
    <section className="relative min-h-[720px] lg:min-h-[820px] flex items-center justify-center bg-[#1C1412] text-white overflow-hidden pt-36 sm:pt-40 lg:pt-44 pb-20 lg:pb-28">
      {/* Background Hero Image with Feathered Dissolve ("مشبح") */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 68%, rgba(0,0,0,0.5) 86%, rgba(0,0,0,0) 100%)",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 68%, rgba(0,0,0,0.5) 86%, rgba(0,0,0,0) 100%)"
        }}
      >
        <Image
          src="/assets/images/hero-villa-dusk.jpg"
          alt="Live the Unrivaled El Gouna Lifestyle"
          fill
          priority
          sizes="100vw"
          className="w-full h-full object-cover object-center animate-ken-burns"
        />
        {/* Top Vignette for Transparent Header Contrast */}
        <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-black/85 via-black/45 to-transparent z-10" />

        {/* Cinematic Dusk Ambient Glow */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/25 to-black/60 pointer-events-none" />
      </div>

      {/* Multi-tier Smoky Feathered Bottom Transition into Page ("شكل مشبح") */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#1C1412] via-[#1C1412]/70 to-transparent pointer-events-none z-0" />
      <div className="absolute inset-x-0 -bottom-1 h-40 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/85 via-[#FAF8F5]/30 to-transparent pointer-events-none z-10" />
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[88%] h-32 bg-[#FAF8F5] blur-3xl opacity-85 pointer-events-none rounded-full z-10" />

      {/* Main Content Container with Staggered Entrance Animations */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
        {/* Curated Luxury Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[#E5DCD3] text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] mb-4 sm:mb-6 shadow-md animate-fade-in-down animate-float">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-terracotta animate-pulse" />
          <span>Curated Luxury Experiences • Private Escapes</span>
        </div>

        {/* Hero Title with Dramatic Contrast & Smooth Slide Up */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-[#FAF8F5] max-w-4xl leading-[1.15] sm:leading-[1.1] mb-4 sm:mb-6 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] animate-fade-in-up [animation-delay:150ms]">
          Live the Unrivaled <br className="hidden sm:inline" />
          <span className="italic font-normal">El Gouna Lifestyle</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-xs sm:text-base lg:text-lg text-[#E5DCD3] max-w-3xl font-light leading-relaxed mb-6 sm:mb-10 text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] animate-fade-in-up [animation-delay:300ms] px-2 sm:px-0">
          Where the Red Sea meets understated luxury: bespoke private villas,
          yacht charters, and 24/7 VIP concierge experiences crafted exclusively
          for you.
        </p>

        {/* Floating Search Bar (Compact & Ultra-Luxury on Mobile) */}
        <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(28,20,18,0.35)] hover:shadow-[0_30px_70px_-15px_rgba(28,20,18,0.45)] border border-white/90 text-brand-brown transition-all duration-500 animate-fade-in-scale [animation-delay:450ms]">
          {/* Tab Selector: 3 Compact Columns on Mobile */}
          <div className="grid grid-cols-3 gap-1 sm:flex sm:items-center sm:gap-2 mb-3 sm:mb-4 border-b border-brand-border/60 pb-2.5 sm:pb-3">
            <button
              type="button"
              onClick={() => setActiveTab("rent")}
              className={`px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center ${
                activeTab === "rent"
                  ? "bg-brand-terracotta text-white shadow-xs"
                  : "bg-brand-sand-light text-brand-brown hover:bg-brand-sand/60"
              }`}
            >
              <span>🏡</span>
              <span className="truncate">Rent Stay</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("sale")}
              className={`px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center ${
                activeTab === "sale"
                  ? "bg-brand-terracotta text-white shadow-xs"
                  : "bg-brand-sand-light text-brand-brown hover:bg-brand-sand/60"
              }`}
            >
              <span>🏛️</span>
              <span className="truncate">Buy Property</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("experiences")}
              className={`px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center ${
                activeTab === "experiences"
                  ? "bg-brand-terracotta text-white shadow-xs"
                  : "bg-brand-sand-light text-brand-brown hover:bg-brand-sand/60"
              }`}
            >
              <span>⛵</span>
              <span className="truncate">Experiences</span>
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
                  Check-in
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

              {/* Check-Out / Type */}
              <div className="p-3 bg-brand-sand-light/60 hover:bg-brand-sand-light rounded-2xl border border-brand-border/80 transition-colors">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                  {activeTab === "rent"
                    ? "Check-out"
                    : activeTab === "sale"
                    ? "Property Type"
                    : "Category"}
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">
                    {activeTab === "rent" ? "📅" : "🏷️"}
                  </span>
                  {activeTab === "rent" ? (
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown cursor-pointer"
                    />
                  ) : activeTab === "sale" ? (
                    <select className="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown cursor-pointer">
                      <option value="all">All Properties</option>
                      <option value="villas">Signature Villas</option>
                      <option value="chalets">Waterfront Chalets</option>
                      <option value="penthouses">Marina Penthouses</option>
                    </select>
                  ) : (
                    <select className="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown cursor-pointer">
                      <option value="all">All Experiences</option>
                      <option value="yachts">Private Yacht Charters</option>
                      <option value="safari">Desert Safaris</option>
                      <option value="watersports">Kitesurfing &amp; Diving</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Guests & Action Button */}
              <div className="flex items-center gap-2">
                <div className="p-3 bg-brand-sand-light/60 hover:bg-brand-sand-light rounded-2xl border border-brand-border/80 flex-1 transition-colors">
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
