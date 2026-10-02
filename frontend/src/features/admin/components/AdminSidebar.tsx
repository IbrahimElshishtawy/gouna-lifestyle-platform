"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    bookings: false,
    properties: true,
    pricing: false,
    experiences: false,
    events: false,
    customers: false,
    cms: false,
    seo: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (path: string) => pathname === path;

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
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-brand-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
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
                El Gouna
              </span>
              <span className="block text-sm font-serif font-bold text-brand-brown tracking-wider">
                GOUNOW ADMIN
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-2 text-brand-brown hover:text-brand-terracotta"
            aria-label="Close Sidebar"
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
            <span className="mr-3">📊</span>
            <span>Dashboard</span>
          </Link>

          {/* 2. Bookings */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection("bookings")}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all text-left"
            >
              <div className="flex items-center">
                <span className="mr-3">📅</span>
                <span>Bookings</span>
              </div>
              <span
                className={`text-xs text-brand-brown-muted transition-transform ${
                  openSections.bookings ? "rotate-90" : ""
                }`}
              >
                ▶
              </span>
            </button>
            {openSections.bookings && (
              <div className="pl-8 border-l-2 border-brand-sand mt-1 space-y-1">
                <Link
                  href="/admin/bookings"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  All Bookings
                </Link>
                <Link
                  href="/admin/bookings?status=pending"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  Pending Bookings
                </Link>
                <Link
                  href="/admin/bookings?status=confirmed"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  Confirmed
                </Link>
              </div>
            )}
          </div>

          {/* 3. Properties */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection("properties")}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all text-left"
            >
              <div className="flex items-center">
                <span className="mr-3">🏡</span>
                <span>Properties</span>
              </div>
              <span
                className={`text-xs text-brand-brown-muted transition-transform ${
                  openSections.properties ? "rotate-90" : ""
                }`}
              >
                ▶
              </span>
            </button>
            {openSections.properties && (
              <div className="pl-8 border-l-2 border-brand-sand mt-1 space-y-1">
                <Link
                  href="/admin/properties"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  All Properties
                </Link>
                <Link
                  href="/admin/properties?type=rent"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  For Rent (Stays)
                </Link>
                <Link
                  href="/admin/properties?type=sale"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  For Sale
                </Link>
                <Link
                  href="/admin/properties/create"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-terracotta font-semibold"
                >
                  + Add Property
                </Link>
              </div>
            )}
          </div>

          {/* 4. Pricing Engine */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection("pricing")}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all text-left"
            >
              <div className="flex items-center">
                <span className="mr-3">🏷️</span>
                <span>Pricing Engine</span>
              </div>
              <span
                className={`text-xs text-brand-brown-muted transition-transform ${
                  openSections.pricing ? "rotate-90" : ""
                }`}
              >
                ▶
              </span>
            </button>
            {openSections.pricing && (
              <div className="pl-8 border-l-2 border-brand-sand mt-1 space-y-1">
                <Link
                  href="/admin/pricing"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  Base Prices & Rules
                </Link>
                <Link
                  href="/admin/pricing#seasons"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  Seasonal Rules
                </Link>
                <Link
                  href="/admin/pricing#discounts"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  Discounts & Codes
                </Link>
              </div>
            )}
          </div>

          {/* 5. Experiences */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection("experiences")}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all text-left"
            >
              <div className="flex items-center">
                <span className="mr-3">⛵</span>
                <span>Experiences</span>
              </div>
              <span
                className={`text-xs text-brand-brown-muted transition-transform ${
                  openSections.experiences ? "rotate-90" : ""
                }`}
              >
                ▶
              </span>
            </button>
            {openSections.experiences && (
              <div className="pl-8 border-l-2 border-brand-sand mt-1 space-y-1">
                <Link
                  href="/admin/experiences"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  All Experiences
                </Link>
                <Link
                  href="/admin/experiences?category=boat-trips"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  Yacht Charters
                </Link>
                <Link
                  href="/admin/experiences?category=safari"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  Safari & Stargazing
                </Link>
              </div>
            )}
          </div>

          {/* 6. Customers & Leads */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection("customers")}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-brand-brown hover:bg-brand-sand/50 transition-all text-left"
            >
              <div className="flex items-center">
                <span className="mr-3">👥</span>
                <span>Customers & Leads</span>
              </div>
              <span
                className={`text-xs text-brand-brown-muted transition-transform ${
                  openSections.customers ? "rotate-90" : ""
                }`}
              >
                ▶
              </span>
            </button>
            {openSections.customers && (
              <div className="pl-8 border-l-2 border-brand-sand mt-1 space-y-1">
                <Link
                  href="/admin/customers"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  Customer Profiles
                </Link>
                <Link
                  href="/admin/customers#leads"
                  className="block py-1.5 px-2 text-xs rounded-lg text-brand-brown-muted hover:text-brand-terracotta"
                >
                  Sale Leads & Inquiries
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-brand-border text-xs text-brand-brown-muted flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-brand-brown">Live Sync</span>
          </div>
          <span className="font-mono text-[10px]">v2.6-next</span>
        </div>
      </aside>
    </>
  );
}
