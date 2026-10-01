import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-brand-sand-card border-t border-brand-border mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-14 border-b border-brand-border">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                <Image
                  src="/assets/images/logo.jpg"
                  alt="GOUNOW"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold tracking-[0.25em] text-brand-terracotta">
                  El Gouna
                </span>
                <span className="block text-base font-serif font-bold text-brand-brown tracking-wider">
                  GOUNOW LIFESTYLE
                </span>
              </div>
            </Link>
            <p className="text-xs text-brand-brown-muted leading-relaxed max-w-sm">
              The premier destination for bespoke luxury vacation rentals,
              exclusive real estate investments, yacht charters, and curated
              desert adventures in El Gouna, Red Sea.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-brand-brown font-medium">
              <span>📍 Abu Tig Marina &amp; Downtown, El Gouna</span>
            </div>
          </div>

          {/* Stays & Properties */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-brown">
              Explore Stays
            </h4>
            <ul className="space-y-2 text-xs text-brand-brown-muted">
              <li>
                <Link
                  href="/stays?listing_type=rent"
                  className="hover:text-brand-terracotta transition"
                >
                  All Vacation Rentals
                </Link>
              </li>
              <li>
                <Link
                  href="/stays?listing_type=rent&category=luxury-villas"
                  className="hover:text-brand-terracotta transition"
                >
                  Private Pool Villas
                </Link>
              </li>
              <li>
                <Link
                  href="/stays?listing_type=rent&location=abu-tig-marina"
                  className="hover:text-brand-terracotta transition"
                >
                  Marina Waterfront
                </Link>
              </li>
              <li>
                <Link
                  href="/stays?listing_type=sale"
                  className="hover:text-brand-terracotta transition font-semibold text-brand-terracotta"
                >
                  Properties For Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Experiences */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-brown">
              Experiences
            </h4>
            <ul className="space-y-2 text-xs text-brand-brown-muted">
              <li>
                <Link
                  href="/experiences?category=boat-trips"
                  className="hover:text-brand-terracotta transition"
                >
                  Private Yacht Charters
                </Link>
              </li>
              <li>
                <Link
                  href="/experiences?category=safari"
                  className="hover:text-brand-terracotta transition"
                >
                  Desert Quad Safari
                </Link>
              </li>
              <li>
                <Link
                  href="/experiences"
                  className="hover:text-brand-terracotta transition"
                >
                  Kite &amp; Water Sports
                </Link>
              </li>
              <li>
                <Link
                  href="/experiences"
                  className="hover:text-brand-terracotta transition"
                >
                  Lagoon Private Dining
                </Link>
              </li>
            </ul>
          </div>

          {/* VIP Concierge */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-brown">
              VIP Concierge
            </h4>
            <ul className="space-y-2 text-xs text-brand-brown-muted">
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span className="font-semibold text-brand-brown">
                  +20 100 000 0000
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span>💬</span>
                <a
                  href="https://wa.me/201000000000?text=Hello%20GouNow,%20I%20need%20assistance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-terracotta transition font-medium"
                >
                  Chat on WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <span>concierge@gounow.com</span>
              </li>
              <li className="flex items-center gap-2 pt-1 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Open Daily: 24/7 Desk</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brand-brown-muted">
          <p>
            &copy; 2026 GOUNOW Lifestyle &amp; Properties. El Gouna, Red Sea,
            Egypt. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs">
            <Link href="/stays" className="hover:text-brand-brown transition">
              Privacy Policy
            </Link>
            <Link href="/stays" className="hover:text-brand-brown transition">
              Terms of Service
            </Link>
            <Link href="/stays" className="hover:text-brand-brown transition">
              Booking Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
