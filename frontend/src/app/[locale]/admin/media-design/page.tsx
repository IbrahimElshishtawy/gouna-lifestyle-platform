"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getMediaDesignConfig,
  updateMediaDesignConfig,
  uploadMediaDesignAsset,
} from "@/features/admin/services/admin.api";
import type { MediaDesignConfig, HeroScene } from "@/features/admin/types";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";

export default function AdminMediaDesignPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"hero" | "featured_units" | "sections" | "announcement">("hero");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<MediaDesignConfig>({
    hero: {
      badge_en: "",
      badge_ar: "",
      title_line1_en: "",
      title_line1_ar: "",
      title_line2_en: "",
      title_line2_ar: "",
      subtitle_en: "",
      subtitle_ar: "",
      cta1_text_en: "",
      cta1_text_ar: "",
      cta1_link: "",
      cta2_text_en: "",
      cta2_text_ar: "",
      cta2_link: "",
      background_image: "",
      video_url: "",
      media_mode: "scenes",
      scenes: [],
    },
    sections: {
      hero: true,
      pillars: true,
      vacation_rentals: true,
      experiences: true,
      diving: true,
      sales: true,
      testimonials: true,
      events: true,
      concierge: true,
      faq: true,
    },
    featured_property_ids: [],
    announcement: {
      enabled: false,
      text_en: "",
      text_ar: "",
      link: "",
    },
  });

  const [availableProperties, setAvailableProperties] = useState<Array<{
    id: number;
    reference_number: string;
    title_en: string;
    title_ar: string | null;
    listing_type: "rent" | "sale";
    is_published: boolean;
    is_featured: boolean;
  }>>([]);

  useEffect(() => {
    let mounted = true;
    getMediaDesignConfig()
      .then((res) => {
        if (!mounted) return;
        if (res.config) {
          setConfig(res.config);
        }
        if (Array.isArray(res.available_properties)) {
          setAvailableProperties(res.available_properties);
        }
      })
      .catch(() => {
        setFeedback({
          type: "error",
          message: isAr
            ? "تعذر تحميل إعدادات ميديا ديزاين من الخادم."
            : "Failed to load Media Design settings.",
        });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isAr]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await updateMediaDesignConfig(config);
      setFeedback({
        type: "success",
        message: res.message || (isAr ? "تم حفظ إعدادات ميديا ديزاين بنجاح." : "Media Design configuration saved successfully."),
      });
    } catch {
      setFeedback({
        type: "error",
        message: isAr ? "حدث خطأ أثناء حفظ الإعدادات." : "Failed to save configuration.",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleFeaturedProperty = (id: number) => {
    setConfig((prev) => {
      const currentIds = prev.featured_property_ids || [];
      const newIds = currentIds.includes(id)
        ? currentIds.filter((item) => item !== id)
        : [...currentIds, id];
      return { ...prev, featured_property_ids: newIds };
    });
  };

  const toggleSection = (sectionKey: keyof MediaDesignConfig["sections"]) => {
    setConfig((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionKey]: !prev.sections[sectionKey],
      },
    }));
  };

  const handleUploadMainVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia("main_video");
    try {
      const res = await uploadMediaDesignAsset(file);
      setConfig((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          video_url: res.url,
          media_mode: "video",
        },
      }));
      setFeedback({
        type: "success",
        message: isAr ? "تم رفع الفيديو بنجاح وتعيينه كخلفية للهيرو." : "Video uploaded and set as hero background.",
      });
    } catch {
      setFeedback({
        type: "error",
        message: isAr ? "فشل رفع ملف الفيديو." : "Failed to upload video file.",
      });
    } finally {
      setUploadingMedia(null);
    }
  };

  const handleUploadMainImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia("main_image");
    try {
      const res = await uploadMediaDesignAsset(file);
      setConfig((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          background_image: res.url,
          media_mode: "image",
        },
      }));
      setFeedback({
        type: "success",
        message: isAr ? "تم رفع الصورة بنجاح وتعيينها كخلفية." : "Image uploaded successfully.",
      });
    } catch {
      setFeedback({
        type: "error",
        message: isAr ? "فشل رفع الصورة." : "Failed to upload image.",
      });
    } finally {
      setUploadingMedia(null);
    }
  };

  const handleAddScene = () => {
    const newScene: HeroScene = {
      id: `scene-${Date.now()}`,
      name_ar: `مشهد ${(config.hero.scenes?.length || 0) + 1}`,
      name_en: `Scene ${(config.hero.scenes?.length || 0) + 1}`,
      media_type: "image",
      image_url: "/assets/images/hero-villa-dusk.jpg",
      video_url: "",
      title_line1_ar: "",
      title_line2_ar: "",
      title_line1_en: "",
      title_line2_en: "",
      subtitle_ar: "",
      subtitle_en: "",
    };
    setConfig((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        scenes: [...(prev.hero.scenes || []), newScene],
      },
    }));
  };

  const handleRemoveScene = (index: number) => {
    setConfig((prev) => {
      const currentScenes = [...(prev.hero.scenes || [])];
      currentScenes.splice(index, 1);
      return {
        ...prev,
        hero: {
          ...prev.hero,
          scenes: currentScenes,
        },
      };
    });
  };

  const handleMoveScene = (index: number, direction: "up" | "down") => {
    setConfig((prev) => {
      const currentScenes = [...(prev.hero.scenes || [])];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= currentScenes.length) return prev;
      const temp = currentScenes[index];
      currentScenes[index] = currentScenes[targetIndex];
      currentScenes[targetIndex] = temp;
      return {
        ...prev,
        hero: {
          ...prev.hero,
          scenes: currentScenes,
        },
      };
    });
  };

  const handleUpdateScene = (index: number, fields: Partial<HeroScene>) => {
    setConfig((prev) => {
      const currentScenes = [...(prev.hero.scenes || [])];
      currentScenes[index] = { ...currentScenes[index], ...fields };
      return {
        ...prev,
        hero: {
          ...prev.hero,
          scenes: currentScenes,
        },
      };
    });
  };

  const handleUploadSceneMedia = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(`scene_${index}`);
    try {
      const res = await uploadMediaDesignAsset(file);
      if (res.file_type === "video") {
        handleUpdateScene(index, {
          media_type: "video",
          video_url: res.url,
        });
      } else {
        handleUpdateScene(index, {
          media_type: "image",
          image_url: res.url,
        });
      }
      setFeedback({
        type: "success",
        message: isAr ? "تم رفع الوسائط وتعيينها للمشهد بنجاح." : "Scene media uploaded successfully.",
      });
    } catch {
      setFeedback({
        type: "error",
        message: isAr ? "فشل رفع ملف الوسائط للمشهد." : "Failed to upload scene media.",
      });
    } finally {
      setUploadingMedia(null);
    }
  };

  if (loading) {
    return (
      <div className="p-12">
        <LoadingState message={isAr ? "جارٍ تحميل منظومة ميديا ديزاين..." : "Loading Media Design suite..."} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-brown">
            {isAr ? "ميديا ديزاين وإدارة الواجهة الرئيسية" : "Media Design & Homepage CMS"}
          </h1>
          <p className="text-xs text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "تحكم شامل في جميع العناصر، الصور، الفلل المميزة، والأقسام التي تظهر للعملاء في الصفحة الرئيسية."
              : "Full control over visual media, hero banners, featured special units, and visible sections on the homepage."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2 bg-white hover:bg-brand-sand-light text-brand-brown border border-brand-border rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <span>{isAr ? "معاينة الواجهة الرئيسية" : "Preview Live Homepage"}</span>
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <span>{isAr ? "جارٍ الحفظ..." : "Saving..."}</span>
            ) : (
              <span>{isAr ? "حفظ التغييرات" : "Save Changes"}</span>
            )}
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline cursor-pointer"
          >
            {isAr ? "إغلاق" : "Dismiss"}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-border pb-3 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "hero"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "الواجهة الأساسية (Hero Section)" : "Hero Visuals & Copy"}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("featured_units")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "featured_units"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr
            ? `الوحدات الخاصة المميزة (${config.featured_property_ids?.length || 0})`
            : `Featured Special Units (${config.featured_property_ids?.length || 0})`}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sections")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "sections"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "ظهور أقسام الصفحة الرئيسية" : "Homepage Sections Visibility"}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("announcement")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === "announcement"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "شريط الإعلانات الترويجي" : "Announcement Ribbon"}
        </button>
      </div>

      {/* Tab 1: Hero Section Media & Copy */}
      {activeTab === "hero" && (
        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-brand-border/60 pb-4">
            <h2 className="text-base font-serif font-bold text-brand-brown">
              {isAr ? "وسائط ونصوص الواجهة الأساسية (Hero Section)" : "Hero Media & Visual Assets"}
            </h2>
            <p className="text-xs text-brand-brown-muted mt-0.5">
              {isAr
                ? "تحكم في صورة الخلفية والعناوين الرئيسية والفرعية وأزرار الدعوة للإجراء (CTA)."
                : "Manage the hero background, main headlines in Arabic and English, and call-to-action buttons."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hidden File Inputs for Uploads */}
            <input
              type="file"
              ref={videoInputRef}
              accept="video/mp4,video/webm,video/quicktime,video/*"
              className="hidden"
              onChange={handleUploadMainVideo}
            />
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleUploadMainImage}
            />

            {/* Media Mode Selector */}
            <div className="md:col-span-2 p-5 rounded-2xl bg-[#FAF8F5] border border-brand-border/80 space-y-3">
              <label className="text-xs font-bold text-brand-brown block uppercase tracking-wider">
                {isAr ? "نمط وسائط واجهة الهيرو (Hero Media Mode)" : "Hero Display Mode"}
              </label>
              <div className="flex flex-wrap gap-2.5">
                {[
                  {
                    id: "scenes",
                    name_ar: "مشاهد متعددة متحركة (Multi-Scene Slider)",
                    name_en: "Multi-Scene Slider",
                    desc_ar: "عرض عدة مشاهد بالتبادل (صور أو فيديوهات) مع تحكم الزائر في المشهد",
                  },
                  {
                    id: "video",
                    name_ar: "فيديو سينمائي بالخلفية (Background Video)",
                    name_en: "Cinematic Video",
                    desc_ar: "تشغيل فيديو عالي الجودة متكرر في خلفية الواجهة",
                  },
                  {
                    id: "image",
                    name_ar: "صورة مفردة كلاسيكية (Single Image)",
                    name_en: "Single Image",
                    desc_ar: "عرض صورة ثابتة واحدة فائقة الدقة",
                  },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, media_mode: mode.id as any },
                      }))
                    }
                    className={`px-4 py-3 rounded-xl border text-start transition-all cursor-pointer flex-1 min-w-[200px] ${
                      (config.hero.media_mode || "scenes") === mode.id
                        ? "border-brand-terracotta bg-white shadow-sm ring-1 ring-brand-terracotta"
                        : "border-brand-border bg-white/70 hover:bg-white text-brand-brown-muted"
                    }`}
                  >
                    <div className="text-xs font-bold text-brand-brown mb-0.5">
                      {isAr ? mode.name_ar : mode.name_en}
                    </div>
                    <div className="text-[11px] text-brand-brown-muted font-light leading-snug">
                      {mode.desc_ar}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Video Background Configuration */}
            {((config.hero.media_mode === "video") || config.hero.video_url) && (
              <div className="md:col-span-2 p-5 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-brand-brown uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-terracotta" />
                      <span>{isAr ? "الفيديو السينمائي للواجهة (Hero Video Background)" : "Hero Background Video"}</span>
                    </h3>
                    <p className="text-[11px] text-brand-brown-muted">
                      {isAr
                        ? "يمكنك رفع فيديو من جهازك (MP4 / WebM / MOV) أو لصق رابط مباشر للفيديو."
                        : "Upload a video file from your device or paste a direct video stream URL."}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={uploadingMedia === "main_video"}
                    onClick={() => videoInputRef.current?.click()}
                    className="px-4 py-2 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>
                      {uploadingMedia === "main_video"
                        ? (isAr ? "جارٍ الرفع..." : "Uploading...")
                        : (isAr ? "رفع فيديو من جهازك" : "Upload Video File")}
                    </span>
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={config.hero.video_url || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, video_url: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs text-brand-brown bg-white focus:ring-1 focus:ring-brand-terracotta focus:outline-none"
                    placeholder="https://... or /storage/media_design/hero_video.mp4"
                  />
                  {config.hero.video_url && (
                    <div className="relative rounded-xl overflow-hidden border border-brand-border max-w-lg mt-2 bg-black aspect-video">
                      <video
                        src={config.hero.video_url}
                        controls
                        muted
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Multi-Scenes Manager */}
            {(config.hero.media_mode === "scenes" || !config.hero.media_mode) && (
              <div className="md:col-span-2 p-5 rounded-2xl bg-[#FAF8F5] border border-brand-border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border/60 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-brand-brown uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{isAr ? "إدارة مشاهد الهيرو (Hero Scenes Slider)" : "Hero Scenes Manager"}</span>
                    </h3>
                    <p className="text-[11px] text-brand-brown-muted">
                      {isAr
                        ? "أضف عدة مشاهد (صور أو مقاطع فيديو) لتعرض في الواجهة بالتبادل وتتيح للزائر التنقل بين أجواء الجونة."
                        : "Configure multiple scenes (photos or clips) to rotate in the hero and let visitors switch atmospheres."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddScene}
                    className="px-4 py-2 bg-brand-brown hover:bg-brand-brown-dark text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>{isAr ? "+ إضافة مشهد جديد" : "+ Add New Scene"}</span>
                  </button>
                </div>

                {/* Scenes List */}
                <div className="space-y-4">
                  {(config.hero.scenes || []).map((scene, index) => (
                    <div
                      key={scene.id || index}
                      className="p-4 sm:p-5 rounded-2xl bg-white border border-brand-border shadow-xs space-y-3 relative group"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-border/40 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-brand-sand text-brand-brown font-mono text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-xs font-bold text-brand-brown">
                            {isAr ? (scene.name_ar || `مشهد ${index + 1}`) : (scene.name_en || `Scene ${index + 1}`)}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-brand-sand-light text-brand-brown-muted">
                            {scene.media_type === "video" ? "Video" : "Image"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveScene(index, "up")}
                            className="p-1.5 rounded-lg border border-brand-border hover:bg-brand-sand-light text-brand-brown disabled:opacity-30 cursor-pointer"
                            title={isAr ? "تحريك لأعلى" : "Move up"}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={index === (config.hero.scenes?.length || 0) - 1}
                            onClick={() => handleMoveScene(index, "down")}
                            className="p-1.5 rounded-lg border border-brand-border hover:bg-brand-sand-light text-brand-brown disabled:opacity-30 cursor-pointer"
                            title={isAr ? "تحريك لأسفل" : "Move down"}
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveScene(index)}
                            className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition cursor-pointer"
                          >
                            {isAr ? "حذف" : "Remove"}
                          </button>
                        </div>
                      </div>

                      {/* Scene Name and Media Type */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-brand-brown block mb-1">
                            {isAr ? "اسم المشهد (عربي)" : "Scene Name (AR)"}
                          </label>
                          <input
                            type="text"
                            value={scene.name_ar || ""}
                            onChange={(e) => handleUpdateScene(index, { name_ar: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-brand-border text-xs"
                            placeholder="غروب الفلل الذهبي"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-brand-brown block mb-1">
                            {isAr ? "اسم المشهد (إنجليزي)" : "Scene Name (EN)"}
                          </label>
                          <input
                            type="text"
                            value={scene.name_en || ""}
                            onChange={(e) => handleUpdateScene(index, { name_en: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-brand-border text-xs"
                            placeholder="Lagoon Sunset"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-brand-brown block mb-1">
                            {isAr ? "نوع الوسائط" : "Media Type"}
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateScene(index, { media_type: "image" })}
                              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                                scene.media_type === "image"
                                  ? "bg-brand-terracotta text-white border-brand-terracotta"
                                  : "border-brand-border bg-white text-brand-brown-muted"
                              }`}
                            >
                              {isAr ? "صورة" : "Image"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateScene(index, { media_type: "video" })}
                              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                                scene.media_type === "video"
                                  ? "bg-brand-terracotta text-white border-brand-terracotta"
                                  : "border-brand-border bg-white text-brand-brown-muted"
                              }`}
                            >
                              {isAr ? "فيديو" : "Video"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Scene URL and Upload */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-brand-brown block">
                            {scene.media_type === "video"
                              ? (isAr ? "رابط فيديو المشهد" : "Scene Video URL")
                              : (isAr ? "رابط صورة المشهد" : "Scene Image URL")}
                          </label>
                          <label className="cursor-pointer text-xs font-bold text-brand-terracotta hover:underline flex items-center gap-1">
                            <input
                              type="file"
                              accept={scene.media_type === "video" ? "video/*" : "image/*"}
                              className="hidden"
                              onChange={(e) => handleUploadSceneMedia(index, e)}
                            />
                            <span>
                              {uploadingMedia === `scene_${index}`
                                ? (isAr ? "جارٍ الرفع..." : "Uploading...")
                                : (isAr ? "📤 رفع ملف من جهازك" : "📤 Upload File")}
                            </span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={scene.media_type === "video" ? (scene.video_url || "") : (scene.image_url || "")}
                          onChange={(e) =>
                            handleUpdateScene(
                              index,
                              scene.media_type === "video"
                                ? { video_url: e.target.value }
                                : { image_url: e.target.value }
                            )
                          }
                          className="w-full px-3 py-2 rounded-lg border border-brand-border text-xs bg-white"
                          placeholder="https://... or /assets/images/..."
                        />

                        {/* Scene Media Preview */}
                        {scene.media_type === "video" && scene.video_url && (
                          <div className="relative rounded-xl overflow-hidden border border-brand-border max-w-xs mt-2 bg-black aspect-video">
                            <video src={scene.video_url} controls muted className="w-full h-full object-cover" />
                          </div>
                        )}
                        {scene.media_type !== "video" && scene.image_url && (
                          <div className="relative h-28 rounded-xl overflow-hidden border border-brand-border max-w-xs mt-2 bg-brand-sand">
                            <Image src={scene.image_url} alt="Scene preview" fill className="object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Single Background Image URL (Fallback / Mode: image) */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-brand-brown block">
                  {isAr ? "صورة خلفية الواجهة الأساسية (Fallback Background Image)" : "Fallback Background Image"}
                </label>
                <button
                  type="button"
                  disabled={uploadingMedia === "main_image"}
                  onClick={() => imageInputRef.current?.click()}
                  className="text-xs font-bold text-brand-terracotta hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>
                    {uploadingMedia === "main_image"
                      ? (isAr ? "جارٍ الرفع..." : "Uploading...")
                      : (isAr ? "📤 رفع صورة من جهازك" : "📤 Upload Image")}
                  </span>
                </button>
              </div>
              <input
                type="text"
                value={config.hero.background_image}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, background_image: e.target.value },
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/40 focus:ring-1 focus:ring-brand-terracotta focus:outline-none"
                placeholder="/assets/images/hero-villa-dusk.jpg or https://..."
              />
              {config.hero.background_image && (
                <div className="relative h-32 rounded-xl overflow-hidden border border-brand-border max-w-xs mt-2">
                  <Image
                    src={config.hero.background_image}
                    alt="Hero Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            {/* Badge Arabic & English */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-brown block">
                {isAr ? "شارة التميز (عربي)" : "Curated Badge (Arabic)"}
              </label>
              <input
                type="text"
                value={config.hero.badge_ar}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, badge_ar: e.target.value },
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/40 focus:ring-1 focus:ring-brand-terracotta focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-brown block">
                {isAr ? "شارة التميز (إنجليزي)" : "Curated Badge (English)"}
              </label>
              <input
                type="text"
                value={config.hero.badge_en}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, badge_en: e.target.value },
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/40 focus:ring-1 focus:ring-brand-terracotta focus:outline-none"
              />
            </div>

            {/* Title Line 1 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-brown block">
                {isAr ? "العنوان الرئيسي - السطر الأول (عربي)" : "Main Headline - Line 1 (Arabic)"}
              </label>
              <input
                type="text"
                value={config.hero.title_line1_ar}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, title_line1_ar: e.target.value },
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/40 focus:ring-1 focus:ring-brand-terracotta focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-brown block">
                {isAr ? "العنوان الرئيسي - السطر الأول (إنجليزي)" : "Main Headline - Line 1 (English)"}
              </label>
              <input
                type="text"
                value={config.hero.title_line1_en}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, title_line1_en: e.target.value },
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/40 focus:ring-1 focus:ring-brand-terracotta focus:outline-none"
              />
            </div>

            {/* Title Line 2 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-brown block">
                {isAr ? "العنوان الرئيسي - السطر الثاني (عربي)" : "Main Headline - Line 2 (Arabic)"}
              </label>
              <input
                type="text"
                value={config.hero.title_line2_ar}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, title_line2_ar: e.target.value },
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/40 focus:ring-1 focus:ring-brand-terracotta focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-brown block">
                {isAr ? "العنوان الرئيسي - السطر الثاني (إنجليزي)" : "Main Headline - Line 2 (English)"}
              </label>
              <input
                type="text"
                value={config.hero.title_line2_en}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, title_line2_en: e.target.value },
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/40 focus:ring-1 focus:ring-brand-terracotta focus:outline-none"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-brown block">
                {isAr ? "الوصف الترحيبي (عربي)" : "Hero Subtitle (Arabic)"}
              </label>
              <textarea
                rows={3}
                value={config.hero.subtitle_ar}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, subtitle_ar: e.target.value },
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/40 focus:ring-1 focus:ring-brand-terracotta focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-brown block">
                {isAr ? "الوصف الترحيبي (إنجليزي)" : "Hero Subtitle (English)"}
              </label>
              <textarea
                rows={3}
                value={config.hero.subtitle_en}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, subtitle_en: e.target.value },
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/40 focus:ring-1 focus:ring-brand-terracotta focus:outline-none"
              />
            </div>

            {/* Primary CTA */}
            <div className="p-4 rounded-2xl bg-brand-sand-light/30 border border-brand-border space-y-3">
              <span className="text-xs font-bold text-brand-terracotta block uppercase tracking-wider">
                {isAr ? "الزر الرئيسي الأول (Primary CTA)" : "Primary Action Button"}
              </span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder={isAr ? "النص بالعربية" : "Text (AR)"}
                  value={config.hero.cta1_text_ar}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, cta1_text_ar: e.target.value },
                    }))
                  }
                  className="px-3 py-2 rounded-lg border border-brand-border text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder={isAr ? "النص بالإنجليزية" : "Text (EN)"}
                  value={config.hero.cta1_text_en}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, cta1_text_en: e.target.value },
                    }))
                  }
                  className="px-3 py-2 rounded-lg border border-brand-border text-xs bg-white"
                />
              </div>
              <input
                type="text"
                placeholder={isAr ? "الرابط (مثال: #stays أو /stays)" : "Link destination (e.g. #stays)"}
                value={config.hero.cta1_link}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, cta1_link: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-brand-border text-xs bg-white"
              />
            </div>

            {/* Secondary CTA */}
            <div className="p-4 rounded-2xl bg-brand-sand-light/30 border border-brand-border space-y-3">
              <span className="text-xs font-bold text-brand-brown-muted block uppercase tracking-wider">
                {isAr ? "الزر الثانوي الثاني (Secondary CTA)" : "Secondary Action Button"}
              </span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder={isAr ? "النص بالعربية" : "Text (AR)"}
                  value={config.hero.cta2_text_ar}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, cta2_text_ar: e.target.value },
                    }))
                  }
                  className="px-3 py-2 rounded-lg border border-brand-border text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder={isAr ? "النص بالإنجليزية" : "Text (EN)"}
                  value={config.hero.cta2_text_en}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, cta2_text_en: e.target.value },
                    }))
                  }
                  className="px-3 py-2 rounded-lg border border-brand-border text-xs bg-white"
                />
              </div>
              <input
                type="text"
                placeholder={isAr ? "الرابط (مثال: #experiences)" : "Link destination (e.g. #experiences)"}
                value={config.hero.cta2_link}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, cta2_link: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-brand-border text-xs bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Featured Special Units on Homepage */}
      {activeTab === "featured_units" && (
        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-brand-border/60 pb-4">
            <h2 className="text-base font-serif font-bold text-brand-brown">
              {isAr ? "الوحدات الخاصة المميزة المعروضة في الصفحة الرئيسية" : "Featured Special Units on Homepage"}
            </h2>
            <p className="text-xs text-brand-brown-muted mt-0.5">
              {isAr
                ? "حدد الفلل والشقق الخاصة التي ترغب في إبرازها للعميل في واجهة العرض الرئيسية للمنصة."
                : "Select which luxury villas and chalets should be pinned and featured prominently in the landing showcase."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableProperties.map((prop) => {
              const isFeatured = (config.featured_property_ids || []).includes(prop.id);
              const title = isAr && prop.title_ar ? prop.title_ar : prop.title_en;

              return (
                <div
                  key={prop.id}
                  onClick={() => toggleFeaturedProperty(prop.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isFeatured
                      ? "bg-brand-sand-light/60 border-brand-terracotta shadow-xs ring-1 ring-brand-terracotta/40"
                      : "bg-white border-brand-border hover:bg-brand-sand-light/20"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-brand-brown">
                        {prop.reference_number}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          prop.listing_type === "rent"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-purple-50 text-purple-700"
                        }`}
                      >
                        {prop.listing_type === "rent" ? (isAr ? "إيجار" : "Rent") : (isAr ? "بيع" : "Sale")}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-brand-brown block line-clamp-1">
                      {title}
                    </span>
                    <span className="text-[10px] text-brand-brown-muted block">
                      {prop.is_published
                        ? (isAr ? "معروض ونشط" : "Active & Displayed")
                        : (isAr ? "متوقف عن العرض" : "Paused")}
                    </span>
                  </div>

                  <div className="shrink-0">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isFeatured
                          ? "bg-brand-terracotta text-white shadow-xs"
                          : "border-2 border-brand-border text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Homepage Sections Visibility */}
      {activeTab === "sections" && (
        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-brand-border/60 pb-4">
            <h2 className="text-base font-serif font-bold text-brand-brown">
              {isAr ? "التحكم في ظهور واختفاء أقسام الصفحة الرئيسية" : "Homepage Sections Visibility Controller"}
            </h2>
            <p className="text-xs text-brand-brown-muted mt-0.5">
              {isAr
                ? "يمكنك إظهار أو إخفاء أي قسم من أقسام الموقع الرئيسية لجميع الزوار بضغطة زر واحدة."
                : "Toggle each homepage ecosystem block on or off in real-time."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: "hero",
                labelAr: "الواجهة الأساسية وشريط البحث (Hero & Booking Engine)",
                labelEn: "Hero Showcase & Luxury Search Engine",
              },
              {
                key: "pillars",
                labelAr: "ركائز الهوية ونمط حياة الجونة (Brand Ecosystem Pillars)",
                labelEn: "Core Brand Narrative & Ecosystem Pillars",
              },
              {
                key: "vacation_rentals",
                labelAr: "إقامات وفلل الإيجار المميزة (Featured Vacation Rentals)",
                labelEn: "Featured Vacation Rentals Showcase",
              },
              {
                key: "experiences",
                labelAr: "رحلات اليخوت وتجارب جزيرة طوّيلة (Curated Experiences)",
                labelEn: "Curated Yacht Charters & Red Sea Expeditions",
              },
              {
                key: "diving",
                labelAr: "عالم الأعماق والغوص البحري (The Deep: Marine & Diving)",
                labelEn: "Marine Expeditions & Scuba Diving Showcase",
              },
              {
                key: "sales",
                labelAr: "عقارات وقصور التملك والبيع (Real Estate Sales)",
                labelEn: "Luxury Real Estate & Signature Estates For Sale",
              },
              {
                key: "testimonials",
                labelAr: "آراء وتجارب كبار النزلاء (Guest Testimonials)",
                labelEn: "Guest Social Proof & Testimonials",
              },
              {
                key: "events",
                labelAr: "الفعاليات وحفلات المارينا (What's On & Events)",
                labelEn: "Marina Events & Seasonal Gatherings",
              },
              {
                key: "concierge",
                labelAr: "طلب ترتيبات الكونسيرج الخاص (VIP Concierge Form)",
                labelEn: "Personal Concierge & Bespoke Request Form",
              },
              {
                key: "faq",
                labelAr: "الأسئلة الشائعة للنزلاء (Frequently Asked Questions)",
                labelEn: "Guest FAQ & Helpful Guidelines",
              },
            ].map((section) => {
              const secKey = section.key as keyof MediaDesignConfig["sections"];
              const isVisible = config.sections?.[secKey] ?? true;

              return (
                <div
                  key={section.key}
                  onClick={() => toggleSection(secKey)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isVisible
                      ? "bg-emerald-50/20 border-emerald-200"
                      : "bg-brand-sand-light/40 border-brand-border opacity-70"
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-brand-brown block">
                      {isAr ? section.labelAr : section.labelEn}
                    </span>
                    <span className="text-[10px] text-brand-brown-muted">
                      {isVisible
                        ? (isAr ? "مفعّل ومعروض للجمهور" : "Visible on Landing")
                        : (isAr ? "مخفي مؤقتاً" : "Hidden")}
                    </span>
                  </div>

                  <div
                    className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                      isVisible ? "bg-emerald-600 justify-end" : "bg-neutral-300 justify-start"
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Announcement Ribbon */}
      {activeTab === "announcement" && (
        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-brand-border/60 pb-4">
            <h2 className="text-base font-serif font-bold text-brand-brown">
              {isAr ? "شريط الإعلانات الترويجي العلوي (Announcement Ribbon)" : "Top Promotional Announcement Ribbon"}
            </h2>
            <p className="text-xs text-brand-brown-muted mt-0.5">
              {isAr
                ? "شريط يظهر في أعلى الموقع للإعلان عن المواسم أو العروض الحصرية أو افتتاح الحجوزات الخاصة."
                : "A prominent top ribbon for seasonal announcements or exclusive booking openings."}
            </p>
          </div>

          <div className="space-y-4 max-w-2xl">
            <div
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  announcement: {
                    ...prev.announcement,
                    enabled: !prev.announcement.enabled,
                  },
                }))
              }
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                config.announcement.enabled
                  ? "bg-emerald-50/30 border-emerald-200"
                  : "bg-brand-sand-light/30 border-brand-border"
              }`}
            >
              <div>
                <span className="text-xs font-bold text-brand-brown block">
                  {isAr ? "تفعيل شريط الإعلانات" : "Enable Announcement Ribbon"}
                </span>
                <span className="text-[10px] text-brand-brown-muted">
                  {config.announcement.enabled
                    ? (isAr ? "الشريط معروض في أعلى الصفحة" : "Banner is currently active")
                    : (isAr ? "الشريط معطل" : "Banner is hidden")}
                </span>
              </div>
              <div
                className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                  config.announcement.enabled ? "bg-emerald-600 justify-end" : "bg-neutral-300 justify-start"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-brown block">
                {isAr ? "نص الإعلان (عربي)" : "Announcement Text (Arabic)"}
              </label>
              <input
                type="text"
                value={config.announcement.text_ar}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    announcement: { ...prev.announcement, text_ar: e.target.value },
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/40 focus:ring-1 focus:ring-brand-terracotta focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-brown block">
                {isAr ? "نص الإعلان (إنجليزي)" : "Announcement Text (English)"}
              </label>
              <input
                type="text"
                value={config.announcement.text_en}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    announcement: { ...prev.announcement, text_en: e.target.value },
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/40 focus:ring-1 focus:ring-brand-terracotta focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-brown block">
                {isAr ? "رابط التوجيه (اختياري)" : "Target Destination Link (Optional)"}
              </label>
              <input
                type="text"
                placeholder="/events or /stays"
                value={config.announcement.link}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    announcement: { ...prev.announcement, link: e.target.value },
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/40 focus:ring-1 focus:ring-brand-terracotta focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
