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
              {t.nav.home}
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
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-brand-brown-muted mt-2">
            <span className="flex items-center gap-1.5 font-medium text-brand-brown">
              <svg className="w-3.5 h-3.5 text-brand-terracotta shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{experience.location?.name || (isAr ? "الجونة" : "El Gouna")}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-brand-brown-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{experience.duration}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-brand-brown-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <span>{isAr ? `أقصى عدد ${experience.max_guests} ضيوف` : `Max ${experience.max_guests} Guests`}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <a
            href={whatsappInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center gap-2 shadow-xs active:scale-95"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.943.514 1.785.78 2.796.78h.005c3.18 0 5.767-2.587 5.768-5.766.001-3.182-2.585-5.767-5.773-5.767zm3.375 8.16c-.14.394-.808.753-1.121.794-.312.041-.703.064-2.146-.532-1.748-.724-2.884-2.483-2.973-2.6-.088-.117-.714-.95-.714-1.812s.449-1.286.609-1.464c.16-.178.349-.223.465-.223.116 0 .233.001.335.006.107.006.251-.041.393.3.145.349.494 1.205.538 1.293.044.088.073.19.015.306-.058.117-.087.19-.174.292-.087.102-.184.228-.263.307-.087.087-.178.182-.077.356.102.175.452.747.97 1.208.667.594 1.229.778 1.404.865.174.087.276.073.378-.044.102-.117.436-.51.553-.685.116-.175.233-.146.393-.087.16.058 1.019.48 1.194.568.174.087.291.131.335.204.043.073.043.423-.097.817z" />
            </svg>
            <span>{isAr ? "مكتب واتساب VIP" : "VIP WhatsApp Desk"}</span>
          </a>
        </div>
      </div>

      {/* Editorial Gallery Banner */}
      <div className="mb-8 rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-brand-border h-[340px] sm:h-[460px] lg:h-[500px] bg-brand-sand relative group">
        <Image
          src={experience.image}
          alt={experience.title}
          fill
          priority
          sizes="100vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        <div className="absolute top-4 start-4 sm:top-6 sm:start-6 flex flex-wrap gap-2 z-10">
          <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider">
            {experience.category?.name || (isAr ? "مغامرة مميزة" : "Curated Adventure")}
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-brand-terracotta text-white text-xs font-bold uppercase tracking-wider shadow-xs">
            {isAr ? "مرخص CDWS" : "CDWS Certified"}
          </span>
        </div>

        <div className="absolute bottom-4 start-4 end-4 sm:bottom-6 sm:start-6 sm:end-6 flex items-center justify-between z-10 text-white">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isAr ? "تأكيد فوري متاح" : "Instant Confirmation Available"}</span>
          </div>
          <span className="text-xs font-mono bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
            {experience.duration}
          </span>
        </div>
      </div>

      {/* 2 Columns Grid: Details & Inquiry Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-8 sm:space-y-10">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border/80 shadow-xs space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-brown">
              {isAr ? "نظرة عامة على التجربة" : "Experience Overview"}
            </h2>
            <div className="text-xs sm:text-sm text-brand-brown/90 leading-relaxed space-y-4 font-light">
              <p className="font-normal text-brand-brown leading-relaxed">
                {experience.description}
              </p>
              <div className="whitespace-pre-line text-brand-brown-muted">
                {experience.overview}
              </div>
            </div>
          </div>

          {/* Key Info Grid */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border/80 shadow-xs space-y-6">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-brown">
              {isAr ? "معلومات وتفاصيل هامة" : "Important Details"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 p-4 rounded-2xl bg-brand-sand-light/50 border border-brand-border/70">
                <span className="font-bold text-brand-brown flex items-center gap-2">
                  <svg className="w-4 h-4 text-brand-terracotta shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span>{isAr ? "نقطة التجمع والانطلاق:" : "Meeting & Departure Point:"}</span>
                </span>
                <p className="text-brand-brown-muted leading-relaxed">
                  {experience.meeting_point}
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-brand-sand-light/50 border border-brand-border/70">
                <span className="font-bold text-brand-brown flex items-center gap-2">
                  <svg className="w-4 h-4 text-brand-terracotta shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <span>{isAr ? "ما يجب إحضاره:" : "What to Bring:"}</span>
                </span>
                <p className="text-brand-brown-muted leading-relaxed">
                  {experience.what_to_bring}
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-brand-sand-light/50 border border-brand-border/70 sm:col-span-2">
                <span className="font-bold text-brand-brown flex items-center gap-2">
                  <svg className="w-4 h-4 text-brand-terracotta shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span>{isAr ? "سياسة الإلغاء والطقس:" : "Cancellation & Weather Policy:"}</span>
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

