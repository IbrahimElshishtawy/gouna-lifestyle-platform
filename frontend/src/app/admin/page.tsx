import React from "react";
import Link from "next/link";
import { getProperties } from "@/features/properties/services/properties.api";

export default async function AdminDashboardPage() {
  const properties = await getProperties();
  const staysCount = properties.filter((p) => p.listing_type === "rent").length;
  const salesCount = properties.filter((p) => p.listing_type === "sale").length;

  const mockBookings = [
    {
      ref: "GON-2026-641770",
      customer: "First Booker",
      phone: "+201000000001",
      property: "Fanadir Bay Waterfront Villa",
      duration: "5 nights • 2 guests",
      dates: "Nov 18 - Nov 23, 2026",
      total: "30,210",
      status: "Confirmed",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
    {
      ref: "GON-2026-936084",
      customer: "Guest User",
      phone: "+201022334455",
      property: "Mangroovy Beachfront Luxury Chalet",
      duration: "3 nights • 3 guests",
      dates: "Oct 14 - Oct 17, 2026",
      total: "18,810",
      status: "Pending",
      statusColor: "bg-amber-100 text-amber-800",
    },
    {
      ref: "GON-2026-118492",
      customer: "Sarah Jenkins",
      phone: "+44 7911 123456",
      property: "Abu Tig Marina Penthouse",
      duration: "7 nights • 4 guests",
      dates: "Dec 22 - Dec 29, 2026",
      total: "74,400",
      status: "Confirmed",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
    {
      ref: "GON-2026-552910",
      customer: "Karim Mansour",
      phone: "+201112223334",
      property: "West Golf Sunset Lagoon Villa",
      duration: "4 nights • 6 guests",
      dates: "Nov 02 - Nov 06, 2026",
      total: "58,000",
      status: "Confirmed",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome & Quick Actions Banner */}
      <div className="bg-gradient-to-r from-brand-sand-light via-white to-brand-sand-card p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-terracotta">
              El Gouna Live System
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-brown">
            Welcome back, Gounow Super Admin
          </h2>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-1 max-w-xl">
            Manage your luxury rental properties, private yacht excursions, ticketed nightlife events, and client leads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/properties/create"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold shadow-xs transition-all"
          >
            <span className="mr-1.5">+</span>
            <span>New Property</span>
          </Link>
          <Link
            href="/admin/pricing"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white hover:bg-brand-sand/50 text-brand-brown border border-brand-border text-xs font-bold transition-all shadow-xs"
          >
            <span className="mr-1.5">📅</span>
            <span>Pricing Calendar</span>
          </Link>
          <Link
            href="/admin/experiences"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white hover:bg-brand-sand/50 text-brand-brown border border-brand-border text-xs font-bold transition-all shadow-xs"
          >
            <span className="mr-1.5">⛵</span>
            <span>Experiences</span>
          </Link>
        </div>
      </div>

      {/* 4 Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs hover:border-brand-terracotta/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-brand-brown-muted uppercase tracking-wider">
              Collected Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">
              💰
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-brand-brown">
            221,103 <span className="text-xs font-sans font-normal text-brand-brown-muted">EGP</span>
          </div>
          <div className="mt-2 text-xs text-brand-brown-muted flex items-center">
            <span className="text-emerald-600 font-semibold mr-1">● Active</span>
            <span>0 EGP pending balance</span>
          </div>
        </div>

        {/* Metric 2: Bookings */}
        <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs hover:border-brand-terracotta/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-brand-brown-muted uppercase tracking-wider">
              Monthly Bookings
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
              📋
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-brand-brown">
            19 <span className="text-xs font-sans font-normal text-brand-brown-muted">Bookings</span>
          </div>
          <div className="mt-2 text-xs text-brand-brown-muted flex items-center">
            <span className="text-amber-600 font-semibold mr-1">9</span>
            <span>pending confirmation</span>
          </div>
        </div>

        {/* Metric 3: Properties */}
        <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs hover:border-brand-terracotta/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-brand-brown-muted uppercase tracking-wider">
              Properties Listed
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-brand-terracotta flex items-center justify-center text-sm font-bold">
              🏡
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-brand-brown">
            {properties.length} <span className="text-xs font-sans font-normal text-brand-brown-muted">Units</span>
          </div>
          <div className="mt-2 text-xs text-brand-brown-muted">
            <span>{staysCount} Stays &bull; {salesCount} For Sale</span>
          </div>
        </div>

        {/* Metric 4: Active Leads */}
        <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs hover:border-brand-terracotta/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-brand-brown-muted uppercase tracking-wider">
              Active Leads
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-bold">
              💬
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-brand-brown">
            14 <span className="text-xs font-sans font-normal text-brand-brown-muted">Inquiries</span>
          </div>
          <div className="mt-2 text-xs text-brand-brown-muted">
            <span>4 WhatsApp leads today</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column (2 Cols): Recent Bookings Table */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
            <div className="p-6 border-b border-brand-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-brand-brown">
                  Recent Bookings &amp; Reservations
                </h3>
                <p className="text-xs text-brand-brown-muted">
                  Live reservations recorded in the booking engine
                </p>
              </div>
              <Link
                href="/admin/bookings"
                className="text-xs font-bold text-brand-terracotta hover:underline"
              >
                View All &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto gounow-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-semibold border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Property</th>
                    <th className="py-3 px-4">Dates</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {mockBookings.map((b) => (
                    <tr key={b.ref} className="hover:bg-brand-sand-light/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-brown">
                        {b.ref}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brand-brown">{b.customer}</div>
                        <div className="text-[11px] text-brand-brown-muted">{b.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-brand-brown truncate max-w-[180px]">
                          {b.property}
                        </div>
                        <div className="text-[10px] text-brand-brown-muted">{b.duration}</div>
                      </td>
                      <td className="py-3.5 px-4 text-brand-brown-muted whitespace-nowrap">
                        {b.dates}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-brand-brown whitespace-nowrap">
                        {b.total} <span className="text-[10px] font-normal text-brand-brown-muted">EGP</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${b.statusColor}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Property Quick Status & Live System Health */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4">
            <h3 className="text-base font-bold text-brand-brown">
              Portfolio Snapshot
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-brand-border">
                <span className="text-brand-brown-muted">Vacation Rental Stays</span>
                <span className="font-bold text-brand-brown">{staysCount} Active</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-brand-border">
                <span className="text-brand-brown-muted">Real Estate For Sale</span>
                <span className="font-bold text-brand-brown">{salesCount} Active</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-brand-border">
                <span className="text-brand-brown-muted">Average Occupancy (Oct)</span>
                <span className="font-bold text-emerald-600">84.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-brown-muted">WhatsApp Concierge Desk</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/admin/properties"
                className="w-full block text-center py-2.5 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl text-xs font-bold transition"
              >
                Manage All Properties
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-terracotta to-brand-terracotta-dark p-6 rounded-3xl text-white shadow-sm space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-sand">
              VIP Concierge 24/7
            </span>
            <h4 className="font-serif text-lg font-bold">
              Direct Emergency Dispatch
            </h4>
            <p className="text-xs text-brand-sand/90 leading-relaxed font-light">
              Connect immediately with Abu Tig Marina dock master, airport dispatch, or villa maintenance teams.
            </p>
            <a
              href="https://wa.me/201000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 px-4 py-2 bg-white text-brand-terracotta rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-sand transition"
            >
              Open WhatsApp Console
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
