"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { usePathname } from "@/i18n/routing";
import { useLanguage } from "@/context/LanguageContext";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { t, locale, isRtl } = useLanguage();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    bookings: false,
    properties: true,
    pricing: false,
    experiences: false,
    customers: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (path: string) => pathname === path;

  const mobileTranslateClass = isRtl
    ? (open ? "translate-x-0" : "translate-x-full")
    : (open ? "translate-x-0" : "-translate-x-full");

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 start-0 z-50 w-72 bg-white border-e border-brand-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${mobileTranslateClass}`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 border-b border-brand-border flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="h-10 w-10 relative rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500/15 to-brand-terracotta/20 border border-brand-terracotta/30 shrink-0 p-1.5 shadow-sm">
              <Image
                src="/assets/images/official-elgouna-icon.png"
                alt="El Gouna"
                width={26}
                height={26}
                className="object-contain drop-shadow"
              />
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold tracking-[0.25em] text-brand-terracotta">
                {locale === "ar" ? "الجونة" : "El Gouna"}
              </span>
              <span className="block text-sm font-serif font-bold text-brand-brown tracking-wider">
                {locale === "ar" ? "إدارة جوناو" : "GOUNOW ADMIN"}
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-2 text-brand-brown hover:text-brand-terracotta cursor-pointer"
            aria-label={locale === "ar" ? "إغلاق القائمة الجانبية" : "Close Sidebar"}
          >
            ✕
          </button>
        </div>

        {/* Navigation Items (Scrollable) */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 text-sm font-medium gounow-scrollbar">
          {/* 1. Dashboard */}
          <Link
            href="/admin"
            className={`flex items-center px-3 py-2.5 rounded-xl transition-all ${
              isActive("/admin")
                ? "bg-brand-terracotta text-white shadow-xs font-semibold"
                : "text-brand-brown hover:bg-brand-sand/50"
            }`}
          >
            <span className="me-3">📊</span>
            <span>{t.admin.dashboard}</span>
          </Link>

          {/* 2. Bookings */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection("bookings")}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all text-start cursor-pointer"
            >
              <div className="flex items-center">
                <span className="me-3">📅</span>
                <span>{t.admin.bookings}</span>
              </div>
              <span
                className={`text-xs text-brand-brown-muted transition-transform rtl:rotate-180 ${
                  openSections.bookings ? "rotate-90 rtl:rotate-90" : ""
                }`}
              >
                ▶
              </span>
            </button>
            {openSections.bookings && (
              <div className="ps-8 border-s-2 border-brand-sand mt-1 space-y-1">
                <Link
                  href="/admin/bookings"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {locale === "ar" ? "جميع الحجوزات" : "All Bookings"}
                </Link>
                <Link
                  href="/admin/bookings?status=pending"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {locale === "ar" ? "حجوزات قيد الانتظار" : "Pending Bookings"}
                </Link>
                <Link
                  href="/admin/bookings?status=confirmed"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {locale === "ar" ? "حجوزات مؤكدة" : "Confirmed"}
                </Link>
              </div>
            )}
          </div>

          {/* 3. Properties */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection("properties")}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all text-start cursor-pointer"
            >
              <div className="flex items-center">
                <span className="me-3">🏡</span>
                <span>{t.admin.properties}</span>
              </div>
              <span
                className={`text-xs text-brand-brown-muted transition-transform rtl:rotate-180 ${
                  openSections.properties ? "rotate-90 rtl:rotate-90" : ""
                }`}
              >
                ▶
              </span>
            </button>
            {openSections.properties && (
              <div className="ps-8 border-s-2 border-brand-sand mt-1 space-y-1">
                <Link
                  href="/admin/properties"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {locale === "ar" ? "جميع العقارات" : "All Properties"}
                </Link>
                <Link
                  href="/admin/properties?type=rent"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {locale === "ar" ? "للإيجار (إقامات)" : "For Rent (Stays)"}
                </Link>
                <Link
                  href="/admin/properties?type=sale"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {locale === "ar" ? "للبيع" : "For Sale"}
                </Link>
                <Link
                  href="/admin/properties/create"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-terracotta font-semibold"
                >
                  {locale === "ar" ? "+ إضافة عقار" : "+ Add Property"}
                </Link>
              </div>
            )}
          </div>

          {/* 4. Pricing Engine */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection("pricing")}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all text-start cursor-pointer"
            >
              <div className="flex items-center">
                <span className="me-3">🏷️</span>
                <span>{locale === "ar" ? "محرك الأسعار" : "Pricing Engine"}</span>
              </div>
              <span
                className={`text-xs text-brand-brown-muted transition-transform rtl:rotate-180 ${
                  openSections.pricing ? "rotate-90 rtl:rotate-90" : ""
                }`}
              >
                ▶
              </span>
            </button>
            {openSections.pricing && (
              <div className="ps-8 border-s-2 border-brand-sand mt-1 space-y-1">
                <Link
                  href="/admin/pricing"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {locale === "ar" ? "الأسعار الأساسية والقواعد" : "Base Prices & Rules"}
                </Link>
                <Link
                  href="/admin/pricing#seasons"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {locale === "ar" ? "قواعد المواسم" : "Seasonal Rules"}
                </Link>
                <Link
                  href="/admin/pricing#discounts"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {locale === "ar" ? "الخصومات والقسائم" : "Discounts & Codes"}
                </Link>
              </div>
            )}
          </div>

          {/* 5. Experiences */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection("experiences")}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all text-start cursor-pointer"
            >
              <div className="flex items-center">
                <span className="me-3">⛵</span>
                <span>{t.admin.experiencesNav}</span>
              </div>
              <span
                className={`text-xs text-brand-brown-muted transition-transform rtl:rotate-180 ${
                  openSections.experiences ? "rotate-90 rtl:rotate-90" : ""
                }`}
              >
                ▶
              </span>
            </button>
            {openSections.experiences && (
              <div className="ps-8 border-s-2 border-brand-sand mt-1 space-y-1">
                <Link
                  href="/admin/experiences"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {locale === "ar" ? "جميع التجارب" : "All Experiences"}
                </Link>
                <Link
                  href="/admin/experiences?category=boat-trips"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {t.experiencesPage.boatTrips}
                </Link>
                <Link
                  href="/admin/experiences?category=safari"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {t.experiencesPage.safari}
                </Link>
              </div>
            )}
          </div>

          {/* 6. Customers & Leads */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection("customers")}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all text-start cursor-pointer"
            >
              <div className="flex items-center">
                <span className="me-3">👥</span>
                <span>{t.admin.customers}</span>
              </div>
              <span
                className={`text-xs text-brand-brown-muted transition-transform rtl:rotate-180 ${
                  openSections.customers ? "rotate-90 rtl:rotate-90" : ""
                }`}
              >
                ▶
              </span>
            </button>
            {openSections.customers && (
              <div className="ps-8 border-s-2 border-brand-sand mt-1 space-y-1">
                <Link
                  href="/admin/customers"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {locale === "ar" ? "ملفات العملاء" : "Customer Profiles"}
                </Link>
                <Link
                  href="/admin/customers#leads"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {locale === "ar" ? "طلبات الشراء والاستفسارات" : "Sale Leads & Inquiries"}
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-brand-border text-xs text-brand-brown-muted flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-brand-brown">{locale === "ar" ? "مزامنة لحظية" : "Live Sync"}</span>
          </div>
          <span className="font-mono text-[10px]" dir="ltr">v2.6-next</span>
        </div>
      </aside>
    </>
  );
}

