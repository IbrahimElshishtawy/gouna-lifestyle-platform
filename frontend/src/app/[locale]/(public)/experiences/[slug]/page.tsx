import React from "react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getExperienceBySlug,
  getExperiences,
} from "@/features/experiences/services/experiences.api";
import ExperienceInquiryWidget from "@/features/experiences/components/ExperienceInquiryWidget";
import ExperienceCard from "@/features/experiences/components/ExperienceCard";
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
  const exp = await getExperienceBySlug(slug);
  const isAr = locale === "ar";
  if (!exp) return { title: isAr ? "التجربة غير موجودة" : "Experience Not Found" };

  return {
    title: `${exp.title} | ${isAr ? "تجارب جوناو الجونة" : "GouNow El Gouna Experiences"}`,
    description: exp.description,
    openGraph: {
      title: exp.title,
      description: exp.description,
      locale: isAr ? "ar_EG" : "en_US",
      images: exp.image ? [exp.image] : [],
    },
  };
}

export default async function ExperienceDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = getDictionary(locale);
  const isAr = locale === "ar";

  const experience = await getExperienceBySlug(slug);

  if (!experience) {
    notFound();
  }

  const allExperiences = await getExperiences();
  const relatedExperiences = allExperiences
    .filter((e) => e.id !== experience.id)
    .slice(0, 3);

  const whatsappMsgHeader = isAr ? "مرحباً جوناو،" : "Hello GouNow,";
  const whatsappInquiryUrl = `https://wa.me/201000000000?text=${encodeURIComponent(
    `${whatsappMsgHeader}\n\n${isAr ? "أستفسر عن تجربة:" : "I am inquiring about the experience:"} ${experience.title}\n\n${isAr ? "هل يمكن تزويدي بالمواعيد المتاحة وخيارات الانطلاق؟" : "Could you please let me know availability and departure options?"}`
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-12">
      {/* Breadcrumb & Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs text-brand-brown-muted mb-2">
            <Link href="/" className="hover:text-brand-brown">
              {t.common.home}
            </Link>
            <span className="rtl:rotate-180">/</span>
            <Link href="/experiences" className="hover:text-brand-brown">
              {t.nav.experiences}
            </Link>
            <span className="rtl:rotate-180">/</span>
            <span className="text-brand-brown font-medium">
              {experience.category?.name || (isAr ? "مغامرة مميزة" : "Curated Adventure")}
            </span>
          </nav>
          <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-brand-brown">
            {experience.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-brand-brown-muted mt-2">
            <span>📍 {experience.location?.name || (isAr ? "الجونة" : "El Gouna")}</span>
            <span>•</span>
            <span>⏱️ {experience.duration}</span>
            <span>•</span>
            <span>{isAr ? `أقصى عدد ${experience.max_guests} ضيوف` : `Max ${experience.max_guests} Guests`}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <a
            href={whatsappInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition flex items-center gap-1.5 shadow-xs"
          >
            <span>💬</span>
            <span>{isAr ? "مكتب واتساب" : "WhatsApp Desk"}</span>
          </a>
        </div>
      </div>

      {/* Editorial Gallery Banner */}
      <div className="mb-10 rounded-3xl overflow-hidden shadow-xs border border-brand-border h-[350px] sm:h-[460px] bg-brand-sand relative">
        <Image
          src={experience.image}
          alt={experience.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute bottom-6 start-6 z-10">
          <span className="px-4 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-full uppercase tracking-wider">
            {experience.category?.name || (isAr ? "مغامرة مميزة" : "Curated Adventure")}
          </span>
        </div>
      </div>

      {/* 2 Columns Grid: Details & Inquiry Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white p-8 rounded-3xl border border-brand-border shadow-xs space-y-4">
            <h2 className="font-serif text-xl font-bold text-brand-brown">
              {isAr ? "نظرة عامة على التجربة" : "Experience Overview"}
            </h2>
            <div className="text-xs sm:text-sm text-brand-brown/90 leading-relaxed space-y-4 font-light">
              <p className="font-medium text-brand-brown leading-relaxed">
                {experience.description}
              </p>
              <div className="whitespace-pre-line text-brand-brown-muted">
                {experience.overview}
              </div>
            </div>
          </div>

          {/* Key Info Grid */}
          <div className="bg-white p-8 rounded-3xl border border-brand-border shadow-xs space-y-6">
            <h2 className="font-serif text-xl font-bold text-brand-brown">
              {isAr ? "معلومات وتفاصيل هامة" : "Important Details"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1.5 p-4 rounded-2xl bg-brand-sand-light/50 border border-brand-border">
                <span className="font-bold text-brand-brown block">
                  📍 {isAr ? "نقطة التجمع والانطلاق:" : "Meeting & Departure Point:"}
                </span>
                <p className="text-brand-brown-muted leading-relaxed">
                  {experience.meeting_point}
                </p>
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-brand-sand-light/50 border border-brand-border">
                <span className="font-bold text-brand-brown block">
                  🎒 {isAr ? "ما يجب إحضاره:" : "What to Bring:"}
                </span>
                <p className="text-brand-brown-muted leading-relaxed">
                  {experience.what_to_bring}
                </p>
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-brand-sand-light/50 border border-brand-border sm:col-span-2">
                <span className="font-bold text-brand-brown block">
                  🛡️ {isAr ? "سياسة الإلغاء والطقس:" : "Cancellation & Weather Policy:"}
                </span>
                <p className="text-brand-brown-muted leading-relaxed">
                  {experience.cancellation_policy}
                </p>
              </div>
            </div>
          </div>

          {/* Guest Reviews Section */}
          <ReviewsSection title={isAr ? `تقييمات الضيوف لـ ${experience.title}` : `Guest Reviews for ${experience.title}`} />
        </div>

        {/* Right: Sticky Inquiry Form */}
        <div className="lg:col-span-1 lg:sticky lg:top-28">
          <ExperienceInquiryWidget experience={experience} />
        </div>
      </div>

      {/* Related Experiences */}
      {relatedExperiences.length > 0 && (
        <div className="mt-20 pt-12 border-t border-brand-border">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-terracotta">
              {isAr ? "اكتشف المزيد" : "Discover More"}
            </span>
            <h2 className="font-serif text-2xl font-bold text-brand-brown mt-1">
              {isAr ? "مغامرات بحرية وصحراوية أخرى بالجونة" : "Other Curated Red Sea Adventures"}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedExperiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

