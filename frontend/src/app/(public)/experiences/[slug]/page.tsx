import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getExperienceBySlug,
  getExperiences,
} from "@/features/experiences/services/experiences.api";
import ExperienceInquiryWidget from "@/features/experiences/components/ExperienceInquiryWidget";
import ExperienceCard from "@/features/experiences/components/ExperienceCard";
import ReviewsSection from "@/features/reviews/components/ReviewsSection";
import type { Metadata } from "next";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exp = await getExperienceBySlug(slug);
  if (!exp) return { title: "Experience Not Found" };

  return {
    title: `${exp.title} | GouNow El Gouna Experiences`,
    description: exp.description,
    openGraph: {
      title: exp.title,
      description: exp.description,
      images: exp.image ? [exp.image] : [],
    },
  };
}

export default async function ExperienceDetailPage({ params }: Props) {
  const { slug } = await params;
  const experience = await getExperienceBySlug(slug);

  if (!experience) {
    notFound();
  }

  const allExperiences = await getExperiences();
  const relatedExperiences = allExperiences
    .filter((e) => e.id !== experience.id)
    .slice(0, 3);

  const whatsappInquiryUrl = `https://wa.me/201000000000?text=${encodeURIComponent(
    `Hello GouNow,\n\nI am inquiring about the experience: ${experience.title}\n\nCould you please let me know availability and departure options?`
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-12">
      {/* Breadcrumb & Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs text-brand-brown-muted mb-2">
            <Link href="/" className="hover:text-brand-brown">
              Home
            </Link>
            <span>/</span>
            <Link href="/experiences" className="hover:text-brand-brown">
              Experiences
            </Link>
            <span>/</span>
            <span className="text-brand-brown font-medium">
              {experience.category?.name || "Curated Adventure"}
            </span>
          </nav>
          <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-brand-brown">
            {experience.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-brand-brown-muted mt-2">
            <span>📍 {experience.location?.name || "El Gouna"}</span>
            <span>•</span>
            <span>⏱️ {experience.duration}</span>
            <span>•</span>
            <span>Max {experience.max_guests} Guests</span>
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
            <span>WhatsApp Desk</span>
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
        <div className="absolute bottom-6 left-6 z-10">
          <span className="px-4 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-full uppercase tracking-wider">
            {experience.category?.name || "Curated Adventure"}
          </span>
        </div>
      </div>

      {/* 2 Columns Grid: Details & Inquiry Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white p-8 rounded-3xl border border-brand-border shadow-xs space-y-4">
            <h2 className="font-serif text-xl font-bold text-brand-brown">
              Experience Overview
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
              Important Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1.5 p-4 rounded-2xl bg-brand-sand-light/50 border border-brand-border">
                <span className="font-bold text-brand-brown block">
                  📍 Meeting & Departure Point:
                </span>
                <p className="text-brand-brown-muted leading-relaxed">
                  {experience.meeting_point}
                </p>
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-brand-sand-light/50 border border-brand-border">
                <span className="font-bold text-brand-brown block">
                  🎒 What to Bring:
                </span>
                <p className="text-brand-brown-muted leading-relaxed">
                  {experience.what_to_bring}
                </p>
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-brand-sand-light/50 border border-brand-border sm:col-span-2">
                <span className="font-bold text-brand-brown block">
                  🛡️ Cancellation & Weather Policy:
                </span>
                <p className="text-brand-brown-muted leading-relaxed">
                  {experience.cancellation_policy}
                </p>
              </div>
            </div>
          </div>

          {/* Guest Reviews Section */}
          <ReviewsSection title={`Guest Reviews for ${experience.title}`} />
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
              Discover More
            </span>
            <h2 className="font-serif text-2xl font-bold text-brand-brown mt-1">
              Other Curated Red Sea Adventures
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
