"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useLanguage } from "@/context/LanguageContext";
import { ChapterTag, FadeIn } from "@/components/ui/MotionPrimitives";
import Card3D from "@/components/ui/Card3D";

export default function DivingSection() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const DIVE_SITES = [
    {
      name: isAr ? "دولفين هاوس (شعب الإرج)" : "Dolphin House (Sha'ab El Erg)",
      depth: "12m - 18m",
      type: isAr ? "شعاب مرجانية ودلافين برية" : "Wild Spinner Dolphins & Pinnacles",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
      visibility: "30m+",
    },
    {
      name: isAr ? "حطام سفينة كارناتيك (أبو نحاس)" : "Carnatic Wreck (Abu Nuhas)",
      depth: "18m - 26m",
      type: isAr ? "غوص حطام تاريخي 1869" : "Historic 1869 Shipwreck",
      image: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=800&q=80",
      visibility: "25m+",
    },
    {
      name: isAr ? "شعاب صخرة أوم أوش" : "Umm Usk Coral Garden",
      depth: "8m - 22m",
      type: isAr ? "حدائق مرجانية وسلاحف بحرية" : "Vivid Coral Gardens & Sea Turtles",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      visibility: "35m+",
    },
  ];

  return (
    <section className="relative py-16 sm:py-28 lg:py-32 bg-[#08151A] text-white overflow-hidden">
      {/* Ambient Underwater Lighting Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#08151A] via-[#0E222A]/80 to-[#08151A] pointer-events-none" />
      <div className="absolute top-1/4 -start-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -end-40 w-96 h-96 bg-teal-400/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Chapter Header */}
        <FadeIn direction="up">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 mb-10 sm:mb-16">
            <div className="max-w-2xl">
              <ChapterTag
                number="CHAPTER 04"
                title={isAr ? "أعماق البحر الأحمر وغوص المحترفين" : "THE DEEP // RED SEA MARINE EXPEDITIONS"}
                subtitle={isAr ? "مياه فيروزية لا متناهية وتنوع بحري استثنائي" : "Crystal visibility, wild spinner dolphins & historic wrecks"}
                dark
              />
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-semibold text-white leading-tight">
                {isAr
                  ? "اكتشف أسرار أعمق نقطة ساحرة في الجونة"
                  : "Descend into the Northern Red Sea's Pristine Sanctuaries"}
              </h2>
            </div>
            <div className="shrink-0 flex items-center gap-4">
              <Link
                href="/experiences?category=boat-trips"
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 active:scale-95 shadow-lg shadow-cyan-500/10"
              >
                <span>{isAr ? "استكشف رحلات الغوص واليخوت" : "Explore Diving Expeditions"}</span>
                <span className="rtl:rotate-180">→</span>
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* 3 Atmospheric Dive Sites Cards with 3D Depth */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {DIVE_SITES.map((site, index) => (
            <FadeIn key={site.name} direction="up" delay={index * 150}>
              <Card3D maxTilt={7} glare={true} className="h-full">
                <div className="h-full group relative bg-[#0D2128]/80 rounded-2xl sm:rounded-3xl overflow-hidden border border-cyan-900/40 hover:border-cyan-400/50 transition-all duration-500 shadow-2xl flex flex-col justify-between preserve-3d">
                  
                  <div>
                    {/* Image Container with Ambient Mask */}
                    <div className="relative aspect-[16/11] sm:aspect-[16/10] overflow-hidden">
                      <Image
                        src={site.image}
                        alt={site.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D2128] via-[#0D2128]/30 to-transparent" />
                      
                      {/* Visibility Tag */}
                      <div
                        className="absolute top-3.5 start-3.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-cyan-400/30 text-cyan-300 text-[10px] font-mono tracking-wider transition-transform duration-300"
                        style={{ transform: "translateZ(26px)" }}
                      >
                        {isAr ? "رؤية" : "VISIBILITY"} {site.visibility}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6 space-y-3">
                      <div>
                        <span
                          className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400 block"
                          style={{ transform: "translateZ(14px)" }}
                        >
                          {isAr ? "عمق المسار" : "DEPTH RANGE"}: {site.depth}
                        </span>
                        <h3
                          className="font-serif text-lg sm:text-xl font-bold text-white mt-1 group-hover:text-cyan-200 transition-colors"
                          style={{ transform: "translateZ(20px)" }}
                        >
                          {site.name}
                        </h3>
                      </div>

                      <p
                        className="text-xs text-stone-300/80 font-light leading-relaxed line-clamp-2"
                        style={{ transform: "translateZ(12px)" }}
                      >
                        {site.type}
                      </p>
                    </div>
                  </div>

                  <div
                    className="p-4 sm:p-6 pt-0 flex items-center justify-between border-t border-cyan-900/50 mt-2"
                    style={{ transform: "translateZ(22px)" }}
                  >
                    <span className="text-[11px] text-cyan-300/80 font-medium">
                      {isAr ? "شهادة PADI معتمدة" : "PADI Certified Guides"}
                    </span>
                    <Link
                      href="/experiences"
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-200 flex items-center gap-1 transition-colors active:scale-95"
                    >
                      <span>{isAr ? "حجز المغامرة" : "Reserve"}</span>
                      <span className="rtl:rotate-180">→</span>
                    </Link>
                  </div>

                </div>
              </Card3D>
            </FadeIn>
          ))}
        </div>

        {/* Cinematic Marine Quote Ribbon */}
        <div className="mt-12 sm:mt-16 py-6 px-6 sm:px-8 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left rtl:sm:text-right">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐬</span>
            <p className="text-xs sm:text-sm text-cyan-100 font-light">
              {isAr
                ? "جميع رحلات الغوص تشمل يخت خاص ومعدات احترافية وكابتن مرخص من غرفة سياحة الغوص (CDWS)."
                : "All expeditions include private luxury yacht charter, technical dive gear, and CDWS-certified skippers."}
            </p>
          </div>
          <Link
            href="/experiences?category=boat-trips"
            className="text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 underline shrink-0"
          >
            {isAr ? "جدول الرحلات الأسبوعي" : "Weekly Schedule"} &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
