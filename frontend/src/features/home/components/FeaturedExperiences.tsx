import React from "react";
import Link from "next/link";
import ExperienceCard from "@/features/experiences/components/ExperienceCard";
import { Experience } from "@/features/experiences/types/experience.types";

interface Props {
  experiences: Experience[];
}

export default function FeaturedExperiences({ experiences }: Props) {
  return (
    <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-2">
            Red Sea Adventures
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
            Curated Experiences
          </h2>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-2 max-w-xl font-light">
            Private yacht charters, desert mountain safaris, and elite water
            sports tailored exclusively for you.
          </p>
        </div>

        <Link
          href="/experiences"
          className="mt-6 md:mt-0 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-terracotta hover:text-brand-terracotta-dark transition-colors group"
        >
          <span>Explore All Experiences</span>
          <span className="transform group-hover:translate-x-1 transition-transform">
            &rarr;
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {experiences.slice(0, 3).map((experience) => (
          <ExperienceCard key={experience.id} experience={experience} />
        ))}
      </div>
    </section>
  );
}
