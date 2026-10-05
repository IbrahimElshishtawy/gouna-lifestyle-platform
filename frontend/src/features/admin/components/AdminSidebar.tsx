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
  const isAr = locale === "ar";

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    bookings: false,
    properties: true,
    pricing: false,
    experiences: false,
    events: false,
    customers: false,
    concierge: false,
    users: true, // Open by default for Super Admin visibility
    finances: false,
    settings: false,
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
        <div className="h-20 px-6 border-b border-brand-border flex items-center justify-between shrink-0">
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
              <div className="flex items-center gap-1.5">
                <span className="block text-[10px] uppercase font-bold tracking-[0.2em] text-brand-terracotta">
                  {isAr ? "الجونة" : "El Gouna"}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-terracotta/10 text-brand-terracotta font-bold">
                  {isAr ? "سوبر أدمن" : "Super Admin"}
                </span>
              </div>
              <span className="block text-sm font-serif font-bold text-brand-brown tracking-wider">
                {isAr ? "إدارة جوناو التنفيذية" : "GOUNOW COMMAND"}
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-2 text-brand-brown hover:text-brand-terracotta cursor-pointer"
            aria-label={isAr ? "إغلاق القائمة الجانبية" : "Close Sidebar"}
          >
            ✕
          </button>
        </div>

        {/* Navigation Items (Scrollable) */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 text-sm font-medium gounow-scrollbar">
          {/* Section: Core Management */}
          <div className="px-3 pb-1 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted/70">
              {isAr ? "إدارة العمليات الرئيسية" : "CORE OPERATIONS"}
            </span>
          </div>

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
                  {isAr ? "جميع الحجوزات" : "All Bookings"}
                </Link>
                <Link
                  href="/admin/bookings?status=pending"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {isAr ? "حجوزات قيد الانتظار" : "Pending Bookings"}
                </Link>
                <Link
                  href="/admin/bookings?status=confirmed"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {isAr ? "حجوزات مؤكدة" : "Confirmed"}
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
                  {isAr ? "جميع العقارات" : "All Properties"}
                </Link>
                <Link
                  href="/admin/properties?type=rent"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {isAr ? "للإيجار (إقامات)" : "For Rent (Stays)"}
                </Link>
                <Link
                  href="/admin/properties?type=sale"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {isAr ? "للبيع" : "For Sale"}
                </Link>
                <Link
                  href="/admin/properties/create"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-terracotta font-semibold"
                >
                  {isAr ? "+ إضافة عقار" : "+ Add Property"}
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
                <span>{isAr ? "محرك الأسعار" : "Pricing Engine"}</span>
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
                  {isAr ? "الأسعار الأساسية والقواعد" : "Base Prices & Rules"}
                </Link>
                <Link
                  href="/admin/pricing#seasons"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {isAr ? "قواعد المواسم" : "Seasonal Rules"}
                </Link>
              </div>
            )}
          </div>

          {/* 5. Experiences & Yacht Charters */}
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
                  {isAr ? "جميع التجارب واليخوت" : "All Experiences & Charters"}
                </Link>
              </div>
            )}
          </div>

          {/* 6. Events & Nightlife */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection("events")}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all text-start cursor-pointer"
            >
              <div className="flex items-center">
                <span className="me-3">🎉</span>
                <span>{isAr ? "الفعاليات والحفلات" : "Events & Nightlife"}</span>
              </div>
              <span
                className={`text-xs text-brand-brown-muted transition-transform rtl:rotate-180 ${
                  openSections.events ? "rotate-90 rtl:rotate-90" : ""
                }`}
              >
                ▶
              </span>
            </button>
            {openSections.events && (
              <div className="ps-8 border-s-2 border-brand-sand mt-1 space-y-1">
                <Link
                  href="/admin/events"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {isAr ? "جميع الفعاليات والتذاكر" : "All Events & Tickets"}
                </Link>
              </div>
            )}
          </div>

          {/* Section: Super Admin & High-Tier Command */}
          <div className="px-3 pb-1 pt-4 border-t border-brand-border/60 mt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-terracotta flex items-center gap-1.5">
              <span>👑</span>
              <span>{isAr ? "صلاحيات السوبر أدمن" : "SUPER ADMIN SUITE"}</span>
            </span>
          </div>

          {/* 7. Super Admin: Users & Staff Management */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection("users")}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all text-start cursor-pointer"
            >
              <div className="flex items-center">
                <span className="me-3">👥</span>
                <span className="font-semibold">{isAr ? "المشرفون والصلاحيات" : "Staff & Roles"}</span>
              </div>
              <span
                className={`text-xs text-brand-brown-muted transition-transform rtl:rotate-180 ${
                  openSections.users ? "rotate-90 rtl:rotate-90" : ""
                }`}
              >
                ▶
              </span>
            </button>
            {openSections.users && (
              <div className="ps-8 border-s-2 border-brand-sand mt-1 space-y-1">
                <Link
                  href="/admin/users"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {isAr ? "فريق الإدارة والمشرفين" : "Admin Staff & Roles"}
                </Link>
              </div>
            )}
          </div>

          {/* 8. VIP Concierge Inquiries */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection("concierge")}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all text-start cursor-pointer"
            >
              <div className="flex items-center">
                <span className="me-3">🛎️</span>
                <span>{isAr ? "طلبات الكونسيرج" : "VIP Concierge"}</span>
              </div>
              <span
                className={`text-xs text-brand-brown-muted transition-transform rtl:rotate-180 ${
                  openSections.concierge ? "rotate-90 rtl:rotate-90" : ""
                }`}
              >
                ▶
              </span>
            </button>
            {openSections.concierge && (
              <div className="ps-8 border-s-2 border-brand-sand mt-1 space-y-1">
                <Link
                  href="/admin/concierge"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {isAr ? "طلبات ورسائل النزلاء" : "Inquiries & WhatsApp Leads"}
                </Link>
              </div>
            )}
          </div>

          {/* 9. Finances & Payouts */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection("finances")}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all text-start cursor-pointer"
            >
              <div className="flex items-center">
                <span className="me-3">💳</span>
                <span>{isAr ? "المالية والمدفوعات" : "Finances & Payouts"}</span>
              </div>
              <span
                className={`text-xs text-brand-brown-muted transition-transform rtl:rotate-180 ${
                  openSections.finances ? "rotate-90 rtl:rotate-90" : ""
                }`}
              >
                ▶
              </span>
            </button>
            {openSections.finances && (
              <div className="ps-8 border-s-2 border-brand-sand mt-1 space-y-1">
                <Link
                  href="/admin/finances"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {isAr ? "سجل المدفوعات والتحصيلات" : "Payment Transactions"}
                </Link>
              </div>
            )}
          </div>

          {/* 10. Platform Settings & Audit Logs */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection("settings")}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all text-start cursor-pointer"
            >
              <div className="flex items-center">
                <span className="me-3">⚙️</span>
                <span>{isAr ? "إعدادات المنصة" : "Platform Settings"}</span>
              </div>
              <span
                className={`text-xs text-brand-brown-muted transition-transform rtl:rotate-180 ${
                  openSections.settings ? "rotate-90 rtl:rotate-90" : ""
                }`}
              >
                ▶
              </span>
            </button>
            {openSections.settings && (
              <div className="ps-8 border-s-2 border-brand-sand mt-1 space-y-1">
                <Link
                  href="/admin/settings"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  {isAr ? "إعدادات النظام وسجلات الأمان" : "System Rules & Logs"}
                </Link>
              </div>
            )}
          </div>

          {/* 11. Customers & Investors */}
          <div className="pt-1">
            <Link
              href="/admin/customers"
              className="flex items-center px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all text-start"
            >
              <span className="me-3">💼</span>
              <span>{isAr ? "العملاء والمستثمرون" : "Clients & Investors"}</span>
            </Link>
          </div>
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-brand-border text-xs text-brand-brown-muted flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-brand-brown">{isAr ? "سوبر أدمن نشط" : "Super Admin Active"}</span>
          </div>
          <span className="font-mono text-[10px]" dir="ltr">v4.8.2-PROD</span>
        </div>
      </aside>
    </>
  );
}
