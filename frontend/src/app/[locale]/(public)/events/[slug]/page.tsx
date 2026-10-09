import React from "react";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import SafeImage from "@/components/ui/SafeImage";
import { getPublicEventBySlug } from "@/features/events/services/events.api";
import EventBookingClient from "@/features/events/components/EventBookingClient";

interface Props {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const isAr = locale === "ar";
  const event = await getPublicEventBySlug(slug);

  if (!event) {
    return { title: isAr ? "الفعالية غير موجودة | GouNow" : "Event Not Found | GouNow" };
  }

  const title = isAr && event.attributes.title_ar ? event.attributes.title_ar : event.attributes.title_en;
  const desc = isAr && event.attributes.short_description ? event.attributes.short_description : (event.attributes.description || "");

  return {
    title: `${title} | GouNow El Gouna`,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: event.attributes.cover_url ? [event.attributes.cover_url] : [],
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const isAr = locale === "ar";

  const event = await getPublicEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const { attributes, relationships } = event;
  const title = isAr && attributes.title_ar ? attributes.title_ar : attributes.title_en;
  const description = isAr && attributes.description ? attributes.description : (attributes.description || attributes.short_description || "");
  const coverUrl = attributes.cover_url || "/assets/images/fanadir-villa.jpg";
  const venue = relationships?.venue?.name || attributes.venue_name || (isAr ? "الجونة" : "El Gouna");

  // Date formatting
  const dateObj = attributes.event_date ? new Date(attributes.event_date) : null;
  const formattedDate = dateObj
    ? dateObj.toLocaleDateString(isAr ? "ar-EG" : "en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : attributes.event_date;

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* 1. Cinematic Hero Header */}
      <section className="relative bg-[#1C1412] text-white pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden border-b border-brand-border">
        {/* Full-width Blurred Backsplash */}
        <div className="absolute inset-0 z-0">
          <SafeImage
            src={coverUrl}
            alt={title}
            fill
            fallbackSrc="/assets/images/fanadir-villa.jpg"
            priority
            sizes="100vw"
            className="object-cover opacity-25 filter blur-xs scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1412] via-[#1C1412]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-xs font-mono text-[#E5DCD3]/80 uppercase tracking-widest">
              <li>
                <Link href="/" className="hover:text-white transition">
                  {isAr ? "الرئيسية" : "Home"}
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/events" className="hover:text-white transition">
                  {isAr ? "الفعاليات" : "Events"}
                </Link>
              </li>
              <li>/</li>
              <li className="text-brand-terracotta truncate max-w-[200px] sm:max-w-none">{title}</li>
            </ol>
          </nav>

          <div className="max-w-4xl">
            {/* Badges Row */}
            <div className="flex items-center gap-2.5 flex-wrap mb-4">
              <span className="px-3 py-1 rounded-full bg-brand-terracotta text-white text-[11px] font-bold uppercase tracking-wider shadow-md">
                {formattedDate}
              </span>
              {attributes.category && (
                <span className="px-3 py-1 rounded-full bg-white/10 text-[#FAF8F5] text-[11px] font-medium uppercase tracking-wider backdrop-blur-md border border-white/20">
                  {attributes.category}
                </span>
              )}
              {attributes.is_featured && (
                <span className="px-3 py-1 rounded-full bg-[#D4AF37] text-white text-[11px] font-bold uppercase tracking-wider shadow-md">
                  ★ VIP GALA
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FAF8F5] leading-tight mb-4">
              {title}
            </h1>

            {/* Sub-info bar */}
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-xs sm:text-sm text-[#E5DCD3] pt-2">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-brand-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{venue}</span>
              </div>

              {attributes.start_time && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-brand-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    {isAr ? `البدء: ${attributes.start_time}` : `Doors: ${attributes.start_time}`}
                  </span>
                </div>
              )}

              {attributes.organizer && (
                <div className="flex items-center gap-1.5 text-xs opacity-80">
                  <span>{isAr ? "الجهة المنظمة:" : "By:"}</span>
                  <span className="font-semibold">{attributes.organizer}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Split Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Event Overview & Atmosphere (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Visual Cover Card */}
            <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden bg-brand-sand border border-brand-border/80 shadow-md">
              <SafeImage
                src={coverUrl}
                alt={title}
                fill
                fallbackSrc="/assets/images/fanadir-villa.jpg"
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-5 start-5 end-5 text-white flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-[#E5DCD3]">
                  {attributes.category || "EL GOUNA EVENT"}
                </span>
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-semibold border border-white/20">
                  {venue}
                </span>
              </div>
            </div>

            {/* Event Description */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/80 shadow-sm space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-brown">
                {isAr ? "عن الفعالية وأجوائها" : "About the Event"}
              </h2>
              <div className="text-xs sm:text-sm text-brand-brown-muted leading-relaxed font-light whitespace-pre-line">
                {description || (isAr ? "لا توجد تفاصيل إضافية متاحة حالياً." : "No additional description available.")}
              </div>
            </div>

            {/* Event Rules & Guidelines */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/80 shadow-sm space-y-4">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-brown">
                {isAr ? "الشروط والتعليمات الهامة" : "Event Guidelines & Restrictions"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-brand-border/60">
                  <span className="block text-[11px] font-mono uppercase text-brand-terracotta mb-1">
                    {isAr ? "الزي المعتمد" : "DRESS CODE"}
                  </span>
                  <span className="font-semibold text-xs sm:text-sm text-brand-brown">
                    {attributes.dress_code || (isAr ? "أنيق ساحلي / كاجوال راقي" : "Smart Elegant / Beach Chic")}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-brand-border/60">
                  <span className="block text-[11px] font-mono uppercase text-brand-terracotta mb-1">
                    {isAr ? "الفئة العمرية" : "AGE RESTRICTION"}
                  </span>
                  <span className="font-semibold text-xs sm:text-sm text-brand-brown">
                    {attributes.age_restriction || (isAr ? "مناسب لكافة الأعمار" : "All Ages Welcome")}
                  </span>
                </div>

                {attributes.doors_open_time && (
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-brand-border/60">
                    <span className="block text-[11px] font-mono uppercase text-brand-terracotta mb-1">
                      {isAr ? "فتح الأبواب" : "DOORS OPEN"}
                    </span>
                    <span className="font-semibold text-xs sm:text-sm text-brand-brown">
                      {attributes.doors_open_time}
                    </span>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-brand-border/60">
                  <span className="block text-[11px] font-mono uppercase text-brand-terracotta mb-1">
                    {isAr ? "الدخول" : "ADMISSION"}
                  </span>
                  <span className="font-semibold text-xs sm:text-sm text-brand-brown">
                    {attributes.is_ticketed ? (isAr ? "تذاكر إلكترونية برمز QR" : "Digital QR Ticket Required") : (isAr ? "دخول حر" : "Free Admission")}
                  </span>
                </div>
              </div>

              {attributes.rules && (
                <p className="text-xs text-brand-brown-muted bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/60 mt-3">
                  ⚠️ {attributes.rules}
                </p>
              )}
            </div>

            {/* Venue Location Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border/80 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-sand flex items-center justify-center shrink-0 text-brand-terracotta">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-base text-brand-brown">{venue}</h4>
                <p className="text-xs text-brand-brown-muted font-light">
                  {attributes.venue_address || (isAr ? "الجونة، البحر الأحمر، مصر" : "El Gouna, Red Sea, Egypt")}
                </p>
                <span className="text-[11px] text-brand-terracotta block pt-1">
                  {isAr ? "مواقف سيارات وخدمة صف السيارات VIP متاحة" : "Valet parking & VIP guest arrivals available on site."}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking & Ticket Purchase Box (5 Cols) */}
          <div className="lg:col-span-5 sticky top-28 space-y-6">
            <EventBookingClient event={event} locale={locale} />
          </div>
        </div>
      </section>
    </div>
  );
}
