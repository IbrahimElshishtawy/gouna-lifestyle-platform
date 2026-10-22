"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getAdminBookings,
  updateBookingStatus,
  refundBooking,
  checkinBooking,
  checkoutBooking,
} from "@/features/admin/services/admin.api";
import type { AdminBookingItem, AdminBookingSummary } from "@/features/admin/types";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PermissionGuard from "@/components/ui/PermissionGuard";
import SectionExportButtons from "@/features/admin/components/SectionExportButtons";

export default function AdminBookingsPage() {
  const searchParams = useSearchParams();
  const urlStatus = searchParams.get("status") || "all";
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [bookings, setBookings] = useState<AdminBookingItem[]>([]);
  const [summary, setSummary] = useState<AdminBookingSummary>({
    total: 0,
    pending: 0,
    confirmed: 0,
    active_stays: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters state
  const [activeTab, setActiveTab] = useState<string>(urlStatus);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Action Dialog State
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: "confirm" | "cancel" | "refund" | "checkin" | "checkout";
    bookingId: number | null;
    reference: string;
    loading: boolean;
    notes?: string;
    booking?: AdminBookingItem | null;
    refundAmount?: string;
    refundReason?: string;
    cancelBooking?: boolean;
  }>({
    isOpen: false,
    type: "confirm",
    bookingId: null,
    reference: "",
    loading: false,
    booking: null,
    refundAmount: "",
    refundReason: "",
    cancelBooking: true,
  });

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = activeTab !== "all" ? activeTab : undefined;
      const paymentParam = paymentFilter !== "all" ? paymentFilter : undefined;
      const searchParam = searchQuery.trim() || undefined;

      const res = await getAdminBookings({
        status: statusParam,
        payment_status: paymentParam,
        search: searchParam,
        check_in_from: dateFrom || undefined,
        check_in_to: dateTo || undefined,
        page: currentPage,
        per_page: 15,
      });

      setBookings(res.data);
      if (res.summary) {
        setSummary(res.summary);
      }
      if (res.meta) {
        setTotalCount(res.meta.total);
        setLastPage(res.meta.last_page);
      } else {
        setTotalCount(res.data.length);
      }
    } catch {
      setBookings([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [activeTab, paymentFilter, searchQuery, dateFrom, dateTo, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchBookings]);

  const handleOpenDialog = (
    type: "confirm" | "cancel" | "refund" | "checkin" | "checkout",
    id: number,
    ref: string,
    booking?: AdminBookingItem
  ) => {
    let refundAmount = "";
    let cancelBooking = true;
    if (type === "refund" && booking) {
      const paid = booking.amount_paid_cents || 0;
      const refunded = booking.refund_amount_cents || 0;
      const maxRefundable = Math.max(0, paid - refunded);
      refundAmount = (maxRefundable / 100).toFixed(2);
      cancelBooking = true;
    }

    setDialogState({
      isOpen: true,
      type,
      bookingId: id,
      reference: ref,
      loading: false,
      notes: "",
      booking: booking || null,
      refundAmount,
      refundReason: isAr ? "طلب العميل إلغاء الحجز" : "Customer cancellation request",
      cancelBooking,
    });
  };

  const handleDialogConfirm = async () => {
    if (!dialogState.bookingId) return;

    setDialogState((prev) => ({ ...prev, loading: true }));
    setFeedback(null);

    try {
      if (dialogState.type === "confirm") {
        await updateBookingStatus(dialogState.bookingId, "confirmed");
        setFeedback({
          type: "success",
          message: isAr
            ? `تم تأكيد الحجز ${dialogState.reference} بنجاح.`
            : `Booking ${dialogState.reference} confirmed successfully.`,
        });
      } else if (dialogState.type === "cancel") {
        await updateBookingStatus(dialogState.bookingId, "cancelled");
        setFeedback({
          type: "success",
          message: isAr
            ? `تم إلغاء الحجز ${dialogState.reference} وتحرير تواريخ الإقامة.`
            : `Booking ${dialogState.reference} has been cancelled and dates released.`,
        });
      } else if (dialogState.type === "refund") {
        const amountCents = dialogState.refundAmount
          ? Math.round(parseFloat(dialogState.refundAmount) * 100)
          : undefined;
        await refundBooking(
          dialogState.bookingId,
          amountCents,
          dialogState.refundReason,
          dialogState.cancelBooking
        );
        setFeedback({
          type: "success",
          message: isAr
            ? `تمت معالجة استرداد المبلغ للحجز ${dialogState.reference} بنجاح.`
            : `Refund processed successfully for ${dialogState.reference}.`,
        });
      } else if (dialogState.type === "checkin") {
        await checkinBooking(dialogState.bookingId, dialogState.notes);
        setFeedback({
          type: "success",
          message: isAr
            ? `تم تسجيل وصول النزيل للحجز ${dialogState.reference}.`
            : `Guest checked-in successfully for booking ${dialogState.reference}.`,
        });
      } else if (dialogState.type === "checkout") {
        await checkoutBooking(dialogState.bookingId, dialogState.notes);
        setFeedback({
          type: "success",
          message: isAr
            ? `تم تسجيل مغادرة النزيل وإتمام الحجز ${dialogState.reference}.`
            : `Guest checked out and reservation ${dialogState.reference} completed.`,
        });
      }

      setDialogState((prev) => ({ ...prev, isOpen: false }));
      await fetchBookings();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر تنفيذ الإجراء المطلوب." : "Operation failed."),
      });
      setDialogState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-brown">
            {isAr ? "إدارة الحجوزات والعمليات" : "Bookings & Operations Management"}
          </h1>
          <p className="text-xs text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "متابعة دورة حياة الحجوزات، تحصيلات الدفع، وحالات وصول ومغادرة النزلاء في الجونة."
              : "Live reservations lifecycle, payment auditing, and guest occupancy in El Gouna."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SectionExportButtons sectionType="bookings" />

          <Link
            href="/admin/stays"
            className="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl text-xs font-bold transition flex items-center gap-2 border border-brand-border"
          >
            <span>🛎️</span>
            <span>{isAr ? "إدارة الإقامات الحية" : "Active Stays Hub"}</span>
          </Link>

          <Link
            href="/admin/bookings/calendar"
            className="px-4 py-2 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2"
          >
            <span>📅</span>
            <span>{isAr ? "تقويم التوفر" : "Availability Calendar"}</span>
          </Link>
        </div>
      </div>

      {/* Operational Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <button
          onClick={() => { setActiveTab("all"); setCurrentPage(1); }}
          className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-white border-brand-terracotta ring-1 ring-brand-terracotta shadow-xs"
              : "bg-white border-brand-border hover:bg-brand-sand-light/50"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
            {isAr ? "إجمالي الحجوزات" : "Total Bookings"}
          </span>
          <span className="text-xl font-bold font-serif text-brand-brown mt-0.5 block">
            {summary.total}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("pending"); setCurrentPage(1); }}
          className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
            activeTab === "pending"
              ? "bg-amber-50/40 border-amber-400 ring-1 ring-amber-400 shadow-xs"
              : "bg-white border-brand-border hover:bg-amber-50/20"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-amber-800 block">
            {isAr ? "قيد التأكيد" : "Pending"}
          </span>
          <span className="text-xl font-bold font-serif text-amber-700 mt-0.5 block">
            {summary.pending}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("confirmed"); setCurrentPage(1); }}
          className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
            activeTab === "confirmed"
              ? "bg-emerald-50/40 border-emerald-400 ring-1 ring-emerald-400 shadow-xs"
              : "bg-white border-brand-border hover:bg-emerald-50/20"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-emerald-800 block">
            {isAr ? "حجوزات مؤكدة" : "Confirmed"}
          </span>
          <span className="text-xl font-bold font-serif text-emerald-700 mt-0.5 block">
            {summary.confirmed}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("active"); setCurrentPage(1); }}
          className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
            activeTab === "active"
              ? "bg-blue-50/40 border-blue-400 ring-1 ring-blue-400 shadow-xs"
              : "bg-white border-brand-border hover:bg-blue-50/20"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-blue-800 block">
            {isAr ? "نزلاء حاليون" : "Active In-House"}
          </span>
          <span className="text-xl font-bold font-serif text-blue-700 mt-0.5 block">
            {summary.active_stays}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("completed"); setCurrentPage(1); }}
          className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
            activeTab === "completed"
              ? "bg-stone-50 border-stone-400 ring-1 ring-stone-400 shadow-xs"
              : "bg-white border-brand-border hover:bg-stone-50"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-stone-600 block">
            {isAr ? "مكتملة / مغادرة" : "Completed"}
          </span>
          <span className="text-xl font-bold font-serif text-stone-700 mt-0.5 block">
            {summary.completed}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("cancelled"); setCurrentPage(1); }}
          className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
            activeTab === "cancelled"
              ? "bg-rose-50/40 border-rose-400 ring-1 ring-rose-400 shadow-xs"
              : "bg-white border-brand-border hover:bg-rose-50/20"
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-rose-800 block">
            {isAr ? "ملغاة" : "Cancelled"}
          </span>
          <span className="text-xl font-bold font-serif text-rose-700 mt-0.5 block">
            {summary.cancelled}
          </span>
        </button>
      </div>

      {/* Feedback Toast */}
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
            className="text-xs font-bold opacity-60 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="flex-1">
            <input
              type="text"
              placeholder={
                isAr
                  ? "بحث بكود الحجز، اسم النزيل، البريد، الهاتف، أو اسم العقار..."
                  : "Search booking reference, guest name, email, phone, or villa..."
              }
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/40 placeholder:text-brand-brown-muted focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
            />
          </div>

          {/* Payment Status Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-brand-border text-xs font-medium text-brand-brown bg-brand-sand-light/40 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
            >
              <option value="all">{isAr ? "جميع حالات الدفع" : "All Payment Statuses"}</option>
              <option value="paid">{isAr ? "مدفوع بالكامل" : "Fully Paid"}</option>
              <option value="partially_paid">{isAr ? "مدفوع جزئياً" : "Partially Paid"}</option>
              <option value="unpaid">{isAr ? "غير مدفوع" : "Unpaid"}</option>
              <option value="refunded">{isAr ? "مسترد" : "Refunded"}</option>
            </select>

            {/* Date Pickers */}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/40 focus:outline-none"
              title={isAr ? "تاريخ الوصول من" : "Check-in from"}
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/40 focus:outline-none"
              title={isAr ? "تاريخ الوصول إلى" : "Check-in to"}
            />

            {(searchQuery || paymentFilter !== "all" || dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setPaymentFilter("all");
                  setDateFrom("");
                  setDateTo("");
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl bg-brand-sand text-brand-brown hover:bg-brand-sand-dark text-xs font-semibold cursor-pointer"
              >
                {isAr ? "إعادة ضبط" : "Reset"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-xs">
          <LoadingState message={isAr ? "جارٍ تحميل سجل الحجوزات التشغيلي..." : "Loading operational bookings ledger..."} rows={6} />
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="📅"
          title={isAr ? "لا توجد حجوزات مطابقة" : "No Bookings Found"}
          description={
            isAr
              ? "لم يتم العثور على سجلات حجوزات تطابق معايير الفلترة المحددة."
              : "No reservation records match your selected filter criteria."
          }
          actionText={isAr ? "عرض جميع الحجوزات" : "View All Bookings"}
          onAction={() => {
            setActiveTab("all");
            setPaymentFilter("all");
            setSearchQuery("");
            setDateFrom("");
            setDateTo("");
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto gounow-scrollbar">
            <table className="w-full text-start text-xs">
              <thead className="bg-brand-sand-light/70 text-brand-brown-muted font-bold text-[10px] uppercase tracking-wider border-b border-brand-border">
                <tr>
                  <th className="py-3.5 px-4 text-start">{isAr ? "كود الحجز" : "Booking ID"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "النزيل" : "Guest"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "العقار / الوحدة" : "Property / Unit"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "جدول الإقامة" : "Stay Dates"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "المالية" : "Total & Paid"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "حالة الحجز" : "Booking Status"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "حالة الدفع" : "Payment"}</th>
                  <th className="py-3.5 px-4 text-end">{isAr ? "إجراءات العمليات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {bookings.map((b) => {
                  const propTitle = b.bookable
                    ? (isAr && b.bookable.title_ar ? b.bookable.title_ar : b.bookable.title)
                    : (isAr ? "عقار غير محدد" : "Property");
                  return (
                    <tr key={b.id} className="hover:bg-brand-sand/30 transition-colors">
                      {/* Booking Reference */}
                      <td className="py-4 px-4 font-mono font-bold text-brand-brown">
                        <Link
                          href={`/admin/bookings/${b.id}`}
                          className="hover:text-brand-terracotta hover:underline"
                        >
                          {b.reference}
                        </Link>
                        <span className="block text-[9px] text-brand-brown-muted font-normal font-sans">
                          {b.created_at ? new Date(b.created_at).toLocaleDateString() : ""}
                        </span>
                      </td>

                      {/* Guest Details */}
                      <td className="py-4 px-4 font-medium text-brand-brown">
                        <div>
                          <span className="font-semibold">{b.customer?.name || (isAr ? "نزيل" : "Guest")}</span>
                          {b.customer?.email && (
                            <span className="block text-[10px] text-brand-brown-muted truncate max-w-[150px]">
                              {b.customer.email}
                            </span>
                          )}
                          {b.customer?.phone && (
                            <a
                              href={`https://wa.me/${b.customer.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-emerald-700 font-mono hover:underline inline-block mt-0.5"
                              dir="ltr"
                            >
                              📱 {b.customer.phone}
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Bookable Property */}
                      <td className="py-4 px-4">
                        <Link
                          href={b.bookable?.id ? `/admin/properties/${b.bookable.id}` : "#"}
                          className="font-semibold text-brand-brown hover:text-brand-terracotta block line-clamp-1 max-w-[180px]"
                        >
                          {propTitle}
                        </Link>
                        <span className="text-[10px] text-brand-brown-muted block">
                          {b.nights} {isAr ? "ليالٍ" : "nights"} • {b.guests} {isAr ? "ضيوف" : "guests"}
                        </span>
                      </td>

                      {/* Schedule Dates */}
                      <td className="py-4 px-4 text-brand-brown font-mono text-[11px]" dir="ltr">
                        <div>{b.check_in}</div>
                        <div className="text-[10px] text-brand-brown-muted">→ {b.check_out}</div>
                      </td>

                      {/* Financial Amounts */}
                      <td className="py-4 px-4">
                        <span className="font-serif font-bold text-brand-brown block">
                          {b.formatted_total}
                        </span>
                        <span className="text-[10px] text-emerald-700 block">
                          {isAr ? "المسدد:" : "Paid:"} {b.formatted_paid}
                        </span>
                        {b.amount_remaining_cents ? (
                          <span className="text-[10px] text-amber-700 block font-medium">
                            {isAr ? "المتبقي:" : "Due:"} {b.formatted_remaining}
                          </span>
                        ) : null}
                      </td>

                      {/* Booking Status Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            b.status === "confirmed" || b.status === "completed"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : b.status === "cancelled" || b.status === "refunded"
                              ? "bg-rose-100 text-rose-800 border-rose-300"
                              : "bg-amber-100 text-amber-800 border-amber-300"
                          }`}
                        >
                          {b.status.toUpperCase()}
                        </span>
                        {b.stay_status === "in_house" && (
                          <span className="block mt-1 text-[9px] font-bold text-blue-700">
                            🛎️ {isAr ? "مقيم بالوحدة حالياً" : "In-House Guest"}
                          </span>
                        )}
                      </td>

                      {/* Payment Status Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            b.payment_status === "paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : b.payment_status === "partially_paid"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : b.payment_status === "refunded"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-stone-100 text-stone-700 border border-stone-200"
                          }`}
                        >
                          {b.payment_status.toUpperCase()}
                        </span>
                      </td>

                      {/* Operational Actions */}
                      <td className="py-4 px-4 text-end">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* View Details */}
                          <Link
                            href={`/admin/bookings/${b.id}`}
                            className="px-2.5 py-1 rounded-lg bg-brand-sand-light hover:bg-brand-sand text-brand-brown text-[11px] font-bold transition border border-brand-border"
                          >
                            {isAr ? "التفاصيل" : "Details"}
                          </Link>

                          {/* Confirm */}
                          {b.status === "pending" && (
                            <PermissionGuard permission="manage_bookings">
                              <button
                                onClick={() => handleOpenDialog("confirm", b.id, b.reference, b)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition shadow-2xs cursor-pointer"
                              >
                                {isAr ? "تأكيد" : "Confirm"}
                              </button>
                            </PermissionGuard>
                          )}

                          {/* Check-in (if confirmed and not yet completed) */}
                          {(b.status === "confirmed" || b.payment_status === "paid") && b.stay_status !== "in_house" && b.stay_status !== "checked_out" && (
                            <PermissionGuard permission="manage_bookings">
                              <button
                                onClick={() => handleOpenDialog("checkin", b.id, b.reference, b)}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition shadow-2xs cursor-pointer"
                              >
                                {isAr ? "تسجيل وصول" : "Check-in"}
                              </button>
                            </PermissionGuard>
                          )}

                          {/* Check-out (if currently in_house) */}
                          {b.stay_status === "in_house" && (
                            <PermissionGuard permission="manage_bookings">
                              <button
                                onClick={() => handleOpenDialog("checkout", b.id, b.reference, b)}
                                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-900 text-white text-[11px] font-bold transition shadow-2xs cursor-pointer"
                              >
                                {isAr ? "تسجيل مغادرة" : "Check-out"}
                              </button>
                            </PermissionGuard>
                          )}

                          {/* Cancel */}
                          {b.status !== "cancelled" && b.status !== "completed" && (
                            <PermissionGuard permission="manage_bookings">
                              <button
                                onClick={() => handleOpenDialog("cancel", b.id, b.reference, b)}
                                className="px-2.5 py-1 rounded-lg bg-white border border-brand-border text-brand-brown hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-[11px] font-semibold transition cursor-pointer"
                              >
                                {isAr ? "إلغاء" : "Cancel"}
                              </button>
                            </PermissionGuard>
                          )}

                          {/* Refund */}
                          {b.payment_status !== "refunded" && (b.amount_paid_cents - (b.refund_amount_cents || 0)) > 0 && (
                            <PermissionGuard permission="manage_payments">
                              <button
                                onClick={() => handleOpenDialog("refund", b.id, b.reference, b)}
                                className="px-2.5 py-1 rounded-lg bg-white border border-brand-border text-brand-brown hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 text-[11px] font-semibold transition cursor-pointer"
                              >
                                {isAr ? "استرداد" : "Refund"}
                              </button>
                            </PermissionGuard>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="p-4 border-t border-brand-border flex items-center justify-between text-xs text-brand-brown-muted">
              <span>
                {isAr
                  ? `عرض الصفحة ${currentPage} من إجمالي ${lastPage} (${totalCount} حجز)`
                  : `Showing page ${currentPage} of ${lastPage} (${totalCount} bookings)`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-brand-border hover:bg-brand-sand-light disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isAr ? "السابق" : "Previous"}
                </button>
                <button
                  disabled={currentPage >= lastPage}
                  onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-brand-border hover:bg-brand-sand-light disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isAr ? "التالي" : "Next"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation & Operation Action Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        maxWidth={dialogState.type === "refund" ? "max-w-lg" : "max-w-md"}
        title={
          dialogState.type === "confirm"
            ? isAr ? "تأكيد الحجز النهائي" : "Confirm Reservation"
            : dialogState.type === "checkin"
            ? isAr ? "تسجيل وصول النزيل (Check-in)" : "Guest Check-in"
            : dialogState.type === "checkout"
            ? isAr ? "تسجيل مغادرة النزيل (Check-out)" : "Guest Check-out"
            : dialogState.type === "cancel"
            ? isAr ? "إلغاء الحجز" : "Cancel Booking"
            : isAr ? "معالجة استرداد المبلغ" : "Process Refund"
        }
        description={
          dialogState.type === "confirm"
            ? isAr
              ? `هل أنت متأكد من تأكيد الحجز رقم ${dialogState.reference}؟ سيتم إشعار النزيل وتثبيت مواعيد الإقامة.`
              : `Are you sure you want to confirm reservation ${dialogState.reference}? The guest will be notified.`
            : dialogState.type === "checkin"
            ? isAr
              ? `هل وصل النزيل بالفعل إلى الوحدة لتأكيد تسجيل الدخول للحجز ${dialogState.reference}؟ سيتم تحديث حالة الإقامة لتصبح في حيازة النزيل.`
              : `Confirm guest arrival for booking ${dialogState.reference}? Stay status will transition to in-house.`
            : dialogState.type === "checkout"
            ? isAr
              ? `تأكيد مغادرة النزيل وتسليم المفاتيح للحجز ${dialogState.reference}؟ سيتم تصنيف الحجز كمكتمل وتحرير الوحدة للصيانة والتنظيف.`
              : `Confirm guest check-out for ${dialogState.reference}? Booking will be marked completed and unit released for housekeeping.`
            : dialogState.type === "cancel"
            ? isAr
              ? `تحذير: إلغاء الحجز رقم ${dialogState.reference} سيقوم بتحرير الليالي في جدول التوفر وإلغاء صلاحية الوصول.`
              : `Warning: Cancelling reservation ${dialogState.reference} will release blocked calendar dates.`
            : isAr
              ? `حدد قيمة الاسترداد وسبب العملية للحجز ${dialogState.reference}. سيتم تسجيل الحركة المالية فوراً.`
              : `Specify the refund amount and reason for ${dialogState.reference}. The transaction will be recorded immediately.`
        }
        confirmText={
          dialogState.type === "confirm"
            ? isAr ? "نعم، تأكيد الحجز" : "Confirm Booking"
            : dialogState.type === "checkin"
            ? isAr ? "تأكيد تسجيل الوصول" : "Confirm Check-in"
            : dialogState.type === "checkout"
            ? isAr ? "تأكيد تسجيل المغادرة" : "Confirm Check-out"
            : dialogState.type === "cancel"
            ? isAr ? "تأكيد الإلغاء" : "Cancel Booking"
            : isAr ? "تنفيذ الاسترداد" : "Execute Refund"
        }
        cancelText={isAr ? "تراجع" : "Dismiss"}
        isDestructive={dialogState.type === "cancel" || dialogState.type === "refund"}
        isLoading={dialogState.loading}
        confirmDisabled={
          dialogState.type === "refund" &&
          (() => {
            if (!dialogState.booking) return true;
            const maxRefundableCents = Math.max(
              0,
              (dialogState.booking.amount_paid_cents || 0) - (dialogState.booking.refund_amount_cents || 0)
            );
            const amount = parseFloat(dialogState.refundAmount || "0");
            const amountCents = Math.round(amount * 100);
            return isNaN(amount) || amountCents <= 0 || amountCents > maxRefundableCents;
          })()
        }
        onConfirm={handleDialogConfirm}
        onCancel={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
      >
        {dialogState.booking && dialogState.type === "refund" && (() => {
          const paidCents = dialogState.booking.amount_paid_cents || 0;
          const refundedCents = dialogState.booking.refund_amount_cents || 0;
          const maxRefundableCents = Math.max(0, paidCents - refundedCents);
          const enteredAmount = parseFloat(dialogState.refundAmount || "0");
          const enteredCents = isNaN(enteredAmount) ? 0 : Math.round(enteredAmount * 100);
          const isFull = enteredCents >= maxRefundableCents && maxRefundableCents > 0;
          const currency = dialogState.booking.currency || "EGP";

          return (
            <div className="space-y-4 text-xs">
              {/* Financial Snapshot Card */}
              <div className="bg-brand-sand-light/50 border border-brand-border/60 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-brand-brown-muted font-medium">{isAr ? "النزيل:" : "Guest:"}</span>
                  <span className="font-bold text-brand-brown">{dialogState.booking.customer.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-brown-muted font-medium">{isAr ? "إجمالي الحجز:" : "Booking Total:"}</span>
                  <span className="font-mono font-bold text-brand-brown">{dialogState.booking.formatted_total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-brown-muted font-medium">{isAr ? "المسدد حتى الآن:" : "Paid so far:"}</span>
                  <span className="font-mono font-bold text-emerald-700">{dialogState.booking.formatted_paid}</span>
                </div>
                {refundedCents > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-brand-brown-muted font-medium">{isAr ? "مسترد سابقاً:" : "Previously refunded:"}</span>
                    <span className="font-mono font-bold text-amber-700">
                      {currency} {(refundedCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-brand-border/50 pt-2 text-brand-terracotta">
                  <span className="font-bold">{isAr ? "الحد الأقصى المتاح للاسترداد:" : "Max Refundable Balance:"}</span>
                  <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded-md border border-brand-border">
                    {currency} {(maxRefundableCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-[11px] font-bold text-brand-brown mb-1.5">
                  {isAr ? "خيارات الاسترداد السريعة:" : "Quick Refund Options:"}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setDialogState((prev) => ({
                        ...prev,
                        refundAmount: (maxRefundableCents / 100).toFixed(2),
                        cancelBooking: true,
                      }))
                    }
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      isFull
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-white hover:bg-brand-sand-light text-brand-brown border-brand-border"
                    }`}
                  >
                    {isAr ? "استرداد كامل (100%)" : "Full Refund (100%)"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDialogState((prev) => ({
                        ...prev,
                        refundAmount: ((maxRefundableCents * 0.5) / 100).toFixed(2),
                        cancelBooking: false,
                      }))
                    }
                    className="py-1.5 px-2 rounded-xl text-xs font-bold transition border bg-white hover:bg-brand-sand-light text-brand-brown border-brand-border cursor-pointer"
                  >
                    {isAr ? "استرداد 50%" : "Refund 50%"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDialogState((prev) => ({
                        ...prev,
                        refundAmount: ((maxRefundableCents * 0.25) / 100).toFixed(2),
                        cancelBooking: false,
                      }))
                    }
                    className="py-1.5 px-2 rounded-xl text-xs font-bold transition border bg-white hover:bg-brand-sand-light text-brand-brown border-brand-border cursor-pointer"
                  >
                    {isAr ? "تعويض 25%" : "Refund 25%"}
                  </button>
                </div>
              </div>

              {/* Refund Amount Input */}
              <div>
                <label className="block text-[11px] font-bold text-brand-brown mb-1.5">
                  {isAr ? `قيمة المبلغ المسترد (${currency}) *` : `Refund Amount (${currency}) *`}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={(maxRefundableCents / 100).toFixed(2)}
                    value={dialogState.refundAmount || ""}
                    onChange={(e) => setDialogState((prev) => ({ ...prev, refundAmount: e.target.value }))}
                    placeholder="0.00"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/30 focus:outline-none focus:ring-2 focus:ring-rose-500/40 font-mono font-bold"
                  />
                  <span className="absolute end-3 top-2.5 text-xs text-brand-brown-muted font-bold">
                    {currency}
                  </span>
                </div>
                {enteredCents > maxRefundableCents && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">
                    {isAr
                      ? `القيمة المدخلة تتجاوز الرصيد القابل للاسترداد (${(maxRefundableCents / 100).toFixed(2)} ${currency}).`
                      : `Amount exceeds maximum refundable balance (${(maxRefundableCents / 100).toFixed(2)} ${currency}).`}
                  </p>
                )}
              </div>

              {/* Refund Reason */}
              <div>
                <label className="block text-[11px] font-bold text-brand-brown mb-1.5">
                  {isAr ? "سبب الاسترداد *" : "Refund Reason *"}
                </label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {[
                    isAr ? "طلب العميل إلغاء الحجز" : "Customer cancellation request",
                    isAr ? "تعويض عن ملاحظة في الخدمة" : "Service compensation",
                    isAr ? "تعديل إداري متفق عليه" : "Agreed administrative adjustment",
                    isAr ? "ظروف جوية أو طارئة" : "Weather / Force majeure",
                  ].map((presetReason) => (
                    <button
                      key={presetReason}
                      type="button"
                      onClick={() => setDialogState((prev) => ({ ...prev, refundReason: presetReason }))}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition cursor-pointer ${
                        dialogState.refundReason === presetReason
                          ? "bg-stone-800 text-white border-stone-800"
                          : "bg-white text-brand-brown-muted border-brand-border hover:bg-brand-sand-light"
                      }`}
                    >
                      {presetReason}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={dialogState.refundReason || ""}
                  onChange={(e) => setDialogState((prev) => ({ ...prev, refundReason: e.target.value }))}
                  placeholder={isAr ? "اكتب سبب الاسترداد المالي..." : "Enter reason for refund..."}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/30 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                />
              </div>

              {/* Cancellation Toggle */}
              <div className="bg-stone-50 border border-brand-border/60 rounded-xl p-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dialogState.cancelBooking ?? isFull}
                    onChange={(e) => setDialogState((prev) => ({ ...prev, cancelBooking: e.target.checked }))}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-brand-border"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-brand-brown block">
                      {isAr ? "إلغاء الحجز أيضاً وتحرير الليالي في جدول التوفر" : "Also cancel booking and release calendar dates"}
                    </span>
                    <span className="text-[10px] text-brand-brown-muted">
                      {isAr
                        ? "عند تفعيل هذا الخيار، سيتم نقل الحجز إلى حالة 'ملغي' وإتاحة الوحدة لحجوزات جديدة."
                        : "When checked, booking transitions to cancelled and dates become available for new guests."}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          );
        })()}

        {/* Check-in Interactive Details Card */}
        {dialogState.type === "checkin" && dialogState.booking && (() => {
          const b = dialogState.booking;
          const isEarly = b.check_in > new Date().toISOString().split("T")[0];
          const hasRemaining = (b.amount_remaining_cents || 0) > 0;

          return (
            <div className="space-y-3.5 text-xs">
              <div className="bg-brand-sand-light/50 border border-brand-border/60 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-brand-brown-muted font-medium">{isAr ? "النزيل:" : "Guest:"}</span>
                  <span className="font-bold text-brand-brown">
                    {b.customer.name} {b.customer.phone && `(${b.customer.phone})`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-brown-muted font-medium">{isAr ? "الوحدة المحجوزة:" : "Booked Unit:"}</span>
                  <span className="font-semibold text-brand-brown">{b.bookable.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-brown-muted font-medium">{isAr ? "فترة الإقامة:" : "Stay Period:"}</span>
                  <span className="font-mono text-brand-brown" dir="ltr">
                    {b.check_in} → {b.check_out} ({b.nights} {isAr ? "ليالٍ" : "nights"})
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-brand-border/40">
                  <span className="text-brand-brown-muted font-medium">{isAr ? "حالة الدفع:" : "Payment Status:"}</span>
                  <span className={`font-bold ${hasRemaining ? "text-amber-700" : "text-emerald-700"}`}>
                    {hasRemaining
                      ? `${isAr ? "متبقي" : "Due:"} ${b.formatted_remaining}`
                      : isAr ? "مدفوع بالكامل ✓" : "Fully Paid ✓"}
                  </span>
                </div>
              </div>

              {isEarly && (
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-[11px] flex items-center gap-2">
                  <span>ℹ️</span>
                  <span>
                    {isAr
                      ? `وصول مبكر: موعد الحجز المجدول يبدأ في ${b.check_in}. سيتم تفعيل الإقامة فوراً كمقيم بالوحدة.`
                      : `Early Check-in: Scheduled arrival is ${b.check_in}. Status will transition immediately to in-house.`}
                  </span>
                </div>
              )}

              {hasRemaining && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                  <span>⚠️</span>
                  <span>
                    {isAr
                      ? `تنبيه: يوجد رصيد متبقي ${b.formatted_remaining}، يُرجى التأكد من تحصيله أو التنسيق مع النزيل.`
                      : `Notice: Remaining balance ${b.formatted_remaining} is still due.`}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-brand-brown mb-1">
                  {isAr ? "ملاحظات الاستقبال والتسليم (اختياري):" : "Front-desk Check-in Notes (optional):"}
                </label>
                <textarea
                  value={dialogState.notes || ""}
                  onChange={(e) => setDialogState((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder={isAr ? "أية ملاحظات خاصة بتسليم المفاتيح أو حالة الوحدة أو طلبات النزيل..." : "Notes regarding key handover, unit condition, or guest requests..."}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/30 focus:outline-none focus:ring-1 focus:ring-brand-terracotta resize-none"
                />
              </div>
            </div>
          );
        })()}

        {/* Check-out Interactive Details Card */}
        {dialogState.type === "checkout" && dialogState.booking && (() => {
          const b = dialogState.booking;
          return (
            <div className="space-y-3.5 text-xs">
              <div className="bg-brand-sand-light/50 border border-brand-border/60 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-brand-brown-muted font-medium">{isAr ? "النزيل المغادر:" : "Departing Guest:"}</span>
                  <span className="font-bold text-brand-brown">{b.customer.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-brown-muted font-medium">{isAr ? "الوحدة:" : "Unit:"}</span>
                  <span className="font-semibold text-brand-brown">{b.bookable.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-brown-muted font-medium">{isAr ? "موعد المغادرة المجدول:" : "Scheduled Departure:"}</span>
                  <span className="font-mono text-brand-brown" dir="ltr">{b.check_out}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-brown mb-1">
                  {isAr ? "ملاحظات فحص الوحدة والمغادرة (اختياري):" : "Checkout & Inspection Notes (optional):"}
                </label>
                <textarea
                  value={dialogState.notes || ""}
                  onChange={(e) => setDialogState((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder={isAr ? "تسجيل استلام المفاتيح، حالة الوحدة، أو أية متعلقات..." : "Key return confirmation, unit inspection condition, belongings..."}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/30 focus:outline-none focus:ring-1 focus:ring-brand-terracotta resize-none"
                />
              </div>
            </div>
          );
        })()}
      </ConfirmDialog>
    </div>
  );
}
