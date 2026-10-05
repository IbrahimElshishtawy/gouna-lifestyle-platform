import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import HeroSection from "@/features/home/components/HeroSection";
import BrandPillarsSection from "@/features/home/components/BrandPillarsSection";
import FeaturedVacationRentals from "@/features/home/components/FeaturedVacationRentals";
import FeaturedExperiences from "@/features/home/components/FeaturedExperiences";
import DivingSection from "@/features/home/components/DivingSection";
import FeaturedSales from "@/features/home/components/FeaturedSales";
import TestimonialsSection from "@/features/home/components/TestimonialsSection";
import EventsSection from "@/features/home/components/EventsSection";
import ConciergeInquiry from "@/features/home/components/ConciergeInquiry";
import FaqSection from "@/features/home/components/FaqSection";
import { getProperties } from "@/features/properties/services/properties.api";
import { getExperiences } from "@/features/experiences/services/experiences.api";
import { getPublicMediaDesignConfig } from "@/features/home/services/media-design.public";
import PropertyCardsShowcase from "@/features/home/components/PropertyCardsShowcase";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { setRequestLocale } from "next-intl/server";

export const revalidate = 60; // ISR cache revalidation

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [properties, experiences, mediaConfig] = await Promise.all([
    getProperties(),
    getExperiences(),
    getPublicMediaDesignConfig(),
  ]);

  // Prioritize properties designated as featured in Media Design
  const featuredIds = new Set(mediaConfig?.featured_property_ids || []);
  const displayProperties = [...properties].sort((a, b) => {
    const aFeatured = featuredIds.has(Number(a.id)) ? 1 : 0;
    const bFeatured = featuredIds.has(Number(b.id)) ? 1 : 0;
    return bFeatured - aFeatured;
  });

  const sections = mediaConfig?.sections;
  const isAr = locale === "ar";

  return (
    <>
      <Navbar />

      {/* Media Design Top Promotional Announcement Ribbon if active */}
      {mediaConfig?.announcement?.enabled && (
        <aside
          aria-label={isAr ? "إعلان ترويجي" : "Promotional Announcement"}
          className="fixed top-0 start-0 end-0 z-[60] bg-brand-terracotta text-white text-xs py-2 px-4 text-center font-medium shadow-md flex items-center justify-center gap-3 transition-transform"
        >
          <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
            {isAr ? "إعلان خاص" : "Exclusive"}
          </span>
          <a
            href={mediaConfig.announcement.link || "#stays"}
            className="hover:underline flex items-center gap-1 font-semibold"
          >
            <span>
              {isAr
                ? mediaConfig.announcement.text_ar
                : mediaConfig.announcement.text_en}
            </span>
          </a>
        </aside>
      )}

      <main className="flex-1 overflow-hidden">
        {/* 1. Hero with Luxury Booking Search */}
        {sections?.hero !== false && (
          <HeroSection heroConfig={mediaConfig?.hero} />
        )}

        {/* 2. Brand Narrative & 3 Core Ecosystem Pillars */}
        {sections?.pillars !== false && (
          <ScrollReveal animation="fade-up" duration={800}>
            <BrandPillarsSection />
          </ScrollReveal>
        )}

        {/* 3. Featured Vacation Stays Split Showcase & Secondary Cards */}
        {sections?.vacation_rentals !== false && (
          <ScrollReveal animation="fade-up" duration={800}>
            <FeaturedVacationRentals properties={displayProperties} />
          </ScrollReveal>
        )}

        {/* 3.1 Modern Property Cards Showcase (21st Style with Category Tabs & Spatial Tour) */}
        <ScrollReveal animation="fade-up" duration={800}>
          <PropertyCardsShowcase properties={displayProperties} />
        </ScrollReveal>

        {/* 4. Curated Experiences Split Showcase (Tawila Island Yacht & Adventures) */}
        {sections?.experiences !== false && (
          <ScrollReveal animation="fade-up" duration={800}>
            <FeaturedExperiences experiences={experiences} />
          </ScrollReveal>
        )}

        {/* 5. The Deep: Red Sea Marine Expeditions & Diving */}
        {sections?.diving !== false && <DivingSection />}

        {/* 6. Real Estate For Sale Split Showcase (Tawila Modern Villa & Estates) */}
        {sections?.sales !== false && (
          <ScrollReveal animation="fade-up" duration={800}>
            <FeaturedSales properties={displayProperties} />
          </ScrollReveal>
        )}

        {/* 6. Guest Testimonials & Social Proof */}
        {sections?.testimonials !== false && (
          <ScrollReveal animation="fade-up" duration={800}>
            <TestimonialsSection />
          </ScrollReveal>
        )}

        {/* 7. What's On This Season (Events & Gatherings) */}
        {sections?.events !== false && (
          <ScrollReveal animation="fade-up" duration={800}>
            <EventsSection />
          </ScrollReveal>
        )}

        {/* 8. Personal Concierge & Tailored Arrangements Lead Form */}
        {sections?.concierge !== false && (
          <ScrollReveal animation="fade-up" duration={800}>
            <ConciergeInquiry />
          </ScrollReveal>
        )}

        {/* 9. Frequently Asked Questions */}
        {sections?.faq !== false && (
          <ScrollReveal animation="fade-up" duration={800}>
            <FaqSection />
          </ScrollReveal>
        )}
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
