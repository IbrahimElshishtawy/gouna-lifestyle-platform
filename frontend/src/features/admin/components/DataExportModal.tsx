"use client";

import React, { useEffect, useState } from "react";
import { getExportOverview, downloadExportFile, type ExportOverviewData } from "../services/export.api";
import { useLanguage } from "@/context/LanguageContext";

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DataExportModal({ isOpen, onClose }: DataExportModalProps) {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [selectedFormat, setSelectedFormat] = useState<"excel" | "word" | "json">("excel");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [overview, setOverview] = useState<ExportOverviewData | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoadingOverview(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      getExportOverview()
        .then((data) => setOverview(data))
        .catch(() => {})
        .finally(() => setLoadingOverview(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setDownloading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await downloadExportFile(selectedFormat, selectedType);
      setSuccessMessage(
        isAr
          ? "تم تجهيز وتنزيل الملف بنجاح على جهازك!"
          : "Your data file was prepared and downloaded successfully!"
      );
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          (isAr
            ? "تعذر تنزيل الملف، يرجى التأكد من صلاحيات المشرف والمحاولة مجدداً."
            : "Failed to download file. Please check admin permissions and retry.")
      );
    } finally {
      setDownloading(false);
    }
  };

  const typeOptions = [
    { id: "all", label_ar: "تصدير شامل (كافة بيانات المنصة)", label_en: "All Platform Data (Combined)", count: null, icon: "📦" },
    { id: "properties", label_ar: "الفلل والعقارات", label_en: "Properties & Luxury Stays", count: overview?.properties_count, icon: "🏡" },
    { id: "bookings", label_ar: "الحجوزات والعمليات التشغيلية", label_en: "Bookings & Reservations", count: overview?.bookings_count, icon: "📅" },
    { id: "experiences", label_ar: "التجارب واليخوت البحرية", label_en: "Experiences & Yacht Charters", count: overview?.experiences_count, icon: "🛥️" },
    { id: "events", label_ar: "الفعاليات والحفلات", label_en: "Events & Festivals", count: overview?.events_count, icon: "🎟️" },
    { id: "leads", label_ar: "طلبات واستفسارات الكونسيرج", label_en: "Concierge Inquiries & Leads", count: overview?.leads_count, icon: "🛎️" },
    { id: "customers", label_ar: "قاعدة بيانات العملاء والضيوف", label_en: "Registered Customers & Guests", count: overview?.customers_count, icon: "👤" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-[#FAF8F5] dark:bg-[#1E1715] rounded-3xl shadow-2xl border border-brand-border text-brand-brown overflow-hidden transition-all duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-brand-sand-light via-white to-brand-sand-card border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-terracotta/10 text-brand-terracotta flex items-center justify-center text-xl shrink-0">
              📊
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-brown">
                {isAr ? "مركز تصدير البيانات والتقارير التنفيذية" : "Executive Data Export & Reports"}
              </h2>
              <p className="text-xs text-brand-brown-muted mt-0.5">
                {isAr
                  ? "تنزيل وتصدير جميع بيانات المنصة بصيغ إكسل أو وورد أو نسخ احتياطي كامل"
                  : "Export and download platform datasets in Excel, Word, or raw JSON formats"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-brand-brown flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto gounow-scrollbar">
          {/* Format Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-brown-muted mb-2.5">
              {isAr ? "١. اختر صيغة الملف المطلوب (File Format)" : "1. Select File Format"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option: Excel */}
              <button
                type="button"
                onClick={() => setSelectedFormat("excel")}
                className={`p-4 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                  selectedFormat === "excel"
                    ? "bg-white dark:bg-black/20 border-brand-terracotta shadow-md ring-2 ring-brand-terracotta/20"
                    : "bg-white/60 dark:bg-black/10 border-brand-border hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">📊</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedFormat === "excel"
                        ? "bg-brand-terracotta text-white"
                        : "bg-brand-border/40 text-brand-brown-muted"
                    }`}
                  >
                    .CSV / Excel
                  </span>
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-brown">
                    {isAr ? "شيت إكسل (Excel)" : "Excel Spreadsheet"}
                  </div>
                  <div className="text-[11px] text-brand-brown-muted mt-0.5 leading-snug">
                    {isAr ? "جداول منظمة متوافقة مع Excel بحروف عربية نقية UTF-8" : "Clean table format with UTF-8 BOM encoding"}
                  </div>
                </div>
              </button>

              {/* Option: Word */}
              <button
                type="button"
                onClick={() => setSelectedFormat("word")}
                className={`p-4 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                  selectedFormat === "word"
                    ? "bg-white dark:bg-black/20 border-brand-terracotta shadow-md ring-2 ring-brand-terracotta/20"
                    : "bg-white/60 dark:bg-black/10 border-brand-border hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">📄</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedFormat === "word"
                        ? "bg-brand-terracotta text-white"
                        : "bg-brand-border/40 text-brand-brown-muted"
                    }`}
                  >
                    .DOC / Word
                  </span>
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-brown">
                    {isAr ? "ملف وورد (Word)" : "Word Document"}
                  </div>
                  <div className="text-[11px] text-brand-brown-muted mt-0.5 leading-snug">
                    {isAr ? "تقرير رسمي منسق بالهوية الفاخرة وجاهز للطباعة والمشاركة" : "Formatted executive dossier ready for printing"}
                  </div>
                </div>
              </button>

              {/* Option: JSON */}
              <button
                type="button"
                onClick={() => setSelectedFormat("json")}
                className={`p-4 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                  selectedFormat === "json"
                    ? "bg-white dark:bg-black/20 border-brand-terracotta shadow-md ring-2 ring-brand-terracotta/20"
                    : "bg-white/60 dark:bg-black/10 border-brand-border hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">💾</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedFormat === "json"
                        ? "bg-brand-terracotta text-white"
                        : "bg-brand-border/40 text-brand-brown-muted"
                    }`}
                  >
                    .JSON / Backup
                  </span>
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-brown">
                    {isAr ? "نسخة تقنية (JSON)" : "Raw JSON Backup"}
                  </div>
                  <div className="text-[11px] text-brand-brown-muted mt-0.5 leading-snug">
                    {isAr ? "تصدير خام لقاعدة البيانات للأرشفة والتكامل السحابي" : "Full database dump for archival and dev tools"}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Scope Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-brown-muted mb-2.5">
              {isAr ? "٢. حدد نطاق البيانات المراد تصديرها (Data Scope)" : "2. Select Data Scope"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {typeOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedType(opt.id)}
                  className={`p-3 rounded-xl border text-start transition-all cursor-pointer flex items-center justify-between ${
                    selectedType === opt.id
                      ? "bg-brand-terracotta/10 border-brand-terracotta text-brand-terracotta font-bold"
                      : "bg-white/60 dark:bg-black/10 border-brand-border text-brand-brown hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span>{opt.icon}</span>
                    <span className="text-xs truncate">{isAr ? opt.label_ar : opt.label_en}</span>
                  </div>
                  {opt.count !== null && opt.count !== undefined && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-brand-sand dark:bg-black/30 border border-brand-border/70 text-brand-brown-muted shrink-0">
                      {opt.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Alerts / Feedback */}
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <span className="text-base">✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <span className="text-base">⚠</span>
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-white dark:bg-black/20 border-t border-brand-border flex items-center justify-between">
          <div className="text-[11px] text-brand-brown-muted hidden sm:block">
            {overview?.generated_at && (
              <span>
                {isAr ? "آخر تحديث لقاعدة البيانات:" : "Live database sync:"}{" "}
                {new Date(overview.generated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 ms-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={downloading}
              className="px-5 py-2.5 rounded-xl border border-brand-border hover:bg-brand-sand/50 text-brand-brown text-xs font-bold transition-all cursor-pointer"
            >
              {isAr ? "إغلاق" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold shadow-md shadow-brand-terracotta/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isAr ? "جارٍ تجهيز وتنزيل الملف..." : "Preparing Download..."}</span>
                </>
              ) : (
                <>
                  <span>📥</span>
                  <span>
                    {isAr
                      ? `تنزيل ملف ${selectedFormat === "excel" ? "الإكسل (.csv)" : selectedFormat === "word" ? "الوورد (.doc)" : "النسخة (.json)"}`
                      : `Download ${selectedFormat.toUpperCase()}`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
