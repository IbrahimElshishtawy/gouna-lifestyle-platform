import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import HeroSection from "@/features/home/components/HeroSection";
import FeaturedVacationRentals from "@/features/home/components/FeaturedVacationRentals";
import FeaturedSales from "@/features/home/components/FeaturedSales";
import FeaturedExperiences from "@/features/home/components/FeaturedExperiences";
import EventsSection from "@/features/home/components/EventsSection";
import ConciergeInquiry from "@/features/home/components/ConciergeInquiry";
import TestimonialsSection from "@/features/home/components/TestimonialsSection";
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
        <HeroSection />
        <FeaturedVacationRentals properties={properties} />
        <FeaturedSales properties={properties} />
        <FeaturedExperiences experiences={experiences} />
        <EventsSection />
        <ConciergeInquiry />
        <TestimonialsSection />
        <FaqSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
