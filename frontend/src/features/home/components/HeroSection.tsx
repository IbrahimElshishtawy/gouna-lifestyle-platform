"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
import { useLanguage } from "@/context/LanguageContext";

import type { MediaDesignConfig } from "@/features/admin/types";

const CINEMATIC_PRESETS = [
  {
    id: "dusk",
    name_ar: "غروب الفلل الذهبي",
    name_en: "Lagoon Sunset",
    image: "/assets/images/hero-villa-dusk.jpg",
  },
  {
    id: "lagoon",
    name_ar: "مياه الفنار الفيروزية",
    name_en: "Turquoise Lagoon",
    image: "/assets/images/fanadir-villa.jpg",
  },
  {
    id: "marine",
    name_ar: "يخوت مارينا الجونة",
    name_en: "Marina Yacht Life",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=85",
  },
];

interface HeroSectionProps {
  heroConfig?: MediaDesignConfig["hero"];
}

export default function HeroSection({ heroConfig }: HeroSectionProps = {}) {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const isAr = locale === "ar";
  const [activeScene, setActiveScene] = useState<"dusk" | "lagoon" | "marine">("dusk");
  const currentPreset = CINEMATIC_PRESETS.find((p) => p.id === activeScene) || CINEMATIC_PRESETS[0];
  const activeBgImage = heroConfig?.background_image || currentPreset.image;

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
    <section className="relative min-h-[760px] lg:min-h-[880px] flex items-center justify-center bg-[#1C1412] text-white overflow-hidden pt-36 sm:pt-40 lg:pt-44 pb-20 lg:pb-28">
      {/* Background Hero Image/Video with Feathered Dissolve */}
      <div 
        className="absolute inset-0 z-0 transition-opacity duration-1000"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 68%, rgba(0,0,0,0.5) 86%, rgba(0,0,0,0) 100%)",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 68%, rgba(0,0,0,0.5) 86%, rgba(0,0,0,0) 100%)"
        }}
      >
        {heroConfig?.video_url ? (
          <video
            src={heroConfig.video_url}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center animate-ken-burns"
          />
        ) : (
          <Image
            src={activeBgImage}
            alt="Live the Unrivaled El Gouna Lifestyle"
            fill
            priority
            sizes="100vw"
            className="w-full h-full object-cover object-center animate-ken-burns transition-all duration-1000"
          />
        )}
        {/* Top Vignette for Transparent Header Contrast */}
        <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-black/85 via-black/45 to-transparent z-10" />

        {/* Cinematic Dusk Ambient Glow */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/25 to-black/60 pointer-events-none" />
      </div>

      {/* Floating Cinematic Scene Atmosphere Switcher (Desktop) */}
      <aside
        aria-label={isAr ? "التحكم في المشهد السينمائي" : "Cinematic Scene Switcher"}
        className="absolute bottom-6 end-6 z-30 hidden lg:flex items-center gap-1.5 p-1.5 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"
      >
        <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-[#E5DCD3]">
          {isAr ? "مشهد الجونة:" : "SCENE:"}
        </span>
        {CINEMATIC_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActiveScene(p.id as any)}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              activeScene === p.id
                ? "bg-brand-terracotta text-white shadow-md scale-105"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            {isAr ? p.name_ar : p.name_en}
          </button>
        ))}
      </aside>

      {/* Multi-tier Smoky Feathered Bottom Transition into Page */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#1C1412] via-[#1C1412]/70 to-transparent pointer-events-none z-0" />
      <div className="absolute inset-x-0 -bottom-1 h-40 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/85 via-[#FAF8F5]/30 to-transparent pointer-events-none z-10" />
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[88%] h-32 bg-[#FAF8F5] blur-3xl opacity-85 pointer-events-none rounded-full z-10" />

      {/* Main Content Container with Staggered Entrance Animations */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
        {/* Cinematic Live Red Sea Telemetry Pill */}
        <div className="inline-flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 text-[#FAF8F5] text-[10px] sm:text-[11px] font-mono tracking-wider mb-4 shadow-lg animate-fade-in-down">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-[#FAF8F5]">{isAr ? "الجونة مباشرة" : "EL GOUNA LIVE"}</span>
          <span className="text-white/40">|</span>
          <span className="text-amber-300 font-semibold">{isAr ? "28°C مشمس صافٍ" : "28°C Clear Sky"}</span>
          <span className="hidden md:inline text-white/40">|</span>
          <span className="hidden md:inline text-[#E5DCD3]">{isAr ? "مياه هادئة مثالية للإبحار" : "Calm Waters & Sailing"}</span>
          <span className="hidden lg:inline text-white/40">|</span>
          <span className="hidden lg:inline text-emerald-300 font-semibold">{isAr ? "الكونسيرج 24/7" : "Concierge Online"}</span>
        </div>

        {/* Curated Luxury Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[#E5DCD3] text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] mb-4 sm:mb-6 shadow-md animate-fade-in-down animate-float">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-terracotta animate-pulse" />
          <span>
            {heroConfig
              ? (isAr ? heroConfig.badge_ar : heroConfig.badge_en)
              : t.hero.badge}
          </span>
        </div>

        {/* Hero Title with Dramatic Contrast & Smooth Slide Up */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-[#FAF8F5] max-w-4xl leading-[1.15] sm:leading-[1.1] mb-4 sm:mb-6 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] animate-fade-in-up [animation-delay:150ms]">
          {heroConfig ? (
            <>
              {isAr ? heroConfig.title_line1_ar : heroConfig.title_line1_en}{" "}
              <br className="hidden sm:inline" />
              <span className="italic font-normal">
                {isAr ? heroConfig.title_line2_ar : heroConfig.title_line2_en}
              </span>
            </>
          ) : (
            <>
              {t.hero.titleLine1} <br className="hidden sm:inline" />
              <span className="italic font-normal">{t.hero.titleLine2}</span>
            </>
          )}
        </h1>

        {/* Hero Subtitle */}
        <p className="text-xs sm:text-base lg:text-lg text-[#E5DCD3] max-w-3xl font-light leading-relaxed mb-6 sm:mb-8 text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] animate-fade-in-up [animation-delay:300ms] px-2 sm:px-0">
          {heroConfig
            ? (isAr ? heroConfig.subtitle_ar : heroConfig.subtitle_en)
            : t.hero.subtitle}
        </p>

        {/* Dual Cinematic Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 mb-6 sm:mb-10 w-full sm:w-auto max-w-md sm:max-w-none animate-fade-in-up [animation-delay:350ms]">
          <a
            href={heroConfig?.cta1_link || "#stays"}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-brand-terracotta/30 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center"
          >
            <span>
              {heroConfig
                ? (isAr ? heroConfig.cta1_text_ar : heroConfig.cta1_text_en)
                : (isAr ? "استكشف الفلل والإقامات" : "Explore Curated Stays")}
            </span>
          </a>
          <a
            href={heroConfig?.cta2_link || "#experiences"}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF8F5] border border-white/25 backdrop-blur-md text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center"
          >
            <span>
              {heroConfig
                ? (isAr ? heroConfig.cta2_text_ar : heroConfig.cta2_text_en)
                : (isAr ? "اليخوت والأنشطة البحرية" : "Private Charters & Diving")}
            </span>
          </a>
        </div>

        {/* Master Luxury Search Card */}
        <div className="w-full max-w-5xl bg-white/95 backdrop-blur-2xl p-3 sm:p-6 lg:p-7 rounded-2xl sm:rounded-[2.5rem] shadow-[0_30px_90px_-20px_rgba(28,20,18,0.5)] border border-white/80 text-brand-brown transition-all duration-500 animate-fade-in-scale [animation-delay:450ms]">
          
          {/* Centered Segmented Tab Capsule */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="inline-flex p-1 sm:p-1.5 bg-[#F5EFEA]/90 backdrop-blur-md rounded-xl sm:rounded-full border border-brand-border/80 shadow-inner max-w-full overflow-x-auto no-scrollbar gap-1">
              {/* Tab 1: Rent Stays */}
              <button
                type="button"
                onClick={() => setActiveTab("rent")}
                className={`px-4 sm:px-7 py-1.5 sm:py-2.5 rounded-lg sm:rounded-full text-[11px] sm:text-xs font-bold tracking-wide transition-all duration-300 flex items-center justify-center whitespace-nowrap cursor-pointer ${
                  activeTab === "rent"
                    ? "bg-brand-terracotta text-white shadow-md shadow-brand-terracotta/30 scale-[1.02]"
                    : "text-brand-brown hover:text-brand-terracotta hover:bg-white/70"
                }`}
              >
                <span>{t.hero.tabRent}</span>
              </button>

              {/* Tab 2: Buy Real Estate */}
              <button
                type="button"
                onClick={() => setActiveTab("sale")}
                className={`px-4 sm:px-7 py-2 sm:py-2.5 rounded-xl sm:rounded-full text-xs font-bold tracking-wide transition-all duration-300 flex items-center justify-center whitespace-nowrap cursor-pointer ${
                  activeTab === "sale"
                    ? "bg-brand-terracotta text-white shadow-md shadow-brand-terracotta/30 scale-[1.02]"
                    : "text-brand-brown hover:text-brand-terracotta hover:bg-white/70"
                }`}
              >
                <span>{t.hero.tabSale}</span>
              </button>

              {/* Tab 3: Experiences & Yacht Charters */}
              <button
                type="button"
                onClick={() => setActiveTab("experiences")}
                className={`px-4 sm:px-7 py-2 sm:py-2.5 rounded-xl sm:rounded-full text-xs font-bold tracking-wide transition-all duration-300 flex items-center justify-center whitespace-nowrap cursor-pointer ${
                  activeTab === "experiences"
                    ? "bg-brand-terracotta text-white shadow-md shadow-brand-terracotta/30 scale-[1.02]"
                    : "text-brand-brown hover:text-brand-terracotta hover:bg-white/70"
                }`}
              >
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
                    <div className="mb-1">
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
                    <div className="mb-1">
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
                    <div className="mb-1">
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
                    <div className="mb-1">
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
                    <div className="mb-1">
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
                    <div className="mb-1">
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
                    <div className="mb-1">
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
                    <div className="mb-1">
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
                    <div className="mb-1">
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
                    <div className="mb-1">
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
                    <div className="mb-1">
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
                    <div className="mb-1">
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

        {/* Cinematic Ecosystem Metrics Bar */}
        <div className="mt-8 sm:mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 w-full max-w-5xl text-start animate-fade-in-up [animation-delay:550ms]">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/15 text-white shadow-lg transition-transform hover:scale-[1.02]">
            <span className="block text-xl sm:text-2xl font-serif font-bold text-amber-300">120+</span>
            <span className="block text-xs sm:text-sm font-semibold text-[#FAF8F5]">
              {isAr ? "فيلا شاطئية معتمدة" : "Curated Lagoon Villas"}
            </span>
            <span className="block text-[10px] text-[#E5DCD3]/75 mt-0.5">
              {isAr ? "إطلالات لاجون وبحر مباشر" : "Private Shoreline & Pools"}
            </span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/15 text-white shadow-lg transition-transform hover:scale-[1.02]">
            <span className="block text-xl sm:text-2xl font-serif font-bold text-amber-300">18</span>
            <span className="block text-xs sm:text-sm font-semibold text-[#FAF8F5]">
              {isAr ? "يخت فاخر للإبحار" : "Private Yacht Fleet"}
            </span>
            <span className="block text-[10px] text-[#E5DCD3]/75 mt-0.5">
              {isAr ? "رحلات جزيرة طويلة ومحميات الدلافين" : "Tawila Island Expeditions"}
            </span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/15 text-white shadow-lg transition-transform hover:scale-[1.02]">
            <span className="block text-xl sm:text-2xl font-serif font-bold text-amber-300">24/7</span>
            <span className="block text-xs sm:text-sm font-semibold text-[#FAF8F5]">
              {isAr ? "خدمة كونسيرج VIP" : "Dedicated Concierge Desk"}
            </span>
            <span className="block text-[10px] text-[#E5DCD3]/75 mt-0.5">
              {isAr ? "شيف خاص وحجوزات حصرية" : "Private Chefs & Island Transfers"}
            </span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/15 text-white shadow-lg transition-transform hover:scale-[1.02]">
            <span className="block text-xl sm:text-2xl font-serif font-bold text-amber-300">100%</span>
            <span className="block text-xs sm:text-sm font-semibold text-[#FAF8F5]">
              {isAr ? "حجز فندقي موثوق" : "Verified Booking Security"}
            </span>
            <span className="block text-[10px] text-[#E5DCD3]/75 mt-0.5">
              {isAr ? "دفع بنكي مشفر وإلغاء مرن" : "Encrypted Bank Checkout"}
            </span>
          </div>
        </div>

        {/* Subtle Cinematic Scroll Down Indicator */}
        <div className="mt-10 sm:mt-12 flex flex-col items-center gap-2 animate-fade-in-up [animation-delay:600ms]">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#E5DCD3]/70">
            {locale === "ar" ? "مرر للاستكشاف" : "SCROLL TO EXPLORE"}
          </span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-brand-terracotta via-white/50 to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  );
}
