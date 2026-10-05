"use client";

import React, { useEffect, useState } from "react";
import { getAdminConciergeLeads, updateConciergeStatus } from "@/features/admin/services/admin.api";
import type { AdminLeadItem } from "@/features/admin/types";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import PermissionGuard from "@/components/ui/PermissionGuard";

export default function AdminConciergePage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [leads, setLeads] = useState<AdminLeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await getAdminConciergeLeads();
      setLeads(res.data);
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateConciergeStatus(id, newStatus);
      setFeedback({
        type: "success",
        message: isAr ? "تم تحديث حالة طلب الكونسيرج بنجاح." : "Concierge status updated successfully.",
      });
      await fetchLeads();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر تحديث الحالة." : "Failed to update status."),
      });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-terracotta font-bold">
              {isAr ? "مكتب كونسيرج الجونة الحي" : "LIVE 24/7 CONCIERGE DESK"}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown">
            {isAr ? "استفسارات وطلبات كبار الزوار (VIP)" : "VIP Concierge Inquiries & Work Queue"}
          </h1>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "متابعة طلبات اليخوت الخاصة، وحجوزات الفلل الفاخرة، وطلبات النقل الجوي واستفسارات الواتساب."
              : "Bespoke high-net-worth requests, private charters, and high-priority WhatsApp leads."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="https://wa.me/201000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <span>{isAr ? "فتح مكتب واتساب المباشر" : "Open WhatsApp Dispatch"}</span>
          </a>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium border flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-sm font-bold opacity-60 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Leads Roster */}
      {loading ? (
        <LoadingState message={isAr ? "جارٍ تحميل طلبات الكونسيرج..." : "Loading concierge queue..."} rows={4} />
      ) : leads.length === 0 ? (
        <EmptyState
          icon="🛎️"
          title={isAr ? "لا توجد طلبات كونسيرج حالياً" : "No Concierge Requests"}
          description={
            isAr
              ? "جميع طلبات واستفسارات كبار النزلاء تم الرد عليها والتعامل معها بنجاح."
              : "All VIP concierge inquiries and leads have been processed."
          }
        />
      ) : (
        <div className="space-y-4">
          {leads.map((item) => (
            <div
              key={item.id}
              className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-brand-border shadow-xs hover:border-brand-terracotta/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-brand-terracotta">
                    LEAD #{item.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.status === "new"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : item.status === "in_progress"
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : "bg-stone-100 text-stone-800 border border-stone-300"
                    }`}
                  >
                    {item.status.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-brand-brown-muted font-light">
                    • {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-brand-brown">
                    {item.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-brand-brown-muted mt-0.5">
                    {item.email && <span>📧 {item.email}</span>}
                    {item.phone && <span className="font-mono" dir="ltr">📞 {item.phone}</span>}
                    {item.type && <span className="capitalize">🏷️ {item.type.replace("_", " ")}</span>}
                  </div>
                </div>

                <p className="text-xs text-brand-brown font-light bg-brand-sand-light/50 p-3 rounded-xl border border-brand-border/60 leading-relaxed">
                  {item.message}
                </p>

                {item.admin_notes && (
                  <p className="text-[11px] text-brand-brown-muted italic">
                    {isAr ? "ملاحظات الإدارة: " : "Admin Notes: "} {item.admin_notes}
                  </p>
                )}
              </div>

              {/* Status Action Workflow */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-brand-border/60">
                {item.phone && (
                  <a
                    href={`https://wa.me/${item.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs"
                  >
                    <span>{isAr ? "واتساب النزيل" : "Direct WhatsApp"}</span>
                  </a>
                )}

                <PermissionGuard permission="manage_leads">
                  <div className="flex items-center gap-1.5">
                    {item.status === "new" && (
                      <button
                        onClick={() => handleStatusChange(item.id, "in_progress")}
                        className="px-3 py-1.5 rounded-lg bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-semibold transition cursor-pointer"
                      >
                        {isAr ? "قيد المتابعة" : "Start Handling"}
                      </button>
                    )}

                    {item.status !== "converted" && (
                      <button
                        onClick={() => handleStatusChange(item.id, "converted")}
                        className="px-3 py-1.5 rounded-lg bg-white border border-brand-border text-brand-brown hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-xs font-semibold transition cursor-pointer"
                      >
                        {isAr ? "إتمام الحجز" : "Mark Converted"}
                      </button>
                    )}
                  </div>
                </PermissionGuard>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
