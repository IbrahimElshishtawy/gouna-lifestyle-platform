"use client";

import React, { useEffect, useState, use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  getBookingByReference,
  getPaymentProofStatusApi,
  submitPaymentProofApi,
  PaymentProofData,
} from "@/features/checkout/services/checkout.api";

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
  const [proofs, setProofs] = useState<PaymentProofData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Manual payment submission form state
  const [amountCents, setAmountCents] = useState<number>(0);
  const [paymentMethodCode, setPaymentMethodCode] = useState<string>("bank_transfer");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [senderName, setSenderName] = useState<string>("");
  const [senderAccount, setSenderAccount] = useState<string>("");
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [customerNotes, setCustomerNotes] = useState<string>("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submittingProof, setSubmittingProof] = useState<boolean>(false);
  const [proofSubmitError, setProofSubmitError] = useState<string>("");
  const [proofSubmitSuccess, setProofSubmitSuccess] = useState<string>("");

  useEffect(() => {
    async function load() {
      try {
        const [bookingData, proofStatusData] = await Promise.all([
          getBookingByReference(ref, token),
          getPaymentProofStatusApi(ref, token).catch(() => null),
        ]);

        if (bookingData) {
          setBooking(bookingData);
          const total = bookingData.attributes?.pricing?.total_cents || 0;
          setAmountCents(total);
        } else {
          setError(true);
        }

        if (proofStatusData?.proofs) {
          setProofs(proofStatusData.proofs);
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

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProofSubmitError("");
    setProofSubmitSuccess("");

    if (!receiptFile) {
      setProofSubmitError(
        isAr ? "يرجى إرفاق صورة إيصال التحويل (JPG, PNG, PDF)" : "Please attach the transfer receipt image."
      );
      return;
    }

    setSubmittingProof(true);

    try {
      const formData = new FormData();
      formData.append("amount_cents", String(amountCents || booking?.attributes?.pricing?.total_cents || 0));
      formData.append("payment_method_code", paymentMethodCode);
      formData.append("receipt", receiptFile);
      if (referenceNumber) formData.append("reference_number", referenceNumber);
      if (senderName) formData.append("sender_name", senderName);
      if (senderAccount) formData.append("sender_account", senderAccount);
      if (transferDate) formData.append("transfer_date", transferDate);
      if (customerNotes) formData.append("customer_notes", customerNotes);

      const res = await submitPaymentProofApi(ref, formData, token);

      if (res?.data) {
        setProofs((prev) => [res.data, ...prev]);
        setProofSubmitSuccess(
          isAr
            ? "تم استلام بيانات التحويل بنجاح — الدفع قيد المراجعة والتدقيق المالي ولم يتم تأكيده بعد."
            : "Transfer details submitted. Payment is under financial review."
        );
      }
    } catch (err: any) {
      setProofSubmitError(
        err?.message ||
          (isAr
            ? "تعذر إرسال الإثبات حالياً، يرجى التحقق من حجم الملف والبيانات والمحاولة مجدداً."
            : "Could not submit proof. Please ensure file is valid and try again.")
      );
    } finally {
      setSubmittingProof(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-terracotta border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-brand-brown-muted font-medium">
          {isAr ? "جاري جلب تفاصيل الحجز..." : "Retrieving reservation details..."}
        </p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          !
        </div>
        <h2 className="text-2xl font-serif font-bold text-brand-brown">
          {isAr ? "تعذر العثور على الحجز" : "Reservation Not Found"}
        </h2>
        <p className="text-sm text-brand-brown-muted">
          {isAr
            ? "يرجى التحقق من صحة رقم المرجع ورابط الوصول الآمن."
            : "Please verify the booking reference and secure access token."}
        </p>
        <Link
          href="/"
          className="inline-block mt-4 px-6 py-2.5 bg-brand-terracotta text-white rounded-xl text-xs font-bold"
        >
          {isAr ? "العودة للرئيسية" : "Back to Home"}
        </Link>
      </div>
    );
  }

  const attrs = booking?.attributes;
  const property = booking?.relationships?.bookable;
  const customer = booking?.relationships?.customer;
  const pricing = attrs?.pricing;

  const latestProof = proofs.length > 0 ? proofs[0] : null;

  // Determine actual financial status
  const isVerified = attrs?.payment_status === "paid" || attrs?.status === "confirmed" || latestProof?.status === "verified";
  const isPendingVerification = !isVerified && (latestProof?.status === "pending_verification" || attrs?.payment_status === "pending");
  const isRejected = !isVerified && latestProof?.status === "rejected";
  const isUnpaid = !isVerified && !isPendingVerification;

  // Pre-filled WhatsApp message
  const waMessage = encodeURIComponent(
    isAr
      ? `مرحباً كونسيرج جوناو VIP، بخصوص حجزي رقم: ${ref} في ${property?.attributes?.title || "العقار"}.`
      : `Hello GouNow VIP Concierge, regarding my reservation ${ref} at ${property?.attributes?.title || "property"}.`
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Printable Voucher Box */}
      <div className="bg-white rounded-3xl border border-brand-border/60 shadow-xl overflow-hidden print:border-none print:shadow-none">
        {/* Dynamic Status Header Ribbon */}
        {isVerified && (
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white p-8 sm:p-10 text-center space-y-3 relative overflow-hidden">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto text-4xl border border-white/20 shadow-inner">
              ✓
            </div>
            <span className="inline-block text-xs uppercase tracking-widest font-extrabold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              {isAr ? "دفع معتمد ومؤكد رسمياً" : "Payment Verified & Approved"}
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
              {isAr ? "تم تأكيد حجزك وسداد المبلغ بنجاح!" : "Reservation & Payment Confirmed!"}
            </h1>
            <p className="text-sm text-emerald-100 max-w-lg mx-auto leading-relaxed">
              {isAr
                ? `شكراً لك${customer?.name ? ` ${customer.name}` : ""}، تم التحقق من وصول المبلغ وإصدار إيصال الحجز المعتمد.`
                : `Thank you${customer?.name ? ` ${customer.name}` : ""}, payment verified and reservation voucher is issued.`}
            </p>
          </div>
        )}

        {isPendingVerification && (
          <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-800 text-white p-8 sm:p-10 text-center space-y-3 relative overflow-hidden">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto text-4xl border border-white/20 shadow-inner">
              ⏳
            </div>
            <span className="inline-block text-xs uppercase tracking-widest font-extrabold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              {isAr ? "الدفع قيد التدقيق والمراجعة المالية" : "Pending Financial Verification"}
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
              {isAr ? "تم استلام بيانات التحويل — لم يتم تأكيد الدفع بعد" : "Proof Received — Payment Under Review"}
            </h1>
            <p className="text-sm text-amber-100 max-w-xl mx-auto leading-relaxed">
              {isAr
                ? "تم تسجيل بيانات تحويلك بنجاح. لا يُعد الحجز مؤكداً نهائياً إلا بعد مراجعة مسؤول الحسابات ومطابقة الإيصال مع الحساب البنكي/المحفظة."
                : "Your transfer proof has been recorded. Reservation is not final until an authorized administrator verifies receipt of funds in the destination account."}
            </p>
          </div>
        )}

        {isRejected && (
          <div className="bg-gradient-to-r from-rose-600 via-red-700 to-red-800 text-white p-8 sm:p-10 text-center space-y-3 relative overflow-hidden">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto text-4xl border border-white/20 shadow-inner">
              ✕
            </div>
            <span className="inline-block text-xs uppercase tracking-widest font-extrabold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              {isAr ? "إثبات الدفع غير معتمد" : "Payment Proof Rejected"}
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
              {isAr ? "تعذر التحقق من وصول التحويل" : "Transfer Verification Failed"}
            </h1>
            <p className="text-sm text-rose-100 max-w-lg mx-auto leading-relaxed">
              {latestProof?.rejection_reason
                ? (isAr ? `سبب الرفض: ${latestProof.rejection_reason}` : `Reason: ${latestProof.rejection_reason}`)
                : (isAr ? "لم نتمكن من مطابقة بيانات التحويل. يرجى إعادة إرسال الإيصال الصحيح أدناه." : "Could not verify transfer. Please re-submit valid proof below.")}
            </p>
          </div>
        )}

        {isUnpaid && (
          <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white p-8 sm:p-10 text-center space-y-3 relative overflow-hidden">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto text-4xl border border-white/20 shadow-inner">
              📋
            </div>
            <span className="inline-block text-xs uppercase tracking-widest font-extrabold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              {isAr ? "في انتظار إتمام التحويل ورفع الإيصال" : "Awaiting Transfer & Proof Submission"}
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
              {isAr ? "طلب الحجز مسجل — يرجى إتمام التحويل" : "Reservation Created — Please Complete Transfer"}
            </h1>
            <p className="text-sm text-slate-200 max-w-lg mx-auto leading-relaxed">
              {isAr
                ? "يتم الدفع خارج الموقع عبر التحويل البنكي أو المحفظة الإلكترونية. يرجى تحويل المبلغ المطلوب ثم رفع إيصال الدفع أدناه."
                : "Payment is completed offline via bank transfer or mobile wallet. Please transfer the amount and upload your payment proof below."}
            </p>
          </div>
        )}

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
                {isAr ? "حالة السداد والتحقق" : "Payment & Verification Status"}
              </span>
              {isVerified && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  {isAr ? "دفع معتمد (Verified)" : "Verified & Paid"}
                </span>
              )}
              {isPendingVerification && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                  {isAr ? "قيد التدقيق (Pending Review)" : "Pending Review"}
                </span>
              )}
              {isRejected && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  {isAr ? "مرفوض (Rejected)" : "Rejected"}
                </span>
              )}
              {isUnpaid && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  {isAr ? "في انتظار التحويل (Unpaid)" : "Awaiting Payment"}
                </span>
              )}
            </div>
          </div>

          {/* Transfer Instructions & Upload Proof Form for Unpaid or Rejected */}
          {(isUnpaid || isRejected) && (
            <div className="p-6 sm:p-8 bg-amber-50/60 rounded-3xl border border-amber-200 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  {isAr ? "تعليمات الدفع والتحويل الخارجي" : "Offline Transfer Instructions"}
                </span>
                <h3 className="text-lg font-bold text-brand-brown">
                  {isAr ? "حول المبلغ المطلوب عبر إحدى الطرق التالية:" : "Transfer required amount using one of the accounts below:"}
                </h3>
              </div>

              {/* Instructions Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-white rounded-2xl border border-amber-200/80 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-brown">⚡ Instapay / إنستاباي</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                      {isAr ? "موصى به" : "Recommended"}
                    </span>
                  </div>
                  <p className="text-brand-brown-muted">
                    {isAr ? "عنوان إنستاباي (IPA):" : "Instapay Handle:"}{" "}
                    <span className="font-mono font-bold text-brand-brown select-all">gounow@cib</span>
                  </p>
                  <p className="text-brand-brown-muted">
                    {isAr ? "المبلغ المطلوب تحويله:" : "Required Amount:"}{" "}
                    <span className="font-bold text-brand-terracotta">
                      {formatCurrency(pricing?.total_cents || 0)}
                    </span>
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-amber-200/80 space-y-2 shadow-sm">
                  <span className="font-bold text-brand-brown block">🏦 تحويل بنكي (CIB Egypt)</span>
                  <p className="text-brand-brown-muted">
                    {isAr ? "اسم الحساب:" : "Account:"}{" "}
                    <span className="font-bold text-brand-brown">GouNow Lifestyle LLC</span>
                  </p>
                  <p className="text-brand-brown-muted">
                    {isAr ? "رقم الحساب:" : "Acc No:"}{" "}
                    <span className="font-mono font-bold text-brand-brown select-all">1000-4829-9182-01</span>
                  </p>
                </div>
              </div>

              {/* Submit Proof Form */}
              <form onSubmit={handleProofSubmit} className="space-y-4 pt-4 border-t border-amber-200/80">
                <h4 className="font-bold text-sm text-brand-brown">
                  {isAr ? "نموذج إرسال إثبات التحويل:" : "Submit Payment Proof Form:"}
                </h4>

                {proofSubmitError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                    {proofSubmitError}
                  </div>
                )}

                {proofSubmitSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
                    {proofSubmitSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-brand-brown-muted font-medium mb-1">
                      {isAr ? "وسيلة التحويل المستخدمة *" : "Payment Method Used *"}
                    </label>
                    <select
                      value={paymentMethodCode}
                      onChange={(e) => setPaymentMethodCode(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-brand-border text-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-terracotta"
                    >
                      <option value="bank_transfer">إنستاباي / Instapay (IPA)</option>
                      <option value="bank_transfer">تحويل بنكي / CIB Bank Wire</option>
                      <option value="vodafone_cash">محفظة فودافون كاش / Vodafone Cash</option>
                      <option value="cash">سداد نقدي بمكتب مارينا أبو تيج / Cash</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-brand-brown-muted font-medium mb-1">
                      {isAr ? "رقم العملية / المرجع البنكي (Reference) *" : "Transaction Reference No. *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isAr ? "مثال: 987654321 أو رقم المعاملة" : "e.g. 987654321"}
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-brand-border text-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-terracotta"
                    />
                  </div>

                  <div>
                    <label className="block text-brand-brown-muted font-medium mb-1">
                      {isAr ? "اسم صاحب الحساب المحوِّل" : "Sender Full Name"}
                    </label>
                    <input
                      type="text"
                      placeholder={isAr ? "الاسم المدون على التحويل" : "Name as appears on transfer"}
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-brand-border text-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-terracotta"
                    />
                  </div>

                  <div>
                    <label className="block text-brand-brown-muted font-medium mb-1">
                      {isAr ? "رقم المحفظة / آخر 4 أرقام من الحساب" : "Sender Account / Mobile Wallet No."}
                    </label>
                    <input
                      type="text"
                      placeholder={isAr ? "010... أو آخر 4 أرقام" : "010... or last 4 digits"}
                      value={senderAccount}
                      onChange={(e) => setSenderAccount(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-brand-border text-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-terracotta"
                    />
                  </div>

                  <div>
                    <label className="block text-brand-brown-muted font-medium mb-1">
                      {isAr ? "تاريخ ووقت التحويل" : "Transfer Date"}
                    </label>
                    <input
                      type="date"
                      value={transferDate}
                      onChange={(e) => setTransferDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-brand-border text-brand-brown focus:outline-none focus:ring-2 focus:ring-brand-terracotta"
                    />
                  </div>

                  <div>
                    <label className="block text-brand-brown-muted font-medium mb-1">
                      {isAr ? "صورة إيصال التحويل (JPG, PNG, PDF - بحد أقصى 5 ميجا) *" : "Receipt Image File (Max 5MB) *"}
                    </label>
                    <input
                      type="file"
                      required
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-1.5 bg-white rounded-xl border border-brand-border text-brand-brown file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-brand-sand file:text-brand-brown"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingProof}
                    className="w-full sm:w-auto px-8 py-3 bg-brand-terracotta hover:bg-brand-terracotta/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 shadow-md"
                  >
                    {submittingProof
                      ? (isAr ? "جاري رفع الإثبات وتأكيد التسجيل..." : "Uploading Proof...")
                      : (isAr ? "إرسال إثبات التحويل للمراجعة" : "Submit Proof for Verification")}
                  </button>
                </div>
              </form>
            </div>
          )}

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
                {isAr ? "البيان المالي للحجز" : "Financial Breakdown"}
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

                <div className="p-3 bg-brand-cream/60 rounded-xl border border-brand-border/60 space-y-1">
                  <div className="flex justify-between text-xs font-bold text-brand-brown">
                    <span>{isAr ? "المبلغ المعتمد سداده:" : "Verified Amount Paid:"}</span>
                    <span className="text-sm text-emerald-700">
                      {formatCurrency(attrs?.amount_paid_cents || 0)}
                    </span>
                  </div>
                  {attrs?.amount_remaining_cents > 0 && (
                    <div className="flex justify-between text-[11px] text-amber-800 pt-1 border-t border-brand-border/40">
                      <span>{isAr ? "المتبقي للاستحقاق:" : "Remaining Balance:"}</span>
                      <span className="font-bold">{formatCurrency(attrs?.amount_remaining_cents)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 print:hidden">
            {isVerified && (
              <button
                type="button"
                onClick={handlePrint}
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 shadow-lg"
              >
                <span>🖨️</span>
                <span>{isAr ? "طباعة / حفظ إيصال الحجز (Voucher)" : "Print / Save Voucher"}</span>
              </button>
            )}

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
          <p className="text-sm text-brand-brown-muted font-medium">Loading booking confirmation...</p>
        </div>
      }
    >
      <CheckoutConfirmationContent locale={resolvedParams.locale} ref={resolvedParams.ref} />
    </Suspense>
  );
}
