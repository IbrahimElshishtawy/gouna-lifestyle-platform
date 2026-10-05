"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useLanguage } from "@/context/LanguageContext";
import { ChapterTag, FadeIn } from "@/components/ui/MotionPrimitives";

export default function BrandPillarsSection() {
  const { t, locale } = useLanguage();
  const isAr = locale === "ar";

  const pillars = [
    {
      id: "stays",
      number: "01",
      title: t.brandPillars.pillar1Title,
      description: t.brandPillars.pillar1Desc,
      tag: isAr ? "فلل وبحيرات مائية" : "Lagoon & Beachfront Stays",
      link: "/stays?listing_type=rent",
    },
    {
      id: "charters",
      number: "02",
      title: t.brandPillars.pillar2Title,
      description: t.brandPillars.pillar2Desc,
      tag: isAr ? "يخوت وجزر خاصة" : "Private Yacht Expeditions",
      link: "/experiences",
    },
    {
      id: "concierge",
      number: "03",
      title: t.brandPillars.pillar3Title,
      description: t.brandPillars.pillar3Desc,
      tag: isAr ? "خدمات فندقية خاصة" : "Dedicated Lifestyle Desk",
      link: "#concierge",
    },
  ];

  return (
    <section className="py-24 sm:py-32 px-6 lg:px-12 bg-[#FAF8F5] relative overflow-hidden border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto">
        {/* Chapter Header & Narrative Split */}
        <FadeIn direction="up">
          <ChapterTag
            number="CHAPTER 01"
            title={isAr ? "جوهر الجونة والرفاهية الخاصة" : "THE ESSENCE OF GOUNA"}
            subtitle={isAr ? "وجهة فريدة تجمع صفاء البحر وسحر الصحراء" : "Between the tranquil turquoise lagoons and Red Sea peaks"}
          />
        </FadeIn>

        {/* Editorial Narrative Split Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center mb-16 sm:mb-20">
          <div className="lg:col-span-7 space-y-6">
            <FadeIn direction="up" delay={100}>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-semibold text-brand-brown leading-[1.15]">
                {t.brandPillars.title}
              </h2>
            </FadeIn>
            <FadeIn direction="up" delay={200}>
              <p className="text-sm sm:text-base text-brand-brown-muted font-light leading-relaxed max-w-2xl">
                {t.brandPillars.description}
              </p>
            </FadeIn>
            <FadeIn direction="up" delay={300}>
              <div className="pt-2 flex items-center gap-6 text-xs font-mono uppercase tracking-widest text-brand-terracotta">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {t.common.verified}
                </span>
                <span className="text-brand-border">•</span>
                <span className="text-brand-brown-muted">
                  {isAr ? "إدارة مرخصة 100%" : "Officially Licensed & Inspected"}
                </span>
              </div>
            </FadeIn>
          </div>

          {/* Architectural Image Card on right */}
          <div className="lg:col-span-5">
            <FadeIn direction="up" delay={250}>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-brand-border group">
                <Image
                  src="/assets/images/fanadir-villa.jpg"
                  alt="Curated El Gouna Living"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-6 start-6 end-6 text-white space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#E5DCD3]">
                    {isAr ? "الجونة، البحر الأحمر" : "EL GOUNA, RED SEA"}
                  </span>
                  <p className="font-serif text-lg font-bold">
                    {isAr ? "حيث تلتقي الفخامة بالطبيعة البكر" : "Where Architectural Elegance Meets Untouched Waters"}
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* 3 Architectural Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <FadeIn key={pillar.id} direction="up" delay={index * 150 + 200}>
              <Link
                href={pillar.link}
                className="group h-full bg-white p-8 sm:p-10 rounded-3xl border border-brand-border/80 shadow-xs hover:shadow-2xl hover:border-brand-terracotta/40 transition-all duration-500 hover:-translate-y-2 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-xs font-mono font-bold text-brand-terracotta/80 bg-brand-sand-light px-3 py-1 rounded-full border border-brand-border">
                      {pillar.number}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-brand-brown-muted">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-brand-brown mb-3 group-hover:text-brand-terracotta transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-brown-muted font-light leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-8 mt-8 border-t border-brand-border/60 flex items-center justify-between text-xs font-bold text-brand-terracotta uppercase tracking-wider">
                  <span>{t.common.discoverMore}</span>
                  <span className="transform group-hover:translate-x-2 rtl:group-hover:-translate-x-2 transition-transform duration-300">
                    &rarr;
                  </span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
