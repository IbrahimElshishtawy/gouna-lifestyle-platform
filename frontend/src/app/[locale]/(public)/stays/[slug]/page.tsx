import React from "react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getPropertyBySlug,
  getProperties,
} from "@/features/properties/services/properties.api";
import PropertyDetailGallery from "@/features/properties/components/PropertyDetailGallery";
import BookingQuoteWidget from "@/features/properties/components/BookingQuoteWidget";
import PropertyCard from "@/features/properties/components/PropertyCard";
import ReviewsSection from "@/features/reviews/components/ReviewsSection";
import { setRequestLocale } from "next-intl/server";
import { getDictionary } from "@/locales/dictionary";
import type { Metadata } from "next";

interface Props {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const property = await getPropertyBySlug(slug);
  const isAr = locale === "ar";
  if (!property) return { title: isAr ? "العقار غير موجود" : "Property Not Found" };

  return {
    title: `${property.title} | ${isAr ? "جوناو الجونة" : "GouNow El Gouna"}`,
    description: property.description,
    openGraph: {
      title: property.title,
      description: property.description,
      locale: isAr ? "ar_EG" : "en_US",
      images: property.images?.[0]?.url ? [property.images[0].url] : [],
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = getDictionary(locale);
  const isAr = locale === "ar";

  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  const allProps = await getProperties();
  const similarProperties = allProps
    .filter((p) => p.id !== property.id)
    .slice(0, 3);

  const whatsappMsgHeader = isAr ? "مرحباً جوناو،" : "Hello GouNow,";
  const whatsappInquiryUrl = `https://wa.me/201000000000?text=${encodeURIComponent(
    `${whatsappMsgHeader}\n\n${isAr ? "أستفسر عن عقار:" : "I am inquiring about:"} ${property.title}\n${isAr ? "المرجع:" : "Reference:"} ${property.reference_code}\n\n${isAr ? "هل يمكن تزويدي بالمزيد من التفاصيل والتواريخ المتاحة؟" : "Could you please provide more details?"}`
  )}`;

  // Clean formatted check-in/out without seconds
  const formattedCheckIn = property.check_in_time ? property.check_in_time.slice(0, 5) : "15:00";
  const formattedCheckOut = property.check_out_time ? property.check_out_time.slice(0, 5) : "11:00";

  return (
    <div className="bg-[#FAF8F5] py-6 sm:py-10 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
      {/* Breadcrumb & Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs text-brand-brown-muted mb-2">
            <Link href="/" className="hover:text-brand-brown">
              {t.nav.home}
            </Link>
            <span className="rtl:rotate-180">/</span>
            <Link
              href={`/stays?listing_type=${property.listing_type}`}
              className="hover:text-brand-brown"
            >
              {property.listing_type === "rent" ? t.nav.stays : (isAr ? "عقارات للبيع" : "Real Estate")}
            </Link>
            <span className="rtl:rotate-180">/</span>
            <span className="text-brand-brown font-medium">
              {property.location?.name || (isAr ? "الجونة" : "El Gouna")}
            </span>
          </nav>

          <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-brand-brown">
            {property.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-brand-brown-muted mt-2">
            <span className="flex items-center gap-1.5 font-medium text-brand-brown">
              <svg className="w-3.5 h-3.5 text-brand-terracotta shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{property.location?.name}, {isAr ? "الجونة، مصر" : "El Gouna, Egypt"}</span>
            </span>
            <span>&bull;</span>
            <span className="font-mono text-brand-terracotta font-semibold" dir="ltr">
              Ref: {property.reference_code}
            </span>
          </div>
        </div>

        {/* Share / WhatsApp */}
        <div className="flex items-center gap-3 text-xs">
          <a
            href={whatsappInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-ga-event="contact_whatsapp"
            data-ga-item={property.title}
            data-ga-category="property_inquiry"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center gap-2 shadow-xs active:scale-95"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.943.514 1.785.78 2.796.78h.005c3.18 0 5.767-2.587 5.768-5.766.001-3.182-2.585-5.767-5.773-5.767zm3.375 8.16c-.14.394-.808.753-1.121.794-.312.041-.703.064-2.146-.532-1.748-.724-2.884-2.483-2.973-2.6-.088-.117-.714-.95-.714-1.812s.449-1.286.609-1.464c.16-.178.349-.223.465-.223.116 0 .233.001.335.006.107.006.251-.041.393.3.145.349.494 1.205.538 1.293.044.088.073.19.015.306-.058.117-.087.19-.174.292-.087.102-.184.228-.263.307-.087.087-.178.182-.077.356.102.175.452.747.97 1.208.667.594 1.229.778 1.404.865.174.087.276.073.378-.044.102-.117.436-.51.553-.685.116-.175.233-.146.393-.087.16.058 1.019.48 1.194.568.174.087.291.131.335.204.043.073.043.423-.097.817z" />
            </svg>
            <span>{isAr ? "كونسيرج واتساب" : "WhatsApp Concierge"}</span>
          </a>
        </div>
      </div>

      {/* Adaptive Architectural Gallery */}
      <PropertyDetailGallery property={property} isAr={isAr} />

      {/* Quick Facts / Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-brand-border/80 shadow-xs mb-10 text-xs">
        <div className="border-e border-brand-border/60 pe-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-sand-light flex items-center justify-center shrink-0 text-brand-terracotta">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </div>
          <div>
            <span className="block text-brand-brown-muted text-[10px] uppercase font-bold tracking-wider">
              {t.staysPage.bedrooms}
            </span>
            <span className="text-sm font-bold text-brand-brown font-mono">
              {property.bedrooms} {isAr ? "غرف نوم" : "Beds"}
            </span>
          </div>
        </div>

        <div className="border-e border-brand-border/60 pe-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-sand-light flex items-center justify-center shrink-0 text-brand-terracotta">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="block text-brand-brown-muted text-[10px] uppercase font-bold tracking-wider">
              {isAr ? "الحمامات" : "Bathrooms"}
            </span>
            <span className="text-sm font-bold text-brand-brown font-mono">
              {property.bathrooms} {isAr ? "حمامات" : "Baths"}
            </span>
          </div>
        </div>

        <div className="border-e border-brand-border/60 pe-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-sand-light flex items-center justify-center shrink-0 text-brand-terracotta">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <div>
            <span className="block text-brand-brown-muted text-[10px] uppercase font-bold tracking-wider">
              {isAr ? "السعة" : "Capacity"}
            </span>
            <span className="text-sm font-bold text-brand-brown">
              {isAr ? `حتى ${property.max_guests} ضيوف` : `Up to ${property.max_guests} Guests`}
            </span>
          </div>
        </div>

        <div className="border-e border-brand-border/60 pe-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-sand-light flex items-center justify-center shrink-0 text-brand-terracotta">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          </div>
          <div>
            <span className="block text-brand-brown-muted text-[10px] uppercase font-bold tracking-wider">
              {isAr ? "المساحة" : "Area"}
            </span>
            <span className="text-sm font-bold text-brand-brown font-mono">
              {property.area_sqm ? `${property.area_sqm} ${isAr ? "م²" : "m²"}` : (isAr ? "مساحة رحبة" : "Exclusive")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-sand-light flex items-center justify-center shrink-0 text-brand-terracotta">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="block text-brand-brown-muted text-[10px] uppercase font-bold tracking-wider">
              {isAr ? "مواعيد الإقامة" : "Times"}
            </span>
            <span className="text-xs font-semibold text-brand-brown">
              {isAr ? `${formattedCheckIn} دخول / ${formattedCheckOut} مغادرة` : `In ${formattedCheckIn} / Out ${formattedCheckOut}`}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left Details + Right Booking Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8 sm:space-y-10">
          {/* Description */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border/80 shadow-xs space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-brown">
              {isAr ? "عن هذا الملاذ الاستثنائي" : "About This Sanctuary"}
            </h2>
            <div className="text-xs sm:text-sm text-brand-brown-muted leading-relaxed space-y-4 font-light">
              <p className="font-normal text-brand-brown leading-relaxed">
                {property.description}
              </p>
            </div>
          </div>

          {/* Amenities Grid */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border/80 shadow-xs space-y-6">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-brown">
                {isAr ? "وسائل الراحة والمرافق" : "Curated Amenities"}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="flex items-center gap-2.5 p-3 bg-brand-sand-light/50 border border-brand-border/60 rounded-xl"
                  >
                    <svg className="w-3.5 h-3.5 text-brand-terracotta shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="font-medium text-brand-brown">{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* House Policies */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border/80 shadow-xs space-y-6">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-brown">
              {isAr ? "سياسات وتعليمات الإقامة" : "Stay Policies & Information"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-brand-brown block">
                  {isAr ? "سياسة الإلغاء:" : "Cancellation Policy:"}
                </span>
                <p className="text-brand-brown-muted leading-relaxed">
                  {property.cancellation_policy}
                </p>
              </div>

              {property.payment_rules && (
                <div className="space-y-2">
                  <span className="font-bold text-brand-brown block">
                    {isAr ? "شروط الدفع:" : "Payment Rules:"}
                  </span>
                  <p className="text-brand-brown-muted leading-relaxed">
                    {property.payment_rules}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Guest Reviews Section */}
          <ReviewsSection title={isAr ? `تقييمات الضيوف لـ ${property.title}` : `Guest Reviews for ${property.title}`} />
        </div>

        {/* Right Column: Sticky Booking / Inquiry Widget */}
        <div className="lg:col-span-1 lg:sticky lg:top-28">
          <BookingQuoteWidget property={property} />
        </div>
      </div>

      {/* Similar Stays Recommendation Grid */}
      {similarProperties.length > 0 && (
        <div className="mt-20 pt-16 border-t border-brand-border">
          <h2 className="font-serif text-2xl font-bold text-brand-brown mb-8">
            {isAr ? `إقامات مماثلة في ${property.location?.name || "الجونة"}` : `Similar Escapes in ${property.location?.name || "El Gouna"}`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {similarProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

