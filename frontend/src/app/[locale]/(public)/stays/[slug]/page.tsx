import React from "react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getPropertyBySlug,
  getProperties,
} from "@/features/properties/services/properties.api";
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

  const images = property.images || [];
  const heroImage = images[0]?.url || "/assets/images/bg-sand-texture.jpg";
  const whatsappMsgHeader = isAr ? "مرحباً جوناو،" : "Hello GouNow,";
  const whatsappInquiryUrl = `https://wa.me/201000000000?text=${encodeURIComponent(
    `${whatsappMsgHeader}\n\n${isAr ? "أستفسر عن عقار:" : "I am inquiring about:"} ${property.title}\n${isAr ? "المرجع:" : "Reference:"} ${property.reference_code}\n\n${isAr ? "هل يمكن تزويدي بالمزيد من التفاصيل والتواريخ المتاحة؟" : "Could you please provide more details?"}`
  )}`;

  return (
    <div className="bg-[#FAF8F5] py-8 px-6 lg:px-12 max-w-7xl mx-auto">
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

          <div className="flex items-center gap-3 text-xs text-brand-brown-muted mt-2">
            <span>📍 {property.location?.name}, {isAr ? "الجونة، مصر" : "El Gouna, Egypt"}</span>
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
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition flex items-center gap-1.5 shadow-xs"
          >
            <span>💬</span>
            <span>{isAr ? "كونسيرج واتساب" : "WhatsApp Concierge"}</span>
          </a>
        </div>
      </div>

      {/* Editorial Gallery Grid */}
      <div className="mb-10 grid grid-cols-1 md:grid-cols-4 gap-3 rounded-3xl overflow-hidden shadow-xs border border-brand-border bg-brand-sand">
        {/* Main Hero Image */}
        <div className="md:col-span-2 md:row-span-2 h-[380px] md:h-[480px] overflow-hidden group cursor-pointer relative">
          <Image
            src={heroImage}
            alt={property.title}
            fill
            priority
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute bottom-4 start-4">
            <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[11px] rounded-full uppercase tracking-wider">
              {property.category?.name || (isAr ? "إقامة مميزة" : "Signature Residence")}
            </span>
          </div>
        </div>

        {/* Supporting Images */}
        {images.slice(1, 5).map((img, idx) => (
          <div
            key={idx}
            className="h-[185px] md:h-[235px] overflow-hidden group cursor-pointer relative"
          >
            <Image
              src={img.url}
              alt={`${property.title} photo ${idx + 2}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </div>

      {/* Quick Facts Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-5 bg-white rounded-2xl border border-brand-border mb-12 text-xs">
        <div className="border-e border-brand-border/60 pe-3">
          <span className="block text-brand-brown-muted text-[10px] uppercase font-bold tracking-wider">
            {t.staysPage.bedrooms}
          </span>
          <span className="text-sm font-bold text-brand-brown">
            {property.bedrooms} {isAr ? "غرف نوم" : "Beds"}
          </span>
        </div>
        <div className="border-e border-brand-border/60 pe-3">
          <span className="block text-brand-brown-muted text-[10px] uppercase font-bold tracking-wider">
            {isAr ? "الحمامات" : "Bathrooms"}
          </span>
          <span className="text-sm font-bold text-brand-brown">
            {property.bathrooms} {isAr ? "حمامات" : "Baths"}
          </span>
        </div>
        <div className="border-e border-brand-border/60 pe-3">
          <span className="block text-brand-brown-muted text-[10px] uppercase font-bold tracking-wider">
            {isAr ? "السعة" : "Capacity"}
          </span>
          <span className="text-sm font-bold text-brand-brown">
            {isAr ? `حتى ${property.max_guests} ضيوف` : `Up to ${property.max_guests} Guests`}
          </span>
        </div>
        <div className="border-e border-brand-border/60 pe-3">
          <span className="block text-brand-brown-muted text-[10px] uppercase font-bold tracking-wider">
            {isAr ? "المساحة" : "Area"}
          </span>
          <span className="text-sm font-bold text-brand-brown">
            {property.area_sqm ? `${property.area_sqm} ${isAr ? "م²" : "m²"}` : (isAr ? "مساحة رحبة" : "Exclusive")}
          </span>
        </div>
        <div>
          <span className="block text-brand-brown-muted text-[10px] uppercase font-bold tracking-wider">
            {isAr ? "مواعيد الإقامة" : "Times"}
          </span>
          <span className="text-xs font-semibold text-brand-brown">
            {isAr ? `وصول ${property.check_in_time} / مغادرة ${property.check_out_time}` : `In ${property.check_in_time} / Out ${property.check_out_time}`}
          </span>
        </div>
      </div>

      {/* Main Content Layout: Left Details + Right Booking Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Description */}
          <div className="bg-white p-8 rounded-3xl border border-brand-border shadow-xs space-y-4">
            <h2 className="font-serif text-xl font-bold text-brand-brown">
              {isAr ? "عن هذا الملاذ الاستثنائي" : "About This Sanctuary"}
            </h2>
            <div className="text-xs sm:text-sm text-brand-brown/90 leading-relaxed space-y-4 font-light">
              <p className="font-medium text-brand-brown leading-relaxed">
                {property.description}
              </p>
            </div>
          </div>

          {/* Amenities Grid */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="bg-white p-8 rounded-3xl border border-brand-border shadow-xs space-y-6">
              <h2 className="font-serif text-xl font-bold text-brand-brown">
                {isAr ? "وسائل الراحة والمرافق" : "Curated Amenities"}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="flex items-center gap-2 p-3 bg-brand-sand-light/50 rounded-xl"
                  >
                    <span>{amenity.icon || "✨"}</span>
                    <span className="font-medium">{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* House Policies */}
          <div className="bg-white p-8 rounded-3xl border border-brand-border shadow-xs space-y-6">
            <h2 className="font-serif text-xl font-bold text-brand-brown">
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

