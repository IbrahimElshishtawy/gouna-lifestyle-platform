"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getAdminExperienceById,
  toggleAdminExperienceStatus,
  AdminExperienceItem,
} from "@/features/experiences/services/experiences.api";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default function ExperienceDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const expId = Number(resolvedParams.id);
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [experience, setExperience] = useState<AdminExperienceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "schedule" | "pricing" | "media">("overview");

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminExperienceById(expId);
      if (res && res.data) {
        setExperience(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load experience details:", err);
    } finally {
      setLoading(false);
    }
  }, [expId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleStatus = async () => {
    if (!experience) return;
    try {
      await toggleAdminExperienceStatus(experience.id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to toggle status");
    }
  };

  if (loading) {
    return <LoadingState message="Loading experience specifications..." rows={6} />;
  }

  if (!experience) {
    return (
      <EmptyState
        icon="🧭"
        title="Experience Not Found"
        description="This experience does not exist or has been removed."
        actionText="Back to Experiences"
        actionHref="/admin/experiences"
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand-brown-muted mb-1">
            <Link href="/admin/experiences" className="hover:text-brand-terracotta transition">
              ← {isAr ? "العودة للأنشطة والتجارب" : "Back to Experiences"}
            </Link>
            <span>/</span>
            <span className="font-mono text-brand-terracotta">{experience.slug}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown">
              {isAr && experience.title_ar ? experience.title_ar : experience.title_en}
            </h1>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                experience.status === "published"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-gray-100 text-gray-800 border border-gray-200"
              }`}
            >
              {experience.status.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-brand-brown-muted mt-1">
            📍 {experience.location?.name_en || "El Gouna"} • 👥 Up to {experience.max_capacity} Guests • ⏱️ {experience.duration}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleStatus}
            className="px-4 py-2 rounded-xl border border-brand-border bg-white hover:bg-brand-sand-light text-brand-brown text-xs font-bold transition cursor-pointer"
          >
            {experience.status === "published" ? "⏸ Unpublish Experience" : "▶ Publish Experience"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-brand-border flex gap-4 overflow-x-auto text-xs font-bold">
        {[
          { id: "overview", label: "Overview & Requirements" },
          { id: "schedule", label: "Schedule & Capacity" },
          { id: "pricing", label: "Pricing & Inclusions" },
          { id: "media", label: "Media Assets" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-1 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? "border-brand-terracotta text-brand-terracotta"
                : "border-transparent text-brand-brown-muted hover:text-brand-brown"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-brand-border p-6 space-y-4 shadow-xs text-xs">
              <h3 className="font-serif text-lg font-bold text-brand-brown">Experience Description</h3>
              <p className="text-brand-brown leading-relaxed">
                {isAr && experience.description_ar ? experience.description_ar : experience.description_en || experience.short_description_en}
              </p>

              <div className="pt-4 border-t border-brand-sand-light grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-brand-brown-muted block text-[10px] uppercase font-bold">Duration</span>
                  <span className="font-bold text-brand-brown">{experience.duration}</span>
                </div>
                <div>
                  <span className="text-brand-brown-muted block text-[10px] uppercase font-bold">Max Group Size</span>
                  <span className="font-bold text-brand-brown">{experience.max_capacity} Guests</span>
                </div>
                <div>
                  <span className="text-brand-brown-muted block text-[10px] uppercase font-bold">Category</span>
                  <span className="font-bold text-brand-brown">{experience.category?.name_en || "Experience"}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-brand-border p-6 space-y-3 shadow-xs text-xs">
              <h3 className="font-serif text-base font-bold text-brand-brown">Logistics & Meeting Point</h3>
              <div className="p-3 rounded-2xl bg-brand-sand-light/40 border border-brand-border/60">
                <span className="font-bold text-brand-terracotta block mb-1">Meeting Location:</span>
                <p className="text-brand-brown">
                  {isAr && experience.meeting_point_ar ? experience.meeting_point_ar : experience.meeting_point_en || "Abu Tig Marina, El Gouna"}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-brand-sand-light/40 border border-brand-border/60">
                <span className="font-bold text-brand-terracotta block mb-1">What to Bring:</span>
                <p className="text-brand-brown">
                  {isAr && experience.what_to_bring_ar ? experience.what_to_bring_ar : experience.what_to_bring_en || "Comfortable resort wear, sun protection, swimwear, personal camera."}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-brand-border p-6 space-y-3 shadow-xs text-xs">
              <h3 className="font-serif text-base font-bold text-brand-brown">Pricing Summary</h3>
              <div className="flex justify-between py-2 border-b border-brand-sand-light">
                <span className="text-brand-brown-muted">Pricing Model:</span>
                <span className="font-bold uppercase text-brand-brown">{experience.pricing_model}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-brand-brown-muted">Base Rate:</span>
                <span className="font-mono font-bold text-brand-terracotta text-sm">
                  {(experience.base_price_cents / 100).toLocaleString()} EGP
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SCHEDULE */}
      {activeTab === "schedule" && (
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-brand-brown">Daily Schedule & Availability</h3>
          <div className="p-5 rounded-3xl bg-white border border-brand-border space-y-3 text-xs">
            <p className="text-brand-brown leading-relaxed">
              Sessions run daily with flexible departures upon concierge confirmation. Maximum booking capacity of {experience.max_capacity} guests per private session.
            </p>
          </div>
        </div>
      )}

      {/* 3. PRICING */}
      {activeTab === "pricing" && (
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-brand-brown">Pricing Structure</h3>
          <div className="p-5 rounded-3xl bg-white border border-brand-border space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-brand-sand-light">
              <span className="text-brand-brown-muted">Model:</span>
              <span className="font-bold text-brand-brown uppercase">{experience.pricing_model}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-brand-brown-muted">Base Price:</span>
              <span className="font-mono font-bold text-brand-terracotta text-base">
                {(experience.base_price_cents / 100).toLocaleString()} EGP
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. MEDIA */}
      {activeTab === "media" && (
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-brand-brown">Experience Media Gallery</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative h-64 rounded-2xl overflow-hidden border border-brand-border bg-brand-sand">
              <Image
                src={experience.cover_url || "/assets/images/tawila-yacht.jpg"}
                alt={experience.title_en}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
