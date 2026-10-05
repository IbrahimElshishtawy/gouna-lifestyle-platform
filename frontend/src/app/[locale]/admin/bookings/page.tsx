"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getAdminBookings, updateBookingStatus, refundBooking } from "@/features/admin/services/admin.api";
import type { AdminBookingItem } from "@/features/admin/types";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PermissionGuard from "@/components/ui/PermissionGuard";

export default function AdminBookingsPage() {
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || "";
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [bookings, setBookings] = useState<AdminBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Dialog state
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: "confirm" | "cancel" | "refund";
    bookingId: number | null;
    reference: string;
    loading: boolean;
  }>({
    isOpen: false,
    type: "confirm",
    bookingId: null,
    reference: "",
    loading: false,
  });

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getAdminBookings({ status: currentStatus || undefined });
      setBookings(res.data);
      setTotalCount(res.meta?.total ?? res.data.length);
    } catch {
      setBookings([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStatus]);

  const handleOpenDialog = (type: "confirm" | "cancel" | "refund", id: number, ref: string) => {
    setDialogState({
      isOpen: true,
      type,
      bookingId: id,
      reference: ref,
      loading: false,
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
            ? `تم إلغاء الحجز ${dialogState.reference}.`
            : `Booking ${dialogState.reference} has been cancelled.`,
        });
      } else if (dialogState.type === "refund") {
        await refundBooking(dialogState.bookingId);
        setFeedback({
          type: "success",
          message: isAr
            ? `تمت معالجة استرداد المبلغ للحجز ${dialogState.reference}.`
            : `Refund processed successfully for ${dialogState.reference}.`,
        });
      }

      setDialogState((prev) => ({ ...prev, isOpen: false }));
      await fetchBookings();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "حدث خطأ أثناء تنفيذ الإجراء." : "Operation failed."),
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
            {isAr ? "إدارة الحجوزات والإقامات" : "Bookings & Reservations"}
          </h1>
          <p className="text-xs text-brand-brown-muted mt-1">
            {isAr
              ? "متابعة الحجوزات الحية، وجداول الدفعات، وتأكيد وصول النزلاء للفلل والشاليهات"
              : "Real-time reservations, payment schedules, and guest check-in audits"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/201000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <span>💬</span>
            <span>{isAr ? "مكتب الكونسيرج المباشر" : "Concierge Desk"}</span>
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-border pb-3 overflow-x-auto">
        <Link
          href="/admin/bookings"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            !currentStatus
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "الكل" : "All"} ({!currentStatus ? totalCount : "•"})
        </Link>
        <Link
          href="/admin/bookings?status=pending"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            currentStatus === "pending"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "قيد التأكيد" : "Pending Confirmation"}
        </Link>
        <Link
          href="/admin/bookings?status=confirmed"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            currentStatus === "confirmed"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "مؤكدة" : "Confirmed"}
        </Link>
        <Link
          href="/admin/bookings?status=cancelled"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            currentStatus === "cancelled"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "ملغاة" : "Cancelled"}
        </Link>
      </div>

      {/* Bookings Content */}
      {loading ? (
        <LoadingState message={isAr ? "جارٍ تحميل سجل الحجوزات..." : "Loading reservations ledger..."} rows={5} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="📅"
          title={isAr ? "لا توجد حجوزات مسجلة" : "No Bookings Found"}
          description={
            isAr
              ? "لم يتم العثور على أي حجوزات تطابق هذا التصنيف في النظام حالياً."
              : "No reservation records match the selected status filter."
          }
          actionText={isAr ? "عرض جميع الحجوزات" : "View All Bookings"}
          actionHref="/admin/bookings"
        />
      ) : (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-brand-sand-light/60 text-brand-brown-muted font-bold text-[10px] uppercase tracking-wider border-b border-brand-border">
                <tr>
                  <th className="py-3.5 px-4 text-start">{isAr ? "رقم الحجز" : "Reference"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "النزيل" : "Guest"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "الوحدة" : "Property / Unit"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "التواريخ" : "Schedule"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "المالية" : "Total / Paid"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "الحالة" : "Status"}</th>
                  <th className="py-3.5 px-4 text-end">{isAr ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {bookings.map((b) => (
                  <tr key={b.reference} className="hover:bg-brand-sand/30 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-brand-brown">
                      {b.reference}
                    </td>

                    <td className="py-4 px-4 font-medium text-brand-brown">
                      <div>
                        <span>{b.customer.name}</span>
                        {b.customer.email && (
                          <span className="block text-[10px] text-brand-brown-muted truncate max-w-[140px]">
                            {b.customer.email}
                          </span>
                        )}
                        {b.customer.phone && (
                          <span className="block text-[10px] text-brand-brown-muted font-mono" dir="ltr">
                            {b.customer.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-semibold text-brand-brown block line-clamp-1">
                        {isAr ? (b.bookable.title_ar || b.bookable.title) : b.bookable.title}
                      </span>
                      <span className="text-[10px] text-brand-brown-muted block">
                        {b.nights} {isAr ? "ليالٍ" : "nights"} • {b.guests} {isAr ? "ضيوف" : "guests"}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-brand-brown-muted font-mono text-[11px]" dir="ltr">
                      <div>{b.check_in}</div>
                      <div className="text-[10px] opacity-75">↓ {b.check_out}</div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-serif font-bold text-brand-brown block">
                        {b.formatted_total}
                      </span>
                      <span className="text-[10px] text-emerald-700 block">
                        {isAr ? "مسدد:" : "Paid:"} {b.formatted_paid}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          b.status === "confirmed"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : b.status === "cancelled"
                            ? "bg-rose-100 text-rose-800 border-rose-300"
                            : "bg-amber-100 text-amber-800 border-amber-300"
                        }`}
                      >
                        {b.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === "pending" && (
                          <PermissionGuard permission="manage_bookings">
                            <button
                              onClick={() => handleOpenDialog("confirm", b.id, b.reference)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition shadow-2xs cursor-pointer"
                            >
                              {isAr ? "تأكيد" : "Confirm"}
                            </button>
                          </PermissionGuard>
                        )}

                        {b.status !== "cancelled" && (
                          <PermissionGuard permission="manage_bookings">
                            <button
                              onClick={() => handleOpenDialog("cancel", b.id, b.reference)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-brand-border text-brand-brown hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-[11px] font-semibold transition cursor-pointer"
                            >
                              {isAr ? "إلغاء" : "Cancel"}
                            </button>
                          </PermissionGuard>
                        )}

                        {b.status === "confirmed" && (
                          <PermissionGuard permission="manage_payments">
                            <button
                              onClick={() => handleOpenDialog("refund", b.id, b.reference)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-brand-border text-brand-brown hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 text-[11px] font-semibold transition cursor-pointer"
                            >
                              {isAr ? "استرداد" : "Refund"}
                            </button>
                          </PermissionGuard>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={
          dialogState.type === "confirm"
            ? (isAr ? "تأكيد الحجز النهائي" : "Confirm Reservation")
            : dialogState.type === "cancel"
            ? (isAr ? "إلغاء الحجز" : "Cancel Booking")
            : (isAr ? "معالجة استرداد المبلغ" : "Process Refund")
        }
        description={
          dialogState.type === "confirm"
            ? (isAr
                ? `هل أنت متأكد من تأكيد الحجز رقم ${dialogState.reference} وإشعار النزيل؟`
                : `Are you sure you want to confirm reservation ${dialogState.reference} and notify the guest?`)
            : dialogState.type === "cancel"
            ? (isAr
                ? `تحذير: إلغاء الحجز رقم ${dialogState.reference} سيقوم بتحرير الليالي في جدول التوفر.`
                : `Warning: Cancelling reservation ${dialogState.reference} will release blocked calendar dates.`)
            : (isAr
                ? `تنبيه مالي: سيتم تسجيل حركة استرداد مالي كاملة للحجز ${dialogState.reference}.`
                : `Financial Alert: This will initiate a full payment refund transaction for ${dialogState.reference}.`)
        }
        confirmText={
          dialogState.type === "confirm"
            ? (isAr ? "نعم، تأكيد الحجز" : "Confirm Booking")
            : dialogState.type === "cancel"
            ? (isAr ? "تأكيد الإلغاء" : "Cancel Booking")
            : (isAr ? "تنفيذ الاسترداد" : "Execute Refund")
        }
        cancelText={isAr ? "تراجع" : "Dismiss"}
        isDestructive={dialogState.type === "cancel" || dialogState.type === "refund"}
        isLoading={dialogState.loading}
        onConfirm={handleDialogConfirm}
        onCancel={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
