"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  getAdminPropertyUnitDetails,
  updateAdminPropertyUnit,
  deleteAdminPropertyUnit,
  togglePropertyStatus,
  getPropertyCalendar,
  addPropertyAvailabilityBlock,
  removePropertyAvailabilityBlock,
  addPropertySeasonalPrice,
  removePropertySeasonalPrice,
} from "@/features/admin/services/admin.api";
import type { AdminPropertyUnitDetail, PropertyCalendarResponse } from "@/features/admin/types";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PermissionGuard from "@/components/ui/PermissionGuard";

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
    unitId: string;
  }>;
}

export default function AdminPropertyUnitDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const propertyId = parseInt(resolvedParams.id, 10);
  const unitId = parseInt(resolvedParams.unitId, 10);

  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const router = useRouter();

  const [unit, setUnit] = useState<AdminPropertyUnitDetail | null>(null);
  const [calendarData, setCalendarData] = useState<PropertyCalendarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "availability" | "pricing" | "amenities" | "media" | "bookings">("overview");

  // Edit Unit Form State
  const [unitForm, setUnitForm] = useState({
    unit_number: "",
    title_en: "",
    title_ar: "",
    view: "Lagoon View",
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    area_sqm: "" as number | "",
    base_price: "",
    status: "published" as "published" | "draft",
  });
  const [unitSaving, setUnitSaving] = useState(false);

  // Availability Block Form State
  const [blockForm, setBlockForm] = useState({
    start_date: "",
    end_date: "",
    status: "blocked" as "blocked" | "maintenance" | "owner_use",
    reason: "",
  });
  const [blockSubmitting, setBlockSubmitting] = useState(false);

  // Seasonal Price Form State
  const [seasonForm, setSeasonForm] = useState({
    name_en: "",
    name_ar: "",
    start_date: "",
    end_date: "",
    price_cents: 0,
    priority: 1,
    min_stay_nights: 1,
  });
  const [seasonSubmitting, setSeasonSubmitting] = useState(false);

  // Deletion & Visibility
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchUnit = async () => {
    setLoading(true);
    try {
      const res = await getAdminPropertyUnitDetails(propertyId, unitId);
      const data = res.data;
      setUnit(data);
      setUnitForm({
        unit_number: data.unit_number || "",
        title_en: data.title_en || "",
        title_ar: data.title_ar || "",
        view: data.view || "Lagoon View",
        bedrooms: data.bedrooms || 1,
        bathrooms: data.bathrooms || 1,
        max_guests: data.max_guests || 2,
        area_sqm: data.area_sqm || "",
        base_price: data.base_price_cents ? (data.base_price_cents / 100).toString() : "",
        status: data.is_published ? "published" : "draft",
      });

      // Also fetch calendar for this specific unit
      const cal = await getPropertyCalendar(unitId, new Date().getFullYear());
      setCalendarData(cal);
    } catch {
      setUnit(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(propertyId) && !isNaN(unitId)) {
      fetchUnit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, unitId]);

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit) return;
    setUnitSaving(true);
    setFeedback(null);
    try {
      const priceCents = Math.round(parseFloat(unitForm.base_price || "0") * 100);
      const res = await updateAdminPropertyUnit(propertyId, unitId, {
        unit_number: unitForm.unit_number,
        title_en: unitForm.title_en,
        title_ar: unitForm.title_ar || undefined,
        view: unitForm.view,
        bedrooms: Number(unitForm.bedrooms),
        bathrooms: Number(unitForm.bathrooms),
        max_guests: Number(unitForm.max_guests),
        area_sqm: unitForm.area_sqm ? Number(unitForm.area_sqm) : undefined,
        base_price_cents: priceCents,
        status: unitForm.status,
      });

      setUnit(res.data);
      setFeedback({
        type: "success",
        message: isAr ? "تم حفظ بيانات وتفاصيل الوحدة بنجاح!" : "Sub-unit details updated successfully!",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر حفظ تعديلات الوحدة." : "Failed to update sub-unit."),
      });
    } finally {
      setUnitSaving(false);
    }
  };

  const handleToggleVisibility = async () => {
    if (!unit) return;
    setToggleLoading(true);
    setFeedback(null);
    try {
      const res = await togglePropertyStatus(unit.id);
      setUnit((prev: any) => ({
        ...prev,
        is_published: res.data.is_published,
        status: res.data.status,
      }));
      setUnitForm((prev) => ({
        ...prev,
        status: res.data.is_published ? "published" : "draft",
      }));
      setFeedback({
        type: "success",
        message: res.message || (isAr ? "تم تحديث حالة الظهور بنجاح." : "Visibility updated successfully."),
      });
    } catch {
      setFeedback({
        type: "error",
        message: isAr ? "تعذر تغيير حالة الظهور." : "Failed to toggle visibility.",
      });
    } finally {
      setToggleLoading(false);
    }
  };

  const handleDeleteUnit = async () => {
    if (!unit) return;
    setDeleteLoading(true);
    try {
      await deleteAdminPropertyUnit(propertyId, unit.id);
      router.push(`/admin/properties/${propertyId}?tab=units`);
    } catch (err: any) {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر حذف الوحدة لوجود حجوزات نشطة." : "Cannot delete unit with active bookings."),
      });
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockForm.start_date || !blockForm.end_date || !unit) return;
    setBlockSubmitting(true);
    setFeedback(null);
    try {
      const res = await addPropertyAvailabilityBlock(unit.id, blockForm);
      setFeedback({
        type: "success",
        message: res.message || (isAr ? "تم حظر الفترة الزمنية لهذه الوحدة بنجاح." : "Dates blocked successfully for this unit."),
      });
      setBlockForm({ start_date: "", end_date: "", status: "blocked", reason: "" });
      const cal = await getPropertyCalendar(unit.id, new Date().getFullYear());
      setCalendarData(cal);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر حظر التواريخ لوجود تعارض." : "Failed to block dates."),
      });
    } finally {
      setBlockSubmitting(false);
    }
  };

  const handleRemoveBlock = async (blockId: number) => {
    if (!unit) return;
    setFeedback(null);
    try {
      await removePropertyAvailabilityBlock(unit.id, blockId);
      setFeedback({
        type: "success",
        message: isAr ? "تم تحرير الفترة الزمنية المحظورة بنجاح." : "Block removed successfully.",
      });
      const cal = await getPropertyCalendar(unit.id, new Date().getFullYear());
      setCalendarData(cal);
    } catch {
      setFeedback({
        type: "error",
        message: isAr ? "تعذر إزالة الحظر." : "Failed to remove block.",
      });
    }
  };

  const handleAddSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seasonForm.name_en || !seasonForm.start_date || !seasonForm.end_date || !unit) return;
    setSeasonSubmitting(true);
    setFeedback(null);
    try {
      const res = await addPropertySeasonalPrice(unit.id, seasonForm);
      setFeedback({
        type: "success",
        message: res.message || (isAr ? "تمت إضافة قاعدة السعر الموسمي للوحدة بنجاح." : "Seasonal rate added successfully for this unit."),
      });
      setSeasonForm({
        name_en: "",
        name_ar: "",
        start_date: "",
        end_date: "",
        price_cents: 0,
        priority: 1,
        min_stay_nights: 1,
      });
      const cal = await getPropertyCalendar(unit.id, new Date().getFullYear());
      setCalendarData(cal);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر حفظ قاعدة السعر." : "Failed to save seasonal rate."),
      });
    } finally {
      setSeasonSubmitting(false);
    }
  };

  const handleRemoveSeason = async (seasonId: number) => {
    if (!unit) return;
    setFeedback(null);
    try {
      await removePropertySeasonalPrice(unit.id, seasonId);
      setFeedback({
        type: "success",
        message: isAr ? "تم حذف قاعدة السعر بنجاح." : "Seasonal rate removed successfully.",
      });
      const cal = await getPropertyCalendar(unit.id, new Date().getFullYear());
      setCalendarData(cal);
    } catch {
      setFeedback({
        type: "error",
        message: isAr ? "تعذر حذف قاعدة السعر." : "Failed to remove seasonal price.",
      });
    }
  };

  if (loading) {
    return <LoadingState message={isAr ? "جاري تحميل تفاصيل الوحدة..." : "Loading sub-unit details..."} />;
  }

  if (!unit) {
    return (
      <EmptyState
        title={isAr ? "الوحدة غير موجودة" : "Sub-Unit Not Found"}
        description={isAr ? "لم يتم العثور على الوحدة المطلوبة أو قد تكون حذفت." : "The requested unit was not found or has been deleted."}
        actionLabel={isAr ? "العودة للعقار الرئيسي" : "Back to Main Property"}
        actionHref={`/admin/properties/${propertyId}?tab=units`}
      />
    );
  }

  const title = isAr && unit.title_ar ? unit.title_ar : unit.title_en;
  const parentTitle = unit.parent
    ? isAr && unit.parent.title_ar
      ? unit.parent.title_ar
      : unit.parent.title_en
    : "Parent Property";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Breadcrumb Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-brand-border shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand-brown-muted mb-1 flex-wrap">
            <Link href="/admin/properties" className="hover:text-brand-terracotta">
              {isAr ? "العقارات" : "Properties"}
            </Link>
            <span>/</span>
            <Link href={`/admin/properties/${propertyId}?tab=units`} className="hover:text-brand-terracotta font-medium">
              {parentTitle} ({unit.parent?.reference_number})
            </Link>
            <span>/</span>
            <span className="text-brand-brown font-bold">
              {unit.unit_number || unit.reference_number}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-serif font-bold text-brand-brown">
              {unit.unit_number ? `${unit.unit_number}: ` : ""}{title}
            </h1>
            <span className="font-mono text-xs px-2.5 py-1 bg-brand-sand-light text-brand-brown rounded-lg border border-brand-border font-bold">
              {unit.reference_number}
            </span>
            {unit.view && (
              <span className="px-2.5 py-1 bg-brand-sand-light text-brand-brown rounded-lg border border-brand-border text-xs font-semibold">
                🌅 {unit.view}
              </span>
            )}
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                unit.is_published
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-amber-100 text-amber-900 border border-amber-300"
              }`}
            >
              {unit.is_published ? (isAr ? "معروض للنزلاء" : "Published") : isAr ? "مسودة" : "Draft"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/admin/properties/${propertyId}?tab=units`}
            className="px-3.5 py-2 rounded-xl bg-brand-sand-light hover:bg-brand-sand text-brand-brown text-xs font-bold transition border border-brand-border"
          >
            ← {isAr ? "قائمة الوحدات" : "Back to Units"}
          </Link>

          <PermissionGuard permission="manage_properties">
            <button
              onClick={handleToggleVisibility}
              disabled={toggleLoading}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                unit.is_published
                  ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {toggleLoading
                ? "..."
                : unit.is_published
                ? isAr ? "إيقاف العرض" : "Pause Display"
                : isAr ? "تفعيل العرض" : "Activate Display"}
            </button>
          </PermissionGuard>

          <Link
            href={`/stays/${unit.slug}`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-brand-sand-light hover:bg-brand-sand text-brand-brown text-xs font-bold transition border border-brand-border"
          >
            {isAr ? "معاينة الوحدة" : "Live Preview"} ↗
          </Link>

          <PermissionGuard permission="manage_properties">
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition border border-rose-200 cursor-pointer"
            >
              {isAr ? "حذف الوحدة" : "Delete"}
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="underline cursor-pointer">
            {isAr ? "إغلاق" : "Dismiss"}
          </button>
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex items-center gap-2 border-b border-brand-border pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "overview"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "بيانات الوحدة والمواصفات" : "Unit Specifications"}
        </button>
        <button
          onClick={() => setActiveTab("availability")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "availability"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "جدول التوفر والحظر" : "Availability & Blocks"}
        </button>
        <button
          onClick={() => setActiveTab("pricing")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "pricing"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "الأسعار والمواسم" : "Pricing & Seasons"}
        </button>
        <button
          onClick={() => setActiveTab("amenities")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "amenities"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "المرافق والخدمات" : "Amenities"}
        </button>
        <button
          onClick={() => setActiveTab("media")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "media"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "الصور والوسائط" : "Media Gallery"}
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "bookings"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "الحجوزات المرتبطة" : "Bookings"}
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <form onSubmit={handleSaveUnit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs space-y-6 text-xs">
              <h3 className="text-base font-bold text-brand-brown border-b border-brand-border pb-3">
                {isAr ? "تعديل تفاصيل وبيانات الوحدة" : "Edit Sub-Unit Information"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "رقم أو اسم الوحدة *" : "Unit Number / Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={unitForm.unit_number}
                    onChange={(e) => setUnitForm({ ...unitForm, unit_number: e.target.value })}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3 focus:outline-hidden focus:border-brand-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "الإطلالة (View) *" : "View *"}
                  </label>
                  <select
                    value={unitForm.view}
                    onChange={(e) => setUnitForm({ ...unitForm, view: e.target.value })}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3"
                  >
                    <option value="Lagoon View">{isAr ? "إطلالة على اللاجون (Lagoon View)" : "Lagoon View"}</option>
                    <option value="Sea View">{isAr ? "إطلالة مباشرة على البحر (Sea View)" : "Sea View"}</option>
                    <option value="Golf Course View">{isAr ? "إطلالة على ملاعب الجولف (Golf View)" : "Golf Course View"}</option>
                    <option value="Marina View">{isAr ? "إطلالة على المارينا (Marina View)" : "Marina View"}</option>
                    <option value="Pool View">{isAr ? "إطلالة على المسبح (Pool View)" : "Pool View"}</option>
                    <option value="Garden View">{isAr ? "إطلالة على الحديقة (Garden View)" : "Garden View"}</option>
                    <option value="Mountain View">{isAr ? "إطلالة جبلية (Mountain View)" : "Mountain View"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "عنوان الوحدة بالإنجليزية *" : "Unit Title (English) *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={unitForm.title_en}
                    onChange={(e) => setUnitForm({ ...unitForm, title_en: e.target.value })}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "عنوان الوحدة بالعربية" : "Unit Title (Arabic)"}
                  </label>
                  <input
                    type="text"
                    value={unitForm.title_ar}
                    onChange={(e) => setUnitForm({ ...unitForm, title_ar: e.target.value })}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3 text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "غرف النوم *" : "Bedrooms *"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={unitForm.bedrooms}
                    onChange={(e) => setUnitForm({ ...unitForm, bedrooms: Number(e.target.value) })}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "الحمامات *" : "Bathrooms *"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={unitForm.bathrooms}
                    onChange={(e) => setUnitForm({ ...unitForm, bathrooms: Number(e.target.value) })}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "أقصى ضيوف *" : "Max Guests *"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={unitForm.max_guests}
                    onChange={(e) => setUnitForm({ ...unitForm, max_guests: Number(e.target.value) })}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "المساحة (م²)" : "Area (m²)"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={unitForm.area_sqm}
                    onChange={(e) => setUnitForm({ ...unitForm, area_sqm: e.target.value ? Number(e.target.value) : "" })}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "سعر الليلة الأساسي (EGP) *" : "Base Nightly Price (EGP) *"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={unitForm.base_price}
                    onChange={(e) => setUnitForm({ ...unitForm, base_price: e.target.value })}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "حالة العرض والظهور" : "Display Status"}
                  </label>
                  <select
                    value={unitForm.status}
                    onChange={(e) => setUnitForm({ ...unitForm, status: e.target.value as any })}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3"
                  >
                    <option value="published">{isAr ? "معروض ونشط (Published)" : "Active / Published"}</option>
                    <option value="draft">{isAr ? "مسودة غير معروضة (Draft)" : "Draft / Hidden"}</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-border flex justify-end">
                <PermissionGuard permission="manage_properties">
                  <button
                    type="submit"
                    disabled={unitSaving}
                    className="px-6 py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {unitSaving ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "حفظ التعديلات" : "Save Changes"}
                  </button>
                </PermissionGuard>
              </div>
            </div>
          </div>

          {/* Sidebar Info: Parent Property Context */}
          <div className="space-y-6 text-xs">
            <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4">
              <h4 className="font-serif font-bold text-brand-brown text-sm border-b border-brand-border pb-2">
                {isAr ? "العقار / الكمبوند الأب" : "Parent Property"}
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] uppercase text-brand-brown-muted block font-bold">
                    {isAr ? "اسم العقار الرئيسي" : "Property Title"}
                  </span>
                  <Link
                    href={`/admin/properties/${propertyId}`}
                    className="font-bold text-brand-terracotta hover:underline"
                  >
                    {parentTitle}
                  </Link>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-brand-brown-muted block font-bold">
                    {isAr ? "كود المرجع الرئيسي" : "Reference Code"}
                  </span>
                  <span className="font-mono font-bold text-brand-brown">
                    {unit.parent?.reference_number}
                  </span>
                </div>

                {unit.parent?.compound && (
                  <div>
                    <span className="text-[10px] uppercase text-brand-brown-muted block font-bold">
                      {isAr ? "الكمبوند" : "Compound"}
                    </span>
                    <span className="text-brand-brown">{unit.parent.compound}</span>
                  </div>
                )}

                {unit.parent?.location && (
                  <div>
                    <span className="text-[10px] uppercase text-brand-brown-muted block font-bold">
                      {isAr ? "المنطقة بالجونة" : "Location"}
                    </span>
                    <span className="text-brand-brown font-medium">
                      {isAr ? unit.parent.location.name_ar : unit.parent.location.name_en}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: AVAILABILITY & BLOCKS */}
      {activeTab === "availability" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs space-y-4 text-xs">
              <h3 className="text-base font-bold text-brand-brown border-b border-brand-border pb-3">
                {isAr ? "الفترات الزمنية المحظورة لهذه الوحدة" : "Blocked Periods for this Unit"}
              </h3>

              {!calendarData?.blocked_ranges || calendarData.blocked_ranges.length === 0 ? (
                <div className="text-brand-brown-muted py-4">
                  {isAr ? "لا توجد فترات محظورة مسجلة لهذه الوحدة." : "No blocked ranges currently set for this unit."}
                </div>
              ) : (
                <div className="space-y-2">
                  {calendarData.blocked_ranges.map((block) => (
                    <div
                      key={block.id}
                      className="flex items-center justify-between p-3.5 bg-brand-sand-light/40 rounded-2xl border border-brand-border"
                    >
                      <div>
                        <span className="font-mono font-bold text-brand-brown block">
                          {block.start_date} → {block.end_date}
                        </span>
                        <span className="text-[11px] text-brand-brown-muted">
                          {block.status === "maintenance"
                            ? isAr ? "صيانة دورية" : "Maintenance"
                            : block.status === "owner_use"
                            ? isAr ? "استخدام المالك" : "Owner Use"
                            : isAr ? "حظر مخصص" : "Blocked"}
                          {block.reason ? ` • ${block.reason}` : ""}
                        </span>
                      </div>
                      <PermissionGuard permission="manage_properties">
                        <button
                          onClick={() => handleRemoveBlock(block.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 cursor-pointer"
                        >
                          {isAr ? "إلغاء الحظر" : "Release Block"}
                        </button>
                      </PermissionGuard>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Block Form */}
          <div className="space-y-6 text-xs">
            <form onSubmit={handleAddBlock} className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4">
              <h4 className="font-serif font-bold text-brand-brown text-sm border-b border-brand-border pb-2">
                {isAr ? "حظر تواريخ جديدة للوحدة" : "Add Blocked Dates"}
              </h4>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "من تاريخ *" : "Start Date *"}
                </label>
                <input
                  type="date"
                  required
                  value={blockForm.start_date}
                  onChange={(e) => setBlockForm({ ...blockForm, start_date: e.target.value })}
                  className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "إلى تاريخ *" : "End Date *"}
                </label>
                <input
                  type="date"
                  required
                  value={blockForm.end_date}
                  onChange={(e) => setBlockForm({ ...blockForm, end_date: e.target.value })}
                  className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "سبب الحظر" : "Reason"}
                </label>
                <select
                  value={blockForm.status}
                  onChange={(e) => setBlockForm({ ...blockForm, status: e.target.value as any })}
                  className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5"
                >
                  <option value="blocked">{isAr ? "حظر عام" : "General Block"}</option>
                  <option value="maintenance">{isAr ? "صيانة وتجديد" : "Maintenance"}</option>
                  <option value="owner_use">{isAr ? "إقامة المالك" : "Owner Stay"}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "ملاحظات إضافية" : "Notes"}
                </label>
                <input
                  type="text"
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  placeholder={isAr ? "مثال: صيانة التكييف المركزي" : "e.g. AC repair"}
                  className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5"
                />
              </div>

              <PermissionGuard permission="manage_properties">
                <button
                  type="submit"
                  disabled={blockSubmitting}
                  className="w-full py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {blockSubmitting ? (isAr ? "جاري الحظر..." : "Blocking...") : isAr ? "حظر التواريخ" : "Block Unit Dates"}
                </button>
              </PermissionGuard>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: PRICING & SEASONS */}
      {activeTab === "pricing" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs space-y-4 text-xs">
              <h3 className="text-base font-bold text-brand-brown border-b border-brand-border pb-3">
                {isAr ? "قواعد الأسعار الخاصة بهذه الوحدة" : "Unit Seasonal Pricing Rules"}
              </h3>

              {!calendarData?.seasonal_prices || calendarData.seasonal_prices.length === 0 ? (
                <div className="text-brand-brown-muted py-4">
                  {isAr ? "لا توجد قواعد مواسم مخصصة لهذه الوحدة. يتم استخدام سعر الليلة الأساسي." : "No specific seasonal overrides for this unit. Base rate applies."}
                </div>
              ) : (
                <div className="space-y-2">
                  {calendarData.seasonal_prices.map((season) => (
                    <div
                      key={season.id}
                      className="flex items-center justify-between p-3.5 bg-brand-sand-light/40 rounded-2xl border border-brand-border"
                    >
                      <div>
                        <span className="font-bold text-brand-brown block">
                          {isAr && season.name_ar ? season.name_ar : season.name_en}
                        </span>
                        <span className="text-[11px] text-brand-brown-muted font-mono">
                          {season.start_date} → {season.end_date} &bull; {season.formatted_price}
                        </span>
                      </div>
                      <PermissionGuard permission="manage_properties">
                        <button
                          onClick={() => handleRemoveSeason(season.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 cursor-pointer"
                        >
                          {isAr ? "حذف القاعدة" : "Delete Rule"}
                        </button>
                      </PermissionGuard>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Season Rule Form */}
          <div className="space-y-6 text-xs">
            <form onSubmit={handleAddSeason} className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4">
              <h4 className="font-serif font-bold text-brand-brown text-sm border-b border-brand-border pb-2">
                {isAr ? "إضافة قاعدة تسعير للوحدة" : "Add Unit Seasonal Rule"}
              </h4>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "اسم الموسم (English) *" : "Rule Name (English) *"}
                </label>
                <input
                  type="text"
                  required
                  value={seasonForm.name_en}
                  onChange={(e) => setSeasonForm({ ...seasonForm, name_en: e.target.value })}
                  placeholder="e.g. Eid Holiday, Summer Peak"
                  className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "من تاريخ *" : "Start Date *"}
                  </label>
                  <input
                    type="date"
                    required
                    value={seasonForm.start_date}
                    onChange={(e) => setSeasonForm({ ...seasonForm, start_date: e.target.value })}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "إلى تاريخ *" : "End Date *"}
                  </label>
                  <input
                    type="date"
                    required
                    value={seasonForm.end_date}
                    onChange={(e) => setSeasonForm({ ...seasonForm, end_date: e.target.value })}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "سعر الليلة (EGP) *" : "Nightly Rate (EGP) *"}
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={seasonForm.price_cents ? seasonForm.price_cents / 100 : ""}
                  onChange={(e) => setSeasonForm({ ...seasonForm, price_cents: Math.round(parseFloat(e.target.value || "0") * 100) })}
                  placeholder="11000"
                  className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono font-bold"
                />
              </div>

              <PermissionGuard permission="manage_properties">
                <button
                  type="submit"
                  disabled={seasonSubmitting}
                  className="w-full py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {seasonSubmitting ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "حفظ سعر الموسم" : "Save Seasonal Rate"}
                </button>
              </PermissionGuard>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: AMENITIES */}
      {activeTab === "amenities" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs space-y-6 text-xs">
          <h3 className="text-base font-bold text-brand-brown border-b border-brand-border pb-3">
            {isAr ? "المرافق والخدمات المتاحة بالوحدة" : "Unit Amenities"}
          </h3>
          {!unit.amenities || unit.amenities.length === 0 ? (
            <div className="text-brand-brown-muted">
              {isAr ? "ترث هذه الوحدة جميع مرافق العقار الأساسي (شاطئ، مسبح خاص، واي فاي، مطبخ مجهز)." : "This unit inherits parent property amenities."}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {unit.amenities.map((am) => (
                <div key={am.id} className="p-3 rounded-2xl bg-brand-sand-light/50 border border-brand-border flex items-center gap-2">
                  <span>✓</span>
                  <span className="font-semibold text-brand-brown">{isAr && am.name_ar ? am.name_ar : am.name_en}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: MEDIA */}
      {activeTab === "media" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs space-y-6 text-xs">
          <h3 className="text-base font-bold text-brand-brown border-b border-brand-border pb-3">
            {isAr ? "معرض الصور الخاص بالوحدة" : "Unit Media Gallery"}
          </h3>
          {!unit.images || unit.images.length === 0 ? (
            <div className="text-brand-brown-muted">
              {isAr ? "لا توجد صور مخصصة لهذه الوحدة بعد. تظهر صورة العقار الرئيسي كصورة افتراضية." : "No dedicated images for this unit yet. Parent property cover applies."}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {unit.images.map((img) => (
                <div key={img.id} className="relative aspect-video rounded-2xl overflow-hidden border border-brand-border">
                  <Image src={img.url} alt="Unit Image" fill className="object-cover" />
                  {img.is_primary && (
                    <span className="absolute top-2 start-2 px-2 py-0.5 rounded-md bg-brand-terracotta text-white text-[9px] font-bold">
                      {isAr ? "الغلاف" : "Primary"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: BOOKINGS */}
      {activeTab === "bookings" && (
        <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden text-xs">
          <div className="p-6 border-b border-brand-border flex items-center justify-between">
            <h3 className="text-base font-bold text-brand-brown">
              {isAr ? "الحجوزات الخاصة بهذه الوحدة" : "Bookings for this Unit"}
            </h3>
          </div>
          {!unit.bookings || unit.bookings.length === 0 ? (
            <div className="p-8 text-center text-brand-brown-muted">
              {isAr ? "لا توجد حجوزات مسجلة لهذه الوحدة حتى الآن." : "No bookings recorded for this unit yet."}
            </div>
          ) : (
            <div className="overflow-x-auto gounow-scrollbar">
              <table className="w-full text-start">
                <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-semibold border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-4 text-start">{isAr ? "رقم الحجز" : "Reference"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "العميل" : "Guest"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "التواريخ" : "Dates"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "الإجمالي" : "Total"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "الحالة" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {unit.bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-brand-sand-light/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-brown">
                        <Link href={`/admin/bookings/${b.id}`} className="hover:text-brand-terracotta underline">
                          {b.reference}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-brand-brown">{b.customer?.name}</td>
                      <td className="py-3.5 px-4 font-mono text-brand-brown-muted">
                        {b.check_in} → {b.check_out} ({b.nights} {isAr ? "ليالي" : "nights"})
                      </td>
                      <td className="py-3.5 px-4 font-serif font-bold text-brand-brown">{b.formatted_total}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title={isAr ? "تأكيد حذف الوحدة" : "Confirm Sub-Unit Deletion"}
        description={
          isAr
            ? `هل أنت متأكد من حذف الوحدة [${unit.unit_number || unit.reference_number}] (${title}) نهائياً؟ لا يمكن حذف الوحدات التي تحتوي على حجوزات نشطة.`
            : `Are you sure you want to permanently delete sub-unit [${unit.unit_number || unit.reference_number}] (${title})?`
        }
        confirmText={isAr ? "نعم، حذف الوحدة" : "Yes, Delete Unit"}
        cancelText={isAr ? "إلغاء" : "Cancel"}
        isDestructive={true}
        isLoading={deleteLoading}
        onConfirm={handleDeleteUnit}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
