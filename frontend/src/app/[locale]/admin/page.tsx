import React from "react";
import Link from "next/link";
import { getProperties } from "@/features/properties/services/properties.api";
import UserActionsHistory from "@/features/admin/components/UserActionsHistory";

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const properties = await getProperties();
  const staysCount = properties.filter((p) => p.listing_type === "rent").length;
  const salesCount = properties.filter((p) => p.listing_type === "sale").length;

  const mockBookings = [
    {
      ref: "GON-2026-641770",
      customer: "First Booker",
      customerAr: "حاجز تجريبي 1",
      phone: "+201000000001",
      property: "Fanadir Bay Waterfront Villa",
      propertyAr: "فيلا واجهة خليج الفنادير المائية",
      duration: isAr ? "5 ليالٍ • ضيفان" : "5 nights • 2 guests",
      dates: isAr ? "18 نوفمبر - 23 نوفمبر 2026" : "Nov 18 - Nov 23, 2026",
      total: "30,210",
      status: isAr ? "مؤكد" : "Confirmed",
      statusColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    {
      ref: "GON-2026-936084",
      customer: "Guest User",
      customerAr: "نزيل معتمد",
      phone: "+201022334455",
      property: "Mangroovy Beachfront Luxury Chalet",
      propertyAr: "شاليه مانجروفي الفاخر على الشاطئ",
      duration: isAr ? "3 ليالٍ • 3 ضيوف" : "3 nights • 3 guests",
      dates: isAr ? "14 أكتوبر - 17 أكتوبر 2026" : "Oct 14 - Oct 17, 2026",
      total: "18,810",
      status: isAr ? "قيد الانتظار" : "Pending",
      statusColor: "bg-amber-100 text-amber-800 border-amber-300",
    },
    {
      ref: "GON-2026-118492",
      customer: "Sarah Jenkins",
      customerAr: "سارة جينكينز",
      phone: "+44 7911 123456",
      property: "Abu Tig Marina Penthouse",
      propertyAr: "بنتهاوس مارينا أبو تيج البانورامي",
      duration: isAr ? "7 ليالٍ • 4 ضيوف" : "7 nights • 4 guests",
      dates: isAr ? "22 ديسمبر - 29 ديسمبر 2026" : "Dec 22 - Dec 29, 2026",
      total: "74,400",
      status: isAr ? "مؤكد" : "Confirmed",
      statusColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    {
      ref: "GON-2026-552910",
      customer: "Karim Mansour",
      customerAr: "كريم منصور",
      phone: "+201112223334",
      property: "West Golf Sunset Lagoon Villa",
      propertyAr: "فيلا لاجون ويست جولف للغروب",
      duration: isAr ? "4 ليالٍ • 6 ضيوف" : "4 nights • 6 guests",
      dates: isAr ? "02 نوفمبر - 06 نوفمبر 2026" : "Nov 02 - Nov 06, 2026",
      total: "58,000",
      status: isAr ? "مؤكد" : "Confirmed",
      statusColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Welcome & Quick Actions Banner */}
      <div className="bg-gradient-to-r from-brand-sand-light via-white to-brand-sand-card p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-terracotta">
              {isAr ? "نظام الجونة الحي الموحد" : "El Gouna Live System"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-brown">
            {isAr ? "مرحباً بعودتك، المدير العام (سوبر أدمن)" : "Welcome back, Gounow Super Admin"}
          </h1>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-1 max-w-xl font-light">
            {isAr
              ? "مركز التحكم الشامل لإدارة الفلل الفاخرة، واليخوت الخاصة، والفعاليات، وفريق المشرفين واستفسارات الكونسيرج."
              : "Manage your luxury rental properties, private yacht excursions, ticketed nightlife events, staff roles, and client leads."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <Link
            href="/admin/properties/create"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <span className="mr-1.5 rtl:ml-1.5 rtl:mr-0">+</span>
            <span>{isAr ? "إضافة عقار جديد" : "New Property"}</span>
          </Link>
          <Link
            href="/admin/users"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white hover:bg-brand-sand/50 text-brand-brown border border-brand-border text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <span className="mr-1.5 rtl:ml-1.5 rtl:mr-0">👥</span>
            <span>{isAr ? "فريق المشرفين" : "Staff & Roles"}</span>
          </Link>
          <Link
            href="/admin/pricing"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white hover:bg-brand-sand/50 text-brand-brown border border-brand-border text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <span className="mr-1.5 rtl:ml-1.5 rtl:mr-0">🏷️</span>
            <span>{isAr ? "محرك الأسعار" : "Pricing Calendar"}</span>
          </Link>
          <Link
            href="/admin/concierge"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white hover:bg-brand-sand/50 text-brand-brown border border-brand-border text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <span className="mr-1.5 rtl:ml-1.5 rtl:mr-0">🛎️</span>
            <span>{isAr ? "طلبات الكونسيرج" : "VIP Inquiries"}</span>
          </Link>
        </div>
      </div>

      {/* 2. Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Total Revenue */}
        <Link
          href="/admin/finances"
          className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs hover:border-brand-terracotta/40 hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-brand-brown-muted uppercase tracking-wider">
              {isAr ? "الإيرادات المحصلة" : "Collected Revenue"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">
              💰
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-brand-brown group-hover:text-brand-terracotta transition-colors">
            221,103 <span className="text-xs font-sans font-normal text-brand-brown-muted">{isAr ? "ج.م" : "EGP"}</span>
          </div>
          <div className="mt-2 text-xs text-brand-brown-muted flex items-center gap-1.5">
            <span className="text-emerald-600 font-semibold">● {isAr ? "نشط" : "Active"}</span>
            <span>{isAr ? "تسويات بنكية مباشرة" : "Direct Settlements"}</span>
          </div>
        </Link>

        {/* Metric 2: Bookings */}
        <Link
          href="/admin/bookings"
          className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs hover:border-brand-terracotta/40 hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-brand-brown-muted uppercase tracking-wider">
              {isAr ? "الحجوزات الشهرية" : "Monthly Bookings"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
              📋
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-brand-brown group-hover:text-brand-terracotta transition-colors">
            19 <span className="text-xs font-sans font-normal text-brand-brown-muted">{isAr ? "حجز" : "Bookings"}</span>
          </div>
          <div className="mt-2 text-xs text-brand-brown-muted flex items-center gap-1">
            <span className="text-amber-600 font-semibold">9</span>
            <span>{isAr ? "بانتظار التأكيد الفوري" : "pending confirmation"}</span>
          </div>
        </Link>

        {/* Metric 3: Properties */}
        <Link
          href="/admin/properties"
          className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs hover:border-brand-terracotta/40 hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-brand-brown-muted uppercase tracking-wider">
              {isAr ? "العقارات والفلل المدرجة" : "Properties Listed"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">
              🏡
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-brand-brown group-hover:text-brand-terracotta transition-colors">
            {properties.length || 6} <span className="text-xs font-sans font-normal text-brand-brown-muted">{isAr ? "وحدة" : "Units"}</span>
          </div>
          <div className="mt-2 text-xs text-brand-brown-muted flex items-center gap-1">
            <span>{isAr ? `إيجار ${staysCount} • بيع ${salesCount}` : `Stays: ${staysCount} | For Sale: ${salesCount}`}</span>
          </div>
        </Link>

        {/* Metric 4: VIP Concierge & Leads */}
        <Link
          href="/admin/concierge"
          className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs hover:border-brand-terracotta/40 hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-brand-brown-muted uppercase tracking-wider">
              {isAr ? "طلبات الكونسيرج النشطة" : "Active VIP Leads"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">
              💬
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-brand-brown group-hover:text-brand-terracotta transition-colors">
            14 <span className="text-xs font-sans font-normal text-brand-brown-muted">{isAr ? "استفسار" : "Inquiries"}</span>
          </div>
          <div className="mt-2 text-xs text-brand-brown-muted flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">{isAr ? "4 اليوم عبر واتساب" : "4 WhatsApp leads today"}</span>
          </div>
        </Link>
      </div>

      {/* 3. Super Admin Exclusive Control Matrix */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs p-5 sm:p-7">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-brand-border/60">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-terracotta font-bold block mb-1">
              {isAr ? "مصفوفة قيادة السوبر أدمن" : "SUPER ADMIN COMMAND MATRIX"}
            </span>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-brand-brown">
              {isAr ? "أدوات الإدارة والتحكم الشاملة في المنصة" : "Executive System Control Hub"}
            </h2>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-brand-sand-light text-brand-brown border border-brand-border">
            ROOT-LEVEL ACCESS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {/* Card 1: Users & Staff */}
          <Link
            href="/admin/users"
            className="p-4 rounded-xl sm:rounded-2xl border border-brand-border/80 bg-brand-sand-light/40 hover:bg-white hover:border-brand-terracotta hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-white border border-brand-border flex items-center justify-center text-lg mb-3 shadow-2xs">
                👥
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-brand-brown group-hover:text-brand-terracotta transition-colors">
                {isAr ? "المشرفون والأدوار" : "Staff & Roles"}
              </h3>
              <p className="text-[11px] text-brand-brown-muted font-light mt-1">
                {isAr ? "3 حسابات إدارية نشطة" : "3 Active Admin Keys"}
              </p>
            </div>
            <span className="text-[11px] font-bold text-brand-terracotta mt-3 block">
              {isAr ? "إدارة الصلاحيات ←" : "Manage Roles →"}
            </span>
          </Link>

          {/* Card 2: Events & Nightlife */}
          <Link
            href="/admin/events"
            className="p-4 rounded-xl sm:rounded-2xl border border-brand-border/80 bg-brand-sand-light/40 hover:bg-white hover:border-brand-terracotta hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-white border border-brand-border flex items-center justify-center text-lg mb-3 shadow-2xs">
                🎉
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-brand-brown group-hover:text-brand-terracotta transition-colors">
                {isAr ? "الفعاليات والحفلات" : "Events & Parties"}
              </h3>
              <p className="text-[11px] text-brand-brown-muted font-light mt-1">
                {isAr ? "مهرجان الجونة وحفلات المارينا" : "Festivals & Nightlife"}
              </p>
            </div>
            <span className="text-[11px] font-bold text-brand-terracotta mt-3 block">
              {isAr ? "إدارة التذاكر ←" : "Manage Events →"}
            </span>
          </Link>

          {/* Card 3: VIP Concierge Inquiries */}
          <Link
            href="/admin/concierge"
            className="p-4 rounded-xl sm:rounded-2xl border border-brand-border/80 bg-brand-sand-light/40 hover:bg-white hover:border-brand-terracotta hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-white border border-brand-border flex items-center justify-center text-lg mb-3 shadow-2xs">
                🛎️
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-brand-brown group-hover:text-brand-terracotta transition-colors">
                {isAr ? "طلبات الكونسيرج" : "VIP Concierge"}
              </h3>
              <p className="text-[11px] text-brand-brown-muted font-light mt-1">
                {isAr ? "طلبات الفلل واليخوت والشيف" : "Bespoke Villa & Yacht Leads"}
              </p>
            </div>
            <span className="text-[11px] font-bold text-brand-terracotta mt-3 block">
              {isAr ? "متابعة الطلبات ←" : "View Inquiries →"}
            </span>
          </Link>

          {/* Card 4: Finances & Payouts */}
          <Link
            href="/admin/finances"
            className="p-4 rounded-xl sm:rounded-2xl border border-brand-border/80 bg-brand-sand-light/40 hover:bg-white hover:border-brand-terracotta hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-white border border-brand-border flex items-center justify-center text-lg mb-3 shadow-2xs">
                💳
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-brand-brown group-hover:text-brand-terracotta transition-colors">
                {isAr ? "المالية والتسويات" : "Finances & Payouts"}
              </h3>
              <p className="text-[11px] text-brand-brown-muted font-light mt-1">
                {isAr ? "التحصيلات والعمولات والمستحقات" : "Paymob, Stripe & Wire"}
              </p>
            </div>
            <span className="text-[11px] font-bold text-brand-terracotta mt-3 block">
              {isAr ? "كشف الحسابات ←" : "View Ledgers →"}
            </span>
          </Link>

          {/* Card 5: Settings & Audit */}
          <Link
            href="/admin/settings"
            className="p-4 rounded-xl sm:rounded-2xl border border-brand-border/80 bg-brand-sand-light/40 hover:bg-white hover:border-brand-terracotta hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-white border border-brand-border flex items-center justify-center text-lg mb-3 shadow-2xs">
                ⚙️
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-brand-brown group-hover:text-brand-terracotta transition-colors">
                {isAr ? "إعدادات المنصة" : "System Settings"}
              </h3>
              <p className="text-[11px] text-brand-brown-muted font-light mt-1">
                {isAr ? "قواعد الحجز وسجلات الأمان" : "Policies & Audit Logs"}
              </p>
            </div>
            <span className="text-[11px] font-bold text-brand-terracotta mt-3 block">
              {isAr ? "تعديل الإعدادات ←" : "Configure Rules →"}
            </span>
          </Link>
        </div>
      </div>

      {/* 4. Split Section: Portfolio Breakdown & Recent Bookings Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left Column: Portfolio Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs">
            <h3 className="font-serif text-lg font-bold text-brand-brown mb-4 pb-2 border-b border-brand-border/60">
              {isAr ? "ملخص المحفظة العقارية" : "Portfolio Snapshot"}
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-brand-brown-muted">{isAr ? "فلل إيجار سياحي نشطة" : "Vacation Rental Stays"}</span>
                <span className="font-bold text-brand-brown">{isAr ? `${staysCount} فلل نشطة` : `${staysCount} Active`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-brown-muted">{isAr ? "عقارات معروضة للبيع" : "Real Estate For Sale"}</span>
                <span className="font-bold text-brand-brown">{isAr ? `${salesCount} عقار معروض` : `${salesCount} Active`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-brown-muted">{isAr ? "متوسط الإشغال (أكتوبر)" : "Average Occupancy (Oct)"}</span>
                <span className="font-bold text-emerald-600">84.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-brown-muted">{isAr ? "مكتب كونسيرج واتساب" : "WhatsApp Concierge Desk"}</span>
                <span className="font-bold text-emerald-600">● {isAr ? "متصل 24/7" : "Online"}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-brand-border/60">
              <Link
                href="/admin/properties"
                className="w-full py-2.5 px-4 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl text-xs font-bold text-center block transition-colors border border-brand-border"
              >
                {isAr ? "إدارة جميع العقارات" : "Manage All Properties"}
              </Link>
            </div>
          </div>

          {/* Direct Emergency Dispatch Box */}
          <div className="bg-gradient-to-br from-[#1E1614] to-[#120E0D] text-white p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-lg space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-terracotta block">
              VIP CONCIERGE 24/7
            </span>
            <h4 className="font-serif text-lg font-bold">
              {isAr ? "طوارئ وخدمات الإنزال السريع" : "Direct Emergency Dispatch"}
            </h4>
            <p className="text-xs text-[#C2B7AC] font-light leading-relaxed">
              {isAr
                ? "تواصل فوري مع قبطان مارينا أبو تيج، وإجراءات النقل السريع لمطار الغردقة، وفريق صيانة الفلل الفوري."
                : "Connect immediately with Abu Tig Marina dock master, airport dispatch, or villa maintenance teams."}
            </p>
          </div>
        </div>

        {/* Right Column: Recent Bookings Table (8 cols) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-brand-border flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-brand-brown">
                  {isAr ? "أحدث الحجوزات المسجلة بالنظام" : "Recent Bookings & Reservations"}
                </h3>
                <p className="text-xs text-brand-brown-muted font-light mt-0.5">
                  {isAr ? "حجوزات حية ومسجلة في محرك الحجز" : "Live reservations recorded in the booking engine"}
                </p>
              </div>

              <Link
                href="/admin/bookings"
                className="text-xs font-bold text-brand-terracotta hover:underline"
              >
                {isAr ? "عرض الكل ←" : "View All →"}
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-brand-sand-light/60 text-brand-brown-muted font-bold text-[10px] uppercase tracking-wider border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-4 text-start">{isAr ? "رقم المرجع" : "Reference"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "العميل" : "Customer"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "العقار / الفيلا" : "Property"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "التواريخ" : "Dates"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "الإجمالي" : "Total"}</th>
                    <th className="py-3 px-4 text-end">{isAr ? "الحالة" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {mockBookings.map((b) => (
                    <tr key={b.ref} className="hover:bg-brand-sand/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-brown">
                        {b.ref}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-brand-brown">
                        <div>
                          <span>{isAr ? b.customerAr : b.customer}</span>
                          <span className="block text-[10px] text-brand-brown-muted font-mono" dir="ltr">
                            {b.phone}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-brand-brown block line-clamp-1">
                          {isAr ? b.propertyAr : b.property}
                        </span>
                        <span className="text-[10px] text-brand-brown-muted block">
                          {b.duration}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-brand-brown-muted">
                        {b.dates}
                      </td>
                      <td className="py-3.5 px-4 font-serif font-bold text-brand-brown">
                        {b.total} <span className="text-[10px] font-sans font-normal">{isAr ? "ج.م" : "EGP"}</span>
                      </td>
                      <td className="py-3.5 px-4 text-end">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${b.statusColor}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* 5. User Activity Trail */}
      <UserActionsHistory />
    </div>
  );
}
