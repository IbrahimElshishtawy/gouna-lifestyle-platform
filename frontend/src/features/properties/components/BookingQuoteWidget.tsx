"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Link } from "@/i18n/routing";
import { Property, QuoteCalculation } from "../types/property.types";
import { calculateQuote, inquireProperty } from "../services/properties.api";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  property: Property;
  initialQuote?: QuoteCalculation | null;
}

export default function BookingQuoteWidget({ property, initialQuote }: Props) {
  const { t, locale } = useLanguage();
  const isRent = property.listing_type === "rent";
  const [isPending, startTransition] = useTransition();

  // Dates
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const in3Days = new Date();
  in3Days.setDate(in3Days.getDate() + 4);

  const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split("T")[0]);
  const [checkOut, setCheckOut] = useState(in3Days.toISOString().split("T")[0]);
  const [guests, setGuests] = useState(2);
  const [quote, setQuote] = useState<QuoteCalculation | null>(initialQuote || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inquiry for Sale
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquiryStatus, setInquiryStatus] = useState<"idle" | "success" | "loading">("idle");

  const recalculate = () => {
    if (!checkIn || !checkOut || checkIn >= checkOut) {
      setErrorMessage(t.bookingQuote.dateValidation);
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      try {
        const q = await calculateQuote({
          property_id: property.id,
          check_in: checkIn,
          check_out: checkOut,
          guests: Number(guests),
        });
        setQuote(q);
      } catch {
        setErrorMessage(t.bookingQuote.calculationError);
      }
    });
  };

  useEffect(() => {
    if (isRent && !quote) {
      recalculate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIn, checkOut, guests]);

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
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-brand-border shadow-lg space-y-6">
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

          {/* Date Inputs */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-brand-sand-light/50 border border-brand-border rounded-xl">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted">
                {t.bookingQuote.checkIn}
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown mt-1 cursor-pointer"
              />
            </div>
            <div className="p-2.5 bg-brand-sand-light/50 border border-brand-border rounded-xl">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted">
                {t.bookingQuote.checkOut}
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown mt-1 cursor-pointer"
              />
            </div>
          </div>

          {/* Guests Selector */}
          <div className="p-2.5 bg-brand-sand-light/50 border border-brand-border rounded-xl text-xs">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted">
              {t.bookingQuote.guests}
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full text-xs font-semibold bg-transparent focus:outline-none text-brand-brown mt-1 cursor-pointer"
            >
              {Array.from({ length: property.max_guests }, (_, i) => i + 1).map(
                (n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? t.bookingQuote.guest : t.bookingQuote.guestsPlural}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* Live Calculation Breakdown */}
          {quote && !errorMessage && (
            <div className="space-y-2.5 text-xs border-t border-brand-border pt-4">
              <div className="flex justify-between text-brand-brown">
                <span>
                  {t.common.currency}{" "}
                  {Math.round(
                    quote.subtotal_cents / 100 / quote.nights
                  ).toLocaleString()}{" "}
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
                    {t.common.currency}{" "}
                    {(quote.cleaning_fee_cents / 100).toLocaleString()}
                  </span>
                </div>
              )}

              {quote.tax_cents > 0 && (
                <div className="flex justify-between text-brand-brown-muted">
                  <span>{t.bookingQuote.taxes}</span>
                  <span>
                    {t.common.currency}{" "}
                    {(quote.tax_cents / 100).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between font-bold text-sm text-brand-brown pt-3 border-t border-brand-border">
                <span>{t.bookingQuote.estimatedTotal}</span>
                <span className="text-brand-terracotta text-base">
                  {t.common.currency} {quote.total_formatted}
                </span>
              </div>

              {quote.deposit_cents > 0 && (
                <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex justify-between">
                  <span>{t.bookingQuote.requiredDeposit}</span>
                  <span className="font-bold">
                    {t.common.currency}{" "}
                    {(quote.deposit_cents / 100).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Reserve CTA Button */}
          <div className="pt-2">
            <Link
              href={checkoutUrl}
              data-ga-event="begin_checkout"
              data-ga-item={property.title}
              data-ga-category="booking"
              className={`w-full block text-center py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md hover:shadow-lg cursor-pointer ${
                isPending || errorMessage ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {isPending ? t.bookingQuote.calculating : t.bookingQuote.reserveVillaNow}
            </Link>
            <p className="text-[10px] text-center text-brand-brown-muted mt-2">
              {t.bookingQuote.noChargeNotice}
            </p>
          </div>
        </div>
      ) : (
        /* Real Estate Inquiry Form */
        <div className="space-y-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-brown-muted block">
              {t.bookingQuote.guidePrice}
            </span>
            <div className="text-2xl font-serif font-bold text-brand-brown mt-1">
              {property.price_formatted}{" "}
              <span className="text-xs font-normal text-brand-brown-muted">
                {t.common.currency}
              </span>
            </div>
          </div>

          {inquiryStatus === "success" ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs">
              {t.bookingQuote.inquirySuccess}
            </div>
          ) : (
            <form onSubmit={handleInquirySubmit} className="space-y-3 pt-3 border-t border-brand-border text-xs">
              <div>
                <label className="block text-[11px] font-bold text-brand-brown-muted mb-1">
                  {t.bookingQuote.fullName}
                </label>
                <input
                  type="text"
                  required
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                  placeholder={t.bookingQuote.namePlaceholder}
                  className="w-full p-2.5 bg-brand-sand-light/50 border border-brand-border rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-brown-muted mb-1">
                  {t.bookingQuote.phone}
                </label>
                <input
                  type="tel"
                  required
                  value={inquiryPhone}
                  onChange={(e) => setInquiryPhone(e.target.value)}
                  placeholder="+20 100 000 0000"
                  className="w-full p-2.5 bg-brand-sand-light/50 border border-brand-border rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-brown-muted mb-1">
                  {t.bookingQuote.questions}
                </label>
                <textarea
                  rows={2}
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder={t.bookingQuote.questionsPlaceholder}
                  className="w-full p-2.5 bg-brand-sand-light/50 border border-brand-border rounded-xl focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={inquiryStatus === "loading"}
                className="w-full py-3 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {inquiryStatus === "loading" ? t.bookingQuote.sending : t.bookingQuote.requestViewing}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
