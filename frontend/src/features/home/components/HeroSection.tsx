"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
import { useLanguage } from "@/context/LanguageContext";

import type { MediaDesignConfig, HeroScene } from "@/features/admin/types";

const CINEMATIC_PRESETS: HeroScene[] = [
  {
    id: "dusk",
    name_ar: "غروب الفلل الذهبي",
    name_en: "Lagoon Sunset",
    media_type: "image",
    image_url: "/assets/images/hero-villa-dusk.jpg",
  },
  {
    id: "lagoon",
    name_ar: "مياه الفنار الفيروزية",
    name_en: "Turquoise Lagoon",
    media_type: "image",
    image_url: "/assets/images/fanadir-villa.jpg",
  },
  {
    id: "marine",
    name_ar: "يخوت مارينا الجونة",
    name_en: "Marina Yacht Life",
    media_type: "image",
    image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=85",
  },
];

interface HeroSectionProps {
  heroConfig?: MediaDesignConfig["hero"];
}

export default function HeroSection({ heroConfig }: HeroSectionProps = {}) {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const isAr = locale === "ar";

  const configuredScenes: HeroScene[] =
    heroConfig?.scenes && heroConfig.scenes.length > 0
      ? heroConfig.scenes
      : CINEMATIC_PRESETS;

  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const currentScene = configuredScenes[activeSceneIndex] || configuredScenes[0];

  // Auto-rotate scenes if more than one scene exists
  useEffect(() => {
    if (configuredScenes.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSceneIndex((prev) => (prev + 1) % configuredScenes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [configuredScenes.length]);

  const isVideo =
    heroConfig?.media_mode === "video"
      ? !!heroConfig?.video_url
      : currentScene?.media_type === "video"
      ? !!currentScene?.video_url
      : !!heroConfig?.video_url && heroConfig?.media_mode !== "image";

  const currentMediaUrl = isVideo
    ? (currentScene?.video_url || heroConfig?.video_url || "")
    : (currentScene?.image_url || heroConfig?.background_image || "/assets/images/hero-villa-dusk.jpg");

  // Booking widget state
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

  const titleLine1 = isAr
    ? (currentScene?.title_line1_ar || heroConfig?.title_line1_ar || t.hero.titleLine1)
    : (currentScene?.title_line1_en || heroConfig?.title_line1_en || t.hero.titleLine1);

  const titleLine2 = isAr
    ? (currentScene?.title_line2_ar || heroConfig?.title_line2_ar || t.hero.titleLine2)
    : (currentScene?.title_line2_en || heroConfig?.title_line2_en || t.hero.titleLine2);

  const subtitle = isAr
    ? (currentScene?.subtitle_ar || heroConfig?.subtitle_ar || t.hero.subtitle)
    : (currentScene?.subtitle_en || heroConfig?.subtitle_en || t.hero.subtitle);

  return (
    <section className="relative min-h-[900px] lg:min-h-[980px] xl:min-h-[1020px] flex flex-col justify-between bg-[#140E0C] text-white overflow-hidden pt-28 sm:pt-32 lg:pt-36 pb-14 sm:pb-18 lg:pb-24">
      {/* ==================== 1. IMMERSIVE BACKGROUND VISUALS ==================== */}
      <div 
        className="absolute inset-0 z-0 transition-opacity duration-1000"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 68%, rgba(0,0,0,0.3) 85%, rgba(0,0,0,0) 100%)",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 68%, rgba(0,0,0,0.3) 85%, rgba(0,0,0,0) 100%)"
        }}
      >
        {isVideo ? (
          <video
            key={currentMediaUrl}
            src={currentMediaUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center motion-safe:animate-ken-burns"
          />
        ) : (
          <Image
            key={currentMediaUrl}
            src={currentMediaUrl}
            alt="Live the Unrivaled El Gouna Lifestyle"
            fill
            priority
            sizes="100vw"
            className="w-full h-full object-cover object-[center_right] lg:object-center motion-safe:animate-ken-burns transition-all duration-1000"
          />
        )}

        {/* Top Vignette for Transparent Header Contrast */}
        <div className="absolute inset-x-0 top-0 h-44 sm:h-56 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none z-10" />

        {/* Asymmetrical Directional Text Shading */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#140E0C]/90 via-[#140E0C]/65 via-45% to-transparent pointer-events-none z-10 rtl:hidden" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#140E0C]/90 via-[#140E0C]/65 via-45% to-transparent pointer-events-none z-10 ltr:hidden" />

        {/* Ambient Dusk Glow */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/15 to-black/50 pointer-events-none z-10" />

        {/* Lower Dark Shading */}
        <div className="absolute inset-x-0 bottom-0 h-72 sm:h-96 bg-gradient-to-t from-[#140E0C] via-[#140E0C]/80 via-45% to-transparent pointer-events-none z-10" />
      </div>

      {/* Multi-tier Smoky Feathered Bottom Transition into White/Page Background (Eliminates Sharp Boundary) */}
      <div className="absolute inset-x-0 -bottom-1 h-36 sm:h-52 lg:h-64 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/85 via-45% via-[#FAF8F5]/25 to-transparent pointer-events-none z-10" />
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[92%] h-28 sm:h-36 bg-[#FAF8F5] blur-3xl opacity-85 pointer-events-none z-10" />

      {/* Floating Cinematic Scene Switcher (Desktop) */}
      {configuredScenes.length > 1 && (
        <aside
          aria-label={isAr ? "التحكم في المشهد السينمائي" : "Cinematic Scene Switcher"}
          className="absolute top-28 sm:top-32 end-6 sm:end-10 z-30 hidden lg:flex items-center gap-1.5 p-1.5 bg-black/55 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"
        >
          <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-[#E5DCD3]/80">
            {isAr ? "المشهد:" : "SCENE:"}
          </span>
          {configuredScenes.map((p, idx) => (
            <button
              key={p.id || idx}
              type="button"
              onClick={() => setActiveSceneIndex(idx)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                activeSceneIndex === idx
                  ? "bg-brand-terracotta text-white shadow-md scale-105"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {isAr ? (p.name_ar || `مشهد ${idx + 1}`) : (p.name_en || `Scene ${idx + 1}`)}
            </button>
          ))}
        </aside>
      )}

      {/* Mobile Scene Indicator Dots */}
      {configuredScenes.length > 1 && (
        <div className="absolute top-24 end-4 z-30 flex lg:hidden items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
          {configuredScenes.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveSceneIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                activeSceneIndex === idx ? "w-4 bg-brand-terracotta" : "bg-white/50"
              }`}
              aria-label={`Scene ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* ==================== 2. ASYMMETRICAL EDITORIAL HERO GRID ==================== */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          
          {/* Left Content Area (~7-10% from viewport edge via container padding) */}
          <div className="lg:col-span-8 xl:col-span-7 flex flex-col items-start text-start">
            
            {/* 1. Small Eyebrow Label */}
            <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#E5DCD3] text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.24em] mb-3.5 sm:mb-4 shadow-sm animate-fade-in-down">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-terracotta animate-pulse" />
              <span>
                {heroConfig
                  ? (isAr ? heroConfig.badge_ar : heroConfig.badge_en)
                  : (isAr ? "تجارب استثنائية منتقاة • ملاذات خاصة" : "CURATED LUXURY EXPERIENCES · PRIVATE ESCAPES")}
              </span>
            </div>

            {/* 2. Main Headline: Refined Editorial Serif, Natural 2-3 Line Wrap, Controlled Max Width */}
            <h1 className="font-serif text-3.5xl sm:text-5xl lg:text-6xl xl:text-6.5xl font-bold tracking-tight text-[#FAF8F5] leading-[1.12] sm:leading-[1.08] mb-4 sm:mb-5 max-w-2xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)] animate-fade-in-up [animation-delay:150ms]">
              {titleLine1} <br />
              <span className="italic font-normal text-amber-200/90">{titleLine2}</span>
            </h1>

            {/* 3. Short Supporting Description */}
            <p className="text-xs sm:text-base lg:text-lg text-[#E5DCD3] max-w-xl font-light leading-relaxed mb-6 sm:mb-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] animate-fade-in-up [animation-delay:250ms]">
              {subtitle}
            </p>

            {/* 4. Dual Clear CTAs: Directly Beneath Description */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto animate-fade-in-up [animation-delay:350ms]">
              <a
                href={heroConfig?.cta1_link || "#stays"}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-brand-terracotta/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
              >
                <span>
                  {heroConfig
                    ? (isAr ? heroConfig.cta1_text_ar : heroConfig.cta1_text_en)
                    : (isAr ? "استكشف الفلل والإقامات" : "Explore Curated Stays")}
                </span>
                <svg
                  className="w-4 h-4 ms-2 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>

              <a
                href={heroConfig?.cta2_link || "#experiences"}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF8F5] border border-white/25 backdrop-blur-md text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>
                  {heroConfig
                    ? (isAr ? heroConfig.cta2_text_ar : heroConfig.cta2_text_en)
                    : (isAr ? "اليخوت والأنشطة البحرية" : "Private Charters & Diving")}
                </span>
              </a>
            </div>

          </div>

          {/* Right Column: Restrained Editorial Live Status Module */}
          <div className="lg:col-span-4 xl:col-span-5 hidden lg:flex flex-col items-end justify-end pb-1">
            <div className="w-full max-w-xs p-4 sm:p-5 rounded-2xl bg-black/45 backdrop-blur-xl border border-white/15 text-start shadow-2xl space-y-3 animate-fade-in-up [animation-delay:300ms]">
              
              {/* Status Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-mono font-bold tracking-widest text-[#FAF8F5]">
                    {isAr ? "الجونة مباشرة" : "EL GOUNA LIVE"}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-amber-300 font-semibold">
                  28°C · {isAr ? "صافٍ ومثالي" : "Clear Sky"}
                </span>
              </div>

              {/* Editorial Caption */}
              <p className="text-xs text-[#E5DCD3] font-serif italic leading-relaxed">
                {isAr
                  ? "«ملاذ استثنائي حيث يلتقي أفق البحر الأحمر بخصوصية الفلل الفاخرة»"
                  : '"A different kind of escape, where Red Sea horizons meet barefoot elegance."'}
              </p>

              {/* Concierge Availability & Marine Water Indicator */}
              <div className="pt-1.5 flex items-center justify-between text-[10px] font-mono text-[#E5DCD3]/80 border-t border-white/10">
                <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {isAr ? "الكونسيرج: متاح 24/7" : "Concierge: 24/7 Online"}
                </span>
                <span className="text-white/50">
                  {isAr ? "مياه هادئة" : "Calm Waters"}
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ==================== 3. LOWER TIER: BOOKING WIDGET & STATISTICS STRIP ==================== */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-12 lg:mt-14">
        
        {/* Master Luxury Search Card (Overlapping lower edge of background, warm off-white surface, 75-88% width) */}
        <div className="w-full bg-[#FAF8F5]/98 dark:bg-[#1E1715]/98 backdrop-blur-2xl p-3 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl shadow-[0_24px_70px_-15px_rgba(14,10,9,0.55)] border border-white/90 dark:border-white/10 text-brand-brown transition-all duration-300 animate-fade-in-scale [animation-delay:400ms]">
          
          {/* Mode Selector (Compact Tab Row) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-3 sm:mb-4 border-b border-brand-border/60 pb-3">
            <div className="inline-flex p-1 bg-[#F0EAE3] dark:bg-black/30 rounded-xl border border-brand-border/70 shadow-inner gap-1 max-w-full overflow-x-auto no-scrollbar">
              {/* Tab 1: Rent Stays */}
              <button
                type="button"
                onClick={() => setActiveTab("rent")}
                className={`px-3.5 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  activeTab === "rent"
                    ? "bg-brand-terracotta text-white shadow-sm"
                    : "text-brand-brown hover:text-brand-terracotta hover:bg-white/60"
                }`}
              >
                {t.hero.tabRent}
              </button>

              {/* Tab 2: Buy Real Estate */}
              <button
                type="button"
                onClick={() => setActiveTab("sale")}
                className={`px-3.5 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  activeTab === "sale"
                    ? "bg-brand-terracotta text-white shadow-sm"
                    : "text-brand-brown hover:text-brand-terracotta hover:bg-white/60"
                }`}
              >
                {t.hero.tabSale}
              </button>

              {/* Tab 3: Experiences & Yacht Charters */}
              <button
                type="button"
                onClick={() => setActiveTab("experiences")}
                className={`px-3.5 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  activeTab === "experiences"
                    ? "bg-brand-terracotta text-white shadow-sm"
                    : "text-brand-brown hover:text-brand-terracotta hover:bg-white/60"
                }`}
              >
                {t.hero.tabExp}
              </button>
            </div>

            {/* Editorial Micro-badge on Desktop */}
            <span className="hidden sm:inline-block text-[10px] sm:text-[11px] font-mono text-brand-brown-muted tracking-wider">
              {isAr ? "ضمان أفضل أسعار حصرية ومطابقة تامة" : "BEST RATE & DIRECT ACCESS GUARANTEE"}
            </span>
          </div>

          {/* Unified Architectural Search Bar */}
          <form onSubmit={handleSearch}>
            <div className="bg-white dark:bg-[#140E0C]/60 rounded-xl sm:rounded-2xl border border-brand-border/80 shadow-sm p-1.5 sm:p-2 flex flex-col lg:flex-row items-stretch lg:items-center divide-y lg:divide-y-0 lg:divide-x rtl:lg:divide-x-reverse divide-brand-border/60 transition-all">
              
              {/* ===================== TAB 1: RENT FIELDS ===================== */}
              {activeTab === "rent" && (
                <>
                  {/* Field 1: Location */}
                  <div className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 hover:bg-brand-sand-light/60 dark:hover:bg-white/5 rounded-xl transition-all text-start cursor-pointer group">
                    <div className="mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.locationLabel}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown dark:text-sand-light bg-transparent focus:outline-none cursor-pointer appearance-none pr-5 rtl:pr-0 rtl:pl-5"
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
                  <div className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 hover:bg-brand-sand-light/60 dark:hover:bg-white/5 rounded-xl transition-all text-start cursor-pointer group">
                    <div className="mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.checkInLabel}
                      </span>
                    </div>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown dark:text-sand-light bg-transparent focus:outline-none cursor-pointer"
                    />
                  </div>

                  {/* Field 3: Check-Out */}
                  <div className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 hover:bg-brand-sand-light/60 dark:hover:bg-white/5 rounded-xl transition-all text-start cursor-pointer group">
                    <div className="mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.checkOutLabel}
                      </span>
                    </div>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown dark:text-sand-light bg-transparent focus:outline-none cursor-pointer"
                    />
                  </div>

                  {/* Field 4: Guests */}
                  <div className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 hover:bg-brand-sand-light/60 dark:hover:bg-white/5 rounded-xl transition-all text-start cursor-pointer group">
                    <div className="mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.guestsLabel}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <select
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown dark:text-sand-light bg-transparent focus:outline-none cursor-pointer appearance-none pr-5 rtl:pr-0 rtl:pl-5"
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
                  <div className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 hover:bg-brand-sand-light/60 dark:hover:bg-white/5 rounded-xl transition-all text-start cursor-pointer group">
                    <div className="mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.locationLabel}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown dark:text-sand-light bg-transparent focus:outline-none cursor-pointer appearance-none pr-5 rtl:pr-0 rtl:pl-5"
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
                  <div className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 hover:bg-brand-sand-light/60 dark:hover:bg-white/5 rounded-xl transition-all text-start cursor-pointer group">
                    <div className="mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.propertyTypeLabel}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown dark:text-sand-light bg-transparent focus:outline-none cursor-pointer appearance-none pr-5 rtl:pr-0 rtl:pl-5"
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
                  <div className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 hover:bg-brand-sand-light/60 dark:hover:bg-white/5 rounded-xl transition-all text-start cursor-pointer group">
                    <div className="mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.budgetLabel}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown dark:text-sand-light bg-transparent focus:outline-none cursor-pointer appearance-none pr-5 rtl:pr-0 rtl:pl-5"
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
                  <div className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 hover:bg-brand-sand-light/60 dark:hover:bg-white/5 rounded-xl transition-all text-start cursor-pointer group">
                    <div className="mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.common.beds}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <select
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown dark:text-sand-light bg-transparent focus:outline-none cursor-pointer appearance-none pr-5 rtl:pr-0 rtl:pl-5"
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
                  <div className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 hover:bg-brand-sand-light/60 dark:hover:bg-white/5 rounded-xl transition-all text-start cursor-pointer group">
                    <div className="mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.expTypeLabel}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <select
                        value={expType}
                        onChange={(e) => setExpType(e.target.value)}
                        className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown dark:text-sand-light bg-transparent focus:outline-none cursor-pointer appearance-none pr-5 rtl:pr-0 rtl:pl-5"
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
                  <div className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 hover:bg-brand-sand-light/60 dark:hover:bg-white/5 rounded-xl transition-all text-start cursor-pointer group">
                    <div className="mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.dateLabel}
                      </span>
                    </div>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown dark:text-sand-light bg-transparent focus:outline-none cursor-pointer"
                    />
                  </div>

                  {/* Field 3: Schedule / Timing */}
                  <div className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 hover:bg-brand-sand-light/60 dark:hover:bg-white/5 rounded-xl transition-all text-start cursor-pointer group">
                    <div className="mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.timingLabel}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <select
                        value={expTiming}
                        onChange={(e) => setExpTiming(e.target.value)}
                        className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown dark:text-sand-light bg-transparent focus:outline-none cursor-pointer appearance-none pr-5 rtl:pr-0 rtl:pl-5"
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
                  <div className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 hover:bg-brand-sand-light/60 dark:hover:bg-white/5 rounded-xl transition-all text-start cursor-pointer group">
                    <div className="mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-brown-muted group-hover:text-brand-terracotta transition-colors">
                        {t.hero.guestsLabel}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <select
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="w-full text-xs sm:text-sm font-serif font-bold text-brand-brown dark:text-sand-light bg-transparent focus:outline-none cursor-pointer appearance-none pr-5 rtl:pr-0 rtl:pl-5"
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
                  className="w-full lg:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl sm:rounded-[1.2rem] font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
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

        {/* ==================== 4. RESTRAINED HORIZONTAL STATISTICS STRIP ==================== */}
        <div className="mt-4 sm:mt-5 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-black/45 backdrop-blur-xl border border-white/15 text-white shadow-xl animate-fade-in-up [animation-delay:500ms]">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x rtl:lg:divide-x-reverse divide-white/10 gap-3.5 lg:gap-0">
            
            {/* Stat 1 */}
            <div className="px-2 sm:px-5 py-1 text-start">
              <span className="block text-xl sm:text-2xl font-serif font-bold text-amber-300">120+</span>
              <span className="block text-xs font-semibold text-[#FAF8F5] mt-0.5">
                {isAr ? "فيلا شاطئية معتمدة" : "Curated Lagoon Villas"}
              </span>
              <span className="block text-[10px] text-[#E5DCD3]/70 truncate">
                {isAr ? "إطلالات لاجون وبحر مباشر" : "Private Shoreline & Pools"}
              </span>
            </div>

            {/* Stat 2 */}
            <div className="px-2 sm:px-5 py-1 text-start pt-2 lg:pt-1">
              <span className="block text-xl sm:text-2xl font-serif font-bold text-amber-300">18</span>
              <span className="block text-xs font-semibold text-[#FAF8F5] mt-0.5">
                {isAr ? "يخت فاخر للإبحار" : "Private Yacht Fleet"}
              </span>
              <span className="block text-[10px] text-[#E5DCD3]/70 truncate">
                {isAr ? "رحلات جزيرة طويلة ومحميات" : "Tawila Island Expeditions"}
              </span>
            </div>

            {/* Stat 3 */}
            <div className="px-2 sm:px-5 py-1 text-start pt-2 lg:pt-1">
              <span className="block text-xl sm:text-2xl font-serif font-bold text-amber-300">24/7</span>
              <span className="block text-xs font-semibold text-[#FAF8F5] mt-0.5">
                {isAr ? "خدمة كونسيرج VIP" : "Dedicated Concierge Desk"}
              </span>
              <span className="block text-[10px] text-[#E5DCD3]/70 truncate">
                {isAr ? "شيف خاص وحجوزات حصرية" : "Private Chefs & Transfers"}
              </span>
            </div>

            {/* Stat 4 */}
            <div className="px-2 sm:px-5 py-1 text-start pt-2 lg:pt-1">
              <span className="block text-xl sm:text-2xl font-serif font-bold text-amber-300">100%</span>
              <span className="block text-xs font-semibold text-[#FAF8F5] mt-0.5">
                {isAr ? "حجز فندقي موثوق" : "Verified Booking Security"}
              </span>
              <span className="block text-[10px] text-[#E5DCD3]/70 truncate">
                {isAr ? "دفع بنكي مشفر وإلغاء مرن" : "Encrypted Bank Checkout"}
              </span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
