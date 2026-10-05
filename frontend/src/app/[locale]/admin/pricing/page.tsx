"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminProperties } from "@/features/admin/services/admin.api";
import type { AdminPropertyItem } from "@/features/admin/types";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";

export default function AdminPricingPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [properties, setProperties] = useState<AdminPropertyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getAdminProperties({ type: "rent" })
      .then((res) => {
        if (!mounted) return;
        setProperties(res.data);
      })
      .catch(() => {
        setProperties([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const seasonalRules = [
    {
      name: isAr ? "مهرجان الجونة السينمائي / ذروة الخريف" : "El Gouna Film Festival / Peak Autumn",
      dates: isAr ? "15 أكتوبر - 05 نوفمبر 2026" : "Oct 15 - Nov 05, 2026",
      multiplier: "+35%",
      status: isAr ? "نشط حالياً" : "Active",
      color: "bg-emerald-100 text-emerald-800",
    },
    {
      name: isAr ? "احتفالات رأس السنة وعيد الميلاد" : "Christmas & New Year Gala",
      dates: isAr ? "20 ديسمبر - 06 يناير 2027" : "Dec 20 - Jan 06, 2027",
      multiplier: "+50%",
      status: isAr ? "مجدول" : "Scheduled",
      color: "bg-blue-100 text-blue-800",
    },
    {
      name: isAr ? "موسم رياح الكايت سيرف الربيعي" : "Spring Kitesurf Wind Season",
      dates: isAr ? "01 أبريل - 31 مايو 2027" : "Apr 01 - May 31, 2027",
      multiplier: "+20%",
      status: isAr ? "مجدول" : "Scheduled",
      color: "bg-amber-100 text-amber-800",
    },
  ];

  const promoCodes = [
    {
      code: "VIP10",
      discount: isAr ? "خصم 10% على الإجمالي" : "10% Off Total",
      usage: isAr ? "38 استخدام" : "38 used",
      status: isAr ? "نشط" : "Active",
    },
    {
      code: "SUMMER2026",
      discount: isAr ? "خصم 15% للإقامات أكثر من 5 ليالٍ" : "15% Off Stays > 5 Nights",
      usage: isAr ? "64 استخدام" : "64 used",
      status: isAr ? "نشط" : "Active",
    },
    {
      code: "TAWILA_BOAT",
      discount: isAr ? "خصم 2,000 ج.م على رحلات اليخوت" : "2,000 EGP Off Yacht Charter",
      usage: isAr ? "12 استخدام" : "12 used",
      status: isAr ? "نشط" : "Active",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-brand-brown">
          {isAr ? "محرك الأسعار وإدارة العوائد" : "Pricing Engine & Revenue Management"}
        </h1>
        <p className="text-xs text-brand-brown-muted mt-1 font-light">
          {isAr
            ? "تسعير ديناميكي لليالي، مضاعفات مواسم الذروة، قسائم الخصم الترويجية، وسياسات الرسوم."
            : "Dynamic nightly pricing, seasonal rules, promotional vouchers, and tax policies."}
        </p>
      </div>

      {/* 1. Base Nightly Rates Table */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
        <div className="p-6 border-b border-brand-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-brand-brown">
              {isAr ? "الأسعار الأساسية لليلة الواحدة" : "Base Nightly Rates"}
            </h2>
            <p className="text-xs text-brand-brown-muted">
              {isAr ? "الأسعار الأساسية لأيام الأسبوع لكل عقار" : "Standard weekday base prices per property"}
            </p>
          </div>
          <span className="text-xs text-brand-brown-muted font-medium">
            {properties.length} {isAr ? "وحدة إيجار" : "Vacation Stays"}
          </span>
        </div>

        {loading ? (
          <div className="p-8">
            <LoadingState message={isAr ? "جارٍ تحميل قواعد الأسعار..." : "Loading pricing rules..."} />
          </div>
        ) : (
          <div className="overflow-x-auto gounow-scrollbar">
            <table className="w-full text-start text-xs">
              <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-semibold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4 text-start">{isAr ? "العقار / الوحدة" : "Property"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "المنطقة" : "Location"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "سعر الليلة الأساسي" : "Base Rate (Night)"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "رسوم النظافة" : "Cleaning Fee"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "رسوم الخدمة" : "Service Fee"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "زيادة عطلة نهاية الأسبوع" : "Weekend Surcharge"}</th>
                  <th className="py-3 px-4 text-end">{isAr ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {properties.map((p) => {
                  const title = isAr && p.title_ar ? p.title_ar : p.title_en;
                  const locName = isAr && p.location?.name_ar ? p.location.name_ar : p.location?.name_en || "الجونة";

                  return (
                    <tr key={p.id} className="hover:bg-brand-sand-light/30 transition">
                      <td className="py-3.5 px-4 font-bold text-brand-brown">
                        <Link href={`/stays/${p.slug}`} target="_blank" className="hover:text-brand-terracotta">
                          {title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-brand-brown-muted font-medium">
                        {locName}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-brand-brown">
                        {p.formatted_price}
                      </td>
                      <td className="py-3.5 px-4 text-brand-brown-muted">1,500 EGP</td>
                      <td className="py-3.5 px-4 text-brand-brown-muted">2,000 EGP</td>
                      <td className="py-3.5 px-4 text-emerald-700 font-semibold">
                        {isAr ? "+10% (الخميس والجمعة)" : "+10% (Thu-Fri)"}
                      </td>
                      <td className="py-3.5 px-4 text-end">
                        <button className="px-2.5 py-1 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-lg text-[11px] font-bold cursor-pointer">
                          {isAr ? "تعديل القاعدة" : "Edit Rule"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2-Column: Seasonal Rules & Promo Codes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Seasonal Multipliers */}
        <div id="seasons" className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-brown">
                {isAr ? "مضاعفات الأسعار الموسمية" : "Seasonal Rate Multipliers"}
              </h2>
              <p className="text-[11px] text-brand-brown-muted">
                {isAr ? "زيادات آلية تُطبّق خلال تواريخ الإشغال المرتفع" : "Automatic price surges applied across peak dates"}
              </p>
            </div>
            <button className="px-3 py-1.5 bg-brand-terracotta text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer">
              {isAr ? "+ موسم جديد" : "+ New Season"}
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
                <div className="text-end">
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
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-brown">
                {isAr ? "أكواد الخصم والقسائم الترويجية" : "Promotional Voucher Codes"}
              </h2>
              <p className="text-[11px] text-brand-brown-muted">
                {isAr ? "الكوبونات النشطة التي يتم التحقق منها عند الدفع" : "Active coupons checked at checkout"}
              </p>
            </div>
            <button className="px-3 py-1.5 bg-brand-terracotta text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer">
              {isAr ? "+ كوبون جديد" : "+ New Voucher"}
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
                <div className="text-end">
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
