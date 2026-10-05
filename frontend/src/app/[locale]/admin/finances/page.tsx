"use client";

import React, { useEffect, useState } from "react";
import { getAdminFinances, getAdminFinanceSummary } from "@/features/admin/services/admin.api";
import type { AdminTransactionItem, FinanceSummary } from "@/features/admin/types";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";

export default function AdminFinancesPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [transactions, setTransactions] = useState<AdminTransactionItem[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      getAdminFinances().catch(() => ({ data: [] })),
      getAdminFinanceSummary().catch(() => null),
    ]).then(([txRes, sumRes]) => {
      if (!mounted) return;
      setTransactions(txRes.data);
      setSummary(sumRes);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown">
            {isAr ? "المالية والتسويات والمدفوعات" : "Financial Command & Payment Transactions"}
          </h1>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "متابعة عمليات الدفع الإلكتروني، وحركات الاسترداد، وتوزيع العمولات وحسابات البنوك."
              : "Track gateway transactions, automated refunds, commissions, and merchant settlements."}
          </p>
        </div>
      </div>

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
            {isAr ? "إجمالي المبالغ المستردة" : "Total Refunds"}
          </span>
          <span className="text-2xl sm:text-3xl font-serif font-bold text-rose-600">
            {summary?.formattedTotalRefunds || "0.00 EGP"}
          </span>
          <span className="text-[11px] text-brand-brown-muted block mt-1 font-light">
            {isAr ? "تسويات وإلغاءات معتمدة" : "Processed Refund Deductions"}
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

      {/* Transactions Table */}
      {loading ? (
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
  );
}
