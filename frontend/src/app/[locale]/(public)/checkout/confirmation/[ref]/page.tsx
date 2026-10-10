"use client";

import React, { useEffect, useState, use, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { getBookingByReference } from "@/features/checkout/services/checkout.api";

interface Props {
  params: Promise<{
    locale: string;
    ref: string;
  }>;
}

function CheckoutConfirmationContent({ locale, ref }: { locale: string; ref: string }) {
  const searchParams = useSearchParams();
  const isAr = locale === "ar";
  const token = searchParams.get("token") || "";

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getBookingByReference(ref, token);
        if (data) {
          setBooking(data);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ref, token]);

  const currencyLabel = isAr ? "ج.م" : "EGP";
  const formatCurrency = (cents: number) => {
    const val = (cents || 0) / 100;
    return `${new Intl.NumberFormat(isAr ? "ar-EG" : "en-US").format(val)} ${currencyLabel}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(isAr ? "ar-EG" : "en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-terracotta border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-brand-brown-muted font-medium">
          {isAr ? "جاري جلب تفاصيل الحجز وتأكيد الدفع..." : "Retrieving confirmed booking details..."}
        </p>
      </div>
    );
  }

  const attrs = booking?.attributes;
  const property = booking?.relationships?.bookable;
  const customer = booking?.relationships?.customer;
  const pricing = attrs?.pricing;

  const isFullyPaid = attrs?.payment_status === "paid" || attrs?.amount_remaining_cents === 0;

  // Pre-filled WhatsApp message for verified booking
  const waMessage = encodeURIComponent(
    isAr
      ? `مرحباً كونسيرج جوناو VIP، لقد أتممت الدفع الإلكتروني بنجاح لحجزي رقم: ${ref} في ${property?.attributes?.title || "العقار"}. أرجو تزويدي بتفاصيل الوصول والاستقبال.`
      : `Hello GouNow VIP Concierge, I have completed payment for my reservation ${ref} at ${property?.attributes?.title || "property"}. Please share check-in instructions.`
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Printable Voucher Box */}
      <div className="bg-white rounded-3xl border border-brand-border/60 shadow-xl overflow-hidden print:border-none print:shadow-none">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white p-8 sm:p-10 text-center space-y-3 relative overflow-hidden">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto text-4xl border border-white/20 shadow-inner">
            ✓
          </div>
          <span className="inline-block text-xs uppercase tracking-widest font-extrabold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
            {isAr ? "دفع مؤكد إلكترونياً عبر Paymob" : "Payment Verified via Paymob"}
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
            {isAr ? "تم تأكيد حجزك وسداد المبلغ بنجاح!" : "Reservation & Payment Confirmed!"}
          </h1>
          <p className="text-sm text-emerald-100 max-w-lg mx-auto leading-relaxed">
            {isAr
              ? `شكراً لك${customer?.name ? ` ${customer.name}` : ""}، تم تسجيل العملية رسمياً وإصدار إيصال الحجز المعتمد.`
              : `Thank you${customer?.name ? ` ${customer.name}` : ""}, your payment was authorized and your reservation voucher is issued.`}
          </p>
        </div>

        {/* Voucher Content */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* Reference & Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-brand-cream/40 rounded-2xl border border-brand-border/60">
            <div>
              <span className="text-xs text-brand-brown-muted block font-medium">
                {isAr ? "رقم المرجع المعتمد (Booking Reference)" : "Booking Reference Code"}
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black text-brand-brown tracking-wider">
                {ref}
              </span>
            </div>

            <div className="text-end">
              <span className="text-xs text-brand-brown-muted block font-medium">
                {isAr ? "حالة السداد المالي" : "Payment Status"}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                {isFullyPaid
                  ? (isAr ? "مدفوع بالكامل (100%)" : "Paid in Full")
                  : (isAr ? "تم سداد العربون (30%)" : "Deposit Paid (30%)")}
              </span>
            </div>
          </div>

          {/* Property & Stay Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-brand-terracotta">
                {isAr ? "تفاصيل الإقامة والعقار" : "Stay & Property Details"}
              </h3>
              
              <div className="p-5 bg-white rounded-2xl border border-brand-border space-y-3">
                <h4 className="font-serif text-lg font-bold text-brand-brown">
                  {property?.attributes?.title || (isAr ? "إقامة فاخرة بالجونة" : "Luxury El Gouna Stay")}
                </h4>
                {property?.attributes?.neighborhood && (
                  <p className="text-xs text-brand-brown-muted">
                    📍 {property.attributes.neighborhood}, {isAr ? "الجونة، البحر الأحمر" : "El Gouna, Red Sea"}
                  </p>
                )}

                <div className="pt-2 border-t border-brand-border/50 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-brand-brown-muted block text-[11px]">
                      {isAr ? "تاريخ الوصول:" : "Check-in:"}
                    </span>
                    <span className="font-bold text-brand-brown">
                      {formatDate(attrs?.check_in)}
                    </span>
                  </div>
                  <div>
                    <span className="text-brand-brown-muted block text-[11px]">
                      {isAr ? "تاريخ المغادرة:" : "Check-out:"}
                    </span>
                    <span className="font-bold text-brand-brown">
                      {formatDate(attrs?.check_out)}
                    </span>
                  </div>
                  <div>
                    <span className="text-brand-brown-muted block text-[11px]">
                      {isAr ? "مدة الإقامة:" : "Duration:"}
                    </span>
                    <span className="font-bold text-brand-brown">
                      {attrs?.nights} {isAr ? "ليالي" : "Nights"}
                    </span>
                  </div>
                  <div>
                    <span className="text-brand-brown-muted block text-[11px]">
                      {isAr ? "عدد النزلاء:" : "Guests:"}
                    </span>
                    <span className="font-bold text-brand-brown">
                      {attrs?.guests} {isAr ? "نزيل" : "Guests"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-brand-terracotta">
                {isAr ? "بيان الدفع المالي (Paymob Receipt)" : "Financial Receipt Breakdown"}
              </h3>

              <div className="p-5 bg-white rounded-2xl border border-brand-border space-y-2.5 text-xs">
                <div className="flex justify-between text-brand-brown-muted">
                  <span>{isAr ? "إجمالي الإقامة والخدمات:" : "Stay & Services:"}</span>
                  <span className="font-medium text-brand-brown">
                    {formatCurrency(pricing?.subtotal_cents)}
                  </span>
                </div>
                {pricing?.discount_cents > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>{isAr ? "الخصم المطبق (بروموكود):" : "Discount Applied:"}</span>
                    <span>-{formatCurrency(pricing?.discount_cents)}</span>
                  </div>
                )}
                <div className="flex justify-between text-brand-brown-muted">
                  <span>{isAr ? "رسوم الخدمة والتنظيف:" : "Cleaning & Service:"}</span>
                  <span className="font-medium text-brand-brown">
                    {formatCurrency(pricing?.cleaning_fee_cents + (pricing?.service_fee_cents || 0))}
                  </span>
                </div>
                <div className="flex justify-between text-brand-brown-muted">
                  <span>{isAr ? "الضريبة المقررة:" : "Taxes (14%):"}</span>
                  <span className="font-medium text-brand-brown">
                    {formatCurrency(pricing?.tax_cents)}
                  </span>
                </div>

                <div className="pt-2 border-t border-brand-border flex justify-between text-sm font-bold text-brand-brown">
                  <span>{isAr ? "الإجمالي الكلي للحجز:" : "Total Amount:"}</span>
                  <span>{formatCurrency(pricing?.total_cents)}</span>
                </div>

                {/* Paid today */}
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 space-y-1">
                  <div className="flex justify-between text-xs font-bold text-emerald-800">
                    <span>{isAr ? "المسدد اليوم عبر بوابة الدفع:" : "Paid Today via Gateway:"}</span>
                    <span className="text-sm">
                      {formatCurrency(pricing?.amount_paid_cents || pricing?.deposit_cents || pricing?.total_cents)}
                    </span>
                  </div>
                  {pricing?.amount_remaining_cents > 0 && (
                    <div className="flex justify-between text-[11px] text-amber-800 pt-1 border-t border-emerald-200/50">
                      <span>{isAr ? "المتبقي للاستحقاق عند الوصول:" : "Remaining Balance (Upon check-in):"}</span>
                      <span className="font-bold">{formatCurrency(pricing?.amount_remaining_cents)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 shadow-lg"
            >
              <span>🖨️</span>
              <span>{isAr ? "طباعة / تحميل إيصال الحجز (Voucher)" : "Print / Save Voucher"}</span>
            </button>

            <a
              href={`https://wa.me/201000000000?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 shadow-lg shadow-emerald-900/20"
            >
              <span>💬</span>
              <span>{isAr ? "تواصل مع كونسيرج الجونة الخاص" : "Chat with VIP Concierge"}</span>
            </a>

            <Link
              href="/"
              className="px-6 py-3.5 bg-brand-cream hover:bg-brand-sand text-brand-brown rounded-xl text-xs font-bold uppercase tracking-wider transition border border-brand-border"
            >
              {isAr ? "العودة للرئيسية" : "Back to Home"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutConfirmationPage({ params }: Props) {
  const resolvedParams = use(params);
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-terracotta border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-brand-brown-muted font-medium">Loading confirmed booking...</p>
        </div>
      }
    >
      <CheckoutConfirmationContent locale={resolvedParams.locale} ref={resolvedParams.ref} />
    </Suspense>
  );
}
