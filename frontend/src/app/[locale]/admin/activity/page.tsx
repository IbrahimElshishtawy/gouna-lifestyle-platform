"use client";

import React, { useEffect, useState } from "react";
import { getAdminAuditLogs } from "@/features/admin/services/admin.api";
import type { ActivityLogItem } from "@/features/admin/types";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import PermissionGuard from "@/components/ui/PermissionGuard";

export default function AdminActivityPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchLogs = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await getAdminAuditLogs({
        page: currentPage,
        search: search || undefined,
        action: actionFilter || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setLogs(res.data || []);
      setPage(res.meta?.current_page || 1);
      setTotalPages(res.meta?.last_page || 1);
      setTotalCount(res.meta?.total || res.data?.length || 0);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [actionFilter, fromDate, toDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const handleReset = () => {
    setSearch("");
    setActionFilter("");
    setFromDate("");
    setToDate("");
    fetchLogs(1);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-brand-terracotta animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-terracotta font-bold">
              {isAr ? "سجل التدقيق الأمني والعمليات" : "IMMUTABLE AUDIT TRAIL & ACTIVITY LOGS"}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown">
            {isAr ? "سجل النشاط والتدقيق الأمني" : "Activity & Security Audit Trail"}
          </h1>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "سجل غير قابل للتعديل يوثق كافة التغييرات والعمليات الإدارية الحساسة على العقارات واليخوت والحجوزات والأسعار والمشرفين."
              : "Complete immutable audit trail documenting administrative actions, security transitions, staff lifecycle, and pricing mutations."}
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-white border border-brand-border text-xs font-mono font-bold text-brand-terracotta shadow-2xs">
          {totalCount} {isAr ? "سجل موثق" : "Audited Events"}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <input
            type="text"
            placeholder={isAr ? "البحث في تفاصيل السجل، أو نوع الإجراء..." : "Search action or description..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-terracotta"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-brand-sand-light hover:bg-brand-sand text-brand-brown text-xs font-bold transition cursor-pointer shrink-0"
          >
            {isAr ? "بحث" : "Search"}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-brand-border bg-white text-brand-brown focus:outline-none focus:border-brand-terracotta"
            title={isAr ? "من تاريخ" : "From Date"}
          />
          <span className="text-brand-brown-muted">-</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-brand-border bg-white text-brand-brown focus:outline-none focus:border-brand-terracotta"
            title={isAr ? "إلى تاريخ" : "To Date"}
          />

          {(search || actionFilter || fromDate || toDate) && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-bold text-brand-brown-muted hover:text-brand-terracotta cursor-pointer"
            >
              {isAr ? "إعادة ضبط" : "Reset"}
            </button>
          )}
        </div>
      </div>

      {/* Logs Table Card */}
      {loading ? (
        <LoadingState message={isAr ? "جارٍ تحميل سجل التدقيق..." : "Loading audit records..."} rows={5} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon="🛡️"
          title={isAr ? "لا توجد سجلات تدقيق" : "No Activity Logs"}
          description={
            isAr
              ? "لم يتم تسجيل أي أحداث وفقاً لخيارات البحث والتصفية المحددة."
              : "No administrative activities match the current filters."
          }
        />
      ) : (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-brand-sand-light/60 text-brand-brown-muted font-bold text-[10px] uppercase tracking-wider border-b border-brand-border">
                <tr>
                  <th className="py-3.5 px-4 text-start">{isAr ? "رقم السجل" : "Log ID"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "المسؤول (Actor)" : "Actor"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "نوع الإجراء (Action)" : "Action"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "الكيان (Entity)" : "Entity"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "التفاصيل" : "Description"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "عنوان IP" : "IP Address"}</th>
                  <th className="py-3.5 px-4 text-end">{isAr ? "التوقيت" : "Timestamp"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-brand-sand/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-brown">
                      LOG-#{log.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-brand-brown block">{log.user_name || "System"}</span>
                      {log.user_id && (
                        <span className="text-[10px] font-mono text-brand-brown-muted">UID: {log.user_id}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] font-bold text-brand-terracotta bg-brand-sand/60 px-2 py-0.5 rounded-md">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-brand-brown">
                      {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ""}
                    </td>
                    <td className="py-3.5 px-4 text-brand-brown font-light max-w-md">
                      {log.description}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-brand-brown-muted" dir="ltr">
                      {log.ip_address || "Internal"}
                    </td>
                    <td className="py-3.5 px-4 text-end font-mono text-[11px] text-brand-brown-muted whitespace-nowrap" dir="ltr">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-brand-border flex items-center justify-between text-xs">
              <span className="text-brand-brown-muted">
                {isAr ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => fetchLogs(page - 1)}
                  className="px-3 py-1.5 rounded-xl border border-brand-border bg-white text-brand-brown hover:bg-brand-sand/50 disabled:opacity-40 cursor-pointer"
                >
                  {isAr ? "السابق" : "Previous"}
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => fetchLogs(page + 1)}
                  className="px-3 py-1.5 rounded-xl border border-brand-border bg-white text-brand-brown hover:bg-brand-sand/50 disabled:opacity-40 cursor-pointer"
                >
                  {isAr ? "التالي" : "Next"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
