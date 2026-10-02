"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
      {/* Top Announcement / Concierge Ribbon */}
      <div
        className={`transition-all duration-500 text-xs px-6 lg:px-12 flex items-center justify-between border-b ${
          isScrolled
            ? "max-h-0 opacity-0 overflow-hidden py-0 border-transparent pointer-events-none"
            : "max-h-10 opacity-100 py-2 bg-black/40 backdrop-blur-md text-[#E5DCD3] border-white/10"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium tracking-wide">
            El Gouna Concierge 24/7 Service
          </span>
        </div>
        <div className="flex items-center gap-5 text-[11px]">
          <a
            href="https://wa.me/201000000000?text=Hello%20GouNow,%20I%20need%20assistance"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition flex items-center gap-1 font-medium"
          >
            <span>💬 WhatsApp Concierge</span>
          </a>
          <span className="text-white/30">|</span>
          <a
            href="#ar"
            onClick={(e) => {
              e.preventDefault();
              document.documentElement.dir =
                document.documentElement.dir === "rtl" ? "ltr" : "rtl";
            }}
            className="hover:text-white font-semibold transition"
          >
            العربية
          </a>
        </div>
      </div>

      {/* Main Transparent / Luxury Glass Header */}
      <header
        className={`transition-all duration-500 ${
          isScrolled
            ? "bg-[#1C1412]/92 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3"
            : "bg-gradient-to-b from-black/85 via-black/40 to-transparent border-b border-white/5 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl shadow-md border border-white/20 group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/assets/images/logo.jpg"
                alt="GOUNOW"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="text-left">
              <span className="block text-[10px] uppercase font-bold tracking-[0.25em] text-brand-terracotta">
                El Gouna
              </span>
              <span className="block text-base font-serif font-bold text-white tracking-wider">
                GOUNOW
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/90">
            <Link
              href="/stays?listing_type=rent"
              className={`hover:text-brand-terracotta transition drop-shadow-sm ${
                pathname?.startsWith("/stays")
                  ? "text-brand-terracotta font-semibold"
                  : ""
              }`}
            >
              Stays
            </Link>
            <Link
              href="/stays?listing_type=sale"
              className="hover:text-brand-terracotta transition drop-shadow-sm"
            >
              Real Estate
            </Link>
            <Link
              href="/experiences"
              className={`hover:text-brand-terracotta transition drop-shadow-sm ${
                pathname?.startsWith("/experiences")
                  ? "text-brand-terracotta font-semibold"
                  : ""
              }`}
            >
              Experiences
            </Link>
            <Link
              href="/#events"
              className="hover:text-brand-terracotta transition drop-shadow-sm"
            >
              What&apos;s On
            </Link>
            <Link
              href="/#concierge"
              className="hover:text-brand-terracotta transition drop-shadow-sm"
            >
              Concierge
            </Link>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/stays?listing_type=rent"
              className="px-5 py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition shadow-lg hover:shadow-brand-terracotta/30 border border-white/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              Book a Stay
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:text-brand-terracotta rounded-lg focus:outline-none cursor-pointer"
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

        {/* Mobile Dropdown Menu with Frosted Glass */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 px-6 py-6 bg-[#1C1412]/98 backdrop-blur-2xl border-t border-white/10 shadow-2xl flex flex-col gap-4 text-white animate-fade-in">
            <Link
              href="/stays?listing_type=rent"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold hover:text-brand-terracotta py-1"
            >
              Stays &amp; Vacation Rentals
            </Link>
            <Link
              href="/stays?listing_type=sale"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold hover:text-brand-terracotta py-1"
            >
              Real Estate For Sale
            </Link>
            <Link
              href="/experiences"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold hover:text-brand-terracotta py-1"
            >
              Curated Experiences &amp; Yachts
            </Link>
            <Link
              href="/#events"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold hover:text-brand-terracotta py-1"
            >
              What&apos;s On This Season
            </Link>
            <Link
              href="/#concierge"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold hover:text-brand-terracotta py-1"
            >
              24/7 VIP Concierge
            </Link>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <Link
                href="/stays?listing_type=rent"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 bg-brand-terracotta text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md"
              >
                Book a Stay Now
              </Link>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
