"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  getAdminStays,
  checkinBooking,
  checkoutBooking,
  extendBookingStay,
} from "@/features/admin/services/admin.api";
import type { AdminStaysResponse, AdminStayItem } from "@/features/admin/types";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PermissionGuard from "@/components/ui/PermissionGuard";

export default function AdminStaysPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [staysData, setStaysData] = useState<AdminStaysResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "checkins" | "checkouts" | "arrivals" | "departures">("active");

  // Dialog State
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: "checkin" | "checkout" | "extend";
    stay: AdminStayItem | null;
    loading: boolean;
    notes?: string;
    newCheckOut?: string;
  }>({
    isOpen: false,
    type: "checkin",
    stay: null,
    loading: false,
  });

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchStays = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminStays();
      setStaysData(data);
    } catch {
      setStaysData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStays();
  }, [fetchStays]);

  const handleOpenCheckin = (stay: AdminStayItem) => {
    setDialogState({
      isOpen: true,
      type: "checkin",
      stay,
      loading: false,
      notes: "",
    });
  };

  const handleOpenCheckout = (stay: AdminStayItem) => {
    setDialogState({
      isOpen: true,
      type: "checkout",
      stay,
      loading: false,
      notes: "",
    });
  };

  const handleOpenExtend = (stay: AdminStayItem) => {
    setDialogState({
      isOpen: true,
      type: "extend",
      stay,
      loading: false,
      newCheckOut: "",
    });
  };

  const handleDialogConfirm = async () => {
    if (!dialogState.stay) return;
    setDialogState((prev) => ({ ...prev, loading: true }));
    setFeedback(null);

    try {
      if (dialogState.type === "checkin") {
        await checkinBooking(dialogState.stay.id, dialogState.notes);
        setFeedback({
          type: "success",
          message: isAr
            ? `تم تسجيل وصول النزيل ${dialogState.stay.customer.name} للحجز ${dialogState.stay.reference}.`
            : `Guest ${dialogState.stay.customer.name} checked in successfully.`,
        });
      } else if (dialogState.type === "checkout") {
        await checkoutBooking(dialogState.stay.id, dialogState.notes);
        setFeedback({
          type: "success",
          message: isAr
            ? `تم تسجيل مغادرة النزيل للحجز ${dialogState.stay.reference}.`
            : `Guest checked out successfully for ${dialogState.stay.reference}.`,
        });
      } else if (dialogState.type === "extend") {
        if (!dialogState.newCheckOut) throw new Error(isAr ? "يرجى تحديد تاريخ المغادرة الجديد" : "Please select a new checkout date");
        await extendBookingStay(dialogState.stay.id, dialogState.newCheckOut);
        setFeedback({
          type: "success",
          message: isAr ? "تم تمديد فترة الإقامة بنجاح." : "Stay period extended successfully.",
        });
      }

      setDialogState({ isOpen: false, type: "checkin", stay: null, loading: false });
      await fetchStays();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر تنفيذ الإجراء المطلوب." : "Operation failed."),
      });
      setDialogState((prev) => ({ ...prev, loading: false }));
    }
  };

  const currentList = staysData
    ? activeTab === "active"
      ? staysData.data.active_stays
      : activeTab === "checkins"
      ? staysData.data.today_checkins
      : activeTab === "checkouts"
      ? staysData.data.today_checkouts
      : activeTab === "arrivals"
      ? staysData.data.upcoming_arrivals
      : staysData.data.upcoming_departures
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-brown">
            {isAr ? "إدارة الإقامات والنزلاء الحالية" : "Stay & Occupancy Operations"}
          </h1>
          <p className="text-xs text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "متابعة النزلاء المقيمين حالياً بالوحدات، وجداول الوصول والمغادرة اليومية في الجونة."
              : "Track active in-house guests, today's arrivals and departures, and front-desk workflows."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/bookings"
            className="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl text-xs font-bold transition border border-brand-border"
          >
            &larr; {isAr ? "جدول الحجوزات الكامل" : "All Bookings Ledger"}
          </Link>
        </div>
      </div>

      {/* KPI Operational Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setActiveTab("active")}
          className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
            activeTab === "active"
              ? "bg-blue-50/40 border-blue-400 ring-1 ring-blue-400 shadow-xs"
              : "bg-white border-brand-border hover:bg-blue-50/20"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-blue-800 block">
            {isAr ? "مقيمون حالياً (In-House)" : "Active In-House"}
          </span>
          <span className="text-2xl font-bold font-serif text-blue-700 mt-1 block">
            {staysData?.summary.active_stays_count ?? 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("checkins")}
          className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
            activeTab === "checkins"
              ? "bg-emerald-50/40 border-emerald-400 ring-1 ring-emerald-400 shadow-xs"
              : "bg-white border-brand-border hover:bg-emerald-50/20"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-emerald-800 block">
            {isAr ? "وصول اليوم (Check-ins)" : "Today's Check-ins"}
          </span>
          <span className="text-2xl font-bold font-serif text-emerald-700 mt-1 block">
            {staysData?.summary.today_checkins_count ?? 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("checkouts")}
          className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
            activeTab === "checkouts"
              ? "bg-amber-50/40 border-amber-400 ring-1 ring-amber-400 shadow-xs"
              : "bg-white border-brand-border hover:bg-amber-50/20"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-amber-800 block">
            {isAr ? "مغادرة اليوم (Check-outs)" : "Today's Check-outs"}
          </span>
          <span className="text-2xl font-bold font-serif text-amber-700 mt-1 block">
            {staysData?.summary.today_checkouts_count ?? 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("arrivals")}
          className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
            activeTab === "arrivals"
              ? "bg-stone-50 border-stone-400 ring-1 ring-stone-400 shadow-xs"
              : "bg-white border-brand-border hover:bg-stone-50"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-stone-700 block">
            {isAr ? "وصول خلال 7 أيام" : "Arrivals Next 7 Days"}
          </span>
          <span className="text-2xl font-bold font-serif text-stone-800 mt-1 block">
            {staysData?.summary.upcoming_arrivals_count ?? 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("departures")}
          className={`p-4 rounded-2xl border text-start transition-all cursor-pointer ${
            activeTab === "departures"
              ? "bg-stone-50 border-stone-400 ring-1 ring-stone-400 shadow-xs"
              : "bg-white border-brand-border hover:bg-stone-50"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-stone-700 block">
            {isAr ? "مغادرة خلال 7 أيام" : "Departures Next 7 Days"}
          </span>
          <span className="text-2xl font-bold font-serif text-stone-800 mt-1 block">
            {staysData?.summary.upcoming_departures_count ?? 0}
          </span>
        </button>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="underline cursor-pointer">
            {isAr ? "إغلاق" : "Dismiss"}
          </button>
        </div>
      )}

      {/* Operational Table */}
      {loading ? (
        <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-xs">
          <LoadingState message={isAr ? "جارٍ فحص سجل الإقامات الميداني..." : "Checking operational stays..."} />
        </div>
      ) : currentList.length === 0 ? (
        <EmptyState
          icon="🛎️"
          title={
            activeTab === "active"
              ? isAr ? "لا يوجد نزلاء مقيمون حالياً" : "No Active In-House Guests"
              : activeTab === "checkins"
              ? isAr ? "لا توجد وصولات مجدولة لهذا اليوم" : "No Check-ins Scheduled Today"
              : isAr ? "لا توجد سجلات تطابق الفلتر" : "No Records Found"
          }
          description={
            isAr
              ? "جميع الوحدات في هذه الفئة شاغرة أو لا توجد تحركات مسجلة حالياً."
              : "All units in this operational category are currently vacant."
          }
          actionText={isAr ? "عرض جميع الحجوزات" : "View All Bookings"}
          actionHref="/admin/bookings"
        />
      ) : (
        <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto gounow-scrollbar">
            <table className="w-full text-start text-xs">
              <thead className="bg-brand-sand-light/70 text-brand-brown-muted font-bold text-[10px] uppercase border-b border-brand-border">
                <tr>
                  <th className="py-3.5 px-4 text-start">{isAr ? "النزيل" : "Guest"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "الوحدة / العقار" : "Property"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "كود الحجز" : "Reference"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "مواعيد الإقامة" : "Dates"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "الحالة المادية" : "Payment"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "حالة الإقامة" : "Occupancy"}</th>
                  <th className="py-3.5 px-4 text-end">{isAr ? "إجراءات مكتب الاستقبال" : "Front-Desk Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {currentList.map((stay) => {
                  const propTitle = isAr && stay.bookable.title_ar ? stay.bookable.title_ar : stay.bookable.title;
                  return (
                    <tr key={stay.id} className="hover:bg-brand-sand/30 transition-colors">
                      {/* Guest */}
                      <td className="py-4 px-4 font-medium text-brand-brown">
                        <div className="font-semibold text-sm">{stay.customer.name}</div>
                        {stay.customer.phone && (
                          <a
                            href={`https://wa.me/${stay.customer.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-700 font-mono hover:underline inline-block mt-0.5"
                            dir="ltr"
                          >
                            📱 {stay.customer.phone}
                          </a>
                        )}
                      </td>

                      {/* Property */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-brand-brown block line-clamp-1 max-w-[200px]">
                          {propTitle}
                        </span>
                        <span className="text-[10px] text-brand-brown-muted block font-mono">
                          {stay.bookable.reference_number || ""}
                        </span>
                      </td>

                      {/* Booking Reference */}
                      <td className="py-4 px-4 font-mono font-bold text-brand-brown">
                        <Link href={`/admin/bookings/${stay.id}`} className="hover:text-brand-terracotta hover:underline">
                          {stay.reference}
                        </Link>
                      </td>

                      {/* Dates */}
                      <td className="py-4 px-4 font-mono text-[11px]" dir="ltr">
                        <div>In: {stay.check_in}</div>
                        <div className="text-brand-brown-muted text-[10px]">Out: {stay.check_out}</div>
                      </td>

                      {/* Financial Status */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-brand-brown block">{stay.formatted_total}</span>
                        {stay.amount_remaining_cents > 0 ? (
                          <span className="text-[10px] text-rose-700 font-semibold block">
                            {isAr ? "متبقي:" : "Due:"} {stay.formatted_remaining}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-700 block">
                            {isAr ? "مسدد بالكامل" : "Paid in Full"}
                          </span>
                        )}
                      </td>

                      {/* Occupancy Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            stay.stay_status === "in_house"
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : stay.stay_status === "checked_out"
                              ? "bg-stone-100 text-stone-800 border-stone-300"
                              : "bg-emerald-100 text-emerald-800 border-emerald-300"
                          }`}
                        >
                          {stay.stay_status === "in_house"
                            ? isAr ? "مقيم بالوحدة" : "In-House"
                            : stay.stay_status === "checked_out"
                            ? isAr ? "غادر" : "Checked-out"
                            : isAr ? "متوقع وصوله" : "Expected Arrival"}
                        </span>
                      </td>

                      {/* Front Desk Actions */}
                      <td className="py-4 px-4 text-end">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Check-in Action */}
                          {stay.stay_status !== "in_house" && stay.stay_status !== "checked_out" && (
                            <PermissionGuard permission="manage_bookings">
                              <button
                                onClick={() => handleOpenCheckin(stay)}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition shadow-xs cursor-pointer"
                              >
                                {isAr ? "تسجيل وصول" : "Check-in"}
                              </button>
                            </PermissionGuard>
                          )}

                          {/* Check-out Action */}
                          {stay.stay_status === "in_house" && (
                            <PermissionGuard permission="manage_bookings">
                              <button
                                onClick={() => handleOpenCheckout(stay)}
                                className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold transition shadow-xs cursor-pointer"
                              >
                                {isAr ? "تسجيل مغادرة" : "Check-out"}
                              </button>
                            </PermissionGuard>
                          )}

                          {/* Extend Stay */}
                          {stay.stay_status === "in_house" && (
                            <PermissionGuard permission="manage_bookings">
                              <button
                                onClick={() => handleOpenExtend(stay)}
                                className="px-2.5 py-1.5 rounded-lg bg-white border border-brand-border text-brand-brown hover:bg-brand-sand-light text-[11px] font-bold transition cursor-pointer"
                              >
                                {isAr ? "تمديد" : "Extend"}
                              </button>
                            </PermissionGuard>
                          )}

                          <Link
                            href={`/admin/bookings/${stay.id}`}
                            className="px-2.5 py-1.5 rounded-lg bg-brand-sand-light hover:bg-brand-sand text-brand-brown text-[11px] font-bold transition border border-brand-border"
                          >
                            {isAr ? "الملف" : "Dossier"}
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Flow Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={
          dialogState.type === "checkin"
            ? isAr ? "تأكيد تسجيل وصول النزيل" : "Confirm Guest Check-in"
            : dialogState.type === "checkout"
            ? isAr ? "تأكيد تسجيل مغادرة النزيل" : "Confirm Guest Check-out"
            : isAr ? "تمديد فترة الإقامة" : "Extend Guest Stay"
        }
        description={
          dialogState.type === "checkin"
            ? isAr
              ? `تأكيد وصول النزيل ${dialogState.stay?.customer.name} للحجز ${dialogState.stay?.reference} وتسليمه المفاتيح؟`
              : `Confirm physical arrival of ${dialogState.stay?.customer.name} for booking ${dialogState.stay?.reference}?`
            : dialogState.type === "checkout"
            ? isAr
              ? `تأكيد مغادرة النزيل ${dialogState.stay?.customer.name} وإخلاء الوحدة؟`
              : `Confirm check-out of ${dialogState.stay?.customer.name} and release unit for housekeeping?`
            : isAr
              ? `حدد تاريخ المغادرة الجديد لتمديد الإقامة للحجز ${dialogState.stay?.reference}.`
              : `Select the new check-out date for booking ${dialogState.stay?.reference}.`
        }
        confirmText={
          dialogState.type === "checkin"
            ? isAr ? "تأكيد الوصول" : "Confirm Check-in"
            : dialogState.type === "checkout"
            ? isAr ? "تأكيد المغادرة" : "Confirm Check-out"
            : isAr ? "تأكيد التمديد" : "Confirm Extension"
        }
        cancelText={isAr ? "إلغاء" : "Cancel"}
        isLoading={dialogState.loading}
        onConfirm={handleDialogConfirm}
        onCancel={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
