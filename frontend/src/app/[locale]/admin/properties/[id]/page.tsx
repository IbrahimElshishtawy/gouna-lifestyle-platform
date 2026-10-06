"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  getAdminPropertyDetails,
  togglePropertyStatus,
  getPropertyCalendar,
  addPropertyAvailabilityBlock,
  removePropertyAvailabilityBlock,
  addPropertySeasonalPrice,
  removePropertySeasonalPrice,
  updateAdminProperty,
  deleteAdminProperty,
} from "@/features/admin/services/admin.api";
import type { PropertyCalendarResponse } from "@/features/admin/types";
import LocationPicker from "@/features/admin/components/LocationPicker";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PermissionGuard from "@/components/ui/PermissionGuard";

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default function AdminPropertyDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const propertyId = parseInt(resolvedParams.id, 10);
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const router = useRouter();

  const [property, setProperty] = useState<any | null>(null);
  const [calendarData, setCalendarData] = useState<PropertyCalendarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "location" | "availability" | "pricing" | "amenities" | "media" | "bookings">("overview");

  // Location Form State
  const [locationForm, setLocationForm] = useState<{
    latitude: number | null;
    longitude: number | null;
    map_url: string;
    address: string;
  }>({
    latitude: null,
    longitude: null,
    map_url: "",
    address: "",
  });
  const [locationSaving, setLocationSaving] = useState(false);

  // Property Deletion State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  // Toggle Visibility State
  const [toggleLoading, setToggleLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const data = await getAdminPropertyDetails(propertyId);
      setProperty(data);
      setLocationForm({
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        map_url: data.map_url || "",
        address: data.address || "",
      });
      const cal = await getPropertyCalendar(propertyId, new Date().getFullYear());
      setCalendarData(cal);
    } catch {
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(propertyId)) {
      fetchProperty();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const handleToggleVisibility = async () => {
    if (!property) return;
    setToggleLoading(true);
    setFeedback(null);
    try {
      const res = await togglePropertyStatus(property.id);
      setProperty((prev: any) => ({
        ...prev,
        is_published: res.data.is_published,
        status: res.data.status,
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

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockForm.start_date || !blockForm.end_date) return;
    setBlockSubmitting(true);
    setFeedback(null);
    try {
      const res = await addPropertyAvailabilityBlock(property.id, blockForm);
      setFeedback({
        type: "success",
        message: res.message || (isAr ? "تم حظر الفترة الزمنية بنجاح." : "Dates blocked successfully."),
      });
      setBlockForm({ start_date: "", end_date: "", status: "blocked", reason: "" });
      const cal = await getPropertyCalendar(property.id, new Date().getFullYear());
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
    setFeedback(null);
    try {
      await removePropertyAvailabilityBlock(property.id, blockId);
      setFeedback({
        type: "success",
        message: isAr ? "تم تحرير الفترة الزمنية المحظورة بنجاح." : "Block removed successfully.",
      });
      const cal = await getPropertyCalendar(property.id, new Date().getFullYear());
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
    if (!seasonForm.name_en || !seasonForm.start_date || !seasonForm.end_date) return;
    setSeasonSubmitting(true);
    setFeedback(null);
    try {
      const res = await addPropertySeasonalPrice(property.id, seasonForm);
      setFeedback({
        type: "success",
        message: res.message || (isAr ? "تمت إضافة قاعدة السعر الموسمي بنجاح." : "Seasonal rate added successfully."),
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
      await fetchProperty();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر إضافة السعر الموسمي." : "Failed to add seasonal price."),
      });
    } finally {
      setSeasonSubmitting(false);
    }
  };

  const handleRemoveSeason = async (seasonId: number) => {
    setFeedback(null);
    try {
      await removePropertySeasonalPrice(property.id, seasonId);
      setFeedback({
        type: "success",
        message: isAr ? "تم حذف قاعدة السعر الموسمي." : "Seasonal price rule deleted.",
      });
      await fetchProperty();
    } catch {
      setFeedback({
        type: "error",
        message: isAr ? "تعذر حذف قاعدة السعر الموسمي." : "Failed to delete seasonal rule.",
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-brand-border">
        <LoadingState message={isAr ? "جارٍ تحميل تفاصيل العقار ومحفظة الوحدات..." : "Loading property inventory dossier..."} />
      </div>
    );
  }

  if (!property) {
    return (
      <EmptyState
        icon="🏡"
        title={isAr ? "العقار غير موجود" : "Property Not Found"}
        description={isAr ? "لم يتم العثور على العقار المطلوب." : "The requested property listing could not be found."}
        actionText={isAr ? "العودة إلى محفظة العقارات" : "Back to Properties"}
        actionHref="/admin/properties"
      />
    );
  }

  const title = isAr && property.title_ar ? property.title_ar : property.title_en;
  const categoryName = isAr && property.category?.name_ar ? property.category.name_ar : property.category?.name_en || "Villa";
  const locationName = isAr && property.location?.name_ar ? property.location.name_ar : property.location?.name_en || "El Gouna";

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs text-brand-brown-muted mb-1">
            <Link href="/admin/properties" className="hover:text-brand-brown">
              {isAr ? "محفظة العقارات" : "Properties Portfolio"}
            </Link>
            <span>/</span>
            <span className="font-mono text-brand-brown font-semibold">{property.reference_number}</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-brand-brown">{title}</h1>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                property.is_published
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : "bg-amber-100 text-amber-800 border-amber-300"
              }`}
            >
              {property.is_published ? (isAr ? "معروض للجمهور (نشط)" : "ACTIVE DISPLAY") : (isAr ? "متوقف عن العرض" : "PAUSED")}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
              {property.listing_type}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <PermissionGuard permission="manage_properties">
            <button
              onClick={handleToggleVisibility}
              disabled={toggleLoading}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                property.is_published
                  ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {toggleLoading
                ? "..."
                : property.is_published
                ? (isAr ? "إيقاف العرض" : "Pause Public Display")
                : (isAr ? "تفعيل العرض" : "Activate Public Display")}
            </button>
          </PermissionGuard>

          <Link
            href={`/stays/${property.slug}`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-brand-sand-light hover:bg-brand-sand text-brand-brown text-xs font-bold transition border border-brand-border"
          >
            {isAr ? "معاينة بالموقع" : "Live Preview"} ↗
          </Link>
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

      {/* Section Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-border pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "overview"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "المواصفات والبيانات" : "Specifications & Overview"}
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
          {isAr ? "سجل حجوزات الوحدة" : "Unit Bookings"} ({property.stats?.total_bookings || 0})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs space-y-6 text-xs">
              <h3 className="text-base font-bold text-brand-brown border-b border-brand-border pb-3">
                {isAr ? "البيانات الأساسية والموقع" : "Key Inventory Attributes"}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                    {isAr ? "التصنيف" : "Category"}
                  </span>
                  <span className="font-bold text-brand-brown text-sm block mt-0.5">{categoryName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                    {isAr ? "المنطقة" : "Location"}
                  </span>
                  <span className="font-bold text-brand-brown text-sm block mt-0.5">{locationName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                    {isAr ? "الكومباوند / الحي" : "Compound"}
                  </span>
                  <span className="font-bold text-brand-brown text-sm block mt-0.5">{property.compound || "El Gouna"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                    {isAr ? "المساحة" : "Area"}
                  </span>
                  <span className="font-bold text-brand-brown text-sm block mt-0.5">{property.area_sqm || "N/A"} m²</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                    {isAr ? "غرف النوم" : "Bedrooms"}
                  </span>
                  <span className="font-bold text-brand-brown text-sm block mt-0.5">{property.bedrooms}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                    {isAr ? "الحمامات" : "Bathrooms"}
                  </span>
                  <span className="font-bold text-brand-brown text-sm block mt-0.5">{property.bathrooms}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                    {isAr ? "السعة القصوى" : "Max Guests"}
                  </span>
                  <span className="font-bold text-brand-brown text-sm block mt-0.5">{property.max_guests} Guests</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                    {isAr ? "الحد الأدنى للإقامة" : "Min Stay"}
                  </span>
                  <span className="font-bold text-brand-brown text-sm block mt-0.5">{property.min_stay_nights || 1} Nights</span>
                </div>
              </div>

              {property.description_en && (
                <div className="pt-4 border-t border-brand-border">
                  <span className="text-[10px] uppercase font-bold text-brand-brown-muted block mb-1">
                    {isAr ? "الوصف التفصيلي" : "Description"}
                  </span>
                  <p className="text-brand-brown leading-relaxed">{isAr && property.description_ar ? property.description_ar : property.description_en}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4 text-xs">
              <h3 className="text-base font-bold text-brand-brown border-b border-brand-border pb-3">
                {isAr ? "إحصائيات الوحدة المالية" : "Operational Revenue"}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-brand-brown-muted">{isAr ? "السعر الأساسي لليلة:" : "Base Nightly Rate:"}</span>
                  <span className="font-bold font-serif text-brand-brown">{property.formatted_base_price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-brown-muted">{isAr ? "إجمالي الحجوزات:" : "Total Bookings:"}</span>
                  <span className="font-bold text-brand-brown">{property.stats?.total_bookings || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-brown-muted">{isAr ? "إجمالي العائد المحقق:" : "Historical Revenue:"}</span>
                  <span className="font-bold text-emerald-700 font-serif">{property.stats?.formatted_revenue || "0 EGP"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Availability & Blocks */}
      {activeTab === "availability" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Blocks Ledger */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden text-xs">
              <div className="p-6 border-b border-brand-border flex items-center justify-between">
                <h3 className="text-base font-bold text-brand-brown">
                  {isAr ? "الفترات المحظورة والمغلقة (Availability Blocks)" : "Blocked Availability Periods"}
                </h3>
                <span className="text-xs text-brand-brown-muted">
                  {calendarData?.blocked_ranges.length || 0} {isAr ? "فترات مغلقة" : "active blocks"}
                </span>
              </div>

              {!calendarData || calendarData.blocked_ranges.length === 0 ? (
                <div className="p-8 text-center text-brand-brown-muted">
                  {isAr ? "لا توجد فترات مغلقة مسجلة لهذا العقار حالياً." : "No blocked date ranges recorded for this property."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-start">
                    <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-bold text-[10px]">
                      <tr>
                        <th className="py-3 px-4 text-start">{isAr ? "تاريخ البداية" : "Start Date"}</th>
                        <th className="py-3 px-4 text-start">{isAr ? "تاريخ النهاية" : "End Date"}</th>
                        <th className="py-3 px-4 text-start">{isAr ? "النوع" : "Block Type"}</th>
                        <th className="py-3 px-4 text-start">{isAr ? "السبب" : "Reason"}</th>
                        <th className="py-3 px-4 text-end">{isAr ? "إجراء" : "Action"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/60">
                      {calendarData.blocked_ranges.map((block) => (
                        <tr key={block.id} className="hover:bg-brand-sand-light/30">
                          <td className="py-3.5 px-4 font-mono font-bold text-brand-brown">{block.start_date}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-brand-brown">{block.end_date}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                              {block.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-brand-brown-muted">{block.reason || "-"}</td>
                          <td className="py-3.5 px-4 text-end">
                            <button
                              onClick={() => handleRemoveBlock(block.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold cursor-pointer"
                            >
                              {isAr ? "إلغاء الحظر" : "Remove"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Add Block Form */}
          <div>
            <form
              onSubmit={handleAddBlock}
              className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4 text-xs"
            >
              <h3 className="text-base font-bold text-brand-brown border-b border-brand-border pb-3">
                {isAr ? "+ إغلاق فترة زمنية" : "+ Block Dates"}
              </h3>
              <p className="text-brand-brown-muted leading-relaxed">
                {isAr
                  ? "إغلاق حجز الوحدة لأغراض الصيانة الدورية أو الاستخدام الشخصي للمالك."
                  : "Block unit booking for maintenance, cleaning, or owner personal use."}
              </p>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "من تاريخ *" : "Start Date *"}
                </label>
                <input
                  type="date"
                  value={blockForm.start_date}
                  onChange={(e) => setBlockForm({ ...blockForm, start_date: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-sand-light/40 text-brand-brown"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "إلى تاريخ *" : "End Date *"}
                </label>
                <input
                  type="date"
                  value={blockForm.end_date}
                  onChange={(e) => setBlockForm({ ...blockForm, end_date: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-sand-light/40 text-brand-brown"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "تصنيف الإغلاق *" : "Block Reason *"}
                </label>
                <select
                  value={blockForm.status}
                  onChange={(e) => setBlockForm({ ...blockForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-sand-light/40 text-brand-brown"
                >
                  <option value="blocked">{isAr ? "إغلاق إداري عام" : "General Block"}</option>
                  <option value="maintenance">{isAr ? "صيانة وتجديد" : "Maintenance"}</option>
                  <option value="owner_use">{isAr ? "إقامة للمالك" : "Owner Use"}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "ملاحظة أو سبب" : "Notes / Reason"}
                </label>
                <input
                  type="text"
                  placeholder={isAr ? "مثال: صيانة التكييف المركزي" : "e.g. AC Maintenance"}
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-sand-light/40 text-brand-brown"
                />
              </div>

              <button
                type="submit"
                disabled={blockSubmitting}
                className="w-full py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark disabled:opacity-50 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
              >
                {blockSubmitting ? (isAr ? "جارٍ الحفظ..." : "Saving...") : (isAr ? "حفظ الحظر" : "Save Availability Block")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Pricing & Seasons */}
      {activeTab === "pricing" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden text-xs">
              <div className="p-6 border-b border-brand-border flex items-center justify-between">
                <h3 className="text-base font-bold text-brand-brown">
                  {isAr ? "قواعد التسعير الموسمي (Seasonal Rates)" : "Seasonal Pricing Rules"}
                </h3>
              </div>

              {!property.seasonal_prices || property.seasonal_prices.length === 0 ? (
                <div className="p-8 text-center text-brand-brown-muted">
                  {isAr ? "لا توجد قواعد تسعير موسمي مخصصة لهذا العقار." : "No seasonal pricing rules configured for this property."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-start">
                    <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-bold text-[10px]">
                      <tr>
                        <th className="py-3 px-4 text-start">{isAr ? "اسم الموسم" : "Season Name"}</th>
                        <th className="py-3 px-4 text-start">{isAr ? "الفترة الزمنية" : "Date Range"}</th>
                        <th className="py-3 px-4 text-start">{isAr ? "السعر / ليلة" : "Nightly Price"}</th>
                        <th className="py-3 px-4 text-start">{isAr ? "الحد الأدنى" : "Min Nights"}</th>
                        <th className="py-3 px-4 text-end">{isAr ? "إجراء" : "Action"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/60">
                      {property.seasonal_prices.map((season: any) => (
                        <tr key={season.id} className="hover:bg-brand-sand-light/30">
                          <td className="py-3.5 px-4 font-bold text-brand-brown">{season.name_en}</td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-brand-brown-muted">
                            {season.start_date} → {season.end_date}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-800">
                            {number_format(season.price_cents / 100, 2)} EGP
                          </td>
                          <td className="py-3.5 px-4">{season.min_stay_nights || 1} nights</td>
                          <td className="py-3.5 px-4 text-end">
                            <button
                              onClick={() => handleRemoveSeason(season.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold cursor-pointer"
                            >
                              {isAr ? "حذف" : "Delete"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Add Seasonal Price Form */}
          <div>
            <form
              onSubmit={handleAddSeason}
              className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4 text-xs"
            >
              <h3 className="text-base font-bold text-brand-brown border-b border-brand-border pb-3">
                {isAr ? "+ إضافة موسم تسعيري" : "+ Add Seasonal Rate"}
              </h3>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "اسم الموسم (EN) *" : "Season Name (EN) *"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Film Festival Peak"
                  value={seasonForm.name_en}
                  onChange={(e) => setSeasonForm({ ...seasonForm, name_en: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-sand-light/40 text-brand-brown"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "من تاريخ *" : "Start Date *"}
                </label>
                <input
                  type="date"
                  value={seasonForm.start_date}
                  onChange={(e) => setSeasonForm({ ...seasonForm, start_date: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-sand-light/40 text-brand-brown"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "إلى تاريخ *" : "End Date *"}
                </label>
                <input
                  type="date"
                  value={seasonForm.end_date}
                  onChange={(e) => setSeasonForm({ ...seasonForm, end_date: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-sand-light/40 text-brand-brown"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "السعر لليلة (EGP) *" : "Nightly Price (EGP) *"}
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={seasonForm.price_cents / 100 || ""}
                  onChange={(e) => setSeasonForm({ ...seasonForm, price_cents: Math.round(parseFloat(e.target.value || "0") * 100) })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-sand-light/40 text-brand-brown font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "الحد الأدنى لليالي" : "Min Nights"}
                </label>
                <input
                  type="number"
                  min="1"
                  value={seasonForm.min_stay_nights}
                  onChange={(e) => setSeasonForm({ ...seasonForm, min_stay_nights: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-sand-light/40 text-brand-brown"
                />
              </div>

              <button
                type="submit"
                disabled={seasonSubmitting}
                className="w-full py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark disabled:opacity-50 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
              >
                {seasonSubmitting ? (isAr ? "جارٍ الحفظ..." : "Saving...") : (isAr ? "حفظ السعر الموسمي" : "Save Seasonal Rate")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 4: Amenities */}
      {activeTab === "amenities" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs space-y-6 text-xs">
          <h3 className="text-base font-bold text-brand-brown border-b border-brand-border pb-3">
            {isAr ? "المرافق والخدمات المتاحة بالوحدة" : "Verified Amenities"}
          </h3>
          {!property.amenities || property.amenities.length === 0 ? (
            <div className="text-brand-brown-muted">
              {isAr ? "لم يتم ربط مرافق بهذا العقار." : "No amenities assigned to this property."}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {property.amenities.map((am: any) => (
                <div key={am.id} className="p-3 rounded-2xl bg-brand-sand-light/50 border border-brand-border flex items-center gap-2">
                  <span className="text-base">✨</span>
                  <span className="font-semibold text-brand-brown">
                    {isAr && am.name_ar ? am.name_ar : am.name_en}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Media Gallery */}
      {activeTab === "media" && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs space-y-6 text-xs">
          <h3 className="text-base font-bold text-brand-brown border-b border-brand-border pb-3">
            {isAr ? "معرض الصور والوسائط" : "Media Gallery"}
          </h3>
          {!property.images || property.images.length === 0 ? (
            <div className="text-brand-brown-muted">
              {isAr ? "لا توجد صور مضافة لهذا العقار." : "No media uploaded for this property."}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {property.images.map((img: any) => (
                <div key={img.id} className="relative aspect-video rounded-2xl overflow-hidden border border-brand-border group">
                  <Image src={img.url} alt="Property Image" fill className="object-cover" />
                  {img.is_featured && (
                    <span className="absolute top-2 start-2 px-2 py-0.5 rounded-md bg-brand-terracotta text-white text-[9px] font-bold">
                      {isAr ? "الغلاف" : "Cover"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Bookings */}
      {activeTab === "bookings" && (
        <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden text-xs">
          <div className="p-6 border-b border-brand-border flex items-center justify-between">
            <h3 className="text-base font-bold text-brand-brown">
              {isAr ? "سجل الحجوزات الخاصة بهذا العقار" : "Property Bookings History"}
            </h3>
            <Link
              href={`/admin/bookings?property_id=${property.id}`}
              className="text-brand-terracotta font-bold hover:underline"
            >
              {isAr ? "عرض في جدول الحجوزات الكامل" : "View in Full Ledger"} &rarr;
            </Link>
          </div>

          {!property.recent_bookings || property.recent_bookings.length === 0 ? (
            <div className="p-8 text-center text-brand-brown-muted">
              {isAr ? "لا توجد حجوزات مسجلة لهذا العقار حتى الآن." : "No bookings recorded for this property yet."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start">
                <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="py-3 px-4 text-start">{isAr ? "كود الحجز" : "Reference"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "النزيل" : "Guest"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "المواعيد" : "Schedule"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "الإجمالي" : "Amount"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "الحالة" : "Status"}</th>
                    <th className="py-3 px-4 text-end">{isAr ? "إجراء" : "Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {property.recent_bookings.map((b: any) => (
                    <tr key={b.id} className="hover:bg-brand-sand-light/30">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-brown">{b.reference}</td>
                      <td className="py-3.5 px-4 font-medium text-brand-brown">{b.customer_name}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-brand-brown-muted" dir="ltr">
                        {b.check_in} → {b.check_out} ({b.nights}n)
                      </td>
                      <td className="py-3.5 px-4 font-serif font-bold text-brand-brown">{b.formatted_total}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-end">
                        <Link
                          href={`/admin/bookings/${b.id}`}
                          className="px-2.5 py-1 rounded-lg bg-brand-sand-light hover:bg-brand-sand text-brand-brown text-[11px] font-bold border border-brand-border"
                        >
                          {isAr ? "التفاصيل" : "Details"}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function number_format(number: number, decimals: number): string {
  return number.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
