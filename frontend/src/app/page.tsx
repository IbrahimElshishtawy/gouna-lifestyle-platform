import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import HeroSection from "@/features/home/components/HeroSection";
import BrandPillarsSection from "@/features/home/components/BrandPillarsSection";
import FeaturedVacationRentals from "@/features/home/components/FeaturedVacationRentals";
import FeaturedExperiences from "@/features/home/components/FeaturedExperiences";
import FeaturedSales from "@/features/home/components/FeaturedSales";
import TestimonialsSection from "@/features/home/components/TestimonialsSection";
import EventsSection from "@/features/home/components/EventsSection";
import ConciergeInquiry from "@/features/home/components/ConciergeInquiry";
import FaqSection from "@/features/home/components/FaqSection";
import { getProperties } from "@/features/properties/services/properties.api";
import { getExperiences } from "@/features/experiences/services/experiences.api";

export const revalidate = 60; // ISR cache revalidation

export default async function HomePage() {
  const [properties, experiences] = await Promise.all([
    getProperties(),
    getExperiences(),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* 1. Hero with Luxury Booking Search */}
        <HeroSection />

        {/* 2. Brand Narrative & 3 Core Ecosystem Pillars */}
        <BrandPillarsSection />

        {/* 3. Featured Vacation Stays Split Showcase & Secondary Cards */}
        <FeaturedVacationRentals properties={properties} />

        {/* 4. Curated Experiences Split Showcase (Tawila Island Yacht & Adventures) */}
        <FeaturedExperiences experiences={experiences} />

        {/* 5. Real Estate For Sale Split Showcase (Tawila Modern Villa & Estates) */}
        <FeaturedSales properties={properties} />

        {/* 6. Guest Testimonials & Social Proof */}
        <TestimonialsSection />

        {/* 7. What's On This Season (Events & Gatherings) */}
        <EventsSection />

        {/* 8. Personal Concierge & Tailored Arrangements Lead Form */}
        <ConciergeInquiry />

        {/* 9. Frequently Asked Questions */}
        <FaqSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
