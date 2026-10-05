import React from "react";

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminFinancesPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const transactions = [
    {
      id: "TXN-88102",
      bookingRef: "GON-2026-641770",
      customer: "First Booker",
      amount: "30,210 EGP",
      commission: "4,531 EGP",
      payout: "25,679 EGP",
      gateway: "Paymob (Online Card)",
      gatewayAr: "باي موب (بطاقة بنكية)",
      status: "Settled",
      statusAr: "تمت التسوية",
      statusColor: "bg-emerald-100 text-emerald-800",
      date: "Nov 18, 2026",
    },
    {
      id: "TXN-88094",
      bookingRef: "GON-2026-118492",
      customer: "Sarah Jenkins",
      amount: "74,400 EGP",
      commission: "11,160 EGP",
      payout: "63,240 EGP",
      gateway: "Stripe International",
      gatewayAr: "سترايب (دولي)",
      status: "Settled",
      statusAr: "تمت التسوية",
      statusColor: "bg-emerald-100 text-emerald-800",
      date: "Oct 04, 2026",
    },
    {
      id: "TXN-88081",
      bookingRef: "GON-2026-552910",
      customer: "Karim Mansour",
      amount: "58,000 EGP",
      commission: "8,700 EGP",
      payout: "49,300 EGP",
      gateway: "Commercial Bank Wire",
      gatewayAr: "تحويل بنكي مباشر (CIB)",
      status: "Settled",
      statusAr: "تمت التسوية",
      statusColor: "bg-emerald-100 text-emerald-800",
      date: "Oct 02, 2026",
    },
    {
      id: "TXN-88075",
      bookingRef: "GON-2026-936084",
      customer: "Guest User",
      amount: "5,643 EGP (Deposit)",
      commission: "846 EGP",
      payout: "4,797 EGP",
      gateway: "Paymob (Apple Pay)",
      gatewayAr: "باي موب (أبل باي)",
      status: "Pending Capture",
      statusAr: "قيد التأكيد البنكي",
      statusColor: "bg-amber-100 text-amber-800",
      date: "Today, 14:10",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-600 font-bold">
              {isAr ? "التقارير المالية والمدفوعات" : "FINANCIAL DISPATCH & SETTLEMENTS"}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown">
            {isAr ? "التقارير المالية وحسابات المنصة" : "Financial Analytics & Payout Ledgers"}
          </h1>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "متابعة العائدات المحصلة، ونسب عمولة المنصة، ومستحقات الملاك، وتسويات بوابات الدفع."
              : "Review gross collected revenues, 15% platform commissions, host payouts, and gateway reconciliation."}
          </p>
        </div>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-1">
            {isAr ? "إجمالي الإيرادات المحصلة" : "Gross Revenue"}
          </span>
          <span className="text-2xl sm:text-3xl font-serif font-bold text-brand-brown">
            221,103 <span className="text-xs font-sans font-normal text-brand-brown-muted">EGP</span>
          </span>
          <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <span>●</span>
            <span>{isAr ? "جميع التسويات مطابقة بنكياً" : "100% Reconciled"}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-1">
            {isAr ? "عمولة المنصة (15% Net)" : "Platform Net Commission"}
          </span>
          <span className="text-2xl sm:text-3xl font-serif font-bold text-brand-terracotta">
            33,165 <span className="text-xs font-sans font-normal text-brand-brown-muted">EGP</span>
          </span>
          <div className="mt-2 text-xs text-brand-brown-muted font-light">
            {isAr ? "رسوم الخدمة وإدارة الحجوزات" : "Service fees & concierge cut"}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-1">
            {isAr ? "مستحقات الملاك وأصحاب الفلل" : "Host Payouts Due"}
          </span>
          <span className="text-2xl sm:text-3xl font-serif font-bold text-brand-brown">
            187,938 <span className="text-xs font-sans font-normal text-brand-brown-muted">EGP</span>
          </span>
          <div className="mt-2 text-xs text-brand-brown-muted font-light">
            {isAr ? "تُحول شهرياً لحسابات الملاك" : "Transferred bi-weekly via CIB"}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-1">
            {isAr ? "حالة بوابات الدفع الإلكتروني" : "Payment Gateways"}
          </span>
          <div className="space-y-1 mt-2 text-xs font-medium">
            <div className="flex items-center justify-between text-emerald-700">
              <span>Paymob (EGP):</span>
              <span className="font-bold">Active ●</span>
            </div>
            <div className="flex items-center justify-between text-emerald-700">
              <span>Stripe (EUR/USD):</span>
              <span className="font-bold">Active ●</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-brand-border flex items-center justify-between">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-brand-brown">
            {isAr ? "سجل المعاملات والمدفوعات الأخيرة" : "Recent Settlement Ledger"}
          </h2>
          <span className="text-xs text-brand-brown-muted font-mono" dir="ltr">
            Ledger-2026-Q4
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-brand-sand-light/60 text-brand-brown-muted font-bold text-[10px] uppercase tracking-wider border-b border-brand-border">
              <tr>
                <th className="py-3.5 px-4 text-start">{isAr ? "رقم المعاملة" : "Transaction ID"}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? "رقم الحجز" : "Booking Ref"}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? "العميل" : "Client"}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? "القيمة الإجمالية" : "Amount"}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? "عمولة المنصة" : "Fee (15%)"}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? "بوابة الدفع" : "Gateway"}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? "الحالة" : "Status"}</th>
                <th className="py-3.5 px-4 text-end">{isAr ? "التاريخ" : "Date"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-brand-sand/30 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-brand-terracotta">
                    {tx.id}
                  </td>
                  <td className="py-4 px-4 font-mono text-brand-brown">
                    {tx.bookingRef}
                  </td>
                  <td className="py-4 px-4 font-medium text-brand-brown">
                    {tx.customer}
                  </td>
                  <td className="py-4 px-4 font-serif font-bold text-brand-brown">
                    {tx.amount}
                  </td>
                  <td className="py-4 px-4 text-emerald-700 font-semibold">
                    {tx.commission}
                  </td>
                  <td className="py-4 px-4 text-stone-600 font-medium">
                    {isAr ? tx.gatewayAr : tx.gateway}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${tx.statusColor}`}>
                      {isAr ? tx.statusAr : tx.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-end text-brand-brown-muted font-light">
                    {tx.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
