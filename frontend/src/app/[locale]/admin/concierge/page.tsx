import React from "react";

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminConciergePage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const inquiries = [
    {
      id: "CON-9821",
      customer: "Lord Alexander Wright",
      phone: "+44 7700 900077",
      email: "alexander.w@mayfair-invest.co.uk",
      service: "Waterfront Villa & Yacht Charter",
      serviceAr: "فيلا على اللاجون مع يخت خاص",
      dates: "Dec 20 - Jan 03, 2027",
      guests: "8 Guests",
      guestsAr: "8 ضيوف كبار",
      status: "New",
      statusAr: "طلب جديد VIP",
      statusColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      notes: "Requires private mooring for 75ft yacht, daily private chef, and airport Mercedes Maybach transfer.",
      notesAr: "طلب رسو خاص ليخت 75 قدم، شيف إيطالي خاص يومياً، وسيارة مرسيدس مايباخ من مطار الغردقة.",
      time: "25 mins ago",
      timeAr: "منذ 25 دقيقة",
    },
    {
      id: "CON-9819",
      customer: "Eng. Tarek El-Kattan",
      phone: "+20 100 554 9988",
      email: "t.kattan@orascom-partners.eg",
      service: "Ancient Sands Signature Villa Buy Inquiry",
      serviceAr: "معاينة شراء فيلا أنشنت ساندز الخاصة",
      dates: "Immediate Inspection",
      guests: "Family",
      guestsAr: "عائلة",
      status: "In Progress",
      statusAr: "قيد المتابعة",
      statusColor: "bg-blue-100 text-blue-800 border-blue-300",
      notes: "High-net-worth real estate investor requesting architectural floor plans and payment schedule.",
      notesAr: "مستثمر عقاري يرغب في استلام المخططات الهندسية وجدول سداد التقسيط على 5 سنوات.",
      time: "2 hours ago",
      timeAr: "منذ ساعتين",
    },
    {
      id: "CON-9814",
      customer: "Elena Rostova",
      phone: "+971 50 123 4567",
      email: "elena.r@dubai-creatives.ae",
      service: "Superyacht Day Expedition to Tawila Island",
      serviceAr: "رحلة يخت فاخر ليوم كامل إلى جزيرة طويلة",
      dates: "Oct 28, 2026",
      guests: "12 Guests",
      guestsAr: "12 ضيف",
      status: "Contacted",
      statusAr: "تم التواصل واتساب",
      statusColor: "bg-amber-100 text-amber-800 border-amber-300",
      notes: "Birthday celebration on sandbar with catering, scuba instructor, and drone videographer.",
      notesAr: "حفل عيد ميلاد على لسان جزيرة طويلة مع تجهيزات ضيافة، مدرب غوص ومصور درون محترف.",
      time: "Yesterday",
      timeAr: "أمس",
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
              {isAr ? "مكتب الكونسيرج الفاخر 24/7" : "VIP CONCIERGE DESK // LIVE DISPATCH"}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown">
            {isAr ? "طلبات الكونسيرج واستفسارات النزلاء" : "VIP Concierge Inquiries & Client Leads"}
          </h1>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "متابعة طلبات الفلل المخصصة، وتأجير اليخوت، وخدمات الشيف الخاص، والتواصل الفوري عبر واتساب."
              : "Review bespoke villa requests, yacht charters, VIP transfers, and instant WhatsApp client dispatch."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-brand-border text-xs font-semibold text-brand-brown">
            {isAr ? "14 استفسار نشط" : "14 Active Inquiries"}
          </span>
        </div>
      </div>

      {/* Inquiries Cards */}
      <div className="space-y-4">
        {inquiries.map((inquiry) => (
          <div
            key={inquiry.id}
            className="p-5 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs hover:border-brand-terracotta/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-brand-terracotta bg-brand-sand-light px-2.5 py-0.5 rounded-lg border border-brand-border">
                  {inquiry.id}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${inquiry.statusColor}`}>
                  {isAr ? inquiry.statusAr : inquiry.status}
                </span>
                <span className="text-xs text-brand-brown-muted font-light">
                  • {isAr ? inquiry.timeAr : inquiry.time}
                </span>
              </div>

              <h3 className="font-serif text-lg font-bold text-brand-brown">
                {inquiry.customer}
              </h3>

              <div className="flex flex-wrap items-center gap-4 text-xs text-brand-brown-muted">
                <span className="font-medium text-brand-brown">
                  🛎️ {isAr ? inquiry.serviceAr : inquiry.service}
                </span>
                <span>•</span>
                <span>🗓️ {inquiry.dates}</span>
                <span>•</span>
                <span>👥 {isAr ? inquiry.guestsAr : inquiry.guests}</span>
              </div>

              <p className="text-xs text-stone-600 bg-brand-sand-light/50 p-3 rounded-xl border border-brand-border/60 leading-relaxed font-light">
                {isAr ? inquiry.notesAr : inquiry.notes}
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-brand-border/60 shrink-0">
              <div className="text-start sm:text-end text-xs text-brand-brown-muted" dir="ltr">
                <span className="block font-mono font-medium text-brand-brown">{inquiry.phone}</span>
                <span className="block text-[11px] truncate max-w-[180px]">{inquiry.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${inquiry.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Hello ${inquiry.customer}, this is GouNow VIP Concierge regarding your request for ${inquiry.service}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span>💬</span>
                  <span>{isAr ? "مراسلة واتساب" : "WhatsApp Dispatch"}</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
