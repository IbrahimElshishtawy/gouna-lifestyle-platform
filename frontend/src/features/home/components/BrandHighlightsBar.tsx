"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

interface HighlightItem {
  id: string;
  num: string;
  name_en: string;
  name_ar: string;
  image: string;
  href: string;
  count_en: string;
  count_ar: string;
  tag_en: string;
  tag_ar: string;
}

const HIGHLIGHTS: HighlightItem[] = [
  {
    id: "stays",
    num: "01",
    name_en: "Stays & Villas",
    name_ar: "إقامات وفلل",
    image: "/assets/images/Rental highlights logo.png",
    href: "#stays",
    count_en: "Homes +48",
    count_ar: "٤٨+ فيلا وشاليه",
    tag_en: "Villas & Chalets",
    tag_ar: "فلل وشاليهات راقية",
  },
  {
    id: "experiences",
    num: "02",
    name_en: "Experiences",
    name_ar: "تجارب ورحلات",
    image: "/assets/images/Trips highlights logo.png",
    href: "#experiences",
    count_en: "Curated +24",
    count_ar: "٢٤+ تجربة خاصة",
    tag_en: "Yachts & Islands",
    tag_ar: "يخوت وجزر خاصة",
  },
  {
    id: "el-gouna",
    num: "03",
    name_en: "Official Gouna",
    name_ar: "الجونة الرسمية",
    image: "/assets/images/official-elgouna-logo.webp",
    href: "#pillars",
    count_en: "Official Partner",
    count_ar: "الشريك المعتمد",
    tag_en: "Destination Life",
    tag_ar: "جوهر الوجهة",
  },
  {
    id: "guests",
    num: "04",
    name_en: "Guest Reviews",
    name_ar: "آراء الضيوف",
    image: "/assets/images/Feedbacks highlight logo.png",
    href: "#testimonials",
    count_en: "Rating ★ 4.9",
    count_ar: "تقييم ٤.٩ ★",
    tag_en: "Verified Reviews",
    tag_ar: "تجارب حقيقية",
  },
  {
    id: "about",
    num: "05",
    name_en: "About GouNow",
    name_ar: "عن جونو",
    image: "/assets/images/About hightlight logo.png",
    href: "#brand-identity",
    count_en: "Ethos & Design",
    count_ar: "الهوية والتصميم",
    tag_en: "Brand Philosophy",
    tag_ar: "فلسفة المنصة",
  },
];

export default function BrandHighlightsBar() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const [activeSection, setActiveSection] = useState<string>("stays");

  // Track active section on scroll to light up current floating chapter
  useEffect(() => {
    const sectionIds = HIGHLIGHTS.map((h) => h.href.replace("#", ""));
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { rootMargin: "-25% 0px -60% 0px", threshold: 0.1 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  const handleScroll = (href: string) => {
    if (href.startsWith("#")) {
      const targetId = href.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        const navOffset = 85;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        if (window.history.pushState) {
          window.history.pushState(null, "", href);
        }
      }
    }
  };

  return (
    <section
      aria-label={isAr ? "شريط الاستكشاف السينمائي" : "Cinematic Navigation Reel"}
      className="relative z-30 -mt-10 sm:-mt-14 lg:-mt-16 mb-8 sm:mb-12 max-w-5xl mx-auto px-3 sm:px-6"
    >
      {/* Ambient cinematic glow halo behind floating bar */}
      <div className="absolute inset-x-8 -top-6 -bottom-6 bg-gradient-to-r from-transparent via-[#A55332]/30 to-transparent blur-3xl -z-10 pointer-events-none" />

      {/* Floating Cinematic Dock */}
      <div className="relative bg-[#160E0C]/90 dark:bg-[#120B09]/95 backdrop-blur-2xl border border-[#DBC0A0]/25 rounded-3xl sm:rounded-full py-4 sm:py-5 px-3 sm:px-8 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.7),0_0_35px_rgba(165,83,50,0.22)]">
        
        {/* Subtle cinematic reel indicator line at the top */}
        <div className="flex items-center justify-between px-3 mb-3 pb-2.5 border-b border-white/10 text-[#DBC0A0]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2BC92] animate-pulse" />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] font-semibold text-[#E2BC92]/90">
              {isAr ? "عرض سنمائي سريع" : "CINEMATIC REEL"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-[#DBC0A0]/70 uppercase">
              {isAr ? "اضغط للانتقال المباشر للقسم" : "SELECT TO NAVIGATE"}
            </span>
            <svg
              className="w-3.5 h-3.5 text-[#E2BC92]/80 rtl:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Floating Icons Reel */}
        <div className="flex items-center justify-between sm:justify-around gap-2 sm:gap-6 overflow-x-auto no-scrollbar py-1 px-1">
          {HIGHLIGHTS.map((item, index) => {
            const isCurrent = activeSection === item.href.replace("#", "");

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleScroll(item.href)}
                className="group flex flex-col items-center cursor-pointer min-w-[76px] sm:min-w-[104px] text-center focus:outline-none transition-all duration-300"
                style={{
                  // Staggered floating effect for cinematic depth
                  animationDelay: `${index * 0.35}s`,
                }}
              >
                {/* Floating Orb Capsule */}
                <div
                  className={`relative p-[2.5px] rounded-full transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-105 motion-safe:animate-float ${
                    isCurrent
                      ? "bg-gradient-to-tr from-[#A55332] via-[#E2BC92] to-[#FFF3E3] shadow-[0_12px_28px_rgba(226,188,146,0.55),0_0_20px_rgba(165,83,50,0.4)]"
                      : "bg-gradient-to-tr from-[#A55332]/70 via-[#DBC0A0]/60 to-[#5B4635]/70 shadow-[0_8px_20px_rgba(0,0,0,0.45)] group-hover:shadow-[0_12px_28px_rgba(226,188,146,0.4)]"
                  }`}
                  style={{
                    animationDelay: `${index * 0.4}s`,
                  }}
                >
                  {/* Floating Chapter Number Badge */}
                  <span className="absolute -top-1.5 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 px-1.5 py-0.5 bg-[#17100D] border border-[#DBC0A0]/60 rounded-full text-[8px] font-mono text-[#E2BC92] font-bold shadow-md z-10 pointer-events-none">
                    {item.num}
                  </span>

                  {/* Inner Luxury Parchment Disc with Glossy Lens Border */}
                  <div className="p-0.5 rounded-full bg-gradient-to-b from-[#2A1E19] to-[#120B09]">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gradient-to-b from-[#FFFDF9] to-[#F5EDE2] flex items-center justify-center shadow-inner">
                      {/* Ambient lens reflection */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none z-10" />

                      <Image
                        src={item.image}
                        alt={isAr ? item.name_ar : item.name_en}
                        width={60}
                        height={60}
                        className="object-contain w-full h-full p-2 group-hover:scale-115 transition-transform duration-500 relative z-0"
                      />
                    </div>
                  </div>

                  {/* Active Spotlight Dot */}
                  {isCurrent && (
                    <span className="absolute -bottom-1 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 w-2 h-2 rounded-full bg-[#E2BC92] shadow-[0_0_8px_#E2BC92] animate-ping" />
                  )}
                </div>

                {/* Typography: Title & Micro-details */}
                <span
                  className={`mt-2.5 text-xs sm:text-sm font-serif font-bold transition-colors duration-300 leading-tight ${
                    isCurrent
                      ? "text-[#E2BC92]"
                      : "text-[#FAF8F5] group-hover:text-[#E2BC92]"
                  }`}
                >
                  {isAr ? item.name_ar : item.name_en}
                </span>

                <span className="mt-0.5 text-[9px] sm:text-[10px] font-mono tracking-wider text-[#DBC0A0]/75 group-hover:text-white transition-colors duration-300">
                  {isAr ? item.count_ar : item.count_en}
                </span>

                <span className="text-[8px] sm:text-[9px] text-[#A8988B] hidden md:block font-light">
                  {isAr ? item.tag_ar : item.tag_en}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
