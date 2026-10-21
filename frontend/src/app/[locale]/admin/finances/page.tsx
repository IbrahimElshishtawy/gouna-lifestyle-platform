"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  getAdminFinances,
  getAdminFinanceSummary,
  getAdminPaymentProofs,
  verifyPaymentProof,
  rejectPaymentProof,
} from "@/features/admin/services/admin.api";
import type {
  AdminTransactionItem,
  FinanceSummary,
  AdminPaymentProofItem,
} from "@/features/admin/types";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import SectionExportButtons from "@/features/admin/components/SectionExportButtons";

export default function AdminFinancesPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [activeTab, setActiveTab] = useState<"proofs" | "ledger">("proofs");

  // Ledger state
  const [transactions, setTransactions] = useState<AdminTransactionItem[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loadingLedger, setLoadingLedger] = useState(true);

  // Manual payment proofs state
  const [proofs, setProofs] = useState<AdminPaymentProofItem[]>([]);
  const [proofStatusFilter, setProofStatusFilter] = useState<string>("all");
  const [loadingProofs, setLoadingProofs] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  // Reject modal state
  const [rejectingProofId, setRejectingProofId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Success message toast
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Fetch ledger data
  const fetchLedger = useCallback(async () => {
    setLoadingLedger(true);
    try {
      const [txRes, sumRes] = await Promise.all([
        getAdminFinances().catch(() => ({ data: [] })),
        getAdminFinanceSummary().catch(() => null),
      ]);
      setTransactions(txRes.data);
      setSummary(sumRes);
    } catch {
      // Handled silently
    } finally {
      setLoadingLedger(false);
    }
  }, []);

  // Fetch payment proofs
  const fetchProofs = useCallback(async () => {
    setLoadingProofs(true);
    try {
      const params = proofStatusFilter !== "all" ? { status: proofStatusFilter } : undefined;
      const res = await getAdminPaymentProofs(params);
      setProofs(res.data);
    } catch {
      // Fallback
      setProofs([]);
    } finally {
      setLoadingProofs(false);
    }
  }, [proofStatusFilter]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  useEffect(() => {
    fetchProofs();
  }, [fetchProofs]);

  // Handle Verify
  const handleVerify = async (proof: AdminPaymentProofItem) => {
    const confirmed = window.confirm(
      isAr
        ? `هل أنت متأكد من مطابقة الحوالة البنكية وتأكيد الحجز (${proof.booking_reference}) بمبلغ ${proof.formatted_amount}؟`
        : `Confirm verification of payment for booking (${proof.booking_reference}) amounting to ${proof.formatted_amount}?`
    );
    if (!confirmed) return;

    setActionInProgress(proof.id);
    try {
      await verifyPaymentProof(proof.id);
      setActionMessage(
        isAr
          ? `تم اعتماد الحوالة بنجاح وتحديث الحجز (${proof.booking_reference}) إلى مؤكد.`
          : `Payment proof verified successfully. Booking ${proof.booking_reference} is now confirmed.`
      );
      fetchProofs();
      fetchLedger();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to verify proof");
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Reject Submit
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingProofId) return;
    if (!rejectionReason.trim()) {
      setRejectError(isAr ? "يرجى كتابة سبب الرفض بوضوح للعميل." : "Please specify a clear rejection reason.");
      return;
    }

    setActionInProgress(rejectingProofId);
    setRejectError(null);
    try {
      await rejectPaymentProof(rejectingProofId, {
        rejection_reason: rejectionReason.trim(),
      });
      setActionMessage(
        isAr ? "تم رفض الإيصال وإشعار العميل لإعادة الإرسال." : "Proof rejected and client notified to retry."
      );
      setRejectingProofId(null);
      setRejectionReason("");
      fetchProofs();
    } catch (err: unknown) {
      setRejectError(err instanceof Error ? err.message : "Failed to reject proof");
    } finally {
      setActionInProgress(null);
    }
  };

  const pendingProofsCount = proofs.filter((p) => p.status === "pending").length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown">
            {isAr ? "المالية والتحصيلات وتأكيد الحوالات" : "Financial Command & Payment Verification"}
          </h1>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "مراجعة إيصالات إنستاباي والتحويلات البنكية، واعتماد الحجوزات يدوياً، وسجل المعاملات والسيولة."
              : "Review Instapay & bank transfer receipts, confirm bookings manually, and audit the financial ledger."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SectionExportButtons sectionType="finances" />
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between">
          <span>✓ {actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-1">
            {isAr ? "إجمالي التحصيلات (Gross)" : "Gross Revenue"}
          </span>
          <span className="text-2xl sm:text-3xl font-serif font-bold text-brand-brown">
            {summary?.formattedTotalRevenue || "0.00 EGP"}
          </span>
          <span className="text-[11px] text-emerald-600 block mt-1 font-medium">
            ● {summary?.transactionCount ?? 0} {isAr ? "معاملة بنكية ناجحة" : "Successful Transactions"}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-1">
            {isAr ? "حوالات بانتظار المراجعة" : "Pending Verifications"}
          </span>
          <span className="text-2xl sm:text-3xl font-serif font-bold text-amber-600">
            {pendingProofsCount}
          </span>
          <span className="text-[11px] text-amber-700 block mt-1 font-medium">
            {isAr ? "تتطلب فحص كشف الحساب والاعتماد" : "Requires bank confirmation"}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-1">
            {isAr ? "صافي السيولة النقدية" : "Net Settlement"}
          </span>
          <span className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700">
            {summary?.formattedNetRevenue || "0.00 EGP"}
          </span>
          <span className="text-[11px] text-emerald-700 block mt-1 font-medium">
            {isAr ? "جاهز للصرف والتسوية" : "Available for Payouts"}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-brand-border gap-4 sm:gap-8">
        <button
          onClick={() => setActiveTab("proofs")}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "proofs"
              ? "border-brand-terracotta text-brand-terracotta"
              : "border-transparent text-brand-brown-muted hover:text-brand-brown"
          }`}
        >
          <span>{isAr ? "قائمة مراجعة التحويلات اليدوية" : "Manual Payment Proofs"}</span>
          {pendingProofsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold">
              {pendingProofsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("ledger")}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === "ledger"
              ? "border-brand-terracotta text-brand-terracotta"
              : "border-transparent text-brand-brown-muted hover:text-brand-brown"
          }`}
        >
          {isAr ? "سجل الحركات المالي العام" : "General Transaction Ledger"}
        </button>
      </div>

      {/* Tab 1: Manual Payment Proofs Queue */}
      {activeTab === "proofs" && (
        <div className="space-y-4">
          {/* Proofs Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-brand-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-brown">
                {isAr ? "تصفية بالحالة:" : "Filter Status:"}
              </span>
              {(["all", "pending", "verified", "rejected"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setProofStatusFilter(status)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
                    proofStatusFilter === status
                      ? "bg-brand-terracotta text-white"
                      : "bg-brand-sand-light text-brand-brown-muted hover:bg-brand-sand"
                  }`}
                >
                  {status === "all"
                    ? isAr ? "الكل" : "All"
                    : status === "pending"
                    ? isAr ? "معلق" : "Pending"
                    : status === "verified"
                    ? isAr ? "معتمد" : "Verified"
                    : isAr ? "مرفوض" : "Rejected"}
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchProofs()}
              className="text-xs text-brand-terracotta hover:underline font-medium"
            >
              ↻ {isAr ? "تحديث القائمة" : "Refresh List"}
            </button>
          </div>

          {loadingProofs ? (
            <LoadingState message={isAr ? "جارٍ تحميل إيصالات الدفع..." : "Loading payment proofs..."} rows={4} />
          ) : proofs.length === 0 ? (
            <EmptyState
              icon="🧾"
              title={isAr ? "لا توجد إيصالات دفع مسجلة" : "No Payment Proofs Found"}
              description={
                isAr
                  ? "لم يتم إرسال أي إيصالات تحويل بنكي تحت هذا التصنيف حتى الآن."
                  : "No manual transfer receipts match the current filter."
              }
            />
          ) : (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-brand-sand-light/60 text-brand-brown-muted font-bold text-[10px] uppercase tracking-wider border-b border-brand-border">
                    <tr>
                      <th className="py-3.5 px-4 text-start">{isAr ? "مرجع الحجز" : "Booking Ref"}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? "العميل" : "Customer"}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? "طريقة التحويل" : "Method"}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? "المبلغ المحول" : "Amount"}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? "المرجع / الراسل" : "Ref / Sender"}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? "الإيصال" : "Receipt"}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? "الحالة" : "Status"}</th>
                      <th className="py-3.5 px-4 text-end">{isAr ? "الإجراءات" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60">
                    {proofs.map((proof) => (
                      <tr key={proof.id} className="hover:bg-brand-sand/30 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-brand-terracotta">
                          {proof.booking_reference}
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-medium text-brand-brown">
                            {proof.customer?.name || "Client"}
                          </div>
                          <div className="text-[10px] text-brand-brown-muted" dir="ltr">
                            {proof.customer?.phone || proof.customer?.email || ""}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="capitalize font-medium text-brand-brown">
                            {proof.payment_method?.name || "Manual Transfer"}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-serif font-bold text-brand-brown">
                          {proof.formatted_amount}
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-mono text-xs font-semibold text-brand-brown">
                            {proof.reference_number}
                          </div>
                          {proof.sender_name && (
                            <div className="text-[10px] text-brand-brown-muted">
                              {proof.sender_name} {proof.sender_account ? `(${proof.sender_account})` : ""}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <a
                            href={proof.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-sand-light text-brand-brown hover:bg-brand-sand border border-brand-border text-[11px] font-medium"
                          >
                            <span>📎</span>
                            <span>{isAr ? "فحص الإيصال" : "View Receipt"}</span>
                          </a>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              proof.status === "verified"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : proof.status === "rejected"
                                ? "bg-rose-100 text-rose-800 border-rose-300"
                                : "bg-amber-100 text-amber-800 border-amber-300"
                            }`}
                          >
                            {proof.status === "verified"
                              ? isAr ? "معتمد ومطابق" : "VERIFIED"
                              : proof.status === "rejected"
                              ? isAr ? "مرفوض" : "REJECTED"
                              : isAr ? "قيد المراجعة" : "PENDING"}
                          </span>
                          {proof.rejection_reason && (
                            <p className="text-[10px] text-rose-700 mt-1 max-w-[180px] truncate" title={proof.rejection_reason}>
                              {proof.rejection_reason}
                            </p>
                          )}
                        </td>

                        <td className="py-4 px-4 text-end">
                          {proof.status === "pending" ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                disabled={actionInProgress === proof.id}
                                onClick={() => handleVerify(proof)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
                              >
                                {actionInProgress === proof.id
                                  ? "..."
                                  : isAr ? "اعتماد الحجز" : "Verify & Confirm"}
                              </button>
                              <button
                                disabled={actionInProgress === proof.id}
                                onClick={() => {
                                  setRejectingProofId(proof.id);
                                  setRejectionReason("");
                                  setRejectError(null);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors disabled:opacity-50"
                              >
                                {isAr ? "رفض" : "Reject"}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-brand-brown-muted italic">
                              {proof.reviewed_at ? new Date(proof.reviewed_at).toLocaleDateString() : "—"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: General Ledger Table */}
      {activeTab === "ledger" && (
        <div>
          {loadingLedger ? (
            <LoadingState message={isAr ? "جارٍ تحميل السجل المالي..." : "Loading transaction ledger..."} rows={5} />
          ) : transactions.length === 0 ? (
            <EmptyState
              icon="💳"
              title={isAr ? "لا توجد معاملات مسجلة" : "No Transactions Found"}
              description={
                isAr
                  ? "لم يتم تسجيل أي معاملات بنكية أو حركات دفع في النظام حتى الآن."
                  : "No payment transactions have been logged in the platform ledger yet."
              }
            />
          ) : (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-brand-border flex items-center justify-between">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-brand-brown">
                  {isAr ? "سجل المعاملات والتحصيلات" : "Payment Ledger"}
                </h2>
                <span className="text-xs text-brand-brown-muted font-light">
                  {isAr ? "تسوية آلية فورية" : "Audited Realtime Ledger"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-brand-sand-light/60 text-brand-brown-muted font-bold text-[10px] uppercase tracking-wider border-b border-brand-border">
                    <tr>
                      <th className="py-3.5 px-4 text-start">{isAr ? "رقم الحركة" : "Transaction ID"}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? "مرجع الحجز" : "Booking Ref"}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? "العميل" : "Client"}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? "بوابة الدفع" : "Gateway"}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? "النوع" : "Type"}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? "المبلغ" : "Amount"}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? "التاريخ" : "Timestamp"}</th>
                      <th className="py-3.5 px-4 text-end">{isAr ? "الحالة" : "Status"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-brand-sand/30 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-brand-brown">
                          TXN-#{tx.id}
                        </td>

                        <td className="py-4 px-4 font-mono text-[11px] text-brand-terracotta font-semibold">
                          {tx.booking_reference || "N/A"}
                        </td>

                        <td className="py-4 px-4 font-medium text-brand-brown">
                          {tx.customer_name || "Direct Client"}
                        </td>

                        <td className="py-4 px-4 text-brand-brown-muted capitalize">
                          {tx.gateway} ({tx.payment_method})
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              tx.type === "refund"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-serif font-bold text-brand-brown">
                          {tx.formatted_amount}
                        </td>

                        <td className="py-4 px-4 font-mono text-[11px] text-brand-brown-muted" dir="ltr">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>

                        <td className="py-4 px-4 text-end">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              tx.status === "successful"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : tx.status === "refunded"
                                ? "bg-rose-100 text-rose-800 border-rose-300"
                                : "bg-amber-100 text-amber-800 border-amber-300"
                            }`}
                          >
                            {tx.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingProofId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-brand-border shadow-xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-brand-brown">
              {isAr ? "رفض إيصال التحويل" : "Reject Payment Proof"}
            </h3>
            <p className="text-xs text-brand-brown-muted">
              {isAr
                ? "يرجى كتابة سبب الرفض الموجه للعميل (مثلاً: رقم الحوالة غير مطابق، الإيصال غير واضح، أو المبلغ أقل من المطلوب):"
                : "Enter the clear rejection reason that will be displayed to the client on their booking page:"}
            </p>

            {rejectError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {rejectError}
              </div>
            )}

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={
                  isAr
                    ? "مثال: لم يتم العثور على المعاملة في الحساب البنكي، يرجى التأكد من رقم المرجع."
                    : "e.g., Transaction not found in bank statement, please verify reference number."
                }
                className="w-full p-3 rounded-xl border border-brand-border text-xs focus:ring-2 focus:ring-brand-terracotta outline-hidden"
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectingProofId(null)}
                  className="px-4 py-2 rounded-xl text-xs text-brand-brown-muted hover:bg-brand-sand-light transition-colors font-medium"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={actionInProgress === rejectingProofId}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {actionInProgress === rejectingProofId
                    ? "..."
                    : isAr ? "تأكيد الرفض" : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
