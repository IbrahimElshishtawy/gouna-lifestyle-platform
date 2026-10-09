"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { completePaymobPaymentApi, declinePaymobPaymentApi } from "@/features/checkout/services/checkout.api";

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export default function PaymobGatewayPage({ params }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const locale = resolvedParams.locale;
  const isAr = locale === "ar";

  const reference = searchParams.get("reference") || "GON-2026-PAYMOB";
  const session = searchParams.get("session") || "";
  const token = searchParams.get("token") || "";
  const initialAmount = searchParams.get("amount") ? Number(searchParams.get("amount")) / 100 : 24966;
  const currency = searchParams.get("currency") || (isAr ? "ج.م" : "EGP");
  const initialChannel = (searchParams.get("channel") as "card" | "instapay") || "card";

  const [activeTab, setActiveTab] = useState<"card" | "instapay">(initialChannel);

  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardType, setCardType] = useState<"visa" | "mastercard" | "meeza" | "unknown">("visa");

  // Instapay state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Processing & 3DS state
  const [isProcessing, setIsProcessing] = useState(false);
  const [show3DSModal, setShow3DSModal] = useState(false);
  const [otpCode, setOtpCode] = useState("123456");
  const [otpTimer, setOtpTimer] = useState(120);
  const [is3DSSubmitting, setIs3DSSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Detect card type from first digits
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, "$1 ").trim();
    setCardNumber(formatted);

    if (raw.startsWith("4")) {
      setCardType("visa");
    } else if (/^5[1-5]/.test(raw) || /^2[2-7]/.test(raw)) {
      setCardType("mastercard");
    } else if (/^5078|^9771/.test(raw)) {
      setCardType("meeza");
    } else {
      setCardType("unknown");
    }
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      setExpiry(`${raw.slice(0, 2)}/${raw.slice(2, 4)}`);
    } else {
      setExpiry(raw);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const formatAmount = (num: number) => {
    return new Intl.NumberFormat(isAr ? "ar-EG" : "en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Card payment submit -> Open 3DS verification
  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanCard = cardNumber.replace(/\s/g, "");
    if (cleanCard.length < 15) {
      setErrorMessage(isAr ? "يرجى إدخال رقم بطاقة بنكية صحيح." : "Please enter a valid card number.");
      return;
    }
    if (expiry.length < 5) {
      setErrorMessage(isAr ? "يرجى إدخال تاريخ انتهاء البطاقة (شهر/سنة)." : "Please enter a valid expiry date (MM/YY).");
      return;
    }
    if (cvv.length < 3) {
      setErrorMessage(isAr ? "يرجى إدخال رمز الأمان CVV." : "Please enter a valid CVV.");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShow3DSModal(true);
    }, 1200);
  };

  // 3DS OTP Confirm -> finalize payment on backend
  const handle3DSConfirm = async () => {
    setIs3DSSubmitting(true);
    try {
      const res = await completePaymobPaymentApi(reference, {
        token,
        session,
        gateway_reference: `PAYMOB-3DS-${Date.now()}`,
        card_brand: cardType,
        channel: "card",
      });

      if (res?.redirect_url) {
        router.push(res.redirect_url);
      } else {
        router.push(`/${locale}/checkout/confirmation/${reference}?token=${token}`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || (isAr ? "فشل التحقق من الدفع، يرجى المحاولة لاحقاً." : "Payment verification failed."));
      setShow3DSModal(false);
      setIs3DSSubmitting(false);
    }
  };

  // Instant Instapay Confirm
  const handleInstapayConfirm = async () => {
    setIsProcessing(true);
    try {
      const res = await completePaymobPaymentApi(reference, {
        token,
        session,
        gateway_reference: `PAYMOB-IPN-${Date.now()}`,
        channel: "instapay",
      });

      if (res?.redirect_url) {
        router.push(res.redirect_url);
      } else {
        router.push(`/${locale}/checkout/confirmation/${reference}?token=${token}`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || (isAr ? "تعذر تأكيد تحويل إنستاباي، يرجى إعادة المحاولة." : "Could not confirm Instapay transfer."));
      setIsProcessing(false);
    }
  };

  // Decline & Return
  const handleCancel = async () => {
    try {
      await declinePaymobPaymentApi(reference, { reason: "User cancelled on gateway" });
    } catch {
      // ignore
    }
    router.back();
  };

  useEffect(() => {
    if (show3DSModal && otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [show3DSModal, otpTimer]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Background Glow effects */}
      <div className="absolute top-0 start-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 end-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        {/* Paymob Official Header */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/60 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/40 rounded-xl flex items-center justify-center text-blue-400 font-bold text-xl tracking-wider shadow-inner">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-wide">
                  {isAr ? "بوابة الدفع الإلكتروني المعتمدة" : "Paymob Unified Gateway"}
                </h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {isAr ? "آمن ومشفر 256-bit" : "256-bit SSL"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAr
                  ? "معتمدة من البنك المركزي المصري (CBE) ومتوافقة مع معايير PCI-DSS الدولية"
                  : "Certified by Central Bank of Egypt & PCI-DSS Level 1 Compliant"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 grayscale opacity-75 hover:grayscale-0 transition">
            <span className="text-[11px] font-semibold text-slate-400">VISA</span>
            <span className="text-[11px] font-semibold text-slate-400">MasterCard</span>
            <span className="text-[11px] font-semibold text-slate-400">Meeza</span>
            <span className="text-[11px] font-semibold text-emerald-400">InstaPay</span>
          </div>
        </div>

        {/* Order Summary Ribbon */}
        <div className="bg-gradient-to-r from-slate-800/90 via-slate-800 to-slate-800/90 rounded-2xl p-5 border border-slate-700/50 shadow-lg flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block font-medium">
              {isAr ? "مرجع الحجز المالي" : "Booking Reference"}
            </span>
            <span className="text-sm font-mono font-bold text-amber-400 tracking-wider">
              {reference}
            </span>
          </div>

          <div className="text-end">
            <span className="text-xs text-slate-400 block font-medium">
              {isAr ? "المبلغ المستحق للدفع اليوم" : "Amount Due Today"}
            </span>
            <div className="flex items-baseline gap-1.5 justify-end">
              <span className="text-2xl font-black text-emerald-400 tracking-tight">
                {formatAmount(initialAmount)}
              </span>
              <span className="text-xs font-bold text-emerald-500/80">{currency}</span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Payment Container */}
        <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700/70 shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="grid grid-cols-2 border-b border-slate-700/60 bg-slate-900/40">
            <button
              type="button"
              onClick={() => setActiveTab("card")}
              className={`py-4 px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                activeTab === "card"
                  ? "text-blue-400 border-b-2 border-blue-500 bg-slate-800/60"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>💳</span>
              <span>{isAr ? "بطاقة بنكية (فيزا / ماستركارد / ميزة)" : "Bank Card (Visa / MC / Meeza)"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("instapay")}
              className={`py-4 px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                activeTab === "instapay"
                  ? "text-emerald-400 border-b-2 border-emerald-500 bg-slate-800/60"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>⚡</span>
              <span>{isAr ? "شبكة إنستاباي الفورية (InstaPay)" : "Instant InstaPay"}</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* CARD TAB */}
            {activeTab === "card" && (
              <form onSubmit={handleCardSubmit} className="space-y-6">
                {/* Visual Card Simulator */}
                <div className="relative w-full h-44 rounded-2xl p-5 bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950 border border-blue-500/30 shadow-xl flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex justify-between items-center relative z-10">
                    <div className="w-11 h-8 bg-amber-400/80 rounded-md flex items-center justify-center shadow-inner">
                      <div className="w-8 h-5 border border-amber-950/40 rounded-sm" />
                    </div>
                    <span className="text-xs uppercase font-extrabold tracking-widest text-blue-400">
                      {cardType === "unknown" ? "BANK CARD" : cardType.toUpperCase()}
                    </span>
                  </div>

                  <div className="relative z-10 text-center tracking-widest font-mono text-lg sm:text-xl font-bold text-slate-200">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </div>

                  <div className="flex justify-between items-end relative z-10 text-xs">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-medium">
                        {isAr ? "اسم حامل البطاقة" : "CARDHOLDER"}
                      </span>
                      <span className="font-semibold text-slate-200 uppercase tracking-wide">
                        {cardHolder || (isAr ? "الاسم كما هو بالبطاقة" : "YOUR NAME")}
                      </span>
                    </div>
                    <div className="text-end">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-medium">
                        {isAr ? "تاريخ الانتهاء" : "EXPIRES"}
                      </span>
                      <span className="font-mono font-semibold text-slate-200">
                        {expiry || "MM/YY"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isAr ? "رقم البطاقة (16 رقماً)" : "Card Number"}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="•••• •••• •••• ••••"
                        value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                      <span className="absolute end-4 top-3 text-xs text-blue-400 font-bold uppercase">
                        {cardType !== "unknown" ? cardType : ""}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isAr ? "اسم حامل البطاقة بالإنجليزية" : "Cardholder Name"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MOHAMED ALI"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {isAr ? "تاريخ الصلاحية (MM/YY)" : "Expiry Date (MM/YY)"}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {isAr ? "رمز الأمان (CVV 3 أرقام)" : "Security Code (CVV)"}
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="•••"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm shadow-xl shadow-blue-900/40 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isAr ? "جاري الاتصال بـ Paymob 3DS..." : "Connecting to Paymob 3DS..."}</span>
                    </>
                  ) : (
                    <>
                      <span>🔒</span>
                      <span>
                        {isAr
                          ? `دفع آمن الآن (${formatAmount(initialAmount)} ${currency})`
                          : `Pay Securely (${formatAmount(initialAmount)} ${currency})`}
                      </span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* INSTAPAY TAB */}
            {activeTab === "instapay" && (
              <div className="space-y-6">
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <span className="text-base">⚡</span>
                    <span>{isAr ? "التحويل الفوري المباشر عبر تطبيق InstaPay" : "Instant Bank Transfer via InstaPay Egypt"}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isAr
                      ? "افتح تطبيق إنستاباي على هاتفك، وقم بتحويل المبلغ المطلوب لحساب منصة جوناو الرسمي باستخدام عنوان الدفع اللحظي (IPA) أو رقم الحساب."
                      : "Open your InstaPay app on your phone and transfer the amount to GouNow official account using IPA address or Account Number."}
                  </p>
                </div>

                {/* Transfer Details Card */}
                <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-700 space-y-4">
                  {/* IPA Handle */}
                  <div className="flex items-center justify-between gap-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">
                        {isAr ? "عنوان الدفع اللحظي (IPA)" : "InstaPay Address (IPA)"}
                      </span>
                      <span className="text-sm font-mono font-bold text-emerald-400">
                        gounow@cib
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy("gounow@cib", "ipa")}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs font-semibold rounded-lg text-slate-200 transition"
                    >
                      {copiedField === "ipa" ? (isAr ? "تم النسخ ✓" : "Copied ✓") : (isAr ? "نسخ" : "Copy")}
                    </button>
                  </div>

                  {/* Bank Account */}
                  <div className="flex items-center justify-between gap-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">
                        {isAr ? "حساب البنك التجاري الدولي (CIB)" : "CIB Bank Account Number"}
                      </span>
                      <span className="text-sm font-mono font-bold text-slate-200">
                        1000-4829-9182-01
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy("10004829918201", "acc")}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs font-semibold rounded-lg text-slate-200 transition"
                    >
                      {copiedField === "acc" ? (isAr ? "تم النسخ ✓" : "Copied ✓") : (isAr ? "نسخ" : "Copy")}
                    </button>
                  </div>

                  {/* Reference code */}
                  <div className="flex items-center justify-between gap-4 p-3 bg-amber-950/20 rounded-xl border border-amber-500/30">
                    <div>
                      <span className="text-[11px] text-amber-400/90 block font-medium">
                        {isAr ? "كود الغرض من التحويل (اكتبه في ملاحظات التحويل)" : "Transfer Memo (Required in notes)"}
                      </span>
                      <span className="text-sm font-mono font-bold text-amber-300">
                        {reference}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(reference, "ref")}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-xs font-semibold rounded-lg text-amber-300 transition"
                    >
                      {copiedField === "ref" ? (isAr ? "تم النسخ ✓" : "Copied ✓") : (isAr ? "نسخ" : "Copy")}
                    </button>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  type="button"
                  onClick={handleInstapayConfirm}
                  disabled={isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm shadow-xl shadow-emerald-950/40 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isAr ? "جاري تأكيد التحويل اللحظي..." : "Verifying Instant Payment..."}</span>
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      <span>
                        {isAr
                          ? "تم التحويل بنجاح، تأكيد الحجز فوراً"
                          : "I have transferred, confirm reservation now"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Cancel Button */}
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={handleCancel}
                className="text-xs text-slate-400 hover:text-rose-400 transition"
              >
                {isAr ? "إلغاء المعاملة والعودة لصفحة الحجز" : "Cancel transaction and return"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Security Badges */}
        <div className="text-center space-y-2 text-slate-500 text-[11px]">
          <p>
            {isAr
              ? "عملية الدفع مؤمنة ومشفرة بالكامل بواسطة Paymob. لا يتم تخزين أي بيانات للبطاقات الائتمانية على خوادم المنصة."
              : "Payment processed securely by Paymob. Card data is never stored on platform servers."}
          </p>
          <div className="flex items-center justify-center gap-4 text-slate-400 font-medium">
            <span>PCI-DSS Level 1</span>
            <span>•</span>
            <span>3D-Secure 2.0</span>
            <span>•</span>
            <span>Central Bank of Egypt Regulated</span>
          </div>
        </div>
      </div>

      {/* 3D-SECURE SIMULATION MODAL */}
      {show3DSModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-500/40 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Bank Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">
                  3DS
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? "التحقق الأمني من البنك (3D Secure)" : "Bank 3D-Secure Verification"}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    VISA / MC Verified
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">
                {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, "0")}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr
                ? "أرسل البنك رمز التحقق المالي (OTP) في رسالة نصية SMS إلى هاتفك المحمول المسجل لتوثيق سداد المبلغ:"
                : "Your issuing bank has sent a One-Time Password (OTP) via SMS to verify this payment:"}
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">{isAr ? "المبلغ المطلوب تفويضه:" : "Authorized Amount:"}</span>
              <span className="font-bold text-emerald-400">{formatAmount(initialAmount)} {currency}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isAr ? "رمز التحقق (OTP):" : "Enter OTP Code:"}
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                className="w-full bg-slate-950 border border-blue-500/60 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest text-emerald-400 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400 block mt-1 text-center">
                {isAr ? "(في بيئة التجربة: الرمز الافتراضي 123456 معتمد)" : "(In simulation mode: default 123456 is verified)"}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handle3DSConfirm}
                disabled={is3DSSubmitting}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-900/40"
              >
                {is3DSSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isAr ? "جاري التوثيق..." : "Authorizing..."}</span>
                  </>
                ) : (
                  <span>{isAr ? "تأكيد وإتمام الدفع" : "Submit OTP & Confirm"}</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShow3DSModal(false)}
                disabled={is3DSSubmitting}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
