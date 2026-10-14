"use client";

import React, { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Property, QuoteCalculation } from "../types/property.types";
import {
  calculateQuote,
  inquireProperty,
  checkPropertyAvailability,
  getPropertyAvailabilityCalendar,
  AlternativeProperty,
  PropertyCalendarAvailability,
} from "../services/properties.api";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  property: Property;
  initialQuote?: QuoteCalculation | null;
}

export default function BookingQuoteWidget({ property, initialQuote }: Props) {
  const { t, locale } = useLanguage();
  const isAr = locale === "ar";
  const isRent = property.listing_type === "rent";
  const [isPending, startTransition] = useTransition();

  // Dates defaults: checkIn tomorrow, checkOut in 4 days
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const in4Days = new Date();
  in4Days.setDate(in4Days.getDate() + 4);

  const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split("T")[0]);
  const [checkOut, setCheckOut] = useState(in4Days.toISOString().split("T")[0]);
  const [guests, setGuests] = useState(2);
  const [promoCode, setPromoCode] = useState("");
  const [quote, setQuote] = useState<QuoteCalculation | null>(initialQuote || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Availability & Alternative Recommendations state
  const [isAvailable, setIsAvailable] = useState<boolean | null>(true);
  const [availabilityMessage, setAvailabilityMessage] = useState<string>("");
  const [alternatives, setAlternatives] = useState<AlternativeProperty[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // Calendar View Modal state
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [calendarData, setCalendarData] = useState<PropertyCalendarAvailability | null>(null);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  // Inquiry for Sale
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquiryStatus, setInquiryStatus] = useState<"idle" | "success" | "loading">("idle");

  // Validate and check availability
  const checkDatesAndCalculate = async (inDate: string, outDate: string, guestCount: number) => {
    if (!inDate || !outDate) return;

    if (inDate < todayStr) {
      setErrorMessage(isAr ? "لا يمكن حجز تاريخ في الماضي." : "Check-in cannot be in the past.");
      setIsAvailable(false);
      return;
    }

    if (inDate >= outDate) {
      setErrorMessage(t.bookingQuote.dateValidation);
      setIsAvailable(false);
      return;
    }

    setErrorMessage(null);
    setIsCheckingAvailability(true);

    try {
      const availRes = await checkPropertyAvailability(property.slug, {
        check_in: inDate,
        check_out: outDate,
        guests: guestCount,
        promo_code: promoCode || undefined,
      });

      setIsAvailable(availRes.is_available);
      setAvailabilityMessage(isAr ? availRes.message_ar : availRes.message_en);
      setAlternatives(availRes.alternatives || []);

      if (availRes.is_available) {
        // Calculate detailed quote
        startTransition(async () => {
          try {
            const q = await calculateQuote({
              property_id: property.id,
              check_in: inDate,
              check_out: outDate,
              guests: guestCount,
              promo_code: promoCode || undefined,
            });
            setQuote(q);
          } catch {
            // Fallback quote from availability quote if present
            if (availRes.quote) {
              setQuote({
                nights: availRes.quote.nights,
                nightly_prices: [],
                subtotal_cents: availRes.quote.subtotal_cents,
                subtotal_formatted: availRes.quote.subtotal_formatted,
                cleaning_fee_cents: availRes.quote.cleaning_fee_cents,
                service_fee_cents: availRes.quote.service_fee_cents,
                discount_cents: availRes.quote.discount_cents,
                promo_code: promoCode || null,
                tax_percentage: 14,
                tax_cents: availRes.quote.tax_cents,
                total_cents: availRes.quote.total_cents,
                total_formatted: availRes.quote.total_formatted,
                deposit_cents: availRes.quote.total_cents,
                amount_remaining_cents: 0,
                currency: availRes.quote.currency || "EGP",
                min_stay_required: 1,
                satisfies_min_stay: true,
              });
            }
          }
        });
      } else {
        setQuote(null);
      }
    } catch {
      // Graceful offline fallback
      setIsAvailable(true);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  useEffect(() => {
    if (isRent) {
      checkDatesAndCalculate(checkIn, checkOut, guests);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIn, checkOut, guests, isRent]);

  // Load calendar availability when requested
  const handleOpenCalendar = async () => {
    setCalendarModalOpen(true);
    if (!calendarData) {
      setLoadingCalendar(true);
      const data = await getPropertyAvailabilityCalendar(property.slug);
      setCalendarData(data);
      setLoadingCalendar(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryStatus("loading");
    await inquireProperty(property.slug, {
      name: inquiryName,
      phone: inquiryPhone,
      message: inquiryMessage,
    });
    setInquiryStatus("success");

    const text = encodeURIComponent(
      locale === "ar"
        ? `مرحباً كونسيرج جو ناو VIP، أود الاستفسار عن شراء عقار: ${property.title} (المرجع: ${property.reference_code}).\nالاسم: ${inquiryName} (${inquiryPhone})\n${inquiryMessage}`
        : `Hello GouNow VIP Concierge, I am inquiring about purchasing: ${property.title} (Ref: ${property.reference_code}).\nName: ${inquiryName} (${inquiryPhone})\n${inquiryMessage}`
    );
    window.open(`https://wa.me/201000000000?text=${text}`, "_blank");
  };

  const checkoutUrl = `/checkout/${property.slug}?check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`;

  return (
    <div className="bg-white p-5 sm:p-7 rounded-3xl border border-brand-border shadow-xl space-y-5 transition-all">
      {isRent ? (
        <div className="space-y-5">
          {/* Nightly Price Header */}
          <div className="flex items-baseline justify-between border-b border-brand-border pb-4">
            <div>
              <span className="text-2xl font-serif font-bold text-brand-brown">
                {property.price_formatted}
              </span>
              <span className="text-xs text-brand-brown-muted font-normal ms-1">
                {t.common.currency} {t.common.perNight}
              </span>
            </div>
            <span className="text-[11px] px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-full border border-emerald-200">
              {t.bookingQuote.instantBooking}
            </span>
          </div>

          {/* Date Range Inputs: Check-in & Check-out */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-brand-brown">
              <span>{isAr ? "مواعيد الإقامة والزيارة" : "Stay Dates"}</span>
              <button
                type="button"
                onClick={handleOpenCalendar}
                className="text-[11px] text-brand-terracotta hover:underline font-mono flex items-center gap-1 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{isAr ? "عرض الفترات المتاحة" : "View Available Dates"}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-[#FAF7F2] border border-brand-border rounded-xl focus-within:border-brand-terracotta transition-colors">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted">
                  {isAr ? "معاد الزيارة (الوصول)" : t.bookingQuote.checkIn}
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown mt-1 cursor-pointer"
                />
              </div>

              <div className="p-2.5 bg-[#FAF7F2] border border-brand-border rounded-xl focus-within:border-brand-terracotta transition-colors">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted">
                  {isAr ? "معاد المغادرة" : t.bookingQuote.checkOut}
                </label>
                <input
                  type="date"
                  min={checkIn || todayStr}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown mt-1 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Guests Selector */}
          <div className="p-2.5 bg-[#FAF7F2] border border-brand-border rounded-xl text-xs">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted">
              {t.bookingQuote.guests}
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown mt-1 cursor-pointer"
            >
              {Array.from({ length: property.max_guests }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? t.bookingQuote.guest : t.bookingQuote.guestsPlural}
                </option>
              ))}
            </select>
          </div>

          {/* Live Availability Status Indicator */}
          {isCheckingAvailability ? (
            <div className="p-3 bg-amber-50/70 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>{isAr ? "جارٍ التحقق من التوافر في التواريخ المحددة..." : "Checking availability for dates..."}</span>
            </div>
          ) : isAvailable === true ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold">
                  {isAr ? "متاحة بالكامل في هذه المواعيد" : "Available for selected dates"}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {isAr ? "تأكيد فوري" : "Instant"}
              </span>
            </div>
          ) : isAvailable === false && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{isAr ? "الوحدة غير متاحة في هذه المواعيد" : "Dates currently unavailable"}</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                {availabilityMessage || (isAr ? "هذه الفيلا محجوزة أو مغلقة في التواريخ المختارة. اختر تواريخ بديلة أو تفقد البدائل المتاحة أدناه." : "This property is booked during the selected period. Please review alternative dates or our curated available villas below.")}
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* ==================== CASE A: PROPERTY AVAILABLE - LIVE QUOTE BREAKDOWN ==================== */}
          {isAvailable && quote && !errorMessage && (
            <div className="space-y-2.5 text-xs border-t border-brand-border pt-4">
              <div className="flex justify-between text-brand-brown">
                <span>
                  {t.common.currency}{" "}
                  {Math.round(quote.subtotal_cents / 100 / quote.nights).toLocaleString()}{" "}
                  &times; {quote.nights} {t.bookingQuote.nights}
                </span>
                <span className="font-semibold">
                  {t.common.currency} {quote.subtotal_formatted}
                </span>
              </div>

              {quote.cleaning_fee_cents > 0 && (
                <div className="flex justify-between text-brand-brown-muted">
                  <span>{t.bookingQuote.cleaningFee}</span>
                  <span>
                    {t.common.currency} {(quote.cleaning_fee_cents / 100).toLocaleString()}
                  </span>
                </div>
              )}

              {quote.tax_cents > 0 && (
                <div className="flex justify-between text-brand-brown-muted">
                  <span>{t.bookingQuote.taxes}</span>
                  <span>
                    {t.common.currency} {(quote.tax_cents / 100).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between font-bold text-sm text-brand-brown pt-3 border-t border-brand-border">
                <span>{t.bookingQuote.estimatedTotal}</span>
                <span className="text-brand-terracotta text-base">
                  {t.common.currency} {quote.total_formatted}
                </span>
              </div>

              {/* Instant Checkout Action Button */}
              <Link
                href={checkoutUrl}
                className="w-full mt-4 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>{t.bookingQuote.reserveVillaNow || (isAr ? "احجز الفيلا الآن" : "Reserve Villa Now")}</span>
                <svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          )}

          {/* ==================== CASE B: PROPERTY UNAVAILABLE - CURATED ALTERNATIVES ==================== */}
          {!isAvailable && alternatives.length > 0 && (
            <div className="pt-4 border-t border-brand-border space-y-3">
              {/* Concierge Custom Banner */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-[#FAF3EA] to-[#F5ECE1] border border-[#DBC0A0]/60 space-y-1">
                <div className="flex items-center gap-1.5 text-brand-terracotta font-serif font-bold text-xs">
                  <span className="text-sm">✦</span>
                  <span>{isAr ? "بدائل فاخرة ومتاحة بنفس مواعيد رحلتك" : "Curated Alternatives for Your Dates"}</span>
                </div>
                <p className="text-[11px] text-brand-brown leading-relaxed">
                  {isAr
                    ? "حرصاً على راحتك، وفرنا لك هذه الوحدات المتاحة بنفس تواريخ الوصول والمغادرة وبمواصفات ممتازة:"
                    : "To ensure your trip is seamless, our VIP Concierge has found these premier villas available for your exact dates:"}
                </p>
              </div>

              {/* Alternatives List */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                {alternatives.map((alt) => (
                  <Link
                    key={alt.id}
                    href={`/stays/${alt.slug}?check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`}
                    className="group block p-2.5 bg-white hover:bg-brand-sand-light/50 border border-brand-border hover:border-brand-terracotta/50 rounded-2xl transition-all shadow-xs hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      {/* Thumbnail */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-brand-sand">
                        <Image
                          src={alt.cover_image || "/assets/images/hero-villa-dusk.jpg"}
                          alt={isAr ? alt.title_ar : alt.title_en}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-xs font-bold text-brand-brown group-hover:text-brand-terracotta truncate transition-colors">
                          {isAr ? alt.title_ar : alt.title_en}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-brand-brown-muted font-medium mt-0.5">
                          <span>{alt.bedrooms} {isAr ? "غرف" : "Beds"}</span>
                          <span>•</span>
                          <span>{alt.max_guests} {isAr ? "ضيوف" : "Guests"}</span>
                          <span>•</span>
                          <span className="truncate">{alt.compound || alt.location.name_en}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs font-bold text-brand-terracotta font-mono">
                            {alt.price_formatted}
                            <span className="text-[9px] font-normal text-brand-brown-muted ms-1">
                              {isAr ? "/ ليلة" : "/ night"}
                            </span>
                          </span>
                          <span className="text-[10px] font-bold text-brand-terracotta underline flex items-center gap-0.5">
                            <span>{isAr ? "حجز البديل" : "Book Alternative"}</span>
                            <span className="rtl:rotate-180">&rarr;</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Real Estate Inquiry Form for Sale */
        <form onSubmit={handleInquirySubmit} className="space-y-4">
          <div className="border-b border-brand-border pb-3">
            <span className="text-xs font-mono uppercase text-brand-terracotta font-bold tracking-widest block">
              {isAr ? "عقار استثماري للبيع" : "Luxury Property For Sale"}
            </span>
            <span className="text-xl font-serif font-bold text-brand-brown block mt-1">
              {property.price_formatted}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                {t.bookingQuote.fullName || (isAr ? "الاسم الكريم" : "Full Name")}
              </label>
              <input
                type="text"
                required
                value={inquiryName}
                onChange={(e) => setInquiryName(e.target.value)}
                placeholder={isAr ? "الاسم الكريم" : "Your full name"}
                className="w-full p-2.5 bg-brand-sand-light/50 border border-brand-border rounded-xl text-brand-brown focus:outline-none focus:border-brand-terracotta"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                {t.bookingQuote.phone}
              </label>
              <input
                type="tel"
                required
                value={inquiryPhone}
                onChange={(e) => setInquiryPhone(e.target.value)}
                placeholder="+20 10..."
                className="w-full p-2.5 bg-brand-sand-light/50 border border-brand-border rounded-xl text-brand-brown focus:outline-none focus:border-brand-terracotta font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                {t.bookingQuote.questions || (isAr ? "الاستفسارات أو المواعيد المقترحة" : "Questions")}
              </label>
              <textarea
                rows={3}
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                placeholder={
                  isAr
                    ? "أرغب في حجز موعد معاينة ومعرفة تفاصيل خطة السداد..."
                    : "I would like to schedule a private viewing and discuss payment terms..."
                }
                className="w-full p-2.5 bg-brand-sand-light/50 border border-brand-border rounded-xl text-brand-brown focus:outline-none focus:border-brand-terracotta"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={inquiryStatus === "loading"}
            className="w-full py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
          >
            {inquiryStatus === "loading"
              ? (isAr ? "جارٍ الإرسال..." : "Submitting...")
              : (isAr ? "طلب استشارة ومعاينة خاصة" : "Request Private Viewing")}
          </button>
        </form>
      )}

      {/* ==================== INTERACTIVE CALENDAR MODAL ==================== */}
      {calendarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-terracotta" />
                <h3 className="font-serif text-base font-bold text-brand-brown">
                  {isAr ? "جدول التواريخ المتاحة والمحجوزة" : "Availability Calendar"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCalendarModalOpen(false)}
                className="w-8 h-8 rounded-full bg-brand-sand-light hover:bg-brand-sand flex items-center justify-center text-brand-brown cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
                <span>{isAr ? "متاح للحجز" : "Available"}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-100 border border-rose-300" />
                <span>{isAr ? "محجوز / غير متاح" : "Booked / Blocked"}</span>
              </span>
            </div>

            {loadingCalendar ? (
              <div className="py-12 text-center text-xs text-brand-brown-muted animate-pulse">
                {isAr ? "جارٍ تحميل جدول المواعيد..." : "Loading calendar..."}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-brand-brown-muted leading-relaxed">
                  {isAr
                    ? "الحد الأدنى للإقامة في هذه الوحدة هو " + (calendarData?.min_stay_nights || 1) + " ليالٍ. يمكنك اختيار التواريخ من النموذج مباشرة وسنتحقق منها فورياً."
                    : "Minimum stay for this villa is " + (calendarData?.min_stay_nights || 1) + " nights."}
                </p>

                {calendarData?.unavailable_dates && Object.keys(calendarData.unavailable_dates).length > 0 ? (
                  <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-brand-border/80">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-2 font-mono">
                      {isAr ? "الفترات المحجوزة القادمة:" : "Upcoming Reserved Dates:"}
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto no-scrollbar">
                      {Object.entries(calendarData.unavailable_dates).map(([d, info]) => (
                        <span
                          key={d}
                          className="px-2 py-1 bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-mono rounded-lg"
                        >
                          {d} ({info.status === "booked" ? (isAr ? "محجوز" : "Booked") : (isAr ? "مغلق" : "Blocked")})
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800">
                    {isAr
                      ? "جميع التواريخ في الأشهر القادمة متاحة حالياً للحجز المباشر!"
                      : "All dates in upcoming months are currently open for booking!"}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setCalendarModalOpen(false)}
                  className="w-full py-3 bg-brand-brown text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-brand-brown-dark transition-colors cursor-pointer"
                >
                  {isAr ? "حسناً، فهمت" : "Got It"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
