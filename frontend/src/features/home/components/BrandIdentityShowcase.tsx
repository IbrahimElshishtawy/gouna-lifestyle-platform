"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { ChapterTag, FadeIn } from "@/components/ui/MotionPrimitives";

interface ColorToken {
  hex: string;
  name_en: string;
  name_ar: string;
  role_en: string;
  role_ar: string;
}

const BRAND_PALETTE: ColorToken[] = [
  {
    hex: "#A55332",
    name_en: "Terracotta Clay",
    name_ar: "طمي التيراكوتا الأصيل",
    role_en: "Primary Brand Accent",
    role_ar: "اللون الرئيسي للهوية والأزرار",
  },
  {
    hex: "#DBC0A0",
    name_en: "Warm Gouna Sand",
    name_ar: "رمال الجونة الدافئة",
    role_en: "Warm Secondary Dune",
    role_ar: "تدرجات الرمال والشواطئ",
  },
  {
    hex: "#E9D9C4",
    name_en: "Soft Cream",
    name_ar: "الكريمي الناعم",
    role_en: "Elevated Backgrounds & Cards",
    role_ar: "خلفيات البطاقات والحدود الراقية",
  },
  {
    hex: "#8C6F56",
    name_en: "Muted Earth Taupe",
    name_ar: "الترابي المائل للدفء",
    role_en: "Editorial Body Text & Subtitles",
    role_ar: "نصوص الشروحات والتفاصيل",
  },
  {
    hex: "#5B4635",
    name_en: "Deep Espresso Bronze",
    name_ar: "البرونزي العميق",
    role_en: "Primary Typography & Headings",
    role_ar: "العناوين الرئيسية والفخامة الليلية",
  },
];

export default function BrandIdentityShowcase() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <section
      id="brand-identity"
      className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[#FAF6F0] via-[#F5EEE4] to-[#FAF6F0] relative overflow-hidden border-t border-brand-border/60 scroll-mt-24"
    >
      {/* Background Sand Texture Overlay */}
      <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-multiply">
        <Image
          src="/assets/images/bg-sand-texture.jpg"
          alt="Texture"
          fill
          className="object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Chapter Header */}
        <FadeIn direction="up">
          <ChapterTag
            number="BRAND IDENTITY"
            title={isAr ? "فلسفة وهوية جو ناو" : "THE GOUNOW IDENTITY"}
            subtitle={
              isAr
                ? "أقم. استكشف. انتمِ — ميثاق التصميم والجمال في الجونة"
                : "Stay. Explore. Belong. — Design Ethos & Architecture"
            }
          />
        </FadeIn>

        {/* Brand Ethos Headline */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <FadeIn direction="up" delay={100}>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <Image
                  src="/assets/images/Gounow Main signature.png"
                  alt="Gounow Signature"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#A55332] font-bold">
                EL GOUNA, EGYPT
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#5B4635] leading-[1.1] mb-6">
              {isAr
                ? "أكثر من مجرد إقامة، مكان تنتمي إليه."
                : "More Than a Stay, a Place to Belong."}
            </h2>
            <p className="text-sm sm:text-base text-[#8C6F56] leading-relaxed font-light">
              {isAr
                ? "صُممت هوية جو ناو لتعكس نقاء مياه الجونة الفيروزية، ودفء رمال صحراء البحر الأحمر، مع خطوط طباعية وألوان عضوية مستوحاة من روعة العمارة الكلاسيكية الحديثة."
                : "Rooted in the warm desert sands and tranquil turquoise waters of El Gouna, our visual identity pairs organic earthy tones with timeless editorial typography."}
            </p>
          </FadeIn>
        </div>

        {/* 2-Column Showcase: Brand Spec Sheet & Interactive Design Tokens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Official Brand Review Graphic Card */}
          <div className="lg:col-span-7">
            <FadeIn direction="up" delay={200}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#DBC0A0]/60 bg-white group">
                {/* Brand Visual Display */}
                <div className="relative aspect-[16/14] sm:aspect-[16/12] w-full bg-[#FAF6F0]">
                  <Image
                    src="/assets/images/Gounow identity review.png"
                    alt="Gounow Official Brand Identity Review"
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-contain p-2 sm:p-4 transition-transform duration-700 group-hover:scale-[1.02]"
                    priority
                  />
                </div>

                {/* Card Footer with Brand Motto */}
                <div className="p-4 sm:p-6 bg-gradient-to-r from-[#5B4635] to-[#3D2E24] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#DBC0A0]">
                      Official Style Guide
                    </span>
                    <h4 className="font-serif text-lg font-bold text-white tracking-wide">
                      GOUNOW — Recoleta Serif & Earth Palette
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-white/15 text-[#DBC0A0] font-mono">
                      Stay · Explore · Belong
                    </span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right Column: Palette & Typography Breakdown */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            {/* 1. Color Palette Tokens */}
            <FadeIn direction="up" delay={250}>
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-[#DBC0A0]/70 shadow-lg">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E9D9C4]">
                  <h3 className="font-serif text-base font-bold text-[#5B4635]">
                    {isAr ? "بالتة ألوان الهوية الرسمية" : "Official Color Palette"}
                  </h3>
                  <span className="text-[10px] font-mono uppercase text-[#A55332]">
                    {copiedHex ? (isAr ? "تم النسخ!" : "Copied!") : (isAr ? "اضغط للنسخ" : "Click to copy")}
                  </span>
                </div>

                <div className="space-y-3">
                  {BRAND_PALETTE.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => copyToClipboard(color.hex)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF6F0] transition-colors group cursor-pointer text-start"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl shadow-md border border-black/10 group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div>
                          <span className="block text-xs font-bold text-[#5B4635]">
                            {isAr ? color.name_ar : color.name_en}
                          </span>
                          <span className="block text-[10px] text-[#8C6F56]">
                            {isAr ? color.role_ar : color.role_en}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-[#F7F2EC] text-[#5B4635] group-hover:bg-[#A55332] group-hover:text-white transition-colors">
                        {color.hex}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* 2. Typography Token (Recoleta) */}
            <FadeIn direction="up" delay={300}>
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-[#DBC0A0]/70 shadow-lg">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E9D9C4]">
                  <h3 className="font-serif text-base font-bold text-[#5B4635]">
                    {isAr ? "الخط الطباعي الرئيسي (Typography)" : "Primary Typography"}
                  </h3>
                  <span className="text-[10px] font-mono uppercase text-[#A55332] font-bold">
                    Recoleta Demo
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF6F0] to-[#E9D9C4]/40 border border-[#DBC0A0]/40">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-[#5B4635] block mb-1">
                    Aa Recoleta
                  </span>
                  <p className="font-serif text-base text-[#A55332] font-semibold italic mb-2">
                    &ldquo;Stay. Explore. Belong.&rdquo;
                  </p>
                  <p className="text-xs text-[#8C6F56] font-light leading-relaxed">
                    {isAr
                      ? "خط سيريـف كلاسيكي دافئ يمزج بين أصالة السبعينيات وأناقة البوتيك الفاخرة، يمنح المنصة صوتاً فريداً وهدوءاً ساحلياً مميزاً."
                      : "A warm, organic 1970s-inspired serif with soft curves and geometric undertones, bringing boutique warmth to El Gouna's luxury hospitality."}
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* 3. Official Co-branding Partner Badge */}
            <FadeIn direction="up" delay={350}>
              <div className="p-4 rounded-2xl bg-[#5B4635] text-white flex items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <Image
                      src="/assets/images/official-elgouna-logo-white.webp"
                      alt="Official El Gouna"
                      width={64}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-[#DBC0A0]">
                      {isAr ? "وجهة الجونة الرسمية" : "Official El Gouna Destination"}
                    </span>
                    <span className="block text-[9px] text-[#E9D9C4]/70">
                      Orascom Development Egypt
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded bg-white/10 text-[#DBC0A0]">
                  Certified
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
