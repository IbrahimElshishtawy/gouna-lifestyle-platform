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
  }>({
    isOpen: false,
    type: "confirm",
    loading: false,
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
        await refundBooking(booking.id);
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

          {(booking.status === "confirmed" || booking.status === "completed") && booking.financials.amount_paid_cents > 0 && (
            <PermissionGuard permission="manage_payments">
              <button
                onClick={() => setDialogState({ isOpen: true, type: "refund", loading: false })}
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
                {booking.customer.name}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                {isAr ? "البريد الإلكتروني" : "Email Address"}
              </span>
              <a href={`mailto:${booking.customer.email}`} className="text-sm text-brand-terracotta hover:underline mt-0.5 block">
                {booking.customer.email}
              </a>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                {isAr ? "رقم الهاتف / واتساب" : "Phone & WhatsApp"}
              </span>
              <span className="text-sm font-mono text-brand-brown mt-0.5 block" dir="ltr">
                {booking.customer.phone || "N/A"}
              </span>
              {booking.customer.phone && (
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
                {booking.customer.nationality || "Egypt"} ({booking.customer.country_of_residence || "EG"})
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                {isAr ? "سجل الحجوزات السابقة" : "Previous Bookings"}
              </span>
              <span className="text-sm font-bold text-brand-brown mt-0.5 block">
                {booking.customer.bookings_count} {isAr ? "حجوزات مسجلة" : "reservations"}
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
              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1.5">
                  {isAr ? "تاريخ المغادرة الجديد *" : "New Check-out Date *"}
                </label>
                <input
                  type="date"
                  min={booking.check_out}
                  value={newCheckOutDate}
                  onChange={(e) => setNewCheckOutDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/40 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                />
              </div>

              <button
                type="submit"
                disabled={extendLoading || !newCheckOutDate}
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
              ? `تأكيد تسجيل وصول النزيل ${booking.customer.name} للوحدة وتغيير الحالة التشغيلية إلى مقيم حالياً؟`
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
              ? `تنبيه مالي: سيتم إرجاع المبلغ المسدد بالكامل لحساب النزيل.`
              : `Financial Alert: This will initiate a full payment refund to the customer.`
        }
        confirmText={isAr ? "تأكيد الإجراء" : "Confirm"}
        cancelText={isAr ? "تراجع" : "Dismiss"}
        isDestructive={dialogState.type === "cancel" || dialogState.type === "refund"}
        isLoading={dialogState.loading}
        onConfirm={handleAction}
        onCancel={() => setDialogState({ isOpen: false, type: "confirm", loading: false })}
      />
    </div>
  );
}
