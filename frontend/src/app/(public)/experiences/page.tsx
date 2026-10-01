import React from "react";
import Link from "next/link";
import { getExperiences } from "@/features/experiences/services/experiences.api";
import ExperienceCard from "@/features/experiences/components/ExperienceCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Curated Experiences & Red Sea Adventures | GouNow El Gouna",
  description:
    "From private sunset catamarans across untouched Red Sea islands to starlit Bedouin desert safaris, explore handpicked activities in El Gouna.",
};

interface Props {
  searchParams: Promise<{
    category?: string;
  }>;
}

const CATEGORIES = [
  { slug: "", label: "All Adventures" },
  { slug: "boat-trips", label: "Private Boat Trips & Yachts" },
  { slug: "safari", label: "Desert Safaris & Stargazing" },
  { slug: "watersports-kitesurfing", label: "Watersports & Kitesurfing" },
  { slug: "boat-trips-test", label: "Boat Trips" },
  { slug: "lifestyle-wellness", label: "Lifestyle & Wellness" },
];

export default async function ExperiencesPage({ searchParams }: Props) {
  const { category = "" } = await searchParams;
  const allExperiences = await getExperiences();

  const filteredExperiences = category
    ? allExperiences.filter(
        (exp) =>
          exp.category?.slug.toLowerCase() === category.toLowerCase() ||
          (category === "yacht-charters" && exp.category?.slug === "boat-trips")
      )
    : allExperiences;

  return (
    <div>
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-brand-sand-light/60 to-[#FAF8F5] border-b border-brand-border py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-terracotta">
              Red Sea Adventures
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
              Curated Experiences
            </h1>
            <p className="text-xs sm:text-sm text-brand-brown-muted leading-relaxed font-light">
              From private sunset catamarans across untouched Red Sea islands to starlit Bedouin desert safaris, explore handpicked activities hosted by certified local guides.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = (cat.slug === "" && !category) || cat.slug === category;
              const href = cat.slug ? `/experiences?category=${cat.slug}` : "/experiences";
              return (
                <Link
                  key={cat.slug || "all"}
                  href={href}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                    isActive
                      ? "bg-brand-terracotta text-white shadow-xs"
                      : "bg-white text-brand-brown hover:bg-brand-sand-light border border-brand-border"
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Experiences Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex items-center justify-between mb-8">
          <span className="text-xs text-brand-brown-muted font-medium">
            Showing <strong className="text-brand-brown">{filteredExperiences.length}</strong> curated experiences in El Gouna
          </span>
        </div>

        {filteredExperiences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExperiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-brand-border p-8">
            <p className="text-brand-brown-muted text-sm mb-4">
              No experiences found in this category at this time.
            </p>
            <Link
              href="/experiences"
              className="inline-block px-5 py-2.5 bg-brand-terracotta text-white text-xs font-bold uppercase rounded-xl"
            >
              View All Experiences
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
