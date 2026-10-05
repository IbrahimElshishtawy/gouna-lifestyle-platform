"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { useRouter } from "@/i18n/routing";
import { logout } from "@/lib/api/auth";
import { useLanguage } from "@/context/LanguageContext";

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const router = useRouter();
  const { locale, setLocale, t, isRtl } = useLanguage();
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    router.push("/admin/login");
  };

  return (
    <header className="h-20 bg-white border-b border-brand-border flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Toggle & Page Context */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-brand-brown rounded-lg hover:bg-brand-sand/50 cursor-pointer"
          aria-label={locale === "ar" ? "فتح القائمة الجانبية" : "Open Sidebar"}
        >
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
        </button>

        <div className="hidden sm:block">
          <h1 className="text-lg font-bold text-brand-brown tracking-tight">
            {locale === "ar" ? "نظرة عامة تنفيذية" : "Executive Overview"}
          </h1>
          <nav className="flex items-center text-xs text-brand-brown-muted gap-2">
            <Link
              href="/admin"
              className="hover:text-brand-terracotta transition"
            >
              {locale === "ar" ? "إدارة جوناو" : "GouNow Admin"}
            </Link>
            <span className="rtl:rotate-180">/</span>
            <span className="text-brand-brown font-medium">{t.admin.dashboard}</span>
          </nav>
        </div>
      </div>

      {/* Right Header: Actions, Locale, Notifications & User */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Link: Public Website */}
        <Link
          href="/"
          target="_blank"
          className="hidden md:inline-flex items-center text-xs font-semibold text-brand-brown-muted hover:text-brand-terracotta transition-colors px-2.5 py-1.5 rounded-lg border border-brand-border hover:border-brand-terracotta/40 gap-1.5"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          <span>{locale === "ar" ? "الموقع الرئيسي" : "View Website"}</span>
        </Link>

        {/* Bilingual Switcher */}
        <div className="flex items-center bg-brand-sand-light p-1 rounded-xl border border-brand-border text-xs font-bold">
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              locale === "en"
                ? "bg-brand-terracotta text-white shadow-xs"
                : "text-brand-brown-muted hover:text-brand-brown"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLocale("ar")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              locale === "ar"
                ? "bg-brand-terracotta text-white shadow-xs"
                : "text-brand-brown-muted hover:text-brand-brown"
            }`}
          >
            عربي
          </button>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifyOpen(!notifyOpen)}
            className="p-2 text-brand-brown-muted hover:text-brand-terracotta rounded-xl hover:bg-brand-sand/40 relative cursor-pointer"
            aria-label={locale === "ar" ? "عرض التنبيهات" : "View notifications"}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-brand-terracotta rounded-full ring-2 ring-white" />
          </button>

          {notifyOpen && (
            <div className="absolute end-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-brand-border py-2 z-50">
              <div className="px-4 py-2 border-b border-brand-border flex items-center justify-between">
                <span className="text-xs font-bold text-brand-brown uppercase tracking-wider">
                  {locale === "ar" ? "التنبيهات" : "Notifications"}
                </span>
                <span className="text-[10px] text-brand-terracotta font-semibold">
                  {locale === "ar" ? "2 جديد" : "2 New"}
                </span>
              </div>
              <div className="divide-y divide-brand-border/60 max-h-64 overflow-y-auto text-xs">
                <Link
                  href="/admin/bookings"
                  onClick={() => setNotifyOpen(false)}
                  className="block p-3 hover:bg-brand-sand-light transition-colors"
                >
                  <p className="font-semibold text-brand-brown">
                    {locale === "ar" ? "حجز فيلا جديد: GON-2026-000101" : "New Villa Reservation: GON-2026-000101"}
                  </p>
                  <span className="text-[10px] text-brand-brown-muted">
                    {locale === "ar" ? "منذ 10 دقائق • فيلا خليج فنادير" : "10 mins ago • Fanadir Bay Villa"}
                  </span>
                </Link>
                <Link
                  href="/admin/customers"
                  onClick={() => setNotifyOpen(false)}
                  className="block p-3 hover:bg-brand-sand-light transition-colors"
                >
                  <p className="font-semibold text-brand-brown">
                    {locale === "ar" ? "طلب شراء عقار: طارق خليل" : "New Buyer Lead: Tarek Khalil"}
                  </p>
                  <span className="text-[10px] text-brand-brown-muted">
                    {locale === "ar" ? "منذ ساعة • استفسار واتساب" : "1 hour ago • WhatsApp Inquiry"}
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-brand-sand/40 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs shadow-xs">
              G
            </div>
            <span className="hidden sm:block text-xs font-bold text-brand-brown max-w-[120px] truncate">
              {locale === "ar" ? "مسؤول النظام" : "Gounow Super Admin"}
            </span>
            <svg
              className="w-3.5 h-3.5 text-brand-brown-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {userMenuOpen && (
            <div className="absolute end-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-brand-border py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-brand-border">
                <span className="block font-bold text-brand-brown">
                  {locale === "ar" ? "مسؤول النظام" : "Gounow Super Admin"}
                </span>
                <span className="block text-[10px] text-brand-brown-muted truncate" dir="ltr">
                  admin@gounow.com
                </span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-start px-4 py-2.5 text-red-600 hover:bg-red-50 font-semibold cursor-pointer"
              >
                {t.admin.signOut}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

