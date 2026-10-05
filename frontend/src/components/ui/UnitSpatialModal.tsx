"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Property } from "@/features/properties/types/property.types";

interface UnitSpatialModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UnitSpatialModal({
  property,
  isOpen,
  onClose,
}: UnitSpatialModalProps) {
  const { locale, t } = useLanguage();
  const isAr = locale === "ar";

  // 3D Orbital Rotation State
  const [rotX, setRotX] = useState(25);
  const [rotY, setRotY] = useState(-30);
  const [activeZone, setActiveZone] = useState<string>("master");
  const [activeLayer, setActiveLayer] = useState<"architecture" | "exterior" | "lagoon">("architecture");
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !property) return null;

  // Touch & Mouse Drag handlers for 3D Orbiting
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setRotY((prev) => prev + deltaX * 0.4);
    setRotX((prev) => Math.max(5, Math.min(65, prev - deltaY * 0.4)));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - lastMousePos.current.x;
    const deltaY = e.touches[0].clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    setRotY((prev) => prev + deltaX * 0.5);
    setRotX((prev) => Math.max(5, Math.min(65, prev - deltaY * 0.5)));
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  const resetView = (x: number, y: number) => {
    setRotX(x);
    setRotY(y);
  };

  const primaryImage =
    property.images?.find((img) => img.is_primary)?.url ||
    property.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=85";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xl animate-fade-in-scale"
    >
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[820px] bg-[#140F0D] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-white/10 bg-black/40 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-terracotta animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-terracotta">
                  {isAr ? "المخطط المعماري ثلاثي الأبعاد" : "3D SPATIAL ARCHITECTURE"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-stone-300 font-mono">
                  {property.reference_code || "GN-VILLA"}
                </span>
              </div>
              <h2 className="font-serif text-base sm:text-xl font-bold text-white line-clamp-1">
                {property.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main Body: 3D Stage & Interactive Specs */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative">
          
          {/* Left/Main Column: 3D Interactive Perspective View (8 cols) */}
          <div
            className="lg:col-span-8 relative bg-gradient-to-b from-[#1C1412] via-[#0E0B0A] to-black flex items-center justify-center overflow-hidden select-none cursor-grab active:cursor-grabbing p-4"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Ambient Background Grid & Lagoon Glow */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
            <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Orbit Hint Badge */}
            <div className="absolute top-4 start-4 z-20 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-stone-300">
              <span className="text-base">🔄</span>
              <span>{isAr ? "اسحب للتدوير بزاوية 360°" : "Drag to orbit 360°"}</span>
            </div>

            {/* Camera View Angle Presets */}
            <div className="absolute bottom-4 start-4 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); resetView(25, -35); }}
                className="px-2.5 py-1 text-[10px] font-mono uppercase rounded-lg hover:bg-white/15 text-stone-300 transition-colors"
              >
                {isAr ? "منظور عام" : "Isometric"}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); resetView(60, 0); }}
                className="px-2.5 py-1 text-[10px] font-mono uppercase rounded-lg hover:bg-white/15 text-stone-300 transition-colors"
              >
                {isAr ? "مسقط رأسي" : "Top Plan"}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); resetView(10, 15); }}
                className="px-2.5 py-1 text-[10px] font-mono uppercase rounded-lg hover:bg-white/15 text-stone-300 transition-colors"
              >
                {isAr ? "واجهة اللاجون" : "Lagoon Front"}
              </button>
            </div>

            {/* THE 3D SPATIAL STAGE (Pure GPU CSS 3D Model) */}
            <div
              className="relative w-64 h-64 sm:w-80 sm:h-80 transition-transform duration-75 ease-out preserve-3d"
              style={{
                perspective: "1200px",
                transform: `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Foundation Slab / Lagoon Basin (Z: -40px) */}
              <div
                className="absolute inset-0 rounded-3xl border border-cyan-500/30 bg-gradient-to-tr from-cyan-950/80 via-teal-900/40 to-cyan-900/60 shadow-[0_30px_60px_rgba(6,182,212,0.25)] transition-all duration-500"
                style={{
                  transform: "translateZ(-30px)",
                }}
              >
                <div className="absolute inset-x-4 top-2 text-[9px] font-mono uppercase tracking-widest text-cyan-400/80">
                  {isAr ? "قناة اللاجون المائية والمرسى" : "LAGOON WATERWAY // BERTH"}
                </div>
              </div>

              {/* Villa Ground Plateau & Private Pool Deck (Z: 0px) */}
              <div
                className="absolute inset-3 rounded-2xl border border-stone-600/50 bg-[#281F1B] shadow-2xl p-3 flex flex-col justify-between"
                style={{
                  transform: "translateZ(0px)",
                }}
              >
                {/* Heated Infinity Pool Element */}
                <div
                  onClick={(e) => { e.stopPropagation(); setActiveZone("pool"); }}
                  className={`w-full h-14 rounded-xl border border-cyan-400/60 bg-gradient-to-r from-cyan-600/70 to-teal-500/70 flex items-center justify-center cursor-pointer transition-all duration-300 shadow-md ${
                    activeZone === "pool" ? "ring-2 ring-cyan-300 scale-[1.02]" : "hover:brightness-110"
                  }`}
                >
                  <span className="text-[10px] font-bold text-white tracking-wider flex items-center gap-1">
                    <span>🏊</span> {isAr ? "مسبح إنفينيتي دافئ مع إطلالة" : "Heated Infinity Pool"}
                  </span>
                </div>

                {/* Living Pavilion & Sun Deck */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div
                    onClick={(e) => { e.stopPropagation(); setActiveZone("deck"); }}
                    className={`p-2 rounded-xl border border-amber-600/40 bg-amber-950/40 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      activeZone === "deck" ? "ring-2 ring-amber-400 scale-[1.02]" : "hover:bg-amber-950/60"
                    }`}
                  >
                    <span className="text-[9px] font-bold uppercase text-amber-300">
                      {isAr ? "تراس التشمس" : "Sundeck & Lounge"}
                    </span>
                    <span className="text-[8px] text-amber-200/70">85 m²</span>
                  </div>

                  <div
                    onClick={(e) => { e.stopPropagation(); setActiveZone("living"); }}
                    className={`p-2 rounded-xl border border-stone-600/60 bg-[#3D2E26] flex flex-col items-center justify-center cursor-pointer transition-all ${
                      activeZone === "living" ? "ring-2 ring-brand-terracotta scale-[1.02]" : "hover:bg-[#4D3A30]"
                    }`}
                  >
                    <span className="text-[9px] font-bold uppercase text-stone-200">
                      {isAr ? "صالون الاستقبال" : "Atrium Living"}
                    </span>
                    <span className="text-[8px] text-stone-400">120 m²</span>
                  </div>
                </div>
              </div>

              {/* First Floor Architectural Penthouse / Master Suites (Z: +45px) */}
              <div
                className="absolute inset-8 rounded-2xl border-2 border-brand-terracotta/70 bg-[#35251F]/95 shadow-[0_20px_40px_rgba(0,0,0,0.8)] p-3 flex flex-col justify-between backdrop-blur-md"
                style={{
                  transform: "translateZ(45px)",
                }}
                onClick={(e) => { e.stopPropagation(); setActiveZone("master"); }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-brand-terracotta">
                    {isAr ? "جناح الماستر البانورامي" : "PANORAMIC MASTER SUITE"}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div className="my-auto text-center py-1">
                  <span className="text-xl">🛏️</span>
                  <p className="text-[10px] font-bold text-white mt-1">
                    {property.bedrooms} {t.common.beds} • {property.bathrooms} {t.common.baths}
                  </p>
                  <p className="text-[8px] text-stone-400">
                    {isAr ? "شرفة خاصة مواجهة للغروب" : "Private Sunset Lagoon Balcony"}
                  </p>
                </div>

                <div className="bg-white/10 rounded-lg py-1 px-2 text-center text-[9px] text-stone-200 font-mono">
                  {property.area_sqm || 480} m² BUA
                </div>
              </div>

              {/* Floating Rooftop Solarium & Sky Terrace (Z: +80px) */}
              <div
                className="absolute inset-16 rounded-xl border border-white/30 bg-white/15 backdrop-blur-md shadow-2xl flex items-center justify-center p-2 cursor-pointer transition-transform hover:scale-105"
                style={{
                  transform: "translateZ(80px)",
                }}
                onClick={(e) => { e.stopPropagation(); setActiveZone("rooftop"); }}
              >
                <div className="text-center">
                  <span className="text-xs">🌅</span>
                  <p className="text-[9px] font-bold text-white uppercase tracking-wider">
                    {isAr ? "روف سكاي لونج" : "Sky Terrace"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Zone Details & Direct Reservation (4 cols) */}
          <div className="lg:col-span-4 p-5 sm:p-6 bg-[#181210] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-between overflow-y-auto">
            
            <div className="space-y-4">
              {/* Active Zone Card */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-terracotta block mb-1">
                  {isAr ? "المنطقة المحددة حالياً" : "ACTIVE ARCHITECTURAL ZONE"}
                </span>

                {activeZone === "master" && (
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white">
                      {isAr ? "جناح الماستر الملكي" : "Royal Master Suite"}
                    </h3>
                    <p className="text-xs text-stone-300 font-light mt-1 leading-relaxed">
                      {isAr
                        ? "تصميم مفتوح بأسلوب العمارة النوبية العصرية مع حمام رخامي فاخر، غرفة ملابس واسعة وشرفة خاصة بإطلالة 180 درجة على مياه اللاجون الفيروزية."
                        : "Open architectural flow featuring floor-to-ceiling glass, Italian marble bathroom, dual dressing areas, and private sunrise lagoon terrace."}
                    </p>
                  </div>
                )}

                {activeZone === "pool" && (
                  <div>
                    <h3 className="font-serif text-lg font-bold text-cyan-300">
                      {isAr ? "حمام السباحة واللاجون" : "Heated Infinity Lagoon Pool"}
                    </h3>
                    <p className="text-xs text-stone-300 font-light mt-1 leading-relaxed">
                      {isAr
                        ? "مسبح إنفينيتي مدفأ بنظام تنقية مياه ذكي مع مقاعد جاكوزي مدمجة، وإمكانية السباحة المباشرة في لاجون الجونة الصافي."
                        : "Temperature-regulated infinity plunge pool with integrated hydrotherapy jets and seamless sand transition to the private lagoon."}
                    </p>
                  </div>
                )}

                {activeZone === "deck" && (
                  <div>
                    <h3 className="font-serif text-lg font-bold text-amber-300">
                      {isAr ? "تراس التشمس والشواء" : "Outdoor Living Deck & BBQ"}
                    </h3>
                    <p className="text-xs text-stone-300 font-light mt-1 leading-relaxed">
                      {isAr
                        ? "أرضيات خشبية فاخرة مقاومة للعوامل الجوية، منطقة طعام خارجية مظللة، ومطبخ صيفي مجهز بالكامل للمناسبات العائلية."
                        : "Teakwood sundeck, pergola-shaded outdoor dining, and custom gas grill station tailored for evening entertaining under the Red Sea stars."}
                    </p>
                  </div>
                )}

                {activeZone === "living" && (
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-200">
                      {isAr ? "بهو الاستقبال والصالون" : "Double-Height Atrium Lounge"}
                    </h3>
                    <p className="text-xs text-stone-300 font-light mt-1 leading-relaxed">
                      {isAr
                        ? "أسقف عالية مع إنارة طبيعية متدفقة، مدفأة عصرية، وأثاث مصمم خصيصاً من الخشب الطبيعي والكتان الفاخر."
                        : "Dramatic double-height ceilings with natural desert light, minimalist fireplace, and custom linen and solid oak furnishings."}
                    </p>
                  </div>
                )}

                {activeZone === "rooftop" && (
                  <div>
                    <h3 className="font-serif text-lg font-bold text-orange-300">
                      {isAr ? "سكاي تراس وغروب الشمس" : "Sky Terrace & Sunset Deck"}
                    </h3>
                    <p className="text-xs text-stone-300 font-light mt-1 leading-relaxed">
                      {isAr
                        ? "إطلالة بانورامية غير محجوبة على جبال البحر الأحمر ومارينا الجونة، مكان مثالي للاسترخاء وقت الغروب."
                        : "Unobstructed 360-degree vistas encompassing the Red Sea mountains and marina waterways, equipped with built-in majlis seating."}
                    </p>
                  </div>
                )}
              </div>

              {/* Spatial Specifications Matrix */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                    {t.common.bua}
                  </span>
                  <span className="text-base font-bold text-white font-mono">
                    {property.area_sqm || 480} m²
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                    {isAr ? "المساحة الإجمالية" : "Plot Size"}
                  </span>
                  <span className="text-base font-bold text-white font-mono">
                    780 m²
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                    {isAr ? "إطلالة الواجهة" : "Water Frontage"}
                  </span>
                  <span className="text-base font-bold text-cyan-300 font-mono">
                    28m {isAr ? "لاجون" : "Lagoon"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                    {isAr ? "السعة" : "Max Occupancy"}
                  </span>
                  <span className="text-base font-bold text-white font-mono">
                    {property.max_guests} {t.common.guests}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Booking Action Strip */}
            <div className="pt-4 border-t border-white/10 mt-4 space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                    {property.listing_type === "rent" ? t.propertyCard.pricePerNight : t.sales.askingPrice}
                  </span>
                  <span className="text-xl font-serif font-bold text-white">
                    {property.price_formatted}{" "}
                    <span className="text-xs font-sans text-stone-400">
                      {property.currency === "EGP" ? t.common.currency : property.currency}
                    </span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/201000000000?text=${encodeURIComponent(
                    `Hello GouNow Concierge, I am viewing the 3D model for ${property.title} (${property.reference_code}) and would like to reserve/schedule a viewing.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all duration-200 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>💬</span>
                  <span>{isAr ? "حجز فوري VIP" : "VIP Inquiry"}</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-3 bg-white/10 hover:bg-white/20 text-stone-200 rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-colors cursor-pointer"
                >
                  {isAr ? "إغلاق النموذج" : "Close Model"}
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
