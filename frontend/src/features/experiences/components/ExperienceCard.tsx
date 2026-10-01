import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Experience } from "../types/experience.types";

interface ExperienceCardProps {
  experience: Experience;
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-brand-border shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="relative h-60 overflow-hidden bg-brand-sand">
        <Image
          src={experience.image}
          alt={experience.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-brand-brown text-[11px] font-bold rounded-full uppercase tracking-wider shadow-xs">
            {experience.category?.name || "Experience"}
          </span>
        </div>
        {experience.duration && (
          <div className="absolute bottom-4 right-4 z-10">
            <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium rounded-full">
              ⏱️ {experience.duration}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-brand-brown-muted">
            <span>📍 {experience.location?.name || "El Gouna"}</span>
            <span>•</span>
            <span>Up to {experience.max_guests} people</span>
          </div>

          <h3 className="font-serif text-lg font-bold text-brand-brown group-hover:text-brand-terracotta transition">
            <Link href={`/experiences/${experience.slug}`}>{experience.title}</Link>
          </h3>

          <p className="text-xs text-brand-brown-muted line-clamp-2 leading-relaxed font-light">
            {experience.description}
          </p>
        </div>

        <div className="pt-4 border-t border-brand-border flex items-center justify-between">
          <div>
            <span className="text-xs text-brand-brown-muted block">Price</span>
            <span className="text-base font-bold text-brand-brown">
              {experience.price_formatted}{" "}
              <span className="text-xs font-normal text-brand-brown-muted">
                {experience.currency}
              </span>
            </span>
            <span className="text-[10px] text-brand-brown-muted block capitalize">
              {experience.pricing_type?.replace(/^\/\s*/, "") || "per group"}
            </span>
          </div>
          <Link
            href={`/experiences/${experience.slug}`}
            className="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl text-xs font-bold transition"
          >
            Explore
          </Link>
        </div>
      </div>
    </div>
  );
}
