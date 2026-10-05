"use client";

import React, { useEffect, useState } from "react";
import { getAdminSettings, updateAdminSettings, getAdminAuditLogs } from "@/features/admin/services/admin.api";
import type { ActivityLogItem, PlatformSettingsMap } from "@/features/admin/types";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import PermissionGuard from "@/components/ui/PermissionGuard";

export default function AdminSettingsPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [settings, setSettings] = useState<PlatformSettingsMap>({});
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, logsRes] = await Promise.all([
        getAdminSettings().catch(() => ({})),
        getAdminAuditLogs().catch(() => ({ data: [] })),
      ]);
      setSettings(settingsRes);
      setLogs(logsRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      await updateAdminSettings(settings);
      setFeedback({
        type: "success",
        message: isAr ? "تم حفظ إعدادات المنصة بنجاح وتوثيقها في سجل الأمان." : "Settings updated and audited successfully.",
      });
      await fetchData();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر حفظ الإعدادات." : "Failed to update settings."),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-brand-terracotta animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-terracotta font-bold">
              {isAr ? "إعدادات المنصة والأمان" : "SYSTEM POLICIES & SECURITY AUDIT"}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown">
            {isAr ? "إعدادات النظام وسياسات الحجز" : "Platform Settings & System Governance"}
          </h1>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "ضبط إعدادات المنصة، وسجلات التدقيق الأمني، وسياسات الدفع وإلغاء الحجوزات."
              : "Configure global commission rates, booking cancellation rules, currency conversion, and audit logs."}
          </p>
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

      {/* Settings Form Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs p-6 sm:p-8">
        <h2 className="font-serif text-lg font-bold text-brand-brown mb-4 pb-2 border-b border-brand-border/60">
          {isAr ? "القواعد التشغيلية والمالية العامة" : "General Governance Rules"}
        </h2>

        {loading ? (
          <LoadingState message={isAr ? "جارٍ تحميل الإعدادات..." : "Loading system settings..."} rows={3} />
        ) : (
          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-bold text-brand-brown mb-1.5">
                  {isAr ? "نسبة ضريبة القيمة المضافة (VAT %)" : "VAT Tax Percentage (%)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings["vat_percentage"] !== undefined ? String(settings["vat_percentage"]) : "14"}
                  onChange={(e) => setSettings({ ...settings, vat_percentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none"
                />
                <span className="text-[11px] text-brand-brown-muted mt-1 block">
                  {isAr ? "تطبق تلقائياً في حسابات محرك التسعير والحجز." : "Automatically applied in server-side quote calculations."}
                </span>
              </div>

              <div>
                <label className="block font-bold text-brand-brown mb-1.5">
                  {isAr ? "عمولة المنصة على الإقامات (%)" : "Platform Commission Rate (%)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings["platform_commission_rate"] !== undefined ? String(settings["platform_commission_rate"]) : "15"}
                  onChange={(e) => setSettings({ ...settings, platform_commission_rate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none"
                />
                <span className="text-[11px] text-brand-brown-muted mt-1 block">
                  {isAr ? "تستقطع من دفعات الملاك عند التسوية البنكية." : "Deducted from owner payouts during financial settlements."}
                </span>
              </div>

              <div>
                <label className="block font-bold text-brand-brown mb-1.5">
                  {isAr ? "مهلة الإلغاء المجاني (بالأيام)" : "Free Cancellation Window (Days)"}
                </label>
                <input
                  type="number"
                  value={settings["cancellation_free_days"] !== undefined ? String(settings["cancellation_free_days"]) : "14"}
                  onChange={(e) => setSettings({ ...settings, cancellation_free_days: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-brown mb-1.5">
                  {isAr ? "العملة الافتراضية للمعاملات" : "Primary Base Currency"}
                </label>
                <input
                  type="text"
                  value={settings["base_currency"] !== undefined ? String(settings["base_currency"]) : "EGP"}
                  onChange={(e) => setSettings({ ...settings, base_currency: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none font-mono"
                />
              </div>
            </div>

            <PermissionGuard permission="manage_settings">
              <div className="flex items-center justify-end pt-4 border-t border-brand-border/60">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {saving ? (isAr ? "جارٍ الحفظ..." : "Saving...") : (isAr ? "حفظ التغييرات" : "Save Changes")}
                </button>
              </div>
            </PermissionGuard>
          </form>
        )}
      </div>

      {/* Audit Logs Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-brand-border flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-brand-brown">
              {isAr ? "سجل التدقيق الأمني والعمليات (Audit Trail)" : "Security Activity Audit Trail"}
            </h2>
            <p className="text-xs text-brand-brown-muted font-light mt-0.5">
              {isAr
                ? "سجل غير قابل للتعديل يوثق كافة العمليات الإدارية الحساسة"
                : "Immutable activity trail tracking sensitive administrative actions"}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-brand-terracotta">
            LIVE LOGS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-brand-sand-light/60 text-brand-brown-muted font-bold text-[10px] uppercase tracking-wider border-b border-brand-border">
              <tr>
                <th className="py-3.5 px-4 text-start">{isAr ? "رقم السجل" : "Log ID"}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? "المسؤول" : "Actor"}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? "الإجراء" : "Action"}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? "التفاصيل" : "Description"}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? "عنوان IP" : "IP / Node"}</th>
                <th className="py-3.5 px-4 text-end">{isAr ? "التوقيت" : "Timestamp"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-brand-sand/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-brand-brown">
                    LOG-#{log.id}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-brand-brown">
                    {log.user_name || "System"}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-brand-terracotta">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-4 text-brand-brown font-light">
                    {log.description}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-brand-brown-muted" dir="ltr">
                    {log.ip_address || "Internal"}
                  </td>
                  <td className="py-3.5 px-4 text-end font-mono text-[11px] text-brand-brown-muted" dir="ltr">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
