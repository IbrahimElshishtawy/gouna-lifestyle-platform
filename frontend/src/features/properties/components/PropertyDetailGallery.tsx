"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import SafeImage from "@/components/ui/SafeImage";
import { Property } from "../types/property.types";
import UnitSpatialModal from "@/components/ui/UnitSpatialModal";

interface Props {
  property: Property;
  isAr: boolean;
}

export default function PropertyDetailGallery({ property, isAr }: Props) {
  const images = property.images && property.images.length > 0
    ? property.images
    : [{ id: 0, url: "/assets/images/fanadir-villa.jpg" }];

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [showSpatialModal, setShowSpatialModal] = useState(false);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") {
        setActivePhotoIdx((prev) => (prev + 1) % images.length);
      }
      if (e.key === "ArrowLeft") {
        setActivePhotoIdx((prev) => (prev - 1 + images.length) % images.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, images.length]);

  const openLightbox = (index: number) => {
    setActivePhotoIdx(index);
    setLightboxOpen(true);
  };

  const totalCount = images.length;

  return (
    <>
      {/* Dynamic Gallery Container */}
      <div className="mb-8 relative">
        {/* Case 1: Single Flagship Image */}
        {totalCount === 1 && (
          <div
            onClick={() => openLightbox(0)}
            className="group relative h-[360px] sm:h-[480px] lg:h-[540px] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl border border-brand-border bg-stone-900 transition-all duration-500"
          >
            <SafeImage
              src={images[0].url}
              alt={property.title}
              fill
              priority
              fallbackSrc="/assets/images/fanadir-villa.jpg"
              sizes="100vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* Top Bar Badges */}
            <div className="absolute top-4 start-4 sm:top-6 sm:start-6 flex flex-wrap items-center gap-2 z-10">
              <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider">
                {property.category?.name || (isAr ? "إقامة فاخرة" : "Signature Residence")}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-brand-terracotta text-white text-xs font-bold uppercase tracking-wider shadow-xs">
                {property.listing_type === "rent" ? (isAr ? "إيجار فندقي" : "Vacation Stay") : (isAr ? "للبيع" : "For Sale")}
              </span>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-4 start-4 end-4 sm:bottom-6 sm:start-6 sm:end-6 flex items-center justify-between z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSpatialModal(true);
                }}
                className="px-4 py-2 rounded-full bg-black/70 hover:bg-brand-terracotta backdrop-blur-md border border-white/25 text-white text-xs font-semibold flex items-center gap-2 transition-all duration-300 shadow-lg hover:scale-105 cursor-pointer"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
                <span>{isAr ? "المجسم المعماري 3D" : "3D Spatial Tour"}</span>
              </button>

              <button
                type="button"
                onClick={() => openLightbox(0)}
                className="px-4 py-2 rounded-full bg-white/90 hover:bg-white text-brand-brown backdrop-blur-md text-xs font-bold flex items-center gap-2 transition-all duration-300 shadow-md cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
                <span>{isAr ? "عرض الصورة كاملة" : "Expand Photo"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Case 2: Exactly 2 Images Split View */}
        {totalCount === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-[360px] sm:h-[460px]">
            {images.map((img, idx) => (
              <div
                key={img.id || idx}
                onClick={() => openLightbox(idx)}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl border border-brand-border bg-stone-900"
              >
                <SafeImage
                  src={img.url}
                  alt={`${property.title} - ${idx + 1}`}
                  fill
                  fallbackSrc="/assets/images/fanadir-villa.jpg"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                {idx === 0 && (
                  <div className="absolute top-4 start-4 z-10">
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
                      {property.category?.name || (isAr ? "إقامة فاخرة" : "Signature Residence")}
                    </span>
                  </div>
                )}
                {idx === 1 && (
                  <div className="absolute bottom-4 end-4 z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSpatialModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-black/70 hover:bg-brand-terracotta backdrop-blur-md border border-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                      </svg>
                      <span>{isAr ? "3D Tour" : "3D Tour"}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Case 3: Exactly 3 Images (1 Large + 2 Stacked) */}
        {totalCount === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-[380px] sm:h-[480px]">
            {/* Big Left */}
            <div
              onClick={() => openLightbox(0)}
              className="md:col-span-2 group relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl border border-brand-border bg-stone-900"
            >
              <Image
                src={images[0].url}
                alt={`${property.title} - Main`}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-4 start-4 z-10 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
                  {property.category?.name || (isAr ? "إقامة فاخرة" : "Signature Residence")}
                </span>
              </div>
              <div className="absolute bottom-4 start-4 z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSpatialModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-black/70 hover:bg-brand-terracotta backdrop-blur-md border border-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                  </svg>
                  <span>{isAr ? "المجسم المعماري 3D" : "3D Spatial Tour"}</span>
                </button>
              </div>
            </div>

            {/* 2 Stacked Right */}
            <div className="grid grid-rows-2 gap-3">
              {images.slice(1, 3).map((img, idx) => (
                <div
                  key={img.id || idx}
                  onClick={() => openLightbox(idx + 1)}
                  className="group relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl border border-brand-border bg-stone-900"
                >
                  <Image
                    src={img.url}
                    alt={`${property.title} - ${idx + 2}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Case 4: 4 or More Images (Flagship 50% + 2x2 Grid 50%) */}
        {totalCount >= 4 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[380px] sm:h-[480px] lg:h-[520px]">
            {/* Main Hero (2 cols x 2 rows) */}
            <div
              onClick={() => openLightbox(0)}
              className="md:col-span-2 md:row-span-2 group relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl border border-brand-border bg-stone-900"
            >
              <Image
                src={images[0].url}
                alt={`${property.title} - Hero`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-4 start-4 z-10 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
                  {property.category?.name || (isAr ? "إقامة فاخرة" : "Signature Residence")}
                </span>
              </div>
              <div className="absolute bottom-4 start-4 z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSpatialModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-black/70 hover:bg-brand-terracotta backdrop-blur-md border border-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                  </svg>
                  <span>{isAr ? "المجسم المعماري 3D" : "3D Spatial Tour"}</span>
                </button>
              </div>
            </div>

            {/* 3 or 4 Supporting Thumbnails */}
            {images.slice(1, 5).map((img, idx) => {
              const isLast = idx === 3;
              const hasMore = totalCount > 5;
              const remaining = totalCount - 5;

              return (
                <div
                  key={img.id || idx}
                  onClick={() => openLightbox(idx + 1)}
                  className="group relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl border border-brand-border bg-stone-900"
                >
                  <Image
                    src={img.url}
                    alt={`${property.title} - ${idx + 2}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {isLast && hasMore && (
                    <div className="absolute inset-0 bg-black/60 hover:bg-black/50 transition-colors backdrop-blur-[2px] flex items-center justify-center text-white text-center p-2">
                      <span className="font-serif text-sm sm:text-base font-bold tracking-wider">
                        +{remaining} {isAr ? "صور إضافية" : "More Photos"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Interactive Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6"
        >
          {/* Lightbox Topbar */}
          <div className="flex items-center justify-between text-white border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-white/70">
                {activePhotoIdx + 1} / {totalCount}
              </span>
              <span className="text-white/40">•</span>
              <h3 className="font-serif text-sm font-semibold truncate max-w-xs sm:max-w-md">
                {property.title}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setLightboxOpen(false);
                  setShowSpatialModal(true);
                }}
                className="px-3 py-1.5 rounded-full bg-brand-terracotta text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
                <span>{isAr ? "المجسم 3D" : "3D Tour"}</span>
              </button>

              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                aria-label="Close Lightbox"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Active Image Display with Prev/Next Controls */}
          <div className="relative flex-1 my-4 flex items-center justify-center">
            {totalCount > 1 && (
              <button
                type="button"
                onClick={() => setActivePhotoIdx((prev) => (prev - 1 + totalCount) % totalCount)}
                aria-label="Previous Image"
                className="absolute start-2 sm:start-4 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-brand-terracotta text-white flex items-center justify-center transition-all backdrop-blur-md cursor-pointer shadow-lg"
              >
                <span className="rtl:rotate-180">&larr;</span>
              </button>
            )}

            <div className="relative w-full h-full max-h-[75vh] max-w-5xl rounded-2xl overflow-hidden">
              <Image
                src={images[activePhotoIdx].url}
                alt={`${property.title} full view ${activePhotoIdx + 1}`}
                fill
                priority
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {totalCount > 1 && (
              <button
                type="button"
                onClick={() => setActivePhotoIdx((prev) => (prev + 1) % totalCount)}
                aria-label="Next Image"
                className="absolute end-2 sm:end-4 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-brand-terracotta text-white flex items-center justify-center transition-all backdrop-blur-md cursor-pointer shadow-lg"
              >
                <span className="rtl:rotate-180">&rarr;</span>
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {totalCount > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 transition-all cursor-pointer ${
                    activePhotoIdx === idx
                      ? "ring-2 ring-brand-terracotta scale-105 opacity-100"
                      : "opacity-40 hover:opacity-80"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3D Unit Spatial Modal Integration */}
      <UnitSpatialModal
        property={property}
        isOpen={showSpatialModal}
        onClose={() => setShowSpatialModal(false)}
      />
    </>
  );
}
