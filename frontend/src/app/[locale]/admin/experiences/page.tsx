"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import SafeImage from "@/components/ui/SafeImage";
import {
  getAdminExperiences,
  getExperienceTaxonomies,
  createAdminExperience,
  updateAdminExperience,
  deleteAdminExperience,
  toggleAdminExperienceStatus,
  AdminExperienceItem,
} from "@/features/experiences/services/experiences.api";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";

interface FormDataState {
  id?: number;
  title_en: string;
  title_ar: string;
  experience_category_id: number | "";
  location_id: number | "";
  pricing_model: "per_group" | "per_person" | "fixed";
  base_price: string;
  duration: string;
  max_capacity: number;
  meeting_point_en: string;
  meeting_point_ar: string;
  short_description_en: string;
  short_description_ar: string;
  description_en: string;
  description_ar: string;
  image_url: string;
  status: "published" | "draft";
  is_featured: boolean;
}

const INITIAL_FORM: FormDataState = {
  title_en: "",
  title_ar: "",
  experience_category_id: "",
  location_id: "",
  pricing_model: "per_group",
  base_price: "",
  duration: "Full Day (8 Hours)",
  max_capacity: 10,
  meeting_point_en: "Abu Tig Marina, El Gouna",
  meeting_point_ar: "مارينا أبو تيج، الجونة",
  short_description_en: "",
  short_description_ar: "",
  description_en: "",
  description_ar: "",
  image_url: "/assets/images/tawila-yacht.jpg",
  status: "published",
  is_featured: true,
};

export default function AdminExperiencesPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [experiences, setExperiences] = useState<AdminExperienceItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminExperienceItem | null>(null);
  const [form, setForm] = useState<FormDataState>(INITIAL_FORM);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [, startTransition] = useTransition();

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [resExp, resTax] = await Promise.all([
        getAdminExperiences({
          q: searchQuery || undefined,
          category_id: selectedCategory ? Number(selectedCategory) : undefined,
          status: selectedStatus !== "all" ? selectedStatus : undefined,
        }),
        getExperienceTaxonomies(),
      ]);

      if (resExp && resExp.data) {
        setExperiences(resExp.data);
      }
      if (resTax) {
        setCategories(resTax.categories || []);
        setLocations(resTax.locations || []);
      }
    } catch (err: any) {
      console.error("Failed to load experiences data:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({
      ...INITIAL_FORM,
      experience_category_id: categories.length > 0 ? categories[0].id : "",
      location_id: locations.length > 0 ? locations[0].id : "",
    });
    setErrorMessage("");
    setModalOpen(true);
  };

  const handleOpenEdit = (item: AdminExperienceItem) => {
    setEditingItem(item);
    setForm({
      id: item.id,
      title_en: item.title_en || "",
      title_ar: item.title_ar || "",
      experience_category_id: item.experience_category_id || "",
      location_id: item.location_id || "",
      pricing_model: (item.pricing_model as any) || "per_group",
      base_price: String(item.base_price_cents ? item.base_price_cents / 100 : ""),
      duration: item.duration || "Full Day",
      max_capacity: item.max_capacity || 10,
      meeting_point_en: item.meeting_point_en || "",
      meeting_point_ar: item.meeting_point_ar || "",
      short_description_en: item.short_description_en || "",
      short_description_ar: item.short_description_ar || "",
      description_en: item.description_en || "",
      description_ar: item.description_ar || "",
      image_url: item.cover_url || (item.media && item.media[0] ? item.media[0].file_path : "/assets/images/tawila-yacht.jpg"),
      status: item.status === "draft" ? "draft" : "published",
      is_featured: !!item.is_featured,
    });
    setErrorMessage("");
    setModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setFormSubmitting(true);

    try {
      const payload: any = {
        title_en: form.title_en,
        title_ar: form.title_ar || null,
        experience_category_id: Number(form.experience_category_id),
        location_id: form.location_id ? Number(form.location_id) : null,
        pricing_model: form.pricing_model,
        base_price: Number(form.base_price) || 0,
        duration: form.duration,
        max_capacity: Number(form.max_capacity) || 1,
        meeting_point_en: form.meeting_point_en || null,
        meeting_point_ar: form.meeting_point_ar || null,
        short_description_en: form.short_description_en || null,
        short_description_ar: form.short_description_ar || null,
        description_en: form.description_en || null,
        description_ar: form.description_ar || null,
        image_url: form.image_url || null,
        status: form.status,
        is_published: form.status === "published",
        is_featured: form.is_featured,
      };

      if (editingItem) {
        await updateAdminExperience(editingItem.id, payload);
        setSuccessMessage(isAr ? "تم تحديث بيانات التجربة بنجاح" : "Experience updated successfully");
      } else {
        await createAdminExperience(payload);
        setSuccessMessage(isAr ? "تم إضافة التجربة ونشرها بنجاح" : "Experience created and published successfully");
      }

      setModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || (isAr ? "فشل حفظ البيانات. يرجى التحقق من الحقول" : "Failed to save data. Please check fields."));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: AdminExperienceItem) => {
    try {
      await toggleAdminExperienceStatus(item.id);
      loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to toggle status");
    }
  };

  const handleDelete = async (item: AdminExperienceItem) => {
    const confirmMsg = isAr
      ? `هل أنت متأكد من رغبتك في أرشفة/حذف التجربة "${item.title_en}"؟`
      : `Are you sure you want to archive/delete "${item.title_en}"?`;

    if (window.confirm(confirmMsg)) {
      try {
        await deleteAdminExperience(item.id);
        loadData();
      } catch (err: any) {
        alert(err?.message || "Failed to delete experience");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-brown">
            {isAr ? "إدارة اليخوت والرحلات والتجارب" : "Experiences & Yacht Charters"}
          </h1>
          <p className="text-xs text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "إدارة رحلات اليخوت الخاصة، الكايت سيرف، وسفاري الصحراء. أي تجربة منشورة تظهر فوراً في الواجهة الرئيسية وصفحة التجارب."
              : "Manage yacht charters, desert safaris, and water sports. Published items appear immediately across the platform."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-xs flex items-center justify-center cursor-pointer"
          >
            <span>{isAr ? "+ إضافة يخت / رحلة جديدة" : "+ Add Experience / Yacht"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <span>✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "بحث بالاسم أو الكلمة المفتاحية..." : "Search by title or keyword..."}
              className="w-full px-3.5 py-2 text-xs border border-brand-border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-brand-terracotta"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : "")}
            aria-label={isAr ? "فلترة حسب التصنيف" : "Filter by category"}
            className="px-3 py-2 text-xs border border-brand-border rounded-xl bg-white text-brand-brown focus:outline-hidden"
          >
            <option value="">{isAr ? "جميع التصنيفات" : "All Categories"}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {isAr && c.name_ar ? c.name_ar : c.name_en}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label={isAr ? "فلترة حسب الحالة" : "Filter by status"}
            className="px-3 py-2 text-xs border border-brand-border rounded-xl bg-white text-brand-brown focus:outline-hidden"
          >
            <option value="all">{isAr ? "كل الحالات" : "All Statuses"}</option>
            <option value="published">{isAr ? "منشور ونشط" : "Published"}</option>
            <option value="draft">{isAr ? "مسودة" : "Draft"}</option>
          </select>
        </div>

        <div className="text-xs text-brand-brown-muted font-medium">
          {isAr ? `إجمالي النتائج: ${experiences.length}` : `Total: ${experiences.length}`}
        </div>
      </div>

      {/* Experiences Table */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingState message={isAr ? "جارٍ تحميل قائمة التجارب واليخوت..." : "Loading experiences..."} />
          </div>
        ) : experiences.length === 0 ? (
          <div className="p-12 text-center text-brand-brown-muted space-y-3">
            <div className="text-3xl">🛥️</div>
            <p className="font-serif text-base text-brand-brown font-semibold">
              {isAr ? "لا توجد تجارب تطابق البحث" : "No experiences found"}
            </p>
            <p className="text-xs font-light">
              {isAr
                ? "يمكنك إضافة يخت جديد أو رحلة بحرية بالضغط على زر الإضافة أعلاه."
                : "You can add a new yacht charter or trip using the button above."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto gounow-scrollbar">
            <table className="w-full text-start text-xs">
              <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-semibold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4 text-start">{isAr ? "التجربة / اليخت" : "Experience / Yacht"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "التصنيف" : "Category"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "الموقع" : "Location"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "المدة والسعة" : "Duration & Capacity"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "السعر الأساسي" : "Base Price"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "الحالة في الفرونت" : "Frontend Status"}</th>
                  <th className="py-3 px-4 text-end">{isAr ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {experiences.map((exp) => {
                  const cover =
                    exp.cover_url ||
                    (exp.media && exp.media.length > 0 ? exp.media[0].file_path : "/assets/images/tawila-yacht.jpg");

                  return (
                    <tr key={exp.id} className="hover:bg-brand-sand-light/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl overflow-hidden bg-brand-sand relative shrink-0 border border-brand-border">
                            <Image
                              src={cover}
                              alt={exp.title_en}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <Link
                              href={`/experiences/${exp.slug}`}
                              target="_blank"
                              className="font-bold text-brand-brown hover:text-brand-terracotta line-clamp-1 max-w-[200px]"
                            >
                              {isAr && exp.title_ar ? exp.title_ar : exp.title_en}
                            </Link>
                            <span className="text-[10px] text-brand-brown-muted block">
                              {exp.meeting_point_en || "Abu Tig Marina"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-sand-light text-brand-brown">
                          {isAr && exp.category?.name_ar ? exp.category.name_ar : exp.category?.name_en || "Adventures"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-brand-brown font-medium">
                        {isAr && exp.location?.name_ar ? exp.location.name_ar : exp.location?.name_en || "El Gouna"}
                      </td>
                      <td className="py-3.5 px-4 text-brand-brown-muted">
                        <div>{exp.duration}</div>
                        <div className="text-[10px] font-mono">
                          {isAr ? `حد أقصى ${exp.max_capacity} ضيوف` : `Max ${exp.max_capacity} Guests`}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-brand-brown">
                        {((exp.base_price_cents || 0) / 100).toLocaleString()}{" "}
                        <span className="text-[10px] font-normal text-brand-brown-muted">
                          EGP {exp.pricing_model === "per_person" ? "/ person" : "/ charter"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(exp)}
                          title={isAr ? "اضغط لتبديل حالة النشر في الموقع" : "Click to toggle frontend publication"}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                            exp.is_published && exp.status === "published"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              exp.is_published && exp.status === "published" ? "bg-emerald-600" : "bg-amber-600"
                            }`}
                          />
                          <span>
                            {exp.is_published && exp.status === "published"
                              ? isAr
                                ? "منشور وظاهر"
                                : "Published"
                              : isAr
                              ? "مسودة (مخفي)"
                              : "Draft"}
                          </span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/experiences/${exp.slug}`}
                            target="_blank"
                            className="px-2.5 py-1 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-lg text-[11px] font-medium border border-brand-border"
                          >
                            {isAr ? "معاينة" : "View"}
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(exp)}
                            className="px-2.5 py-1 bg-white hover:bg-brand-sand-light text-brand-brown rounded-lg text-[11px] font-medium border border-brand-border cursor-pointer"
                          >
                            {isAr ? "تعديل" : "Edit"}
                          </button>
                          <button
                            onClick={() => handleDelete(exp)}
                            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg text-[11px] font-medium border border-red-200 cursor-pointer"
                          >
                            {isAr ? "حذف" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-brand-border shadow-xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-brand-brown">
                  {editingItem
                    ? isAr
                      ? "تعديل بيانات التجربة / اليخت"
                      : "Edit Experience / Yacht"
                    : isAr
                    ? "إضافة يخت أو تجربة جديدة"
                    : "Add New Experience / Yacht"}
                </h2>
                <p className="text-xs text-brand-brown-muted mt-0.5">
                  {isAr
                    ? "أدخل تفاصيل اليخت أو الرحلة لتظهر فورياً للمستخدمين في واجهة الموقع."
                    : "Fill in details to publish this experience live on the frontend."}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full border border-brand-border flex items-center justify-center text-brand-brown-muted hover:bg-brand-sand-light cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-brown mb-1">
                    {isAr ? "اسم التجربة / اليخت (بالإنجليزية) *" : "Title (English) *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title_en}
                    onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                    placeholder="e.g. Luxury 52ft Italian Yacht to Tawila"
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-brown mb-1">
                    {isAr ? "الاسم (بالعربية)" : "Title (Arabic)"}
                  </label>
                  <input
                    type="text"
                    value={form.title_ar}
                    onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
                    placeholder="مثال: يخت إيطالي فاخر 52 قدم إلى جزيرة طويلة"
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>
              </div>

              {/* Category & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-brown mb-1">
                    {isAr ? "التصنيف *" : "Category *"}
                  </label>
                  <select
                    required
                    value={form.experience_category_id}
                    onChange={(e) => setForm({ ...form, experience_category_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl bg-white focus:ring-1 focus:ring-brand-terracotta"
                  >
                    <option value="">{isAr ? "اختر التصنيف..." : "Select category..."}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isAr && c.name_ar ? c.name_ar : c.name_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-brown mb-1">
                    {isAr ? "الموقع الجغرافي" : "Location"}
                  </label>
                  <select
                    value={form.location_id}
                    onChange={(e) => setForm({ ...form, location_id: e.target.value ? Number(e.target.value) : "" })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl bg-white focus:ring-1 focus:ring-brand-terracotta"
                  >
                    <option value="">{isAr ? "مارينا أبو تيج (افتراضي)" : "Abu Tig Marina (Default)"}</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {isAr && loc.name_ar ? loc.name_ar : loc.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Pricing Model */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-brown mb-1">
                    {isAr ? "السعر (بالجنيه EGP) *" : "Price (EGP) *"}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={form.base_price}
                    onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                    placeholder="35000"
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-brown mb-1">
                    {isAr ? "طريقة التسعير" : "Pricing Model"}
                  </label>
                  <select
                    value={form.pricing_model}
                    onChange={(e) => setForm({ ...form, pricing_model: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl bg-white focus:ring-1 focus:ring-brand-terracotta"
                  >
                    <option value="per_group">{isAr ? "لكل رحلة / مجموعة (Charter)" : "Per Group / Charter"}</option>
                    <option value="per_person">{isAr ? "لكل شخص (Per Person)" : "Per Person"}</option>
                    <option value="fixed">{isAr ? "سعر ثابت (Fixed)" : "Fixed"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-brown mb-1">
                    {isAr ? "أقصى عدد ضيوف" : "Max Capacity"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.max_capacity}
                    onChange={(e) => setForm({ ...form, max_capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>
              </div>

              {/* Duration & Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-brown mb-1">
                    {isAr ? "المدة الزمنية" : "Duration"}
                  </label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="e.g. 7 Hours (09:00 - 16:00)"
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-brown mb-1">
                    {isAr ? "رابط الصورة (Image URL / Path)" : "Image URL / Path"}
                  </label>
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="/assets/images/tawila-yacht.jpg"
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>
              </div>

              {/* Short Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-brown mb-1">
                    {isAr ? "وصف مختصر (بالإنجليزية)" : "Short Description (EN)"}
                  </label>
                  <textarea
                    rows={2}
                    value={form.short_description_en}
                    onChange={(e) => setForm({ ...form, short_description_en: e.target.value })}
                    placeholder="Full-day voyage aboard luxury yacht with chef lunch and reef snorkeling..."
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-brown mb-1">
                    {isAr ? "وصف مختصر (بالعربية)" : "Short Description (AR)"}
                  </label>
                  <textarea
                    rows={2}
                    value={form.short_description_ar}
                    onChange={(e) => setForm({ ...form, short_description_ar: e.target.value })}
                    placeholder="يوم كامل على متن يخت فاخر مع غداء بحري طازج وسنوركلينج..."
                    className="w-full px-3 py-2 text-xs border border-brand-border rounded-xl focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>
              </div>

              {/* Status and Featured Switches */}
              <div className="flex flex-wrap items-center justify-between p-3.5 bg-brand-sand-light/50 rounded-2xl border border-brand-border gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="status_published"
                    checked={form.status === "published"}
                    onChange={(e) => setForm({ ...form, status: e.target.checked ? "published" : "draft" })}
                    className="w-4 h-4 text-brand-terracotta rounded"
                  />
                  <label htmlFor="status_published" className="text-xs font-bold text-brand-brown cursor-pointer">
                    {isAr ? "نشر مباشر في واجهة الموقع (Published)" : "Publish live on Frontend"}
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="w-4 h-4 text-brand-terracotta rounded"
                  />
                  <label htmlFor="is_featured" className="text-xs font-bold text-brand-brown cursor-pointer">
                    {isAr ? "عرض في الصفحة الرئيسية (Featured)" : "Feature on Homepage"}
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-brand-border text-brand-brown rounded-xl text-xs font-medium hover:bg-brand-sand-light cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {formSubmitting
                    ? isAr
                      ? "جاري الحفظ..."
                      : "Saving..."
                    : editingItem
                    ? isAr
                      ? "حفظ التعديلات"
                      : "Save Changes"
                    : isAr
                    ? "نشر التجربة الآن"
                    : "Publish Experience"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
