"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function Footer() {
  const { t, locale } = useLanguage();
  const { settings, locations, experienceCategories, whatsappDigits, buildWhatsAppUrl } = useSiteSettings();
  const isAr = locale === "ar";

  return (
    <footer className="bg-brand-brown-dark text-[#E5DCD3] pt-16 pb-12 border-t border-brand-brown/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-14 border-b border-brand-brown/40">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-11 w-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#A55332]/25 via-[#DBC0A0]/20 to-[#5B4635]/60 border border-[#A55332]/40 shadow-sm group-hover:scale-105 transition-all duration-300 p-1.5 backdrop-blur-md">
                <Image
                  src="/assets/images/Gounow Main signature.png"
                  alt="GouNow"
                  width={34}
                  height={34}
                  className="object-contain drop-shadow"
                />
              </div>
              <div className="text-start">
                <span className="block text-[10px] uppercase font-bold tracking-[0.25em] text-brand-terracotta">
                  {t.common.elGouna}
                </span>
                <span className="block text-lg font-serif font-bold text-white tracking-wider">
                  GOUNOW
                </span>
              </div>
            </Link>

            <p className="text-xs text-[#DBC0A0] font-serif italic text-sm">
              &ldquo;Stay. Explore. Belong.&rdquo;
            </p>

            <p className="text-xs text-[#C7BCB3] leading-relaxed max-w-sm font-light">
              {t.footer.tagline}
            </p>

            {/* Official El Gouna Destination Partnership */}
            <div className="pt-2 flex items-center gap-4">
              <Image
                src="/assets/images/official-elgouna-logo-white.webp"
                alt="Official Destination Partner - El Gouna"
                width={110}
                height={34}
                className="object-contain h-7 w-auto opacity-75 hover:opacity-100 transition-opacity"
              />
              <span className="text-[11px] text-[#E5DCD3]/70 font-mono">
                EL GOUNA, RED SEA
              </span>
            </div>
          </div>

          {/* Stays & Properties (Backend Locations) */}
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
              {locations.slice(0, 3).map((loc) => (
                <li key={loc.id}>
                  <Link
                    href={`/stays?listing_type=rent&location=${loc.slug}`}
                    className="hover:text-brand-terracotta transition"
                  >
                    {isAr && loc.name_ar ? loc.name_ar : loc.name_en}
                  </Link>
                </li>
              ))}
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

          {/* Experiences (Backend Categories) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              {t.footer.experiences}
            </h4>
            <ul className="space-y-2 text-xs text-[#C7BCB3]">
              {experienceCategories.slice(0, 4).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/experiences?category=${cat.slug}`}
                    className="hover:text-brand-terracotta transition"
                  >
                    {isAr && cat.name_ar ? cat.name_ar : cat.name_en}
                  </Link>
                </li>
              ))}
              {experienceCategories.length === 0 && (
                <li>
                  <Link
                    href="/experiences"
                    className="hover:text-brand-terracotta transition"
                  >
                    {t.footer.experiences}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* VIP Concierge & WhatsApp */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              {t.footer.talkToTeam}
            </h4>
            <ul className="space-y-2.5 text-xs text-[#C7BCB3]">
              {settings?.phone && (
                <li className="flex items-center gap-2">
                  <span>📞</span>
                  <span className="font-semibold text-white">
                    {settings.phone}
                  </span>
                </li>
              )}
              {settings?.email && (
                <li className="flex items-center gap-2">
                  <span>✉️</span>
                  <span>{settings.email}</span>
                </li>
              )}
              {whatsappDigits && (
                <li className="pt-2">
                  <a
                    href={buildWhatsAppUrl("Hello GouNow, I need assistance")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
                  >
                    <span>💬</span>
                    <span>{t.footer.whatsappConcierge}</span>
                  </a>
                </li>
              )}
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
            <span className="text-white/20">|</span>
            <Link
              href="/admin/login"
              className="hover:text-brand-terracotta transition opacity-70 hover:opacity-100 flex items-center gap-1"
            >
              <span>🔐</span>
              <span>{t.admin.management}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
