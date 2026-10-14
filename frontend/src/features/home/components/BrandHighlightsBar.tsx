"use client";

import React from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

interface HighlightItem {
  id: string;
  name_en: string;
  name_ar: string;
  image: string;
  href: string;
  count?: string;
  tag_en?: string;
  tag_ar?: string;
}

const HIGHLIGHTS: HighlightItem[] = [
  {
    id: "stays",
    name_en: "Stays",
    name_ar: "إقامات وفلل",
    image: "/assets/images/Rental highlights logo.png",
    href: "#stays",
    count: "48+ Homes",
    tag_en: "Villas & Chalets",
    tag_ar: "فلل وشاليهات فاخرة",
  },
  {
    id: "experiences",
    name_en: "Experiences",
    name_ar: "تجارب ورحلات",
    image: "/assets/images/Trips highlights logo.png",
    href: "#experiences",
    count: "24+ Curated",
    tag_en: "Yachts & Islands",
    tag_ar: "يخوت وجزر خاصة",
  },
  {
    id: "el-gouna",
    name_en: "El Gouna",
    name_ar: "الجونة الرسمية",
    image: "/assets/images/official-elgouna-logo.webp",
    href: "#pillars",
    count: "Official Partner",
    tag_en: "Destination Life",
    tag_ar: "جوهر الوجهة",
  },
  {
    id: "guests",
    name_en: "Guests",
    name_ar: "آراء الضيوف",
    image: "/assets/images/Feedbacks highlight logo.png",
    href: "#testimonials",
    count: "4.9 ★ Rating",
    tag_en: "Verified Reviews",
    tag_ar: "تجارب وتقييمات موثقة",
  },
  {
    id: "about",
    name_en: "About",
    name_ar: "عن جونو",
    image: "/assets/images/About hightlight logo.png",
    href: "#brand-identity",
    count: "Ethos & Design",
    tag_en: "Brand Philosophy",
    tag_ar: "فلسفة وهوية المنصة",
  },
];

export default function BrandHighlightsBar() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const handleScroll = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section className="relative z-30 -mt-6 sm:-mt-8 mb-4 max-w-5xl mx-auto px-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-brand-sand/60 shadow-xl shadow-brand-brown/5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-sand/40 px-2">
          <div className="flex items-center gap-2">
            <div className="relative w-5 h-5 flex items-center justify-center">
              <Image
                src="/assets/images/Gounow Main signature.png"
                alt="Gounow"
                width={18}
                height={18}
                className="object-contain"
              />
            </div>
            <span className="font-serif text-xs sm:text-sm font-bold text-brand-brown">
              {isAr ? "مجموعات جونو المنتقاة" : "Curated GouNow Highlights"}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-brand-terracotta font-semibold">
            {isAr ? "استكشف سريعاً" : "Explore Collections"}
          </span>
        </div>

        {/* Stories / Highlights Carousel */}
        <div className="flex items-center justify-between sm:justify-around gap-2 sm:gap-6 overflow-x-auto no-scrollbar py-1">
          {HIGHLIGHTS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleScroll(item.href)}
              className="flex flex-col items-center group cursor-pointer min-w-[70px] sm:min-w-[96px] text-center transition-all focus:outline-none"
            >
              {/* Outer Gradient Ring */}
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#A55332] via-[#DBC0A0] to-[#5B4635] shadow-md group-hover:scale-105 group-hover:shadow-lg transition-transform duration-300">
                <div className="p-0.5 bg-white rounded-full">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-brand-sand-light/50 flex items-center justify-center">
                    <Image
                      src={item.image}
                      alt={isAr ? item.name_ar : item.name_en}
                      width={64}
                      height={64}
                      className="object-contain w-full h-full p-2 group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>

              {/* Title & Tag */}
              <span className="mt-2 text-xs font-serif font-bold text-brand-brown group-hover:text-brand-terracotta transition-colors">
                {isAr ? item.name_ar : item.name_en}
              </span>
              <span className="text-[9px] sm:text-[10px] text-brand-brown-muted/80 font-mono hidden sm:block">
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
