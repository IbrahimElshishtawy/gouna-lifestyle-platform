"use client";

import React, { useState } from "react";
import { downloadExportFile } from "../services/export.api";
import { useLanguage } from "@/context/LanguageContext";

export interface SectionExportButtonsProps {
  sectionType:
    | "properties"
    | "bookings"
    | "pricing"
    | "yachts"
    | "experiences"
    | "events"
    | "users"
    | "leads"
    | "concierge"
    | "finances"
    | "customers"
    | "settings"
    | "all";
  variant?: "buttons" | "compact" | "badge";
  className?: string;
}

export default function SectionExportButtons({
  sectionType,
  variant = "buttons",
  className = "",
}: SectionExportButtonsProps) {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [downloadingFormat, setDownloadingFormat] = useState<"excel" | "word" | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleExport = async (format: "excel" | "word") => {
    if (downloadingFormat) return;
    setDownloadingFormat(format);
    setFeedback(null);

    try {
      await downloadExportFile(format, sectionType);
      setFeedback(isAr ? "تم التحميل بنجاح" : "Downloaded");
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback(isAr ? "خطأ في التحميل" : "Error");
      setTimeout(() => setFeedback(null), 3500);
    } finally {
      setDownloadingFormat(null);
    }
  };

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {/* Excel Button */}
        <button
          type="button"
          onClick={() => handleExport("excel")}
          disabled={downloadingFormat !== null}
          title={isAr ? "تصدير إلى ملف إكسل (CSV)" : "Export to Excel"}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 shadow-2xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {downloadingFormat === "excel" ? (
            <span className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H6v-2h6v2zm0-4H6v-2h6v2zm0-4H6V7h6v2zm6 8h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V7h4v2z" />
            </svg>
          )}
          <span>Excel</span>
        </button>

        {/* Word Button */}
        <button
          type="button"
          onClick={() => handleExport("word")}
          disabled={downloadingFormat !== null}
          title={isAr ? "تصدير تقرير وورد رسمي (.doc)" : "Export to Word Document"}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300/80 shadow-2xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {downloadingFormat === "word" ? (
            <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
          )}
          <span>Word</span>
        </button>

        {feedback && (
          <span className="text-[10px] font-semibold text-brand-terracotta animate-fade-in ps-1">
            {feedback}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Excel Button */}
      <button
        type="button"
        onClick={() => handleExport("excel")}
        disabled={downloadingFormat !== null}
        className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer active:scale-95 disabled:opacity-50"
      >
        {downloadingFormat === "excel" ? (
          <span className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H6v-2h6v2zm0-4H6v-2h6v2zm0-4H6V7h6v2zm6 8h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V7h4v2z" />
          </svg>
        )}
        <span>{isAr ? "تصدير إكسل (Excel)" : "Export Excel"}</span>
      </button>

      {/* Word Button */}
      <button
        type="button"
        onClick={() => handleExport("word")}
        disabled={downloadingFormat !== null}
        className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer active:scale-95 disabled:opacity-50"
      >
        {downloadingFormat === "word" ? (
          <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
          </svg>
        )}
        <span>{isAr ? "تصدير وورد (Word)" : "Export Word"}</span>
      </button>

      {feedback && (
        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 animate-fade-in">
          ✓ {feedback}
        </span>
      )}
    </div>
  );
}
