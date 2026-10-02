"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-brand-brown-dark text-[#E5DCD3] pt-16 pb-12 border-t border-brand-brown/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-14 border-b border-brand-brown/40">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-10 w-10 overflow-hidden rounded-lg shadow-sm">
                <Image
                  src="/assets/images/logo.jpg"
                  alt="GOUNOW"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold tracking-[0.25em] text-brand-terracotta">
                  {t.common.elGouna}
                </span>
                <span className="block text-base font-serif font-bold text-white tracking-wider">
                  GOUNOW LIFESTYLE
                </span>
              </div>
            </Link>
            <p className="text-xs text-[#C7BCB3] leading-relaxed max-w-sm font-light">
              {t.footer.tagline}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#E5DCD3] font-medium">
              <span>📍 {t.footer.location}</span>
            </div>
          </div>

          {/* Stays & Properties */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              {t.footer.portfolio}
            </h4>
            <ul className="space-y-2 text-xs text-[#C7BCB3]">
              <li>
                <Link
                  href="/stays?listing_type=rent"
                  className="hover:text-brand-terracotta transition"
                >
                  {t.footer.vacationVillas}
                </Link>
              </li>
              <li>
                <Link
                  href="/stays?listing_type=rent&location=fanadir-bay"
                  className="hover:text-brand-terracotta transition"
                >
                  {t.footer.fanadirBay}
                </Link>
              </li>
              <li>
                <Link
                  href="/stays?listing_type=rent&location=abu-tig-marina"
                  className="hover:text-brand-terracotta transition"
                >
                  {t.footer.marinaPenthouses}
                </Link>
              </li>
              <li>
                <Link
                  href="/stays?listing_type=sale"
                  className="hover:text-brand-terracotta transition font-semibold text-brand-terracotta"
                >
                  {t.footer.forSale}
                </Link>
              </li>
            </ul>
          </div>

          {/* Experiences */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              {t.footer.experiences}
            </h4>
            <ul className="space-y-2 text-xs text-[#C7BCB3]">
              <li>
                <Link
                  href="/experiences"
                  className="hover:text-brand-terracotta transition"
                >
                  {t.footer.yachtCharters}
                </Link>
              </li>
              <li>
                <Link
                  href="/experiences"
                  className="hover:text-brand-terracotta transition"
                >
                  {t.footer.tawilaExpeditions}
                </Link>
              </li>
              <li>
                <Link
                  href="/experiences"
                  className="hover:text-brand-terracotta transition"
                >
                  {t.footer.desertSafari}
                </Link>
              </li>
              <li>
                <Link
                  href="/experiences"
                  className="hover:text-brand-terracotta transition"
                >
                  {t.footer.kitesurfing}
                </Link>
              </li>
            </ul>
          </div>

          {/* VIP Concierge & WhatsApp */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              {t.footer.talkToTeam}
            </h4>
            <ul className="space-y-2.5 text-xs text-[#C7BCB3]">
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span className="font-semibold text-white">
                  +20 100 000 0000
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <span>concierge@gounow.com</span>
              </li>
              <li className="pt-2">
                <a
                  href="https://wa.me/201000000000?text=Hello%20GouNow,%20I%20need%20assistance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <span>💬</span>
                  <span>{t.footer.whatsappConcierge}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brand-brown-muted">
          <p>
            &copy; 2026 {t.footer.rights}
          </p>
          <div className="flex items-center gap-6 text-xs text-[#C7BCB3]">
            <Link href="/stays" className="hover:text-white transition">
              {t.footer.privacy}
            </Link>
            <Link href="/stays" className="hover:text-white transition">
              {t.footer.terms}
            </Link>
            <Link href="/stays" className="hover:text-white transition">
              {t.footer.conditions}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
