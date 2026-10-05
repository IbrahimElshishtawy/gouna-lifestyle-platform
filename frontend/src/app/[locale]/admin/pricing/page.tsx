import React from "react";
import Link from "next/link";
import { getProperties } from "@/features/properties/services/properties.api";

export default async function AdminPricingPage() {
  const properties = await getProperties();
  const rentalProperties = properties.filter((p) => p.listing_type === "rent");

  const seasonalRules = [
    {
      name: "El Gouna Film Festival / Peak Autumn",
      dates: "Oct 15 - Nov 05, 2026",
      multiplier: "+35%",
      status: "Active",
      color: "bg-emerald-100 text-emerald-800",
    },
    {
      name: "Christmas & New Year Gala",
      dates: "Dec 20 - Jan 06, 2027",
      multiplier: "+50%",
      status: "Scheduled",
      color: "bg-blue-100 text-blue-800",
    },
    {
      name: "Spring Kitesurf Wind Season",
      dates: "Apr 01 - May 31, 2027",
      multiplier: "+20%",
      status: "Scheduled",
      color: "bg-amber-100 text-amber-800",
    },
  ];

  const promoCodes = [
    {
      code: "VIP10",
      discount: "10% Off Total",
      usage: "38 used",
      status: "Active",
    },
    {
      code: "SUMMER2026",
      discount: "15% Off Stays > 5 Nights",
      usage: "64 used",
      status: "Active",
    },
    {
      code: "TAWILA_BOAT",
      discount: "2,000 EGP Off Yacht Charter",
      usage: "12 used",
      status: "Active",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-brand-brown">
          Pricing Engine &amp; Revenue Management
        </h1>
        <p className="text-xs text-brand-brown-muted mt-1">
          Dynamic nightly pricing, seasonal rules, promotional vouchers, and tax policies
        </p>
      </div>

      {/* 1. Base Nightly Rates Table */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
        <div className="p-6 border-b border-brand-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-brand-brown">
              Base Nightly Rates
            </h3>
            <p className="text-xs text-brand-brown-muted">
              Standard weekday base prices per property
            </p>
          </div>
          <span className="text-xs text-brand-brown-muted">
            {rentalProperties.length} Vacation Stays
          </span>
        </div>

        <div className="overflow-x-auto gounow-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-semibold border-b border-brand-border">
              <tr>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Base Rate (Night)</th>
                <th className="py-3 px-4">Cleaning Fee</th>
                <th className="py-3 px-4">Service Fee</th>
                <th className="py-3 px-4">Weekend Surcharge</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {rentalProperties.map((p) => (
                <tr key={p.id} className="hover:bg-brand-sand-light/30 transition">
                  <td className="py-3.5 px-4 font-bold text-brand-brown">
                    <Link href={`/stays/${p.slug}`} target="_blank" className="hover:text-brand-terracotta">
                      {p.title}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-brand-brown-muted">
                    📍 {p.location?.name || "El Gouna"}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-brand-brown">
                    {p.price_formatted} EGP
                  </td>
                  <td className="py-3.5 px-4 text-brand-brown-muted">1,500 EGP</td>
                  <td className="py-3.5 px-4 text-brand-brown-muted">2,000 EGP</td>
                  <td className="py-3.5 px-4 text-emerald-700 font-semibold">+10% (Thu-Fri)</td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="px-2.5 py-1 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded text-[11px] font-bold">
                      Edit Rule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-Column: Seasonal Rules & Promo Codes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Seasonal Multipliers */}
        <div id="seasons" className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-brown">
                Seasonal Rate Multipliers
              </h3>
              <p className="text-[11px] text-brand-brown-muted">
                Automatic price surges applied across peak dates
              </p>
            </div>
            <button className="px-3 py-1.5 bg-brand-terracotta text-white rounded-xl text-xs font-bold shadow-xs">
              + New Season
            </button>
          </div>

          <div className="space-y-3">
            {seasonalRules.map((rule, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-brand-sand-light/40 border border-brand-border flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-xs text-brand-brown">{rule.name}</h4>
                  <p className="text-[11px] text-brand-brown-muted mt-0.5">{rule.dates}</p>
                </div>
                <div className="text-right">
                  <span className="font-serif font-bold text-sm text-brand-terracotta block">
                    {rule.multiplier}
                  </span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${rule.color}`}>
                    {rule.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promo Codes & Vouchers */}
        <div id="discounts" className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-brown">
                Promotional Voucher Codes
              </h3>
              <p className="text-[11px] text-brand-brown-muted">
                Active coupons checked at checkout
              </p>
            </div>
            <button className="px-3 py-1.5 bg-brand-terracotta text-white rounded-xl text-xs font-bold shadow-xs">
              + New Voucher
            </button>
          </div>

          <div className="space-y-3">
            {promoCodes.map((promo, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-brand-sand-light/40 border border-brand-border flex items-center justify-between"
              >
                <div>
                  <span className="font-mono font-bold text-xs text-brand-terracotta bg-white px-2 py-0.5 rounded border border-brand-border">
                    {promo.code}
                  </span>
                  <p className="text-[11px] text-brand-brown mt-1 font-medium">{promo.discount}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-brand-brown-muted block">{promo.usage}</span>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase mt-0.5">
                    {promo.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
