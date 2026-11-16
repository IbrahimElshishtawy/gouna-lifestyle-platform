"use client";

import React, { useEffect, useState } from "react";
import SafeImage from "@/components/ui/SafeImage";
import { Link } from "@/i18n/routing";
import { Property, QuoteCalculation } from "@/features/properties/types/property.types";
import { calculateQuote } from "@/features/properties/services/properties.api";
import {
  fetchPaymentMethodsApi,
  processCheckout,
} from "../services/checkout.api";
import type { PaymentMethod } from "../types/checkout.types";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";

interface CheckoutClientProps {
  property: Property;
  initialCheckIn: string;
  initialCheckOut: string;
  initialGuests: number;
  initialPromo: string;
}

export default function CheckoutClient({
  property,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  initialPromo,
}: CheckoutClientProps) {
  const { t, locale } = useLanguage();
  const { buildWhatsAppUrl, whatsappDigits } = useSiteSettings();
  const isAr = locale === "ar";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState(isAr ? "مصر" : "Egypt");
  const [specialRequests, setSpecialRequests] = useState("");

  const [paymentType, setPaymentType] = useState<"deposit" | "full">("full");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedMethodCode, setSelectedMethodCode] = useState<string>("");

  const [promoCode, setPromoCode] = useState(initialPromo);
  const [appliedPromo, setAppliedPromo] = useState(initialPromo || "");
  const [promoFeedback, setPromoFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const [quote, setQuote] = useState<QuoteCalculation | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [quoteError, setQuoteError] = useState("");

  const [openNights, setOpenNights] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch enabled payment methods from backend
  useEffect(() => {
    let mounted = true;
    fetchPaymentMethodsApi()
      .then((res) => {
        if (!mounted) return;
        const list = res?.data || [];
        setPaymentMethods(list);
        if (list.length > 0) {
          setSelectedMethodCode((prev) => prev || list[0].code);
        }
      })
      .catch(() => {
        if (mounted) setPaymentMethods([]);
      })
      .finally(() => {
        if (mounted) setLoadingMethods(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch authoritative quote from backend
  const loadQuote = async (promo?: string) => {
    setLoadingQuote(true);
    setQuoteError("");
    try {
      const q = await calculateQuote({
        property_id: property.id,
        check_in: initialCheckIn,
        check_out: initialCheckOut,
        guests: initialGuests,
        promo_code: promo || undefined,
      });
      setQuote(q);
      if (promo) {
        if (q.discount_cents > 0) {
          setAppliedPromo(promo);
          setPromoFeedback({
            ok: true,
            text: isAr
              ? `تم تطبيق كود الخصم "${promo}" بنجاح!`
              : `Promo code "${promo}" applied!`,
          });
        } else {
          setAppliedPromo("");
          setPromoFeedback({
            ok: false,
            text: isAr
              ? "كود الخصم غير صالح أو غير مطبق على هذه التواريخ."
              : "Promo code is not valid or not applicable.",
          });
        }
      }
    } catch (err: any) {
      setQuoteError(
        err?.message ||
          (isAr
            ? "تعذر حساب تفاصيل السعر من الخادم."
            : "Could not retrieve authoritative quote from server.")
      );
    } finally {
      setLoadingQuote(false);
    }
  };

  useEffect(() => {
    loadQuote(initialPromo || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property.id, initialCheckIn, initialCheckOut, initialGuests]);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = promoCode.trim().toUpperCase();
    if (!cleaned) {
      setAppliedPromo("");
      setPromoFeedback(null);
      await loadQuote(undefined);
      return;
    }
    await loadQuote(cleaned);
  };

  const nights = quote?.nights ?? 1;
  const subtotalAmount = Math.round((quote?.subtotal_cents ?? 0) / 100);
  const cleaningFeeAmount = Math.round((quote?.cleaning_fee_cents ?? 0) / 100);
  const serviceFeeAmount = Math.round((quote?.service_fee_cents ?? 0) / 100);
  const discountAmount = Math.round((quote?.discount_cents ?? 0) / 100);
  const taxAmount = Math.round((quote?.tax_cents ?? 0) / 100);
  const totalAmount = Math.round((quote?.total_cents ?? 0) / 100);
  const depositAmount = Math.round((quote?.deposit_cents ?? 0) / 100);
  const remainingDepositBalance = Math.max(0, totalAmount - depositAmount);

  const canPayDeposit = depositAmount > 0 && depositAmount < totalAmount;
  const payableAmount = paymentType === "deposit" && canPayDeposit ? depositAmount : totalAmount;

  const currencyLabel = isAr ? "ج.م" : quote?.currency || property.currency || "EGP";
  const formatNum = (num: number) =>
    new Intl.NumberFormat(isAr ? "ar-EG" : "en-US").format(num);
  const formatCurrency = (num: number) => `${formatNum(num)} ${currencyLabel}`;

  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(isAr ? "ar-EG" : "en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const selectedMethod = paymentMethods.find((m) => m.code === selectedMethodCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethodCode) {
      setFormError(
        isAr ? "يرجى اختيار وسيلة الدفع." : "Please select a payment method."
      );
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const res = await processCheckout({
        property_id: property.id,
        check_in: initialCheckIn,
        check_out: initialCheckOut,
        guests: initialGuests,
        promo_code: appliedPromo || undefined,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        country,
        special_requests: specialRequests,
        payment_type: paymentType,
        payment_method: selectedMethodCode,
      });

      if (res?.redirect_url) {
        window.location.href = res.redirect_url;
        return;
      }

      if (res?.booking_reference) {
        window.location.href = `/${locale}/checkout/confirmation/${res.booking_reference}`;
        return;
      }

      setIsSubmitting(false);
    } catch (err: any) {
      setFormError(
        err?.message ||
          (isAr
            ? "تعذر معالجة الطلب حالياً، يرجى التأكد من ملء كافة البيانات المطلوبة وإعادة المحاولة."
            : "Could not initiate payment. Please verify your information and try again.")
      );
      setIsSubmitting(false);
    }
  };

  const thumbImg = property.images?.[0]?.url || "/assets/images/hero-villa-dusk.jpg";
  const displayTitle = isAr && property.title_ar ? property.title_ar : property.title;
  const displayCategory =
    (isAr && property.category?.name_ar ? property.category.name_ar : property.category?.name) ||
    (isAr ? "فيلا فاخرة" : "Luxury Villa");
  const displayLocation =
    (isAr && property.location?.name_ar ? property.location.name_ar : property.location?.name) ||
    (isAr ? "الجونة" : "El Gouna");
  const displayCancellation =
    (isAr ? property.cancellation_policy_text_ar : property.cancellation_policy_text_en) ||
    t.checkout.cancellationPolicy;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-12">
      {/* Checkout Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-brand-brown-muted mb-6">
        <Link href="/" className="hover:text-brand-brown">
          {t.nav.home}
        </Link>
        <span className="rtl:rotate-180">/</span>
        <Link href="/stays" className="hover:text-brand-brown">
          {t.nav.stays}
        </Link>
        <span className="rtl:rotate-180">/</span>
        <Link href={`/stays/${property.slug}`} className="hover:text-brand-brown">
          {displayTitle}
        </Link>
        <span className="rtl:rotate-180">/</span>
        <span className="text-brand-brown font-medium">{t.checkout.checkoutBreadcrumb}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* LEFT COLUMN: Checkout Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Guest Information */}
            <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-brand-border pb-3">
                <span className="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h2 className="font-bold text-brand-brown text-sm uppercase tracking-wider">
                  {t.checkout.guestInfo}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {t.checkout.firstName}
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={isAr ? "أحمد" : "First name"}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {t.checkout.lastName}
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={isAr ? "محمود" : "Last name"}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {t.checkout.email}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guest@example.com"
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {t.checkout.phone}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 1..."
                    dir="ltr"
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-terracotta text-start"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {t.checkout.country}
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder={isAr ? "مصر، الإمارات، السعودية، ألمانيا..." : "Egypt, Germany, UAE..."}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {t.checkout.specialRequests}
                  </label>
                  <textarea
                    rows={2}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder={t.checkout.specialRequestsPlaceholder}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Schedule Option */}
            <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-brand-border pb-3">
                <span className="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h2 className="font-bold text-brand-brown text-sm uppercase tracking-wider">
                  {t.checkout.paymentPreference}
                </h2>
              </div>

              <div className="space-y-3">
                {canPayDeposit && (
                  <label
                    onClick={() => setPaymentType("deposit")}
                    className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentType === "deposit"
                        ? "border-brand-terracotta bg-brand-sand-light/50 ring-1 ring-brand-terracotta"
                        : "border-brand-border bg-white hover:bg-brand-sand-light/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_type"
                      value="deposit"
                      checked={paymentType === "deposit"}
                      onChange={() => setPaymentType("deposit")}
                      className="mt-1 text-brand-terracotta focus:ring-brand-terracotta"
                    />
                    <div className="ms-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-brown">
                          {t.checkout.payDeposit}
                        </span>
                        <span className="text-xs font-bold text-brand-terracotta">
                          {formatCurrency(depositAmount)}
                        </span>
                      </div>
                      <p className="text-[11px] text-brand-brown-muted mt-1">
                        {isAr
                          ? `سداد الدفعة الأولى اليوم. المتبقي ${formatCurrency(remainingDepositBalance)} يُستحق قبل الوصول.`
                          : `Pay deposit today. Remaining balance of ${formatCurrency(remainingDepositBalance)} due prior to arrival.`}
                      </p>
                    </div>
                  </label>
                )}

                <label
                  onClick={() => setPaymentType("full")}
                  className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentType === "full" || !canPayDeposit
                      ? "border-brand-terracotta bg-brand-sand-light/50 ring-1 ring-brand-terracotta"
                      : "border-brand-border bg-white hover:bg-brand-sand-light/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_type"
                    value="full"
                    checked={paymentType === "full" || !canPayDeposit}
                    onChange={() => setPaymentType("full")}
                    className="mt-1 text-brand-terracotta focus:ring-brand-terracotta"
                  />
                  <div className="ms-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-brown">
                        {t.checkout.payFull}
                      </span>
                      <span className="text-xs font-bold text-brand-terracotta">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-brown-muted mt-1">
                      {t.checkout.payFullSub}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* 3. Payment Method (Fetched from Backend) */}
            <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-brand-border pb-3">
                <span className="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <h2 className="font-bold text-brand-brown text-sm uppercase tracking-wider">
                  {t.checkout.paymentMethod}
                </h2>
              </div>

              {loadingMethods ? (
                <div className="py-6 text-center text-xs text-brand-brown-muted">
                  {t.common.loading}
                </div>
              ) : paymentMethods.length === 0 ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {isAr
                    ? "لا توجد وسائل دفع متاحة حالياً."
                    : "No payment methods are currently enabled."}
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.map((pm) => {
                    const isSelected = selectedMethodCode === pm.code;
                    const instructions = isAr
                      ? pm.instructions_ar || pm.instructions
                      : pm.instructions_en || pm.instructions;

                    return (
                      <label
                        key={pm.id}
                        onClick={() => setSelectedMethodCode(pm.code)}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "border-brand-terracotta bg-brand-sand-light/50 ring-1 ring-brand-terracotta"
                            : "border-brand-border bg-white hover:bg-brand-sand-light/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="payment_method"
                            value={pm.code}
                            checked={isSelected}
                            onChange={() => setSelectedMethodCode(pm.code)}
                            className="text-brand-terracotta focus:ring-brand-terracotta"
                          />
                          <div>
                            <span className="block text-xs font-bold text-brand-brown">
                              {pm.name}
                            </span>
                            <span className="block text-[11px] text-brand-brown-muted">
                              {instructions || pm.description}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-brand-brown-muted uppercase bg-brand-sand-light px-2 py-0.5 rounded">
                          {pm.code}
                        </span>
                      </label>
                    );
                  })}

                  {selectedMethod && !selectedMethod.is_online && selectedMethod.configuration && (
                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-2 text-emerald-900 mt-2">
                      <div className="font-bold text-emerald-800">
                        {selectedMethod.name}
                      </div>
                      <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                        {isAr
                          ? selectedMethod.instructions_ar || selectedMethod.instructions
                          : selectedMethod.instructions_en || selectedMethod.instructions}
                      </p>
                      <div className="space-y-1">
                        {Object.entries(selectedMethod.configuration).map(([k, v]) => (
                          <div
                            key={k}
                            className="flex items-center justify-between p-2 bg-white border border-emerald-300 rounded-lg font-mono text-[11px] text-brand-brown"
                            dir="ltr"
                          >
                            <span className="uppercase text-brand-brown-muted">{k.replace(/_/g, " ")}</span>
                            <span className="font-bold select-all">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. Cancellation & House Rules */}
            <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs text-xs text-brand-brown space-y-2">
              <h3 className="font-bold text-sm text-brand-brown mb-1">
                {isAr ? "سياسة الإلغاء" : "Cancellation Policy"}
              </h3>
              <p className="text-brand-brown-muted leading-relaxed">
                {displayCancellation}
              </p>
              <p className="text-[11px] text-brand-brown-muted pt-2 border-t border-brand-border">
                {t.checkout.termsAgreement}
              </p>
            </div>

            {formError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <span>⚠️</span>
                <span>{formError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loadingQuote || Boolean(quoteError) || !selectedMethodCode}
              className="w-full py-4 px-6 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isAr ? "جاري تأكيد الحجز..." : "Processing reservation..."}</span>
                </>
              ) : (
                <>
                  <span>🔒</span>
                  <span>{t.checkout.completeReservation}</span>
                  {quote && <span>({formatCurrency(payableAmount)})</span>}
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Financial Summary Card (5 Cols, Sticky) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
          <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
            {/* Property Header */}
            <div className="p-6 border-b border-brand-border flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-brand-sand shrink-0 border border-brand-border relative">
                <SafeImage
                  src={thumbImg}
                  alt={displayTitle}
                  fill
                  fallbackSrc="/assets/images/hero-villa-dusk.jpg"
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-brand-terracotta uppercase tracking-wider bg-brand-terracotta/10 px-2 py-0.5 rounded">
                  {displayCategory}
                </span>
                <h3 className="font-bold text-brand-brown text-sm mt-1 leading-snug">
                  {displayTitle}
                </h3>
                <p className="text-[11px] text-brand-brown-muted mt-0.5">
                  📍 {displayLocation}
                </p>
              </div>
            </div>

            {/* Dates & Guests Box */}
            <div className="p-6 border-b border-brand-border bg-brand-sand-light/30 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="border-e border-brand-border/80">
                <span className="block text-[10px] font-bold text-brand-brown-muted uppercase">
                  {t.bookingQuote.checkIn}
                </span>
                <span className="font-bold text-brand-brown">
                  {formatDateDisplay(initialCheckIn)}
                </span>
              </div>
              <div className="border-e border-brand-border/80">
                <span className="block text-[10px] font-bold text-brand-brown-muted uppercase">
                  {t.bookingQuote.checkOut}
                </span>
                <span className="font-bold text-brand-brown">
                  {formatDateDisplay(initialCheckOut)}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-brand-brown-muted uppercase">
                  {isAr ? "المدة والضيوف" : "Duration"}
                </span>
                <span className="font-bold text-brand-brown">
                  {nights} {isAr ? "ليالي" : "Nights"} • {initialGuests} {t.bookingQuote.guests}
                </span>
              </div>
            </div>

            {/* Authoritative Price Breakdown from Backend */}
            {loadingQuote ? (
              <div className="p-8 text-center text-xs text-brand-brown-muted">
                {t.bookingQuote.calculating}
              </div>
            ) : quoteError ? (
              <div className="p-6 text-xs text-rose-700 bg-rose-50">
                {quoteError}
              </div>
            ) : (
              <div className="p-6 space-y-3 text-xs text-brand-brown">
                <div className="flex items-center justify-between">
                  <span>{t.checkout.nightsStay.replace("{nights}", String(nights))}</span>
                  <span className="font-semibold">{formatCurrency(subtotalAmount)}</span>
                </div>

                {/* Nightly Accordion */}
                {quote?.nightly_prices && quote.nightly_prices.length > 0 && (
                  <div className="border-y border-brand-border/60 py-2">
                    <button
                      type="button"
                      onClick={() => setOpenNights(!openNights)}
                      className="w-full flex items-center justify-between text-[11px] text-brand-terracotta font-semibold hover:underline cursor-pointer"
                    >
                      <span>{isAr ? "تفاصيل سعر الليلة" : "Nightly Rate Details"}</span>
                      <span>{openNights ? "▲" : "▼"}</span>
                    </button>
                    {openNights && (
                      <div className="mt-2 space-y-1.5 ps-2 text-[11px] text-brand-brown-muted">
                        {quote.nightly_prices.map((np) => (
                          <div key={np.night_date} className="flex items-center justify-between">
                            <span>{np.night_date}</span>
                            <span className="font-medium text-brand-brown">
                              {formatCurrency(Math.round(np.price_cents / 100))}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {cleaningFeeAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span>{t.checkout.cleaningFee}</span>
                    <span className="font-semibold">{formatCurrency(cleaningFeeAmount)}</span>
                  </div>
                )}

                {serviceFeeAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span>{isAr ? "رسوم الخدمة" : "Service Fee"}</span>
                    <span className="font-semibold">{formatCurrency(serviceFeeAmount)}</span>
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-semibold">
                    <span>{t.checkout.promoDiscount} ({appliedPromo})</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                {taxAmount > 0 && (
                  <div className="flex items-center justify-between text-brand-brown-muted">
                    <span>{t.checkout.taxes}</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                )}

                <div className="border-t border-brand-border pt-3 flex items-center justify-between text-sm font-bold">
                  <span>{t.checkout.totalStay}</span>
                  <span className="text-brand-terracotta text-base">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>

                {/* Due Today Highlight */}
                <div className="bg-brand-sand-light p-3.5 rounded-xl border border-brand-border mt-3">
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>
                      {t.checkout.dueToday.replace(
                        "{type}",
                        paymentType === "deposit" && canPayDeposit
                          ? isAr ? "عربون" : "Deposit"
                          : isAr ? "سداد كامل" : "Full"
                      )}
                    </span>
                    <span className="text-brand-terracotta text-sm">
                      {formatCurrency(payableAmount)}
                    </span>
                  </div>
                  {paymentType === "deposit" && canPayDeposit && (
                    <p className="text-[10px] text-brand-brown-muted mt-1">
                      {t.checkout.remainingBalance} {formatCurrency(remainingDepositBalance)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Promo Code Box */}
            <div className="p-6 bg-brand-sand-light/40 border-t border-brand-border">
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder={t.checkout.promoPlaceholder}
                  className="flex-1 text-xs rounded-xl border-brand-border py-2 px-3 uppercase font-mono bg-white focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                />
                <button
                  type="submit"
                  className="py-2 px-4 bg-brand-brown text-white text-xs font-semibold rounded-xl hover:bg-brand-brown-dark transition-colors cursor-pointer"
                >
                  {t.checkout.apply}
                </button>
              </form>
              {promoFeedback && (
                <p
                  className={`text-[10px] font-medium mt-1.5 ${
                    promoFeedback.ok ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  {promoFeedback.text}
                </p>
              )}
              {whatsappDigits && (
                <div className="mt-3 pt-3 border-t border-brand-border/60 text-center">
                  <a
                    href={buildWhatsAppUrl(`Hello GouNow Concierge, I need help booking ${displayTitle}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-emerald-700 hover:underline"
                  >
                    💬 {t.checkout.conciergeWhatsApp}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
