"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { locale, toggleLocale, t } = useLanguage();

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

  return (
    <div className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Top Announcement / Concierge Ribbon */}
      <div
        className={`transition-all duration-300 text-xs px-4 sm:px-6 lg:px-12 flex items-center justify-between border-b ${
          isScrolled
            ? "max-h-0 opacity-0 overflow-hidden py-0 border-transparent pointer-events-none"
            : "max-h-10 opacity-100 py-2 bg-black/40 backdrop-blur-md text-[#E5DCD3] border-white/10"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium tracking-wide">
            {t.nav.ribbonText}
          </span>
        </div>
        <div className="flex items-center gap-4 sm:gap-5 text-[11px]">
          <a
            href="https://wa.me/201000000000?text=Hello%20GouNow,%20I%20need%20assistance"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition flex items-center gap-1 font-medium"
          >
            <span>💬</span>
            <span className="hidden sm:inline">{t.common.whatsAppConcierge}</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
          <span className="text-white/30">|</span>
          <button
            type="button"
            onClick={toggleLocale}
            className="hover:text-white font-bold transition flex items-center gap-1 cursor-pointer bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-full"
            aria-label="Switch Language"
          >
            <span>🌐</span>
            <span>{t.common.switchLanguage}</span>
          </button>
        </div>
      </div>

      {/* Main Adaptive Header (Transparent at Top, Crisp Frosted White on Scroll) */}
      <header
        className={`transition-all duration-300 w-full ${
          isScrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-brand-border/90 shadow-md py-3.5"
            : "bg-gradient-to-b from-black/85 via-black/40 to-transparent border-b border-white/5 py-4"
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
            <div className="text-left rtl:text-right">
              <span className="block text-[10px] uppercase font-bold tracking-[0.25em] text-brand-terracotta">
                {t.common.elGouna}
              </span>
              <span
                className={`block text-base font-serif font-bold tracking-wider transition-colors duration-300 ${
                  isScrolled ? "text-brand-brown" : "text-white"
                }`}
              >
                {t.common.brandName}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (White at Top, Dark Brown on Scroll for 100% Readability) */}
          <nav
            className={`hidden md:flex items-center gap-8 text-sm font-semibold transition-colors duration-300 ${
              isScrolled ? "text-brand-brown" : "text-white/90"
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

          {/* Actions Button */}
          <div className="hidden md:flex items-center gap-4">
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
                isScrolled
                  ? "text-brand-brown hover:text-brand-terracotta"
                  : "text-white hover:text-brand-terracotta"
              }`}
              aria-label="Toggle Menu"
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

        {/* Mobile Dropdown Menu with Ultra-Luxury Styling */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden mx-3 mt-3 p-5 rounded-2xl border shadow-2xl flex flex-col gap-3 animate-fade-in ${
              isScrolled
                ? "bg-white/98 text-brand-brown border-brand-border/90 backdrop-blur-xl"
                : "bg-[#1C1412]/98 text-white border-white/15 backdrop-blur-2xl"
            }`}
          >
            <Link
              href="/stays?listing_type=rent"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-black/5 transition-colors font-medium text-sm"
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
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-black/5 transition-colors font-medium text-sm"
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
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-black/5 transition-colors font-medium text-sm"
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
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-black/5 transition-colors font-medium text-sm"
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
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-black/5 transition-colors font-medium text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🛎️</span>
                <span>{t.nav.concierge}</span>
              </div>
              <span className="text-xs text-brand-terracotta rtl:rotate-180">&rarr;</span>
            </Link>

            {/* Quick Contact & Action Buttons */}
            <div className="pt-3 mt-1 border-t border-brand-border/40 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  toggleLocale();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-brand-border/80 flex items-center justify-center gap-2 hover:bg-black/5 transition-colors"
              >
                <span>🌐</span>
                <span>{t.common.switchLanguage === "العربية" ? "التبديل إلى العربية" : "Switch to English"}</span>
              </button>

              <a
                href="https://wa.me/201000000000?text=Hello%20GouNow,%20I%20need%20assistance"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center gap-2"
              >
                <span>💬</span>
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
