import React from "react";

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminSettingsPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const auditLogs = [
    {
      id: "LOG-5510",
      actor: "superadmin@gounow.com",
      action: "Created Admin Account (admin@gounow.com)",
      actionAr: "إنشاء حساب مسؤول تشغيلي جديد",
      ip: "127.0.0.1 (Local Executive Node)",
      timestamp: "Today, 15:10",
      timestampAr: "اليوم، 15:10",
    },
    {
      id: "LOG-5508",
      actor: "superadmin@gounow.com",
      action: "Executed Database Seeder (CreateAdminAccountsSeeder)",
      actionAr: "تنفيذ بذر قاعدة البيانات لحسابات الإدارة",
      ip: "CLI / Artisan Command",
      timestamp: "Today, 14:58",
      timestampAr: "اليوم، 14:58",
    },
    {
      id: "LOG-5499",
      actor: "admin@gounow.com",
      action: "Confirmed Villa Reservation (GON-2026-641770)",
      actionAr: "تأكيد حجز فيلا خليج الفنادير",
      ip: "192.168.1.10 (El Gouna Marina Hub)",
      timestamp: "Yesterday, 18:22",
      timestampAr: "أمس، 18:22",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-brand-terracotta animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-terracotta font-bold">
              {isAr ? "إعدادات المنصة والأمان" : "SYSTEM POLICIES & SECURITY AUDIT"}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown">
            {isAr ? "إعدادات النظام وسياسات الحجز" : "Platform Settings & System Governance"}
          </h1>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "ضبط إعدادات المنصة، وسجلات التدقيق الأمني، وسياسات الدفع وإلغاء الحجوزات."
              : "Configure global commission rates, booking cancellation rules, currency conversion, and audit logs."}
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Global Policies (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs space-y-5">
            <h2 className="font-serif text-lg font-bold text-brand-brown pb-3 border-b border-brand-border/60">
              {isAr ? "السياسات المالية وقواعد الحجز" : "Core Business Rules"}
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-brand-brown block">
                    {isAr ? "نسبة عمولة المنصة الافتراضية" : "Standard Platform Commission"}
                  </span>
                  <span className="text-brand-brown-muted font-light">
                    {isAr ? "تُخصم تلقائياً من حجوزات الفلل واليخوت" : "Deducted automatically from gross bookings"}
                  </span>
                </div>
                <span className="font-mono font-bold text-base text-brand-terracotta bg-brand-sand-light px-3 py-1 rounded-xl border border-brand-border">
                  15%
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-brand-border/60">
                <div>
                  <span className="font-bold text-brand-brown block">
                    {isAr ? "مهلة تأكيد الحجز المبدئي" : "Instant Hold Window"}
                  </span>
                  <span className="text-brand-brown-muted font-light">
                    {isAr ? "الوقت المتاح للنزيل لإتمام الدفع قبل إلغاء الحجز" : "Reservation hold timeout before release"}
                  </span>
                </div>
                <span className="font-mono font-bold text-sm text-brand-brown bg-brand-sand-light px-3 py-1 rounded-xl border border-brand-border">
                  24 {isAr ? "ساعة" : "Hours"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-brand-border/60">
                <div>
                  <span className="font-bold text-brand-brown block">
                    {isAr ? "سياسة الإلغاء القياسية للفلل" : "Cancellation Policy"}
                  </span>
                  <span className="text-brand-brown-muted font-light">
                    {isAr ? "استرداد كامل حتى 14 يوماً قبل تاريخ الوصول" : "100% refund up to 14 days before check-in"}
                  </span>
                </div>
                <span className="font-bold text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  {isAr ? "مرنة VIP" : "Flexible"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Node & Security Status (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#12100E] text-white p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/10 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-terracotta font-bold">
                {isAr ? "حالة الأمان والحماية" : "SECURITY ENGINE"}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <h3 className="font-serif text-xl font-bold text-white">
              {isAr ? "خادم الجونة الآمن" : "El Gouna Node Hardened"}
            </h3>

            <div className="space-y-2 text-xs text-stone-300 font-light">
              <div className="flex items-center justify-between py-1 border-b border-white/10">
                <span>Sanctum Token Auth:</span>
                <span className="font-mono text-emerald-400 font-bold">Active ●</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/10">
                <span>Hardware Encryption:</span>
                <span className="font-mono text-white">AES-256</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/10">
                <span>Database Connection:</span>
                <span className="font-mono text-emerald-400 font-bold">SQLite Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Table Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-brand-border flex items-center justify-between">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-brand-brown">
            {isAr ? "سجل تدقيق العمليات الأمنية (Audit Trail)" : "Administrative Audit Trail"}
          </h2>
          <span className="text-xs text-brand-brown-muted font-light">
            {isAr ? "تسجيل دقيق لكافة أوامر السوبر أدمن" : "Immutable Action Log"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-brand-sand-light/60 text-brand-brown-muted font-bold text-[10px] uppercase tracking-wider border-b border-brand-border">
              <tr>
                <th className="py-3.5 px-4 text-start">{isAr ? "المعرف" : "Log ID"}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? "المسؤول" : "Actor"}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? "العملية المنفذة" : "Action"}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? "المصدر / IP" : "Source"}</th>
                <th className="py-3.5 px-4 text-end">{isAr ? "التوقيت" : "Timestamp"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-brand-sand/30 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-brand-terracotta">
                    {log.id}
                  </td>
                  <td className="py-4 px-4 font-mono text-brand-brown">
                    {log.actor}
                  </td>
                  <td className="py-4 px-4 font-medium text-brand-brown">
                    {isAr ? log.actionAr : log.action}
                  </td>
                  <td className="py-4 px-4 text-stone-600 font-mono text-[11px]" dir="ltr">
                    {log.ip}
                  </td>
                  <td className="py-4 px-4 text-end text-brand-brown-muted font-light">
                    {isAr ? log.timestampAr : log.timestamp}
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
