import React from "react";
import Image from "next/image";

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminEventsPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const events = [
    {
      id: "ev-01",
      title: "Gouna Film Festival VIP Opening Gala",
      titleAr: "حفل افتتاح مهرجان الجونة السينمائي (VIP)",
      category: "Festival & Red Carpet",
      categoryAr: "مهرجانات وسجادة حمراء",
      date: "Oct 24 - Nov 01, 2026",
      dateAr: "24 أكتوبر - 01 نوفمبر 2026",
      venue: "El Gouna Conference & Culture Centre (Plaza)",
      venueAr: "مركز الجونة للمؤتمرات والثقافة (البلازا)",
      price: "12,500 EGP",
      capacity: "450 / 500 Guests",
      capacityAr: "450 / 500 ضيف",
      status: "Active",
      statusAr: "نشط ومتاح",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "ev-02",
      title: "Smokery Yacht Club Sunset Electronic Sessions",
      titleAr: "حفلات غروب الشمس الإلكترونية - نادي سموكري لليخوت",
      category: "Nightlife & Electronic",
      categoryAr: "حفلات موسيقية وسهر",
      date: "Every Friday & Saturday",
      dateAr: "كل جمعة وسبت",
      venue: "Abu Tig Marina Smokery Beach",
      venueAr: "شاطئ سموكري، مارينا أبو تيج",
      price: "2,800 EGP",
      capacity: "280 / 300 Guests",
      capacityAr: "280 / 300 ضيف",
      status: "Sold Out",
      statusAr: "مكتمل العدد",
      image: "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "ev-03",
      title: "Club 88 Marina Bohemian Beach Party",
      titleAr: "حفلة شاطئ كلوب 88 البوهيمية الفاخرة",
      category: "Beach & Day Club",
      categoryAr: "شاطئ وموسيقى نهارية",
      date: "Every Thursday, 14:00 - 22:00",
      dateAr: "كل خميس، 14:00 - 22:00",
      venue: "Club 88 Pool & Lounge",
      venueAr: "كلوب 88 لاونج والمسبح",
      price: "3,200 EGP",
      capacity: "190 / 250 Guests",
      capacityAr: "190 / 250 ضيف",
      status: "Active",
      statusAr: "نشط ومتاح",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
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
              {isAr ? "إدارة الفعاليات والتذاكر" : "TICKETING & NIGHTLIFE DISPATCH"}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown">
            {isAr ? "إدارة الفعاليات والحفلات بالجونة" : "El Gouna Events & Festival Management"}
          </h1>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "جدولة حفلات المارينا، وتذاكر المهرجانات، والتحكم في قوائم كبار الشخصيات (VIP Guest Lists)."
              : "Schedule marina parties, festival tickets, table allocations, and VIP guest lists."}
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer shrink-0"
        >
          <span>+</span>
          <span>{isAr ? "إضافة فعالية جديدة" : "Create Event"}</span>
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
          >
            <div>
              <div className="relative h-48 overflow-hidden bg-brand-sand">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 start-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                      event.status === "Sold Out"
                        ? "bg-rose-600 text-white"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {isAr ? event.statusAr : event.status}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <span className="text-[10px] font-bold text-brand-terracotta uppercase tracking-wider block mb-1">
                  {isAr ? event.categoryAr : event.category}
                </span>
                <h3 className="font-serif text-lg font-bold text-brand-brown mb-2 leading-snug">
                  {isAr ? event.titleAr : event.title}
                </h3>
                <div className="space-y-1 text-xs text-brand-brown-muted font-light">
                  <p>📍 {isAr ? event.venueAr : event.venue}</p>
                  <p>🗓️ {isAr ? event.dateAr : event.date}</p>
                  <p>🎟️ {isAr ? event.capacityAr : event.capacity}</p>
                </div>
              </div>
            </div>

            <div className="p-5 pt-3 border-t border-brand-border/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                  {isAr ? "سعر التذكرة" : "Ticket Price"}
                </span>
                <span className="text-base font-serif font-bold text-brand-brown">
                  {event.price}
                </span>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg border border-brand-border hover:border-brand-terracotta hover:text-brand-terracotta text-brand-brown text-xs font-semibold transition-colors cursor-pointer"
              >
                {isAr ? "إدارة التذاكر" : "Manage Tickets"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
