"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getAdminBookingDetails,
  updateBookingStatus,
  checkinBooking,
  checkoutBooking,
  extendBookingStay,
  refundBooking,
} from "@/features/admin/services/admin.api";
import type { AdminBookingDetail } from "@/features/admin/types";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PermissionGuard from "@/components/ui/PermissionGuard";

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default function AdminBookingDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const bookingId = parseInt(resolvedParams.id, 10);
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [booking, setBooking] = useState<AdminBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "guest" | "stay" | "payment" | "activity">("overview");

  // Extend Stay State
  const [newCheckOutDate, setNewCheckOutDate] = useState("");
  const [extendLoading, setExtendLoading] = useState(false);

  // Dialog State
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: "confirm" | "cancel" | "refund" | "checkin" | "checkout";
    loading: boolean;
    notes?: string;
    refundAmount?: string;
    refundReason?: string;
    cancelBooking?: boolean;
  }>({
    isOpen: false,
    type: "confirm",
    loading: false,
    refundAmount: "",
    refundReason: "",
    cancelBooking: true,
  });

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const data = await getAdminBookingDetails(bookingId);
      setBooking(data);
    } catch {
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(bookingId)) {
      fetchDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const handleAction = async () => {
    if (!booking) return;
    setDialogState((prev) => ({ ...prev, loading: true }));
    setFeedback(null);

    try {
      if (dialogState.type === "confirm") {
        await updateBookingStatus(booking.id, "confirmed");
        setFeedback({
          type: "success",
          message: isAr ? "تم تأكيد الحجز بنجاح." : "Booking confirmed successfully.",
        });
      } else if (dialogState.type === "checkin") {
        await checkinBooking(booking.id, dialogState.notes);
        setFeedback({
          type: "success",
          message: isAr ? "تم تسجيل وصول النزيل بنجاح." : "Guest checked-in successfully.",
        });
      } else if (dialogState.type === "checkout") {
        await checkoutBooking(booking.id, dialogState.notes);
        setFeedback({
          type: "success",
          message: isAr ? "تم تسجيل مغادرة النزيل وإتمام الحجز." : "Guest checked-out and booking completed.",
        });
      } else if (dialogState.type === "cancel") {
        await updateBookingStatus(booking.id, "cancelled");
        setFeedback({
          type: "success",
          message: isAr ? "تم إلغاء الحجز." : "Booking cancelled.",
        });
      } else if (dialogState.type === "refund") {
        const amountCents = dialogState.refundAmount
          ? Math.round(parseFloat(dialogState.refundAmount) * 100)
          : undefined;
        await refundBooking(
          booking.id,
          amountCents,
          dialogState.refundReason,
          dialogState.cancelBooking
        );
        setFeedback({
          type: "success",
          message: isAr ? "تمت معالجة استرداد المبلغ بنجاح." : "Refund processed successfully.",
        });
      }

      setDialogState({ isOpen: false, type: "confirm", loading: false });
      await fetchDetails();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "فشلت العملية." : "Operation failed."),
      });
      setDialogState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleExtendStaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !newCheckOutDate) return;

    setExtendLoading(true);
    setFeedback(null);
    try {
      const res = await extendBookingStay(booking.id, newCheckOutDate);
      setFeedback({
        type: "success",
        message: res.message || (isAr ? "تم تمديد الإقامة بنجاح." : "Stay extended successfully."),
      });
      setNewCheckOutDate("");
      await fetchDetails();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر تمديد الإقامة، تأكد من التوفر." : "Failed to extend stay."),
      });
    } finally {
      setExtendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-brand-border">
        <LoadingState message={isAr ? "جارٍ تحميل ملف الحجز..." : "Loading booking dossier..."} />
      </div>
    );
  }

  if (!booking) {
    return (
      <EmptyState
        icon="🔍"
        title={isAr ? "الحجز غير موجود" : "Booking Not Found"}
        description={isAr ? "لم يتم العثور على الحجز المطلوب في المنظومة." : "The requested booking could not be located."}
        actionText={isAr ? "العودة إلى جدول الحجوزات" : "Back to Bookings"}
        actionHref="/admin/bookings"
      />
    );
  }

  const propTitle = isAr && booking.property?.title_ar ? booking.property.title_ar : booking.property?.title_en || "Luxury Property";

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs text-brand-brown-muted mb-1">
            <Link href="/admin/bookings" className="hover:text-brand-brown">
              {isAr ? "الحجوزات" : "Bookings"}
            </Link>
            <span>/</span>
            <span className="font-mono text-brand-brown font-semibold">{booking.reference}</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-brand-brown">
              {isAr ? "حجز رقم" : "Booking"} #{booking.reference}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                booking.status === "confirmed" || booking.status === "completed"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : booking.status === "cancelled" || booking.status === "refunded"
                  ? "bg-rose-100 text-rose-800 border-rose-300"
                  : "bg-amber-100 text-amber-800 border-amber-300"
              }`}
            >
              {booking.status.toUpperCase()}
            </span>
            <span
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                booking.payment_status === "paid"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : booking.payment_status === "partially_paid"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-stone-100 text-stone-700 border border-stone-200"
              }`}
            >
              {booking.payment_status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Primary Contextual Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {booking.status === "pending" && (
            <PermissionGuard permission="manage_bookings">
              <button
                onClick={() => setDialogState({ isOpen: true, type: "confirm", loading: false })}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {isAr ? "✓ تأكيد الحجز" : "✓ Confirm Booking"}
              </button>
            </PermissionGuard>
          )}

          {(booking.status === "confirmed" || booking.payment_status === "paid") && booking.stay_status !== "in_house" && booking.stay_status !== "checked_out" && (
            <PermissionGuard permission="manage_bookings">
              <button
                onClick={() => setDialogState({ isOpen: true, type: "checkin", loading: false })}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {isAr ? "🛎️ تسجيل وصول النزيل" : "🛎️ Check-in Guest"}
              </button>
            </PermissionGuard>
          )}

          {booking.stay_status === "in_house" && (
            <PermissionGuard permission="manage_bookings">
              <button
                onClick={() => setDialogState({ isOpen: true, type: "checkout", loading: false })}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {isAr ? "🚪 تسجيل مغادرة النزيل" : "🚪 Check-out Guest"}
              </button>
            </PermissionGuard>
          )}

          {booking.status !== "cancelled" && booking.status !== "completed" && (
            <PermissionGuard permission="manage_bookings">
              <button
                onClick={() => setDialogState({ isOpen: true, type: "cancel", loading: false })}
                className="px-3 py-2 bg-white border border-brand-border hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {isAr ? "إلغاء الحجز" : "Cancel"}
              </button>
            </PermissionGuard>
          )}

          {booking.payment_status !== "refunded" && (booking.financials.amount_paid_cents - (booking.financials.refund_amount_cents || 0)) > 0 && (
            <PermissionGuard permission="manage_payments">
              <button
                onClick={() => {
                  const maxRef = Math.max(0, booking.financials.amount_paid_cents - (booking.financials.refund_amount_cents || 0));
                  setDialogState({
                    isOpen: true,
                    type: "refund",
                    loading: false,
                    refundAmount: (maxRef / 100).toFixed(2),
                    refundReason: isAr ? "طلب العميل إلغاء الحجز" : "Customer cancellation request",
                    cancelBooking: true,
                  });
                }}
                className="px-3 py-2 bg-white border border-brand-border hover:bg-amber-50 text-amber-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {isAr ? "استرداد مالي" : "Refund"}
              </button>
            </PermissionGuard>
          )}
        </div>
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

      {/* Section Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-border pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "overview"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "نظرة عامة والوحدة" : "Overview & Unit"}
        </button>
        <button
          onClick={() => setActiveTab("guest")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "guest"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "بيانات النزيل" : "Guest Profile"}
        </button>
        <button
          onClick={() => setActiveTab("stay")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "stay"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "حالة الإقامة وتمديد الحجز" : "Stay Management & Extension"}
        </button>
        <button
          onClick={() => setActiveTab("payment")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "payment"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "المالية والمدفوعات" : "Financials & Ledger"}
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "activity"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "سجل النشاط والتدقيق" : "Activity Timeline"}
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Card */}
            {booking.property && (
              <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand-sand relative shrink-0 border border-brand-border">
                    <Image
                      src={booking.property.primary_image}
                      alt={propTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-terracotta tracking-wider">
                      {booking.property.category?.name_en || "Villa"} • {booking.property.compound || "El Gouna"}
                    </span>
                    <h3 className="text-base font-bold text-brand-brown hover:text-brand-terracotta">
                      <Link href={`/admin/properties/${booking.property.id}`}>
                        {propTitle}
                      </Link>
                    </h3>
                    <p className="text-xs text-brand-brown-muted font-mono mt-0.5">
                      REF: {booking.property.reference_number} • {booking.property.bedrooms} Beds • {booking.property.bathrooms} Baths
                    </p>
                  </div>
                </div>

                <Link
                  href={`/admin/properties/${booking.property.id}`}
                  className="px-3 py-2 rounded-xl bg-brand-sand-light hover:bg-brand-sand text-brand-brown text-xs font-bold transition border border-brand-border"
                >
                  {isAr ? "عرض ملف العقار" : "View Property"} &rarr;
                </Link>
              </div>
            )}

            {/* Stay Schedule Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-brand-brown border-b border-brand-border pb-3">
                {isAr ? "تفاصيل جدول الإقامة" : "Reservation Itinerary"}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                    {isAr ? "تاريخ الوصول" : "Check-in"}
                  </span>
                  <span className="font-mono font-bold text-brand-brown text-sm block mt-0.5">
                    {booking.check_in}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                    {isAr ? "تاريخ المغادرة" : "Check-out"}
                  </span>
                  <span className="font-mono font-bold text-brand-brown text-sm block mt-0.5">
                    {booking.check_out}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                    {isAr ? "عدد الليالي" : "Total Nights"}
                  </span>
                  <span className="font-bold text-brand-brown text-sm block mt-0.5">
                    {booking.nights} {isAr ? "ليالٍ" : "nights"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                    {isAr ? "عدد النزلاء" : "Guests Capacity"}
                  </span>
                  <span className="font-bold text-brand-brown text-sm block mt-0.5">
                    {booking.guests} {isAr ? "ضيوف" : "guests"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4 text-xs">
              <h3 className="text-sm font-bold text-brand-brown border-b border-brand-border pb-3">
                {isAr ? "ملخص الحجز" : "Booking Snapshot"}
              </h3>
              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-brand-brown-muted">{isAr ? "المبلغ الإجمالي:" : "Total Amount:"}</span>
                  <span className="font-bold font-serif text-brand-brown">{booking.financials.formatted_total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-brown-muted">{isAr ? "المدفوع:" : "Amount Paid:"}</span>
                  <span className="font-bold text-emerald-700">{booking.financials.formatted_paid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-brown-muted">{isAr ? "المتبقي:" : "Balance Due:"}</span>
                  <span className="font-bold text-amber-800">{booking.financials.formatted_remaining}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-brand-border">
                  <span className="text-brand-brown-muted">{isAr ? "المصدر:" : "Source:"}</span>
                  <span className="font-medium text-brand-brown uppercase">{booking.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-brown-muted">{isAr ? "تاريخ الحجز:" : "Booked On:"}</span>
                  <span className="font-mono text-brand-brown">
                    {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Guest Profile */}
      {activeTab === "guest" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs max-w-2xl space-y-6 text-xs">
          <h3 className="text-base font-bold text-brand-brown border-b border-brand-border pb-3">
            {isAr ? "بيانات النزيل وتاريخ المعاملات" : "Guest Identification & Contact"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                {isAr ? "الاسم الكامل" : "Full Name"}
              </span>
              <span className="text-sm font-bold text-brand-brown mt-0.5 block">
                {booking.customer?.name || (isAr ? "نزيل غير محدد" : "Guest")}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                {isAr ? "البريد الإلكتروني" : "Email Address"}
              </span>
              {booking.customer?.email ? (
                <a href={`mailto:${booking.customer.email}`} className="text-sm text-brand-terracotta hover:underline mt-0.5 block">
                  {booking.customer.email}
                </a>
              ) : (
                <span className="text-sm text-brand-brown-muted mt-0.5 block">N/A</span>
              )}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                {isAr ? "رقم الهاتف / واتساب" : "Phone & WhatsApp"}
              </span>
              <span className="text-sm font-mono text-brand-brown mt-0.5 block" dir="ltr">
                {booking.customer?.phone || "N/A"}
              </span>
              {booking.customer?.phone && (
                <a
                  href={`https://wa.me/${booking.customer.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
                >
                  <span>💬 {isAr ? "فتح محادثة واتساب فورية" : "Open WhatsApp Chat"}</span>
                </a>
              )}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                {isAr ? "الجنسية / الإقامة" : "Nationality / Country"}
              </span>
              <span className="text-sm text-brand-brown mt-0.5 block">
                {booking.customer?.nationality || "Egypt"} ({booking.customer?.country_of_residence || "EG"})
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                {isAr ? "سجل الحجوزات السابقة" : "Previous Bookings"}
              </span>
              <span className="text-sm font-bold text-brand-brown mt-0.5 block">
                {booking.customer?.bookings_count ?? 0} {isAr ? "حجوزات مسجلة" : "reservations"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Stay Management & Extension */}
      {activeTab === "stay" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Stay Status */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs space-y-4 text-xs">
            <h3 className="text-base font-bold text-brand-brown border-b border-brand-border pb-3">
              {isAr ? "الحالة التشغيلية للإقامة" : "Live Occupancy Status"}
            </h3>
            <div className="p-4 rounded-2xl bg-brand-sand-light/50 border border-brand-border flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                  {isAr ? "حالة التواجد الحالية" : "Current Physical Status"}
                </span>
                <span className="text-base font-bold text-brand-brown capitalize mt-0.5 block">
                  {booking.stay_status === "in_house"
                    ? isAr ? "النزيل متواجد بالوحدة حالياً" : "Guest In-House"
                    : booking.stay_status === "checked_out"
                    ? isAr ? "النزيل غادر الوحدة" : "Guest Checked-out"
                    : isAr ? "متوقع وصوله" : "Expected Arrival"}
                </span>
              </div>
              <span className="text-2xl">
                {booking.stay_status === "in_house" ? "🛎️" : booking.stay_status === "checked_out" ? "🚪" : "🗓️"}
              </span>
            </div>

            {booking.internal_notes && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                  {isAr ? "ملاحظات تشغيلية وسجل الوصول" : "Operational Notes"}
                </span>
                <div className="p-3 bg-brand-sand-light/40 rounded-xl border border-brand-border font-mono text-[11px] text-brand-brown whitespace-pre-wrap">
                  {booking.internal_notes}
                </div>
              </div>
            )}
          </div>

          {/* Extend Stay Workflow */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs space-y-4 text-xs">
            <h3 className="text-base font-bold text-brand-brown border-b border-brand-border pb-3">
              {isAr ? "تمديد فترة الإقامة (Extend Stay)" : "Extend Stay Workflow"}
            </h3>
            <p className="text-brand-brown-muted leading-relaxed">
              {isAr
                ? "حدد تاريخ المغادرة الجديد. سيقوم النظام بالتحقق الآلي من التوفر وعدم وجود تعارض مع حجوزات أخرى، ثم إعادة حساب الإجمالي المالي."
                : "Select a new check-out date. The system validates real-time availability and recalculates authoritative pricing."}
            </p>

            <form onSubmit={handleExtendStaySubmit} className="space-y-4">
              {/* Quick Presets */}
              <div>
                <label className="block text-[11px] font-bold text-brand-brown mb-1.5">
                  {isAr ? "خيارات سريعة للتمديد:" : "Quick Extension Presets:"}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 7].map((days) => {
                    const [y, m, d] = booking.check_out.split("-").map(Number);
                    const dt = new Date(y, m - 1, d);
                    dt.setDate(dt.getDate() + days);
                    const presetDate = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
                    const isSelected = newCheckOutDate === presetDate;
                    return (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setNewCheckOutDate(presetDate)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                          isSelected
                            ? "bg-brand-terracotta text-white border-brand-terracotta shadow-xs"
                            : "bg-white hover:bg-brand-sand-light text-brand-brown border-brand-border"
                        }`}
                      >
                        {days === 7
                          ? isAr ? "+ أسبوع" : "+1 Week"
                          : isAr
                          ? `+${days} ${days === 1 ? "ليلة" : days === 2 ? "ليلتين" : "ليالٍ"}`
                          : `+${days} ${days === 1 ? "Night" : "Nights"}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1.5">
                  {isAr ? "تاريخ المغادرة الجديد *" : "New Check-out Date *"}
                </label>
                {(() => {
                  const [y, m, d] = booking.check_out.split("-").map(Number);
                  const dt = new Date(y, m - 1, d);
                  dt.setDate(dt.getDate() + 1);
                  const minDate = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
                  return (
                    <input
                      type="date"
                      min={minDate}
                      value={newCheckOutDate}
                      onChange={(e) => setNewCheckOutDate(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/40 focus:outline-none focus:ring-1 focus:ring-brand-terracotta font-mono"
                    />
                  );
                })()}
              </div>

              {/* Extra nights preview */}
              {newCheckOutDate && newCheckOutDate > booking.check_out && (() => {
                const [y1, m1, d1] = booking.check_out.split("-").map(Number);
                const [y2, m2, d2] = newCheckOutDate.split("-").map(Number);
                const addedNights = Math.max(0, Math.round((new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime()) / (1000 * 60 * 60 * 24)));
                const totalCents = booking.financials?.total_cents ?? 0;
                const avgNightly = booking.nights > 0 ? Math.round(totalCents / booking.nights) : 0;
                const estExtra = avgNightly * addedNights;
                return (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs space-y-1 text-emerald-950">
                    <div className="flex justify-between font-medium">
                      <span>{isAr ? "الليالي الإضافية:" : "Additional Nights:"}</span>
                      <span className="font-mono font-bold">+{addedNights} {isAr ? "ليلة" : "nights"}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>{isAr ? "إجمالي الليالي الجديد:" : "New Total Nights:"}</span>
                      <span className="font-mono font-bold">{booking.nights + addedNights} {isAr ? "ليلة" : "nights"}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-emerald-200/60 pt-1">
                      <span>{isAr ? "التكلفة التقديرية المضافة:" : "Estimated Added Amount:"}</span>
                      <span className="font-mono">
                        EGP {(estExtra / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <button
                type="submit"
                disabled={extendLoading || !newCheckOutDate || newCheckOutDate <= booking.check_out}
                className="w-full py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {extendLoading
                  ? isAr ? "جارٍ التحقق وتمديد الإقامة..." : "Validating & Extending..."
                  : isAr ? "تأكيد تمديد الإقامة" : "Confirm Stay Extension"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 4: Financials & Ledger */}
      {activeTab === "payment" && (
        <div className="space-y-6">
          {/* Breakdown Cards */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs space-y-4 text-xs">
            <h3 className="text-base font-bold text-brand-brown border-b border-brand-border pb-3">
              {isAr ? "تفصيل الرسوم والمدفوعات" : "Financial Breakdown"}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                  {isAr ? "سعر الإقامة الأساسي" : "Subtotal"}
                </span>
                <span className="text-sm font-bold text-brand-brown mt-0.5 block">
                  {booking.financials.formatted_subtotal}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                  {isAr ? "الإجمالي النهائي" : "Total Amount"}
                </span>
                <span className="text-sm font-bold text-brand-brown mt-0.5 block">
                  {booking.financials.formatted_total}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                  {isAr ? "المسدد حتى الآن" : "Paid Amount"}
                </span>
                <span className="text-sm font-bold text-emerald-700 mt-0.5 block">
                  {booking.financials.formatted_paid}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-800 block">
                  {isAr ? "المتبقي للتحصيل" : "Balance Due"}
                </span>
                <span className="text-sm font-bold text-amber-700 mt-0.5 block">
                  {booking.financials.formatted_remaining}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Transactions Table */}
          <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
            <div className="p-6 border-b border-brand-border">
              <h3 className="text-base font-bold text-brand-brown">
                {isAr ? "سجل المعاملات والتحصيلات المالية" : "Transactions Audit Trail"}
              </h3>
            </div>
            {booking.transactions.length === 0 ? (
              <div className="p-8 text-center text-xs text-brand-brown-muted">
                {isAr ? "لا توجد معاملات دفع مسجلة لهذا الحجز." : "No payment transactions recorded for this booking."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-brand-sand-light/60 text-brand-brown-muted font-bold text-[10px] uppercase border-b border-brand-border">
                    <tr>
                      <th className="py-3 px-4 text-start">{isAr ? "الرقم التعريفي" : "ID"}</th>
                      <th className="py-3 px-4 text-start">{isAr ? "النوع" : "Type"}</th>
                      <th className="py-3 px-4 text-start">{isAr ? "المبلغ" : "Amount"}</th>
                      <th className="py-3 px-4 text-start">{isAr ? "البوابة والمرجع" : "Gateway / Ref"}</th>
                      <th className="py-3 px-4 text-start">{isAr ? "الحالة" : "Status"}</th>
                      <th className="py-3 px-4 text-end">{isAr ? "التاريخ" : "Timestamp"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60">
                    {booking.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-brand-sand-light/30">
                        <td className="py-3 px-4 font-mono font-bold text-brand-brown">#{tx.id}</td>
                        <td className="py-3 px-4 capitalize font-medium">{tx.type}</td>
                        <td className="py-3 px-4 font-bold text-brand-brown">{tx.formatted_amount}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-brand-brown-muted">
                          {tx.gateway} {tx.gateway_reference ? `• ${tx.gateway_reference}` : ""}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tx.status === "successful"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-end text-brand-brown-muted font-mono text-[11px]">
                          {tx.created_at ? new Date(tx.created_at).toLocaleString() : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Activity Timeline */}
      {activeTab === "activity" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs space-y-6 text-xs">
          <h3 className="text-base font-bold text-brand-brown border-b border-brand-border pb-3">
            {isAr ? "سجل العمليات والتدقيق الإداري" : "Operational Audit Trail"}
          </h3>
          {booking.timeline.length === 0 ? (
            <div className="p-8 text-center text-xs text-brand-brown-muted">
              {isAr ? "لا توجد سجلات نشاط مؤرشفة لهذا الحجز." : "No audit trail entries recorded yet."}
            </div>
          ) : (
            <div className="relative border-s-2 border-brand-sand ms-4 space-y-6 my-4">
              {booking.timeline.map((event) => (
                <div key={event.id} className="relative ps-6">
                  <div className="absolute -start-1.5 top-1 w-3 h-3 rounded-full bg-brand-terracotta ring-4 ring-white" />
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-bold text-brand-brown capitalize text-sm">
                      {event.action.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] font-mono text-brand-brown-muted">
                      {event.created_at ? new Date(event.created_at).toLocaleString() : ""}
                    </span>
                  </div>
                  <p className="text-xs text-brand-brown-muted mt-1 leading-relaxed">
                    {event.description}
                  </p>
                  <span className="text-[10px] text-brand-terracotta font-medium mt-1 inline-block">
                    {isAr ? "بواسطة:" : "By:"} {event.user_name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Operational Confirm Dialog */}
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
              ? `هل تريد تأكيد الحجز رقم ${booking.reference}؟ سيتم تثبيت مواعيد الحجز وإشعار النزيل.`
              : `Confirm reservation ${booking.reference}? The guest will be notified.`
            : dialogState.type === "checkin"
            ? isAr
              ? `تأكيد تسجيل وصول النزيل ${booking.customer.name} للوحدة وتغيير الحالة التشغيلية إلى مقيم حالياً.`
              : `Confirm guest check-in for ${booking.customer.name}? Operational stay state will become in-house.`
            : dialogState.type === "checkout"
            ? isAr
              ? `تأكيد استلام الوحدة ومغادرة النزيل؟ سيتم إتمام الحجز بالكامل.`
              : `Confirm guest check-out? The booking will transition to completed.`
            : dialogState.type === "cancel"
            ? isAr
              ? `تحذير: إلغاء الحجز سيؤدي إلى تحرير الليالي المحجوزة في جدول التوفر.`
              : `Warning: Cancelling will release all blocked dates on the calendar.`
            : isAr
              ? `حدد قيمة الاسترداد والسبب المالي للحجز ${booking.reference}. سيتم تسجيل الحركة في سجل المعاملات المالية.`
              : `Specify the refund amount and reason for ${booking.reference}. The transaction will be recorded in the ledger.`
        }
        confirmText={
          dialogState.type === "refund"
            ? isAr ? "تنفيذ الاسترداد" : "Execute Refund"
            : isAr ? "تأكيد الإجراء" : "Confirm"
        }
        cancelText={isAr ? "تراجع" : "Dismiss"}
        isDestructive={dialogState.type === "cancel" || dialogState.type === "refund"}
        isLoading={dialogState.loading}
        confirmDisabled={
          dialogState.type === "refund" &&
          (() => {
            const maxRefundableCents = Math.max(
              0,
              (booking.financials.amount_paid_cents || 0) - (booking.financials.refund_amount_cents || 0)
            );
            const amount = parseFloat(dialogState.refundAmount || "0");
            const amountCents = Math.round(amount * 100);
            return isNaN(amount) || amountCents <= 0 || amountCents > maxRefundableCents;
          })()
        }
        onConfirm={handleAction}
        onCancel={() => setDialogState({ isOpen: false, type: "confirm", loading: false })}
      >
        {dialogState.type === "refund" && (() => {
          const paidCents = booking.financials.amount_paid_cents || 0;
          const refundedCents = booking.financials.refund_amount_cents || 0;
          const maxRefundableCents = Math.max(0, paidCents - refundedCents);
          const enteredAmount = parseFloat(dialogState.refundAmount || "0");
          const enteredCents = isNaN(enteredAmount) ? 0 : Math.round(enteredAmount * 100);
          const isFull = enteredCents >= maxRefundableCents && maxRefundableCents > 0;
          const currency = booking.currency || "EGP";

          return (
            <div className="space-y-4 text-xs">
              {/* Financial Snapshot Card */}
              <div className="bg-brand-sand-light/50 border border-brand-border/60 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-brand-brown-muted font-medium">{isAr ? "إجمالي الحجز:" : "Booking Total:"}</span>
                  <span className="font-mono font-bold text-brand-brown">{booking.financials.formatted_total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-brown-muted font-medium">{isAr ? "المسدد حتى الآن:" : "Paid so far:"}</span>
                  <span className="font-mono font-bold text-emerald-700">{booking.financials.formatted_paid}</span>
                </div>
                {refundedCents > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-brand-brown-muted font-medium">{isAr ? "مسترد سابقاً:" : "Previously refunded:"}</span>
                    <span className="font-mono font-bold text-amber-700">{booking.financials.formatted_refund}</span>
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/30 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
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
        {dialogState.type === "checkin" && booking && (() => {
          const isEarly = booking.check_in > new Date().toISOString().split("T")[0];
          const hasRemaining = (booking.financials.amount_remaining_cents || 0) > 0;

          return (
            <div className="space-y-3.5 text-xs">
              <div className="bg-brand-sand-light/50 border border-brand-border/60 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-brand-brown-muted font-medium">{isAr ? "النزيل:" : "Guest:"}</span>
                  <span className="font-bold text-brand-brown">
                    {booking.customer.name} {booking.customer.phone && `(${booking.customer.phone})`}
                  </span>
                </div>
                {booking.property && (
                  <div className="flex items-center justify-between">
                    <span className="text-brand-brown-muted font-medium">{isAr ? "الوحدة:" : "Unit:"}</span>
                    <span className="font-semibold text-brand-brown">{isAr ? booking.property.title_ar || booking.property.title_en : booking.property.title_en}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-brand-brown-muted font-medium">{isAr ? "فترة الإقامة:" : "Stay Period:"}</span>
                  <span className="font-mono text-brand-brown" dir="ltr">
                    {booking.check_in} → {booking.check_out} ({booking.nights} {isAr ? "ليالٍ" : "nights"})
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-brand-border/40">
                  <span className="text-brand-brown-muted font-medium">{isAr ? "حالة الدفع:" : "Payment Status:"}</span>
                  <span className={`font-bold ${hasRemaining ? "text-amber-700" : "text-emerald-700"}`}>
                    {hasRemaining
                      ? `${isAr ? "متبقي" : "Due:"} ${booking.financials.formatted_remaining}`
                      : isAr ? "مدفوع بالكامل ✓" : "Fully Paid ✓"}
                  </span>
                </div>
              </div>

              {isEarly && (
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-[11px] flex items-center gap-2">
                  <span>ℹ️</span>
                  <span>
                    {isAr
                      ? `وصول مبكر: موعد الحجز المجدول يبدأ في ${booking.check_in}. سيتم تفعيل الإقامة فوراً كمقيم بالوحدة.`
                      : `Early Check-in: Scheduled arrival is ${booking.check_in}. Status will transition immediately to in-house.`}
                  </span>
                </div>
              )}

              {hasRemaining && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                  <span>⚠️</span>
                  <span>
                    {isAr
                      ? `تنبيه: يوجد رصيد متبقي ${booking.financials.formatted_remaining}، يُرجى التأكد من تحصيله أو التنسيق مع النزيل.`
                      : `Notice: Remaining balance ${booking.financials.formatted_remaining} is still due.`}
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
        {dialogState.type === "checkout" && booking && (() => {
          return (
            <div className="space-y-3.5 text-xs">
              <div className="bg-brand-sand-light/50 border border-brand-border/60 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-brand-brown-muted font-medium">{isAr ? "النزيل المغادر:" : "Departing Guest:"}</span>
                  <span className="font-bold text-brand-brown">{booking.customer.name}</span>
                </div>
                {booking.property && (
                  <div className="flex items-center justify-between">
                    <span className="text-brand-brown-muted font-medium">{isAr ? "الوحدة:" : "Unit:"}</span>
                    <span className="font-semibold text-brand-brown">{isAr ? booking.property.title_ar || booking.property.title_en : booking.property.title_en}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-brand-brown-muted font-medium">{isAr ? "موعد المغادرة المجدول:" : "Scheduled Departure:"}</span>
                  <span className="font-mono text-brand-brown" dir="ltr">{booking.check_out}</span>
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
