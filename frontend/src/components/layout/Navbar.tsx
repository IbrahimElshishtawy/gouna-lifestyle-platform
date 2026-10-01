"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Top Announcement / Concierge Bar */}
      <div className="bg-brand-brown-dark text-[#E5DCD3] text-xs py-2 px-6 lg:px-12 flex items-center justify-between border-b border-brand-brown/40">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
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
          <span className="text-brand-brown-muted/60">|</span>
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

      {/* Main Navigation Bar */}
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-brand-border/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-lg shadow-xs group-hover:scale-105 transition-transform duration-300">
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
              <span className="block text-base font-serif font-bold text-brand-brown tracking-wider">
                GOUNOW
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-brown">
            <Link
              href="/stays?listing_type=rent"
              className={`hover:text-brand-terracotta transition ${
                pathname?.startsWith("/stays")
                  ? "text-brand-terracotta font-semibold"
                  : ""
              }`}
            >
              Stays
            </Link>
            <Link
              href="/stays?listing_type=sale"
              className="hover:text-brand-terracotta transition"
            >
              Real Estate
            </Link>
            <Link
              href="/experiences"
              className={`hover:text-brand-terracotta transition ${
                pathname?.startsWith("/experiences")
                  ? "text-brand-terracotta font-semibold"
                  : ""
              }`}
            >
              Experiences
            </Link>
            <Link href="/#events" className="hover:text-brand-terracotta transition">
              What&apos;s On
            </Link>
            <Link
              href="/#concierge"
              className="hover:text-brand-terracotta transition"
            >
              Concierge
            </Link>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/stays?listing_type=rent"
              className="px-5 py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition shadow-sm hover:shadow-md"
            >
              Book a Stay
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-brand-brown hover:text-brand-terracotta rounded-lg focus:outline-none cursor-pointer"
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
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-brand-border px-6 py-6 space-y-4 shadow-xl transition ease-out duration-200">
            <Link
              href="/stays?listing_type=rent"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-brand-brown hover:text-brand-terracotta py-2"
            >
              Stays &amp; Luxury Villas
            </Link>
            <Link
              href="/stays?listing_type=sale"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-brand-brown hover:text-brand-terracotta py-2"
            >
              Properties For Sale
            </Link>
            <Link
              href="/experiences"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-brand-brown hover:text-brand-terracotta py-2"
            >
              Experiences &amp; Adventures
            </Link>
            <Link
              href="/#events"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-brand-brown hover:text-brand-terracotta py-2"
            >
              What&apos;s On / Events
            </Link>
            <Link
              href="/#concierge"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-brand-brown hover:text-brand-terracotta py-2"
            >
              Contact Concierge
            </Link>
            <div className="pt-4 border-t border-brand-border flex items-center justify-between">
              <Link
                href="/stays?listing_type=rent"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 bg-brand-terracotta text-white rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Book a Stay Now
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
