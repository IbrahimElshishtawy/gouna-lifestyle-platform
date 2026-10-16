"use client";

import React, { useState } from "react";
import Link from "next/link";
import DataExportModal from "@/features/admin/components/DataExportModal";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminExportsPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Breadcrumb & Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-brown-muted mb-1.5">
            <Link href="/admin" className="hover:text-brand-terracotta">
              {isAr ? "لوحة التحكم" : "Dashboard"}
            </Link>
            <span>/</span>
            <span className="text-brand-terracotta">{isAr ? "تصدير البيانات" : "Data Export"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-brown">
            {isAr ? "مركز تصدير التقارير والبيانات (Excel / Word / JSON)" : "Executive Data Export & Reporting Center"}
          </h1>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-1 max-w-2xl font-light">
            {isAr
              ? "استخرج جميع بيانات الفلل، الحجوزات، اليخوت، الفعاليات، وطلبات الكونسيرج بصيغ إكسل أو مستندات وورد رسمية مجهزة للطباعة."
              : "Download comprehensive system records in Excel spreadsheets, formatted Word dossiers, or complete JSON backups."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-terracotta to-brand-terracotta-dark hover:brightness-110 text-white text-xs font-bold shadow-md shadow-brand-terracotta/25 transition-all cursor-pointer self-start sm:self-auto"
        >
          <span>📥</span>
          <span>{isAr ? "فتح مركز التصدير" : "Open Export Console"}</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Excel */}
        <div className="bg-white dark:bg-[#1E1715] p-6 rounded-3xl border border-brand-border shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl mb-4">
              📊
            </div>
            <h3 className="text-base font-bold text-brand-brown">
              {isAr ? "شيت إكسل (Excel / CSV)" : "Excel Spreadsheets"}
            </h3>
            <p className="text-xs text-brand-brown-muted mt-2 leading-relaxed font-light">
              {isAr
                ? "تصدير جداول تفصيلية لكافة العقارات، الحجوزات، والعملاء متوافقة 100% مع Microsoft Excel بحروف عربية نقية."
                : "Structured tabular CSV data ready for Microsoft Excel, Apple Numbers, and Google Sheets with UTF-8 BOM encoding."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-200 cursor-pointer"
          >
            {isAr ? "تصدير كملف إكسل" : "Export as Excel"}
          </button>
        </div>

        {/* Card 2: Word */}
        <div className="bg-white dark:bg-[#1E1715] p-6 rounded-3xl border border-brand-border shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-2xl mb-4">
              📄
            </div>
            <h3 className="text-base font-bold text-brand-brown">
              {isAr ? "ملف وورد رسمي (Word Document)" : "Executive Word Dossier"}
            </h3>
            <p className="text-xs text-brand-brown-muted mt-2 leading-relaxed font-light">
              {isAr
                ? "تقرير تنفيذي منسق بهوية الجونة الرسمية، ومؤشرات الأداء، وملخص العمليات جاهز للعرض والطباعة."
                : "Professional .doc dossier formatted with official GouNow typography, KPI summaries, and printable tables."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-all border border-blue-200 cursor-pointer"
          >
            {isAr ? "تصدير كملف وورد" : "Export as Word"}
          </button>
        </div>

        {/* Card 3: JSON Backup */}
        <div className="bg-white dark:bg-[#1E1715] p-6 rounded-3xl border border-brand-border shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl mb-4">
              💾
            </div>
            <h3 className="text-base font-bold text-brand-brown">
              {isAr ? "نسخة احتياطية كاملة (JSON Backup)" : "Full JSON Backup"}
            </h3>
            <p className="text-xs text-brand-brown-muted mt-2 leading-relaxed font-light">
              {isAr
                ? "تصدير تقني كامل لبيانات النظام لعمل النسخ الاحتياطي الدوري أو التكامل مع منصات أخرى."
                : "Raw hierarchical data dump containing complete relational models for migration and archival."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all border border-amber-200 cursor-pointer"
          >
            {isAr ? "تنزيل نسخة JSON" : "Download JSON Dump"}
          </button>
        </div>
      </div>

      {/* Export Console Modal */}
      <DataExportModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
