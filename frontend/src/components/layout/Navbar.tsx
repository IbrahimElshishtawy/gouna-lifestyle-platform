"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/routing";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { locale, setLocale, toggleLocale, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        window.scrollY ||
        0;
      setIsScrolled(scrollY > 25);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHomePage = pathname === "/" || pathname === "";
  // Transparent only on the homepage hero before scroll
  const isTransparent = isHomePage && !isScrolled;

  return (
    <div className="fixed top-0 start-0 end-0 z-50 transition-all duration-300">
      {/* Top Announcement / Concierge Ribbon */}
      <div
        className={`transition-all duration-300 text-xs px-4 sm:px-6 lg:px-12 flex items-center justify-between border-b ${
          isScrolled
            ? "max-h-0 opacity-0 overflow-hidden py-0 border-transparent pointer-events-none"
            : isTransparent
            ? "max-h-10 opacity-100 py-2 bg-black/40 backdrop-blur-md text-[#E5DCD3] border-white/10"
            : "max-h-10 opacity-100 py-2 bg-[#1C1412] text-[#E5DCD3] border-white/10"
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="font-medium tracking-wide truncate">
            {t.nav.ribbonText}
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 text-[11px] shrink-0">
          <a
            href="https://wa.me/201000000000?text=Hello%20GouNow,%20I%20need%20assistance"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition flex items-center gap-1 font-medium"
          >
            <span className="hidden sm:inline">{t.common.whatsAppConcierge}</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
          <span className="text-white/30">|</span>

          {/* Ribbon Bilingual Switcher Pill */}
          <div className="flex items-center bg-white/10 backdrop-blur-md p-0.5 rounded-full border border-white/15 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                locale === "en"
                  ? "bg-white text-brand-brown shadow-xs"
                  : "text-white/80 hover:text-white"
              }`}
              aria-label="Switch to English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale("ar")}
              className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                locale === "ar"
                  ? "bg-brand-terracotta text-white shadow-xs"
                  : "text-white/80 hover:text-white"
              }`}
              aria-label="التبديل إلى العربية"
            >
              عربي
            </button>
          </div>
        </div>
      </div>

      {/* Main Adaptive Header (Transparent on Home Hero, Crisp Frosted White otherwise) */}
      <header
        className={`transition-all duration-300 w-full ${
          isTransparent
            ? "bg-gradient-to-b from-black/85 via-black/40 to-transparent border-b border-white/5 py-4"
            : "bg-white/95 backdrop-blur-xl border-b border-brand-border/90 shadow-xs py-3.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 via-brand-terracotta/25 to-brand-brown/40 border border-brand-terracotta/40 shadow-md group-hover:scale-105 transition-all duration-300 p-1.5 backdrop-blur-md">
              <Image
                src="/assets/images/official-elgouna-icon.png"
                alt="El Gouna"
                width={26}
                height={26}
                className="object-contain drop-shadow"
                priority
              />
            </div>
            <div className="text-start">
              <span className="block text-[10px] uppercase font-bold tracking-[0.25em] text-brand-terracotta">
                {t.common.elGouna}
              </span>
              <span
                className={`block text-base font-serif font-bold tracking-wider transition-colors duration-300 ${
                  isTransparent ? "text-white" : "text-brand-brown"
                }`}
              >
                {t.common.brandName}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav
            className={`hidden md:flex items-center gap-8 text-sm font-semibold transition-colors duration-300 ${
              isTransparent ? "text-white/90" : "text-brand-brown"
            }`}
          >
            <Link
              href="/stays?listing_type=rent"
              className={`hover:text-brand-terracotta transition-colors ${
                pathname?.startsWith("/stays")
                  ? "text-brand-terracotta font-bold"
                  : ""
              }`}
            >
              {t.nav.stays}
            </Link>
            <Link
              href="/stays?listing_type=sale"
              className="hover:text-brand-terracotta transition-colors"
            >
              {t.nav.realEstate}
            </Link>
            <Link
              href="/experiences"
              className={`hover:text-brand-terracotta transition-colors ${
                pathname?.startsWith("/experiences")
                  ? "text-brand-terracotta font-bold"
                  : ""
              }`}
            >
              {t.nav.experiences}
            </Link>
            <Link
              href="/#events"
              className="hover:text-brand-terracotta transition-colors"
            >
              {t.nav.whatsOn}
            </Link>
            <Link
              href="/#concierge"
              className="hover:text-brand-terracotta transition-colors"
            >
              {t.nav.concierge}
            </Link>
          </nav>

          {/* Desktop Actions & Language Toggle */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {/* Header Language Switcher */}
            <div
              className={`flex items-center p-1 rounded-xl border text-xs font-bold transition-all ${
                isTransparent
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-brand-sand-light/60 border-brand-border text-brand-brown"
              }`}
            >
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  locale === "en"
                    ? isTransparent
                      ? "bg-white text-brand-brown shadow-xs"
                      : "bg-brand-terracotta text-white shadow-xs"
                    : isTransparent
                    ? "text-white/80 hover:text-white"
                    : "text-brand-brown-muted hover:text-brand-brown"
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLocale("ar")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  locale === "ar"
                    ? isTransparent
                      ? "bg-brand-terracotta text-white shadow-xs"
                      : "bg-brand-terracotta text-white shadow-xs"
                    : isTransparent
                    ? "text-white/80 hover:text-white"
                    : "text-brand-brown-muted hover:text-brand-brown"
                }`}
                aria-label="التبديل إلى العربية"
              >
                عربي
              </button>
            </div>

            <Link
              href="/stays?listing_type=rent"
              className="px-5 py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              {t.common.bookAStay}
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg focus:outline-none cursor-pointer transition-colors ${
                isTransparent
                  ? "text-white hover:text-brand-terracotta"
                  : "text-brand-brown hover:text-brand-terracotta"
              }`}
              aria-label={t.nav.toggleMenu}
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden mx-3 mt-3 p-5 rounded-2xl border shadow-2xl flex flex-col gap-3 animate-fade-in ${
              isTransparent
                ? "bg-[#1C1412]/98 text-white border-white/15 backdrop-blur-2xl"
                : "bg-white/98 text-brand-brown border-brand-border/90 backdrop-blur-xl"
            }`}
          >
            <Link
              href="/stays?listing_type=rent"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors font-medium text-sm ${
                isTransparent ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-brand-brown"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🏡</span>
                <span>{t.nav.stays}</span>
              </div>
              <span className="text-xs text-brand-terracotta rtl:rotate-180">&rarr;</span>
            </Link>

            <Link
              href="/stays?listing_type=sale"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors font-medium text-sm ${
                isTransparent ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-brand-brown"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🏛️</span>
                <span>{t.nav.realEstate}</span>
              </div>
              <span className="text-xs text-brand-terracotta rtl:rotate-180">&rarr;</span>
            </Link>

            <Link
              href="/experiences"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors font-medium text-sm ${
                isTransparent ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-brand-brown"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">⛵</span>
                <span>{t.nav.experiences}</span>
              </div>
              <span className="text-xs text-brand-terracotta rtl:rotate-180">&rarr;</span>
            </Link>

            <Link
              href="/#events"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors font-medium text-sm ${
                isTransparent ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-brand-brown"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">📅</span>
                <span>{t.nav.whatsOn}</span>
              </div>
              <span className="text-xs text-brand-terracotta rtl:rotate-180">&rarr;</span>
            </Link>

            <Link
              href="/#concierge"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors font-medium text-sm ${
                isTransparent ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-brand-brown"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🛎️</span>
                <span>{t.nav.concierge}</span>
              </div>
              <span className="text-xs text-brand-terracotta rtl:rotate-180">&rarr;</span>
            </Link>

            {/* Quick Contact & Action Buttons */}
            <div className={`pt-3 mt-1 border-t flex flex-col gap-2.5 ${isTransparent ? "border-white/15" : "border-brand-border/40"}`}>
              {/* Mobile Language Switcher Row */}
              <div className="flex items-center p-1 rounded-xl border border-brand-border/60 bg-brand-sand-light/50">
                <button
                  type="button"
                  onClick={() => {
                    setLocale("en");
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition ${
                    locale === "en"
                      ? "bg-brand-terracotta text-white shadow-xs"
                      : "text-brand-brown hover:text-brand-terracotta"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLocale("ar");
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition ${
                    locale === "ar"
                      ? "bg-brand-terracotta text-white shadow-xs"
                      : "text-brand-brown hover:text-brand-terracotta"
                  }`}
                >
                  العربية
                </button>
              </div>

              <a
                href="https://wa.me/201000000000?text=Hello%20GouNow,%20I%20need%20assistance"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center gap-2"
              >
                <span>{t.common.whatsAppConcierge}</span>
              </a>

              <Link
                href="/stays?listing_type=rent"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-colors"
              >
                {t.common.bookAStay}
              </Link>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
