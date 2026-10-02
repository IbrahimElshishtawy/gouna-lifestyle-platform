"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function HeroSection() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<"rent" | "sale" | "experiences">("rent");
  const [location, setLocation] = useState("all");
  const [checkIn, setCheckIn] = useState("2026-10-24");
  const [checkOut, setCheckOut] = useState("2026-10-31");
  const [guests, setGuests] = useState("4");
  
  // Real Estate specific states
  const [propertyType, setPropertyType] = useState("all");
  const [budget, setBudget] = useState("all");
  const [bedrooms, setBedrooms] = useState("any");
  
  // Experiences specific states
  const [expType, setExpType] = useState("all");
  const [expTiming, setExpTiming] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "experiences") {
      const params = new URLSearchParams();
      if (location && location !== "all") params.set("location", location);
      if (expType && expType !== "all") params.set("category", expType);
      if (guests) params.set("guests", guests);
      if (checkIn) params.set("date", checkIn);
      if (expTiming && expTiming !== "all") params.set("timing", expTiming);
      router.push(`/experiences?${params.toString()}`);
      return;
    }

    if (activeTab === "sale") {
      const params = new URLSearchParams();
      params.set("listing_type", "sale");
      if (location && location !== "all") params.set("location", location);
      if (propertyType && propertyType !== "all") params.set("category", propertyType);
      if (budget && budget !== "all") params.set("budget", budget);
      if (bedrooms && bedrooms !== "any") params.set("bedrooms", bedrooms);
      router.push(`/stays?${params.toString()}`);
      return;
    }

    const params = new URLSearchParams();
    params.set("listing_type", "rent");
    if (location && location !== "all") params.set("location", location);
    if (checkIn) params.set("check_in", checkIn);
    if (checkOut) params.set("check_out", checkOut);
    if (guests) params.set("guests", guests);
    router.push(`/stays?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[720px] lg:min-h-[840px] flex items-center justify-center bg-[#1C1412] text-white overflow-hidden pt-36 sm:pt-40 lg:pt-44 pb-20 lg:pb-28">
      {/* Background Hero Image with Feathered Dissolve */}
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

      {/* Multi-tier Smoky Feathered Bottom Transition into Page */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#1C1412] via-[#1C1412]/70 to-transparent pointer-events-none z-0" />
      <div className="absolute inset-x-0 -bottom-1 h-40 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/85 via-[#FAF8F5]/30 to-transparent pointer-events-none z-10" />
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[88%] h-32 bg-[#FAF8F5] blur-3xl opacity-85 pointer-events-none rounded-full z-10" />

      {/* Main Content Container with Staggered Entrance Animations */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
        {/* Curated Luxury Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[#E5DCD3] text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] mb-4 sm:mb-6 shadow-md animate-fade-in-down animate-float">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-terracotta animate-pulse" />
          <span>{t.hero.badge}</span>
        </div>

        {/* Hero Title with Dramatic Contrast & Smooth Slide Up */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-[#FAF8F5] max-w-4xl leading-[1.15] sm:leading-[1.1] mb-4 sm:mb-6 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] animate-fade-in-up [animation-delay:150ms]">
          {t.hero.titleLine1} <br className="hidden sm:inline" />
          <span className="italic font-normal">{t.hero.titleLine2}</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-xs sm:text-base lg:text-lg text-[#E5DCD3] max-w-3xl font-light leading-relaxed mb-6 sm:mb-10 text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] animate-fade-in-up [animation-delay:300ms] px-2 sm:px-0">
          {t.hero.subtitle}
        </p>

        {/* Master Luxury Search Card */}
        <div className="w-full max-w-5xl bg-white/95 backdrop-blur-2xl p-4 sm:p-6 lg:p-7 rounded-3xl sm:rounded-[2.5rem] shadow-[0_30px_90px_-20px_rgba(28,20,18,0.5)] border border-white/80 text-brand-brown transition-all duration-500 animate-fade-in-scale [animation-delay:450ms]">
          
          {/* Centered Segmented Tab Capsule */}
          <div className="flex justify-center mb-5 sm:mb-6">
            <div className="inline-flex p-1 sm:p-1.5 bg-[#F5EFEA]/90 backdrop-blur-md rounded-2xl sm:rounded-full border border-brand-border/80 shadow-inner max-w-full overflow-x-auto no-scrollbar gap-1">
              {/* Tab 1: Rent Stays */}
              <button
                type="button"
                onClick={() => setActiveTab("rent")}
                className={`px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-full text-xs font-bold tracking-wide transition-all duration-300 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === "rent"
                    ? "bg-brand-terracotta text-white shadow-md shadow-brand-terracotta/30 scale-[1.02]"
                    : "text-brand-brown hover:text-brand-terracotta hover:bg-white/70"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>{t.hero.tabRent}</span>
              </button>

              {/* Tab 2: Buy Real Estate */}
              <button
                type="button"
                onClick={() => setActiveTab("sale")}
                className={`px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-full text-xs font-bold tracking-wide transition-all duration-300 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === "sale"
                    ? "bg-brand-terracotta text-white shadow-md shadow-brand-terracotta/30 scale-[1.02]"
                    : "text-brand-brown hover:text-brand-terracotta hover:bg-white/70"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{t.hero.tabSale}</span>
              </button>

              {/* Tab 3: Experiences & Yacht Charters */}
              <button
                type="button"
                onClick={() => setActiveTab("experiences")}
                className={`px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-full text-xs font-bold tracking-wide transition-all duration-300 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === "experiences"
                    ? "bg-brand-terracotta text-white shadow-md shadow-brand-terracotta/30 scale-[1.02]"
                    : "text-brand-brown hover:text-brand-terracotta hover:bg-white/70"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{t.hero.tabExp}</span>
              </button>
            </div>
          </div>

          {/* Unified Architectural Search Bar */}
          <form onSubmit={handleSearch}>
            <div className="bg-[#FAF8F5]/90 hover:bg-[#FAF8F5] rounded-2xl sm:rounded-[2rem] border border-brand-border/90 shadow-sm p-2 sm:p-2.5 flex flex-col lg:flex-row items-stretch lg:items-center divide-y lg:divide-y-0 lg:divide-x rtl:lg:divide-x-reverse divide-brand-border/70 transition-all">
              
              {/* ===================== TAB 1: RENT FIELDS ===================== */}
              {activeTab === "rent" && (
                <>
                  {/* Field 1: Location */}
                  <div className="flex-1 px-4 py-3 sm:py-3.5 hover:bg-white rounded-xl transition-all text-left rtl:text-right cursor-pointer group">
                    <div className="flex items-center gap-1.5 text-brand-terracotta mb-1">
                      <svg className="w-3.5 h-3.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.locationLabel}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown bg-transparent focus:outline-none cursor-pointer appearance-none pr-5 rtl:pr-0 rtl:pl-5"
                      >
                        <option value="all">{t.hero.locationAll}</option>
                        <option value="fanadir-bay">{t.hero.locationFanadir}</option>
                        <option value="abu-tig-marina">{t.hero.locationMarina}</option>
                        <option value="tawila-island">{t.hero.locationTawila}</option>
                        <option value="ancient-sands">{t.hero.locationAncient}</option>
                        <option value="west-golf">{t.hero.locationWestGolf}</option>
                        <option value="mangroovy-beach">{t.hero.locationMangroovy}</option>
                      </select>
                      <svg className="w-3.5 h-3.5 absolute right-0 rtl:right-auto rtl:left-0 pointer-events-none text-brand-brown-muted/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Field 2: Check-In */}
                  <div className="flex-1 px-4 py-3 sm:py-3.5 hover:bg-white rounded-xl transition-all text-left rtl:text-right cursor-pointer group">
                    <div className="flex items-center gap-1.5 text-brand-terracotta mb-1">
                      <svg className="w-3.5 h-3.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.checkInLabel}
                      </span>
                    </div>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown bg-transparent focus:outline-none cursor-pointer"
                    />
                  </div>

                  {/* Field 3: Check-Out */}
                  <div className="flex-1 px-4 py-3 sm:py-3.5 hover:bg-white rounded-xl transition-all text-left rtl:text-right cursor-pointer group">
                    <div className="flex items-center gap-1.5 text-brand-terracotta mb-1">
                      <svg className="w-3.5 h-3.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.checkOutLabel}
                      </span>
                    </div>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown bg-transparent focus:outline-none cursor-pointer"
                    />
                  </div>

                  {/* Field 4: Guests */}
                  <div className="flex-1 px-4 py-3 sm:py-3.5 hover:bg-white rounded-xl transition-all text-left rtl:text-right cursor-pointer group">
                    <div className="flex items-center gap-1.5 text-brand-terracotta mb-1">
                      <svg className="w-3.5 h-3.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.guestsLabel}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <select
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown bg-transparent focus:outline-none cursor-pointer appearance-none pr-5 rtl:pr-0 rtl:pl-5"
                      >
                        <option value="2">2 {t.common.guests}</option>
                        <option value="4">4 {t.common.guests}</option>
                        <option value="6">6 {t.common.guests}</option>
                        <option value="8">8+ {t.common.guests}</option>
                      </select>
                      <svg className="w-3.5 h-3.5 absolute right-0 rtl:right-auto rtl:left-0 pointer-events-none text-brand-brown-muted/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </>
              )}

              {/* ===================== TAB 2: SALE FIELDS ===================== */}
              {activeTab === "sale" && (
                <>
                  {/* Field 1: Location */}
                  <div className="flex-1 px-4 py-3 sm:py-3.5 hover:bg-white rounded-xl transition-all text-left rtl:text-right cursor-pointer group">
                    <div className="flex items-center gap-1.5 text-brand-terracotta mb-1">
                      <svg className="w-3.5 h-3.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.locationLabel}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown bg-transparent focus:outline-none cursor-pointer appearance-none pr-5 rtl:pr-0 rtl:pl-5"
                      >
                        <option value="all">{t.hero.locationAll}</option>
                        <option value="fanadir-bay">{t.hero.locationFanadir}</option>
                        <option value="abu-tig-marina">{t.hero.locationMarina}</option>
                        <option value="tawila-island">{t.hero.locationTawila}</option>
                        <option value="west-golf">{t.hero.locationWestGolf}</option>
                      </select>
                      <svg className="w-3.5 h-3.5 absolute right-0 rtl:right-auto rtl:left-0 pointer-events-none text-brand-brown-muted/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Field 2: Property Type */}
                  <div className="flex-1 px-4 py-3 sm:py-3.5 hover:bg-white rounded-xl transition-all text-left rtl:text-right cursor-pointer group">
                    <div className="flex items-center gap-1.5 text-brand-terracotta mb-1">
                      <svg className="w-3.5 h-3.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.propertyTypeLabel}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown bg-transparent focus:outline-none cursor-pointer appearance-none pr-5 rtl:pr-0 rtl:pl-5"
                      >
                        <option value="all">{t.hero.propertyAll}</option>
                        <option value="villas">{t.hero.propertyVillas}</option>
                        <option value="townhomes">{t.hero.propertyTownhomes}</option>
                        <option value="penthouses">{t.hero.propertyPenthouses}</option>
                      </select>
                      <svg className="w-3.5 h-3.5 absolute right-0 rtl:right-auto rtl:left-0 pointer-events-none text-brand-brown-muted/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Field 3: Budget Range */}
                  <div className="flex-1 px-4 py-3 sm:py-3.5 hover:bg-white rounded-xl transition-all text-left rtl:text-right cursor-pointer group">
                    <div className="flex items-center gap-1.5 text-brand-terracotta mb-1">
                      <svg className="w-3.5 h-3.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.budgetLabel}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown bg-transparent focus:outline-none cursor-pointer appearance-none pr-5 rtl:pr-0 rtl:pl-5"
                      >
                        <option value="all">{t.hero.budgetAny}</option>
                        <option value="tier1">{t.hero.budget1}</option>
                        <option value="tier2">{t.hero.budget2}</option>
                        <option value="tier3">{t.hero.budget3}</option>
                      </select>
                      <svg className="w-3.5 h-3.5 absolute right-0 rtl:right-auto rtl:left-0 pointer-events-none text-brand-brown-muted/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Field 4: Bedrooms */}
                  <div className="flex-1 px-4 py-3 sm:py-3.5 hover:bg-white rounded-xl transition-all text-left rtl:text-right cursor-pointer group">
                    <div className="flex items-center gap-1.5 text-brand-terracotta mb-1">
                      <svg className="w-3.5 h-3.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.common.beds}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <select
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown bg-transparent focus:outline-none cursor-pointer appearance-none pr-5 rtl:pr-0 rtl:pl-5"
                      >
                        <option value="any">{locale === "ar" ? "أي عدد غرف" : "Any Bedrooms"}</option>
                        <option value="3">3+ {t.common.beds}</option>
                        <option value="4">4+ {t.common.beds}</option>
                        <option value="5">5+ {t.common.beds}</option>
                      </select>
                      <svg className="w-3.5 h-3.5 absolute right-0 rtl:right-auto rtl:left-0 pointer-events-none text-brand-brown-muted/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </>
              )}

              {/* ===================== TAB 3: EXPERIENCES FIELDS ===================== */}
              {activeTab === "experiences" && (
                <>
                  {/* Field 1: Experience Type */}
                  <div className="flex-1 px-4 py-3 sm:py-3.5 hover:bg-white rounded-xl transition-all text-left rtl:text-right cursor-pointer group">
                    <div className="flex items-center gap-1.5 text-brand-terracotta mb-1">
                      <svg className="w-3.5 h-3.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.expTypeLabel}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <select
                        value={expType}
                        onChange={(e) => setExpType(e.target.value)}
                        className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown bg-transparent focus:outline-none cursor-pointer appearance-none pr-5 rtl:pr-0 rtl:pl-5"
                      >
                        <option value="all">{t.hero.expAll}</option>
                        <option value="yachts">{t.hero.expYachts}</option>
                        <option value="tawila">{t.hero.expTawila}</option>
                        <option value="safari">{t.hero.expSafari}</option>
                        <option value="watersports">{t.hero.expWatersports}</option>
                      </select>
                      <svg className="w-3.5 h-3.5 absolute right-0 rtl:right-auto rtl:left-0 pointer-events-none text-brand-brown-muted/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Field 2: Preferred Date */}
                  <div className="flex-1 px-4 py-3 sm:py-3.5 hover:bg-white rounded-xl transition-all text-left rtl:text-right cursor-pointer group">
                    <div className="flex items-center gap-1.5 text-brand-terracotta mb-1">
                      <svg className="w-3.5 h-3.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.dateLabel}
                      </span>
                    </div>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown bg-transparent focus:outline-none cursor-pointer"
                    />
                  </div>

                  {/* Field 3: Schedule / Timing */}
                  <div className="flex-1 px-4 py-3 sm:py-3.5 hover:bg-white rounded-xl transition-all text-left rtl:text-right cursor-pointer group">
                    <div className="flex items-center gap-1.5 text-brand-terracotta mb-1">
                      <svg className="w-3.5 h-3.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.timingLabel}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <select
                        value={expTiming}
                        onChange={(e) => setExpTiming(e.target.value)}
                        className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown bg-transparent focus:outline-none cursor-pointer appearance-none pr-5 rtl:pr-0 rtl:pl-5"
                      >
                        <option value="full-day">{t.hero.timingFullDay}</option>
                        <option value="sunset">{t.hero.timingSunset}</option>
                        <option value="morning">{t.hero.timingMorning}</option>
                        <option value="night">{t.hero.timingNight}</option>
                      </select>
                      <svg className="w-3.5 h-3.5 absolute right-0 rtl:right-auto rtl:left-0 pointer-events-none text-brand-brown-muted/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Field 4: Guests */}
                  <div className="flex-1 px-4 py-3 sm:py-3.5 hover:bg-white rounded-xl transition-all text-left rtl:text-right cursor-pointer group">
                    <div className="flex items-center gap-1.5 text-brand-terracotta mb-1">
                      <svg className="w-3.5 h-3.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.guestsLabel}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <select
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown bg-transparent focus:outline-none cursor-pointer appearance-none pr-5 rtl:pr-0 rtl:pl-5"
                      >
                        <option value="4">4 {t.common.guests}</option>
                        <option value="8">8 {t.common.guests}</option>
                        <option value="12">12 {t.common.guests}</option>
                        <option value="20">20+ {t.common.guests}</option>
                      </select>
                      <svg className="w-3.5 h-3.5 absolute right-0 rtl:right-auto rtl:left-0 pointer-events-none text-brand-brown-muted/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </>
              )}

              {/* Action CTA Button */}
              <div className="p-1.5 sm:p-2 flex items-center justify-center shrink-0">
                <button
                  type="submit"
                  className="w-full lg:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl sm:rounded-[1.4rem] font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <svg
                    className="w-4 h-4 shrink-0"
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
                  <span className="whitespace-nowrap">
                    {activeTab === "rent"
                      ? t.hero.searchRentButton
                      : activeTab === "sale"
                      ? t.hero.searchSaleButton
                      : t.hero.searchExpButton}
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
