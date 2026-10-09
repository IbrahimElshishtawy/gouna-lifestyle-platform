import React from "react";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { getPublicEvents } from "@/features/events/services/events.api";
import EventCard from "@/features/events/components/EventCard";
import ScrollReveal from "@/components/ui/ScrollReveal";

interface Props {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    category?: string;
    q?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr
      ? "أرقى فعاليات ومهرجانات الجونة | GouNow"
      : "Exclusive Events & Festivals in El Gouna | GouNow",
    description: isAr
      ? "اكتشف وحجز تذاكر أهم الفعاليات والمهرجانات في الجونة: مهرجان الجونة السينمائي، الحفلات الموسيقية، أمسيات اليخوت، وبطولات الإسكواش والرياضات البحرية."
      : "Discover and secure VIP passes for premier festivals and luxury gatherings in El Gouna: GFF Red Carpet, live lagoon acoustic concerts, and world-class sporting tournaments.",
  };
}

export default async function EventsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === "ar";

  const { category = "all", q = "" } = await searchParams;

  const res = await getPublicEvents({
    category: category !== "all" ? category : undefined,
    q: q || undefined,
  });

  const events = res.data || [];

  const CATEGORIES = [
    { id: "all", label_en: "All Events", label_ar: "جميع الفعاليات" },
    { id: "Festival", label_en: "Festivals & Galas", label_ar: "مهرجانات وسجادة حمراء" },
    { id: "Music", label_en: "Music & Acoustic", label_ar: "موسيقى وأمسيات حية" },
    { id: "Sports", label_en: "Sports & Regattas", label_ar: "رياضات وبطولات" },
    { id: "Nightlife", label_en: "Exclusive Nightlife", label_ar: "سهرات ومارينا" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Luxury Cinematic Header Banner */}
      <section className="relative bg-[#1C1412] text-white pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden border-b border-brand-border">
        {/* Ambient Glow & Background Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105"
          style={{ backgroundImage: "url('/assets/images/hero-villa-dusk.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1412] via-[#1C1412]/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#E5DCD3] text-[11px] font-bold uppercase tracking-[0.2em] mb-4 sm:mb-6 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-terracotta animate-pulse" />
            <span>{isAr ? "موسم الجونة 2026 الحصري" : "EL GOUNA SEASON 2026"}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FAF8F5] max-w-4xl mx-auto leading-tight mb-4 sm:mb-6">
            {isAr ? "عيش أجواء الفعاليات والاحتفالات" : "Premier Events & Festive Evenings"}
            <br />
            <span className="italic font-normal text-brand-terracotta">
              {isAr ? "على ضفاف البحر الأحمر" : "Across El Gouna Lagoons"}
            </span>
          </h1>

          <p className="text-xs sm:text-base text-[#E5DCD3] max-w-2xl mx-auto font-light leading-relaxed mb-8">
            {isAr
              ? "من السجادة الحمراء لمهرجان الجونة السينمائي إلى حفلات المارينا وأمسيات اليخوت الخاصة، احجز مقعدك لكبار الزوار الآن."
              : "From the red carpet glamour of Gouna Film Festival to intimate marina soirees and sunset gatherings. Reserve your VIP tickets seamlessly."}
          </p>

          {/* Category Filter Chips */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap max-w-3xl mx-auto">
            {CATEGORIES.map((cat) => {
              const active = (category === cat.id) || (cat.id === "all" && !category);
              const label = isAr ? cat.label_ar : cat.label_en;
              const href = cat.id === "all" ? "/events" : `/events?category=${encodeURIComponent(cat.id)}`;

              return (
                <Link
                  key={cat.id}
                  href={href}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
                    active
                      ? "bg-brand-terracotta text-white shadow-lg shadow-brand-terracotta/30 scale-105"
                      : "bg-white/10 hover:bg-white/20 text-[#FAF8F5] border border-white/15 backdrop-blur-md"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Events Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 sm:mb-12 border-b border-brand-border/60 pb-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-brand-terracotta block mb-1">
              {isAr ? "الجدول الزمني المعتمد" : "CURATED CALENDAR"}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown">
              {isAr ? "الفعاليات القادمة والمتاحة للحجز" : "Upcoming Events & Registrations"}
            </h2>
          </div>

          <span className="text-xs sm:text-sm text-brand-brown-muted bg-brand-sand px-3.5 py-1.5 rounded-full border border-brand-border font-medium">
            {isAr ? `${events.length} فعالية متاحة` : `${events.length} Available Events`}
          </span>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {events.map((event, idx) => (
              <ScrollReveal key={event.id} animation="fade-up" delay={idx * 100}>
                <EventCard event={event} locale={locale} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-6 bg-white rounded-3xl border border-brand-border shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-brand-sand flex items-center justify-center mx-auto mb-4 text-brand-terracotta">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-bold text-brand-brown mb-2">
              {isAr ? "لا توجد فعاليات مطابقة حالياً" : "No Events Found"}
            </h3>
            <p className="text-sm text-brand-brown-muted mb-6 leading-relaxed">
              {isAr
                ? "يمكنك التواصل مع فريق كونسيرج الجونة لترتيب تصاريح أو تذاكر خاصة للفعاليات غير المدرجة."
                : "Looking for an exclusive gathering? Contact our VIP Concierge for bespoke arrangements and private invitations."}
            </p>
            <Link
              href="/events"
              className="inline-flex px-6 py-2.5 bg-brand-terracotta text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-brand-terracotta-dark transition-colors"
            >
              {isAr ? "عرض كل الفعاليات" : "View All Events"}
            </Link>
          </div>
        )}

        {/* Concierge VIP Assistance Banner */}
        <div className="mt-16 sm:mt-24 p-6 sm:p-10 lg:p-12 rounded-3xl bg-gradient-to-br from-[#1C1412] to-[#2E201B] text-white flex flex-col lg:flex-row items-center justify-between gap-8 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="space-y-3 text-center lg:text-start max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-brand-terracotta text-white text-[10px] font-bold uppercase tracking-widest inline-block">
              {isAr ? "خدمات كبار الزوار VIP" : "VIP CONCIERGE ACCESS"}
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
              {isAr
                ? "هل ترغب في حضور فعالية خاصة أو حجز طاولة VVIP في الجونة؟"
                : "Looking for Private Tables or Bespoke Event Entry in El Gouna?"}
            </h3>
            <p className="text-xs sm:text-sm text-[#E5DCD3] font-light leading-relaxed">
              {isAr
                ? "يقدم فريق كونسيرج جو ناو تصاريح السجادة الحمراء، حجز طاولات النوادي الشاطئية، وتأجير سيارات فارهة مع سائق خاص لراحتكم التامة."
                : "Our dedicated concierge arranges private passes, backstage access, table reservations, and luxury chauffeurs for any occasion."}
            </p>
          </div>

          <a
            href={`https://wa.me/201000000000?text=${encodeURIComponent(
              isAr
                ? "مرحباً، أود الاستفسار عن حجز تصاريح وطاولات VIP لفعاليات ومهرجانات الجونة."
                : "Hello GouNow Concierge, I would like to inquire about VIP tickets and private table arrangements in El Gouna."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 rounded-full bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-brand-terracotta/40 transition-all duration-300 hover:scale-105 active:scale-95 shrink-0 flex items-center gap-2"
          >
            <span>{isAr ? "تواصل مع الكونسيرج واتساب" : "Contact VIP Concierge"}</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
