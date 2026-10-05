"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getExperiences } from "@/features/experiences/services/experiences.api";
import type { Experience } from "@/features/experiences/types/experience.types";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";

export default function AdminExperiencesPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getExperiences()
      .then((res) => {
        if (!mounted) return;
        setExperiences(res);
      })
      .catch(() => {
        setExperiences([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-brown">
            {isAr ? "التجارب والأنشطة واليخوت الحصرية" : "Experiences & Yacht Charters"}
          </h1>
          <p className="text-xs text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "إدارة رحلات اليخوت الخاصة إلى جزيرة طوّيلة، سفاري الصحراء، والغوص في البحر الأحمر."
              : "Curated yacht charters, desert safaris, and water sports in El Gouna."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-xs flex items-center justify-center cursor-pointer">
            <span>{isAr ? "+ إضافة تجربة جديدة" : "+ Add Experience"}</span>
          </button>
        </div>
      </div>

      {/* Experiences Table */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingState message={isAr ? "جارٍ تحميل قائمة التجارب..." : "Loading experiences..."} />
          </div>
        ) : (
          <div className="overflow-x-auto gounow-scrollbar">
            <table className="w-full text-start text-xs">
              <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-semibold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4 text-start">{isAr ? "التجربة" : "Experience"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "التصنيف" : "Category"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "نقطة التجمع / الموقع" : "Location"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "المدة والقدرة الاستيعابية" : "Duration & Capacity"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "السعر" : "Price"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "الحالة" : "Status"}</th>
                  <th className="py-3 px-4 text-end">{isAr ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {experiences.map((exp) => (
                  <tr key={exp.id} className="hover:bg-brand-sand-light/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-brand-sand relative shrink-0 border border-brand-border">
                          <Image
                            src={exp.image}
                            alt={exp.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/experiences/${exp.slug}`}
                            target="_blank"
                            className="font-bold text-brand-brown hover:text-brand-terracotta line-clamp-1 max-w-[200px]"
                          >
                            {exp.title}
                          </Link>
                          <span className="text-[10px] text-brand-brown-muted block">
                            {exp.meeting_point}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-sand-light text-brand-brown">
                        {exp.category?.name || "Adventures"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-brand-brown font-medium">
                      {exp.location?.name || "El Gouna"}
                    </td>
                    <td className="py-3.5 px-4 text-brand-brown-muted">
                      <div>{exp.duration}</div>
                      <div className="text-[10px]">{isAr ? `حد أقصى ${exp.max_guests} ضيوف` : `Max ${exp.max_guests} Guests`}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-brand-brown">
                      {exp.price_formatted}{" "}
                      <span className="text-[10px] font-normal text-brand-brown-muted">
                        {exp.currency} {exp.pricing_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {isAr ? "نشط ومتاح" : "Active"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-end">
                      <Link
                        href={`/experiences/${exp.slug}`}
                        target="_blank"
                        className="px-2.5 py-1 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-lg text-[11px] font-medium border border-brand-border"
                      >
                        {isAr ? "معاينة" : "View"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
