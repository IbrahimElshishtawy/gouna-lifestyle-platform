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

  const [properties, experiences] = await Promise.all([
    getProperties(),
    getExperiences(),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1 overflow-hidden">
        {/* 1. Hero with Luxury Booking Search */}
        <HeroSection />

        {/* 2. Brand Narrative & 3 Core Ecosystem Pillars */}
        <ScrollReveal animation="fade-up" duration={800}>
          <BrandPillarsSection />
        </ScrollReveal>

        {/* 3. Featured Vacation Stays Split Showcase & Secondary Cards */}
        <ScrollReveal animation="fade-up" duration={800}>
          <FeaturedVacationRentals properties={properties} />
        </ScrollReveal>

        {/* 4. Curated Experiences Split Showcase (Tawila Island Yacht & Adventures) */}
        <ScrollReveal animation="fade-up" duration={800}>
          <FeaturedExperiences experiences={experiences} />
        </ScrollReveal>

        {/* 5. The Deep: Red Sea Marine Expeditions & Diving */}
        <DivingSection />

        {/* 6. Real Estate For Sale Split Showcase (Tawila Modern Villa & Estates) */}
        <ScrollReveal animation="fade-up" duration={800}>
          <FeaturedSales properties={properties} />
        </ScrollReveal>

        {/* 6. Guest Testimonials & Social Proof */}
        <ScrollReveal animation="fade-up" duration={800}>
          <TestimonialsSection />
        </ScrollReveal>

        {/* 7. What's On This Season (Events & Gatherings) */}
        <ScrollReveal animation="fade-up" duration={800}>
          <EventsSection />
        </ScrollReveal>

        {/* 8. Personal Concierge & Tailored Arrangements Lead Form */}
        <ScrollReveal animation="fade-up" duration={800}>
          <ConciergeInquiry />
        </ScrollReveal>

        {/* 9. Frequently Asked Questions */}
        <ScrollReveal animation="fade-up" duration={800}>
          <FaqSection />
        </ScrollReveal>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
