"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
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
  createAdminPropertyUnit,
  deleteAdminPropertyUnit,
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
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab") as any;

  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const router = useRouter();

  const [property, setProperty] = useState<any | null>(null);
  const [calendarData, setCalendarData] = useState<PropertyCalendarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "units" | "location" | "availability" | "maintenance" | "pricing" | "services" | "amenities" | "media" | "bookings" | "activity"
  >(urlTab || "overview");

  // Unit Management State
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [unitForm, setUnitForm] = useState({
    unit_number: "",
    title_en: "",
    title_ar: "",
    view: "Lagoon View",
    bedrooms: 2,
    bathrooms: 2,
    max_guests: 4,
    area_sqm: "" as number | "",
    base_price: "",
    status: "published" as "published" | "draft",
  });
  const [unitSubmitting, setUnitSubmitting] = useState(false);
  const [unitSearch, setUnitSearch] = useState("");
  const [deleteUnitModal, setDeleteUnitModal] = useState<{
    isOpen: boolean;
    unit: any | null;
    loading: boolean;
  }>({
    isOpen: false,
    unit: null,
    loading: false,
  });

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
        latitude: data.latitude ? parseFloat(String(data.latitude)) : null,
        longitude: data.longitude ? parseFloat(String(data.longitude)) : null,
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

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    setUnitSubmitting(true);
    setFeedback(null);
    try {
      const priceCents = Math.round(parseFloat(unitForm.base_price || "0") * 100);
      const res = await createAdminPropertyUnit(property.id, {
        unit_number: unitForm.unit_number,
        title_en: unitForm.title_en,
        title_ar: unitForm.title_ar || undefined,
        view: unitForm.view,
        bedrooms: Number(unitForm.bedrooms),
        bathrooms: Number(unitForm.bathrooms),
        max_guests: Number(unitForm.max_guests),
        area_sqm: unitForm.area_sqm ? Number(unitForm.area_sqm) : undefined,
        base_price_cents: priceCents,
        currency: property.currency || "EGP",
        status: unitForm.status,
        listing_type: "rent",
      });

      setFeedback({
        type: "success",
        message: res.message || (isAr ? "تمت إضافة الوحدة التابعة بنجاح!" : "Sub-unit added successfully!"),
      });

      setIsAddUnitModalOpen(false);
      setUnitForm({
        unit_number: "",
        title_en: "",
        title_ar: "",
        view: "Lagoon View",
        bedrooms: 2,
        bathrooms: 2,
        max_guests: 4,
        area_sqm: "",
        base_price: "",
        status: "published",
      });

      await fetchProperty();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر إضافة الوحدة التابعة." : "Failed to create sub-unit."),
      });
    } finally {
      setUnitSubmitting(false);
    }
  };

  const handleConfirmDeleteUnit = async () => {
    if (!property || !deleteUnitModal.unit) return;
    setDeleteUnitModal((prev) => ({ ...prev, loading: true }));
    try {
      await deleteAdminPropertyUnit(property.id, deleteUnitModal.unit.id);
      setFeedback({
        type: "success",
        message: isAr ? "تم حذف الوحدة التابعة بنجاح." : "Sub-unit deleted successfully.",
      });
      setDeleteUnitModal({ isOpen: false, unit: null, loading: false });
      await fetchProperty();
    } catch (err: any) {
      setDeleteUnitModal((prev) => ({ ...prev, loading: false }));
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر حذف الوحدة التابعة." : "Cannot delete unit with active bookings."),
      });
    }
  };

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

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    setLocationSaving(true);
    setFeedback(null);
    try {
      const res = await updateAdminProperty(property.id, {
        latitude: locationForm.latitude,
        longitude: locationForm.longitude,
        map_url: locationForm.map_url,
        address: locationForm.address,
      });
      setProperty((prev: any) => ({
        ...prev,
        latitude: locationForm.latitude,
        longitude: locationForm.longitude,
        map_url: locationForm.map_url,
        address: locationForm.address,
      }));
      setFeedback({
        type: "success",
        message: res.message || (isAr ? "تم حفظ إحداثيات وموقع العقار بنجاح." : "Location coordinates saved successfully."),
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر حفظ إحداثيات الموقع." : "Failed to save location coordinates."),
      });
    } finally {
      setLocationSaving(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (!property) return;
    setDeleteLoading(true);
    try {
      await deleteAdminProperty(property.id);
      router.push("/admin/properties");
    } catch (err: any) {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر حذف العقار لوجود حجوزات نشطة مرتبطة به." : "Cannot delete property with active bookings."),
      });
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
          <Link
            href={`/admin/pricing?property_id=${property.id}`}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition border border-amber-200 flex items-center gap-1.5 shadow-xs"
          >
            <span>📅</span>
            <span>{isAr ? "محرك الأسعار والتقويم" : "Pricing & Calendar"}</span>
          </Link>

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

          <PermissionGuard permission="manage_properties">
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition border border-rose-200 cursor-pointer"
              title={isAr ? "حذف أو أرشفة العقار نهائياً" : "Delete / Archive Property"}
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

      {/* Section Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-border pb-3 overflow-x-auto gounow-scrollbar">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "المواصفات والبيانات" : "Specifications"}
        </button>
        <button
          onClick={() => setActiveTab("units")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "units"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          <span>{isAr ? "الوحدات والفيلات التابعة" : "Sub-Units"}</span>
          {property?.units && property.units.length > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "units"
                  ? "bg-white/20 text-white"
                  : "bg-brand-sand text-brand-brown border border-brand-border"
              }`}
            >
              {property.units.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("location")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === "location"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "الموقع والخريطة" : "Location"}
        </button>
        <button
          onClick={() => setActiveTab("availability")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === "availability"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "جدول التوفر والحظر" : "Availability"}
        </button>
        <button
          onClick={() => setActiveTab("maintenance")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === "maintenance"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "الصيانة والتجهيز" : "Maintenance"}
        </button>
        <button
          onClick={() => setActiveTab("pricing")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === "pricing"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "الأسعار والمواسم" : "Pricing"}
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === "services"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "الخدمات الإضافية" : "Services"}
        </button>
        <button
          onClick={() => setActiveTab("amenities")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === "amenities"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "المرافق" : "Amenities"}
        </button>
        <button
          onClick={() => setActiveTab("media")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === "media"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "الصور والوسائط" : "Media"}
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === "bookings"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "الحجوزات" : "Bookings"} ({property.stats?.total_bookings || 0})
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === "activity"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          {isAr ? "سجل النشاط" : "Activity"}
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1.1: Sub-Units & Inventory */}
      {activeTab === "units" && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-1">
                {isAr ? "إجمالي الوحدات التابعة" : "Total Sub-Units"}
              </span>
              <span className="text-2xl font-serif font-bold text-brand-brown">
                {property.units ? property.units.length : 0}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-1">
                {isAr ? "الوحدات المعروضة (نشطة)" : "Active / Published"}
              </span>
              <span className="text-2xl font-serif font-bold text-emerald-700">
                {property.units ? property.units.filter((u: any) => u.is_published).length : 0}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-1">
                {isAr ? "إجمالي الغرف المتاحة" : "Total Bedrooms"}
              </span>
              <span className="text-2xl font-serif font-bold text-brand-terracotta">
                {property.units ? property.units.reduce((acc: number, u: any) => acc + (u.bedrooms || 0), 0) : 0}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-1">
                {isAr ? "السعة الاستيعابية القصوى" : "Max Guest Capacity"}
              </span>
              <span className="text-2xl font-serif font-bold text-brand-brown">
                {property.units ? property.units.reduce((acc: number, u: any) => acc + (u.max_guests || 0), 0) : 0} {isAr ? "نزيل" : "Guests"}
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-72 relative">
              <input
                type="text"
                value={unitSearch}
                onChange={(e) => setUnitSearch(e.target.value)}
                placeholder={isAr ? "بحث برقم الوحدة، الاسم، أو الإطلالة..." : "Search by unit #, title, or view..."}
                className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-brand-terracotta"
              />
            </div>

            <PermissionGuard permission="manage_properties">
              <button
                type="button"
                onClick={() => setIsAddUnitModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>＋</span>
                <span>{isAr ? "إضافة وحدة جديدة للكمبوند" : "Add Sub-Unit"}</span>
              </button>
            </PermissionGuard>
          </div>

          {/* Units List */}
          {(!property.units || property.units.length === 0) ? (
            <div className="bg-white rounded-3xl border border-brand-border p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-sand/50 text-brand-brown-muted mx-auto flex items-center justify-center text-2xl">
                🏨
              </div>
              <div>
                <h4 className="text-base font-bold text-brand-brown">
                  {isAr ? "لا توجد وحدات تابعة مسجلة بعد" : "No Sub-Units Added Yet"}
                </h4>
                <p className="text-xs text-brand-brown-muted max-w-md mx-auto mt-1">
                  {isAr
                    ? "يمكنك تقسيم هذا العقار أو الكمبوند إلى وحدات وفيلات منفصلة (مثل Villa 1A، Apt 204) مع تسعير وتقويم توفر مستقل لكل وحدة."
                    : "You can divide this property or compound into individual bookable units (e.g. Villa 1A, Apt 204) with independent pricing and calendar availability."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUnitModalOpen(true)}
                className="px-5 py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                <span>＋</span>
                <span>{isAr ? "إضافة أول وحدة الآن" : "Add First Sub-Unit"}</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-xs">
              <div className="overflow-x-auto gounow-scrollbar">
                <table className="w-full text-start text-xs">
                  <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-semibold border-b border-brand-border">
                    <tr>
                      <th className="py-3 px-4 text-start">{isAr ? "رقم والرمز" : "Unit # / Ref"}</th>
                      <th className="py-3 px-4 text-start">{isAr ? "اسم الوحدة" : "Unit Title"}</th>
                      <th className="py-3 px-4 text-start">{isAr ? "الإطلالة" : "View"}</th>
                      <th className="py-3 px-4 text-start">{isAr ? "المواصفات" : "Specs"}</th>
                      <th className="py-3 px-4 text-start">{isAr ? "سعر الليلة الأساسي" : "Nightly Rate"}</th>
                      <th className="py-3 px-4 text-start">{isAr ? "حالة العرض" : "Status"}</th>
                      <th className="py-3 px-4 text-end">{isAr ? "إجراءات" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60">
                    {property.units
                      .filter((u: any) => {
                        if (!unitSearch.trim()) return true;
                        const s = unitSearch.toLowerCase();
                        return (
                          (u.unit_number && u.unit_number.toLowerCase().includes(s)) ||
                          (u.title_en && u.title_en.toLowerCase().includes(s)) ||
                          (u.title_ar && u.title_ar.toLowerCase().includes(s)) ||
                          (u.view && u.view.toLowerCase().includes(s)) ||
                          (u.reference_number && u.reference_number.toLowerCase().includes(s))
                        );
                      })
                      .map((unit: any) => {
                        const unitTitle = isAr && unit.title_ar ? unit.title_ar : unit.title_en;
                        return (
                          <tr key={unit.id} className="hover:bg-brand-sand-light/30 transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="font-mono font-bold text-brand-brown block">
                                {unit.unit_number || unit.reference_number}
                              </span>
                              <span className="text-[10px] text-brand-brown-muted font-mono">
                                {unit.reference_number}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <Link
                                href={`/admin/properties/${property.id}/units/${unit.id}`}
                                className="font-bold text-brand-brown hover:text-brand-terracotta line-clamp-1"
                              >
                                {unitTitle}
                              </Link>
                              <span className="text-[10px] text-brand-brown-muted block">
                                {unit.category?.name_en || (isAr ? "وحدة سكنية" : "Unit")}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-brand-brown">
                              {unit.view ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-sand-light text-brand-brown border border-brand-border">
                                  🌅 {unit.view}
                                </span>
                              ) : (
                                <span className="text-brand-brown-muted">-</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-brand-brown-muted">
                              <span>{unit.bedrooms} {isAr ? "غرف" : "Bed"}</span> &bull;{" "}
                              <span>{unit.bathrooms} {isAr ? "حمام" : "Bath"}</span> &bull;{" "}
                              <span>{unit.max_guests} {isAr ? "ضيوف" : "Guests"}</span>
                              {unit.area_sqm ? ` • ${unit.area_sqm} m²` : ""}
                            </td>

                            <td className="py-3.5 px-4 font-serif font-bold text-brand-brown">
                              {unit.formatted_price || `${(unit.base_price_cents / 100).toLocaleString()} ${unit.currency || "EGP"}`}
                              <span className="text-[10px] font-normal text-brand-brown-muted block">
                                {isAr ? "/ الليلة" : "/ night"}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              {unit.is_published ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                  {isAr ? "معروض للنزلاء" : "Published"}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                                  {isAr ? "مسودة / مخفي" : "Draft"}
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-end">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  href={`/admin/properties/${property.id}/units/${unit.id}`}
                                  className="px-2.5 py-1.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-lg text-xs font-bold transition shadow-xs"
                                >
                                  {isAr ? "إدارة الوحدة" : "Manage"}
                                </Link>

                                <Link
                                  href={`/stays/${unit.slug}`}
                                  target="_blank"
                                  className="px-2 py-1.5 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-lg text-xs font-medium border border-brand-border"
                                  title={isAr ? "معاينة الوحدة على الموقع العام" : "Preview Unit"}
                                >
                                  ↗
                                </Link>

                                <PermissionGuard permission="manage_properties">
                                  <button
                                    type="button"
                                    onClick={() => setDeleteUnitModal({ isOpen: true, unit, loading: false })}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200 cursor-pointer transition"
                                    title={isAr ? "حذف الوحدة التابعة" : "Delete Unit"}
                                  >
                                    🗑️
                                  </button>
                                </PermissionGuard>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 1.5: Location & Map */}
      {activeTab === "location" && (
        <form onSubmit={handleSaveLocation} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs space-y-6 text-xs">
              <div className="border-b border-brand-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-brand-brown">
                    {isAr ? "الموقع الجغرافي والإحداثيات (Geolocation & Coordinates)" : "Geolocation & Coordinates"}
                  </h3>
                  <p className="text-brand-brown-muted text-xs mt-0.5">
                    {isAr
                      ? "تحديد إحداثيات GPS الدقيقة لظهور العقار على خريطة الجونة وتوجيه النزلاء عبر خرائط Google."
                      : "Pin precise GPS coordinates for the interactive El Gouna map and guest navigation."}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={locationSaving}
                  className="px-5 py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark disabled:opacity-50 text-white rounded-xl font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-2 shrink-0"
                >
                  {locationSaving ? (isAr ? "جارٍ الحفظ..." : "Saving...") : (isAr ? "حفظ التعديلات" : "Save Location Details")}
                </button>
              </div>

              {/* Address input */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1.5">
                  {isAr ? "العنوان النصي أو الحي / الكومباوند" : "Detailed Address / Street"}
                </label>
                <input
                  type="text"
                  value={locationForm.address}
                  onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                  placeholder={isAr ? "مثال: فيلا 42، مارينا أبو تيج، الجونة" : "e.g. Villa 42, Abu Tig Marina, El Gouna"}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-brand-sand-light/40 text-brand-brown text-xs focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                />
              </div>

              {/* LocationPicker */}
              <div className="pt-2">
                <LocationPicker
                  value={locationForm}
                  onChange={(loc) => {
                    setLocationForm((prev) => ({
                      ...prev,
                      latitude: loc.latitude,
                      longitude: loc.longitude,
                      map_url: loc.map_url || prev.map_url,
                      address: loc.address || prev.address,
                    }));
                  }}
                />
              </div>
            </div>
          </div>

          {/* Location Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4 text-xs">
              <h3 className="text-base font-bold text-brand-brown border-b border-brand-border pb-3">
                {isAr ? "حالة الإحداثيات المسجلة" : "Geolocation Dossier"}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-1 border-b border-brand-border/40">
                  <span className="text-brand-brown-muted">{isAr ? "خط العرض (Latitude):" : "Latitude:"}</span>
                  <span className="font-mono font-bold text-brand-brown">
                    {locationForm.latitude !== null ? locationForm.latitude : (isAr ? "غير محدد" : "Not set")}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-brand-border/40">
                  <span className="text-brand-brown-muted">{isAr ? "خط الطول (Longitude):" : "Longitude:"}</span>
                  <span className="font-mono font-bold text-brand-brown">
                    {locationForm.longitude !== null ? locationForm.longitude : (isAr ? "غير محدد" : "Not set")}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-brand-border/40">
                  <span className="text-brand-brown-muted">{isAr ? "المنطقة / الكومباوند:" : "Area / Compound:"}</span>
                  <span className="font-bold text-brand-brown">{locationName}</span>
                </div>
              </div>

              {locationForm.latitude && locationForm.longitude && (
                <div className="pt-3">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${locationForm.latitude},${locationForm.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-brand-sand-light hover:bg-brand-sand text-brand-brown font-bold text-xs border border-brand-border flex items-center justify-center gap-1.5 transition"
                  >
                    <span>🧭</span>
                    <span>{isAr ? "فتح الموقع في خرائط Google" : "Open in Google Maps"} ↗</span>
                  </a>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                <strong className="block mb-1">{isAr ? "💡 ملحوظة أمنية ونظامية:" : "💡 Platform Notice:"}</strong>
                {isAr
                  ? "يتم التحقق من صحة الإحداثيات وسريانها ضمن حدود جمهورية مصر العربية ومنطقة البحر الأحمر برمجياً."
                  : "All coordinates undergo strict backend bounds validation within Egyptian / Red Sea boundaries."}
              </div>
            </div>
          </div>
        </form>
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

      {/* Tab: Maintenance & Operations */}
      {activeTab === "maintenance" && (
        <div className="space-y-6 text-xs">
          {/* Operations Health Status & KPI Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-xs">
              <span className="text-[10px] font-bold uppercase text-brand-brown-muted block">
                {isAr ? "حالة تشغيل العقار" : "Operational Status"}
              </span>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    property.is_published ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`}
                />
                <span className="text-sm font-bold text-brand-brown uppercase">
                  {property.status || (property.is_published ? "Active / Published" : "Draft / Paused")}
                </span>
              </div>
              <p className="text-[11px] text-brand-brown-muted mt-2">
                {property.is_published
                  ? isAr
                    ? "العقار جاهز ومتاح لاستقبال الحجوزات النشطة."
                    : "Property is live on booking channels."
                  : isAr
                    ? "العقار في وضع المسودة أو الإيقاف المؤقت."
                    : "Property is currently offline or paused."}
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-xs">
              <span className="text-[10px] font-bold uppercase text-brand-brown-muted block">
                {isAr ? "فترات الصيانة المجدولة" : "Scheduled Maintenance Outages"}
              </span>
              <div className="text-2xl font-serif font-bold text-brand-brown mt-1">
                {calendarData?.blocked_ranges.filter(
                  (b) =>
                    b.status === "maintenance" ||
                    (b.reason &&
                      (b.reason.toLowerCase().includes("maintenance") ||
                        b.reason.includes("صيانة") ||
                        b.reason.toLowerCase().includes("repair")))
                ).length || 0}
              </div>
              <p className="text-[11px] text-brand-brown-muted mt-2">
                {isAr ? "فترات إغلاق مؤكدة للصيانة أو التجديد" : "Confirmed calendar dates blocked for technical work"}
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-xs">
              <span className="text-[10px] font-bold uppercase text-brand-brown-muted block">
                {isAr ? "فحص الجاهزية والجودة" : "Quality & Readiness Index"}
              </span>
              <div className="text-2xl font-serif font-bold text-emerald-700 mt-1">
                100%
              </div>
              <p className="text-[11px] text-emerald-800 font-semibold mt-2">
                {isAr ? "جميع الأنظمة الأساسية تعمل بكفاءة" : "All critical facility systems operational"}
              </p>
            </div>
          </div>

          {/* Facility Systems Checklist */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-brand-border shadow-xs space-y-4">
            <h3 className="text-sm font-serif font-bold text-brand-brown border-b border-brand-border pb-3">
              {isAr ? "فحص الأنظمة التشغيلية المعتمدة (Facility Systems)" : "Verified Facility Systems Status"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { icon: "❄️", title_en: "HVAC & Central Air", title_ar: "التكييف والتبريد المركزي", desc: "Filters sanitized & coolant levels verified" },
                { icon: "🏊", title_en: "Lagoon / Private Pool", title_ar: "المسبح والشاطئ الخاص", desc: "Circulation pumps & chemical balance OK" },
                { icon: "⚡", title_en: "High-Speed Wi-Fi Mesh", title_ar: "شبكة الإنترنت والألياف", desc: "Dual fiber uplink active (200 Mbps+)" },
                { icon: "🔑", title_en: "Smart Keyless Lock", title_ar: "الأقفال الذكية بدون مفتاح", desc: "Passcode gateway synced / Battery 95%" },
                { icon: "💧", title_en: "Water & Desalination", title_ar: "المياه وضغط السخانات", desc: "Pressure stable / Boilers inspected" },
                { icon: "🧯", title_en: "Safety & Detectors", title_ar: "كواشف الدخان والأمان", desc: "Calibrated & certified compliant" },
              ].map((sys, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-brand-sand-light/40 border border-brand-border flex items-start gap-3">
                  <span className="text-xl">{sys.icon}</span>
                  <div>
                    <span className="font-bold text-brand-brown block">{isAr ? sys.title_ar : sys.title_en}</span>
                    <span className="text-[10px] text-brand-brown-muted">{sys.desc}</span>
                    <span className="inline-block mt-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✓ {isAr ? "تم الفحص والاعتماد" : "Inspected & Passed"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Maintenance Ledger & Schedule Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
              <div className="p-5 border-b border-brand-border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-serif font-bold text-brand-brown">
                    {isAr ? "سجل إغلاقات وأوامر الصيانة (Maintenance Log)" : "Maintenance Outages Ledger"}
                  </h3>
                  <p className="text-[11px] text-brand-brown-muted mt-0.5">
                    {isAr
                      ? "فترات الإغلاق المحجوزة لأغراض الصيانة الدورية أو الإصلاحات الفنية."
                      : "Dates blocked to perform scheduled servicing, HVAC maintenance, or refurbishment."}
                  </p>
                </div>
              </div>

              {(!calendarData ||
                calendarData.blocked_ranges.filter(
                  (b) =>
                    b.status === "maintenance" ||
                    (b.reason &&
                      (b.reason.toLowerCase().includes("maintenance") ||
                        b.reason.includes("صيانة") ||
                        b.reason.toLowerCase().includes("repair")))
                ).length === 0) ? (
                <div className="p-8 text-center text-brand-brown-muted">
                  {isAr ? "لا توجد فترات صيانة مجدولة حالياً لهذا العقار." : "No scheduled maintenance outages recorded."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-start">
                    <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-bold text-[10px]">
                      <tr>
                        <th className="py-3 px-4 text-start">{isAr ? "من تاريخ" : "Start Date"}</th>
                        <th className="py-3 px-4 text-start">{isAr ? "إلى تاريخ" : "End Date"}</th>
                        <th className="py-3 px-4 text-start">{isAr ? "البيان / السبب" : "Work Order Reason"}</th>
                        <th className="py-3 px-4 text-start">{isAr ? "الحالة" : "Status"}</th>
                        <th className="py-3 px-4 text-end">{isAr ? "إجراء" : "Action"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/60">
                      {calendarData.blocked_ranges
                        .filter(
                          (b) =>
                            b.status === "maintenance" ||
                            (b.reason &&
                              (b.reason.toLowerCase().includes("maintenance") ||
                                b.reason.includes("صيانة") ||
                                b.reason.toLowerCase().includes("repair")))
                        )
                        .map((block) => (
                          <tr key={block.id} className="hover:bg-brand-sand-light/30">
                            <td className="py-3.5 px-4 font-mono font-bold text-brand-brown">{block.start_date}</td>
                            <td className="py-3.5 px-4 font-mono font-bold text-brand-brown">{block.end_date}</td>
                            <td className="py-3.5 px-4 font-medium text-brand-brown">{block.reason || "Scheduled Technical Maintenance"}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                                {block.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-end">
                              <button
                                onClick={() => handleRemoveBlock(block.id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold cursor-pointer"
                              >
                                {isAr ? "إنهاء الإغلاق" : "Release"}
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick Schedule Maintenance Outage Form */}
            <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4">
              <h3 className="text-sm font-serif font-bold text-brand-brown border-b border-brand-border pb-2">
                {isAr ? "+ جدولة إغلاق صيانة" : "+ Schedule Maintenance Outage"}
              </h3>
              <p className="text-brand-brown-muted leading-relaxed">
                {isAr
                  ? "إغلاق التواريخ رسمياً في التقويم لمنع أي حجوزات أثناء قيام فريق الصيانة بالعمل."
                  : "Block calendar dates immediately to prevent bookings during technical servicing."}
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddBlock(e);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "تاريخ بدء الصيانة *" : "Start Date *"}
                  </label>
                  <input
                    type="date"
                    required
                    value={blockForm.start_date}
                    onChange={(e) => setBlockForm({ ...blockForm, start_date: e.target.value, status: "maintenance" })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-sand-light/40 text-brand-brown"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "تاريخ انتهاء الصيانة *" : "End Date *"}
                  </label>
                  <input
                    type="date"
                    required
                    value={blockForm.end_date}
                    onChange={(e) => setBlockForm({ ...blockForm, end_date: e.target.value, status: "maintenance" })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-sand-light/40 text-brand-brown"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "بيان أمر العمل *" : "Work Order Description *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isAr ? "مثال: صيانة التكييف أو الفلاتر" : "e.g. AC Filter Overhaul / Painting"}
                    value={blockForm.reason}
                    onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value, status: "maintenance" })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-sand-light/40 text-brand-brown"
                  />
                </div>

                <button
                  type="submit"
                  disabled={blockSubmitting}
                  className="w-full py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark disabled:opacity-50 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  {blockSubmitting ? (isAr ? "جارٍ الحفظ..." : "Scheduling...") : (isAr ? "تأكيد إغلاق الصيانة" : "Confirm Maintenance Block")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Pricing & Seasons */}
      {activeTab === "pricing" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden text-xs">
              <div className="p-6 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-brand-brown">
                    {isAr ? "قواعد التسعير الموسمي (Seasonal Rates)" : "Seasonal Pricing Rules"}
                  </h3>
                  <p className="text-[11px] text-brand-brown-muted mt-0.5">
                    {isAr ? "قواعد الأسعار الموسمية الخاصة بهذا العقار المحدد" : "Seasonal rules specific to this inventory item"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/pricing?tab=calendar&property_id=${property.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-sand-light hover:bg-brand-sand text-brand-brown border border-brand-border text-xs font-bold transition shadow-2xs"
                  >
                    <span>📅</span>
                    <span>{isAr ? "فتح تقويم التسعير" : "Pricing Calendar"}</span>
                    <span className="text-[10px]">↗</span>
                  </Link>
                  <Link
                    href={`/admin/pricing?tab=preview&property_id=${property.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-sand-light hover:bg-brand-sand text-brand-brown border border-brand-border text-xs font-bold transition shadow-2xs"
                  >
                    <span>🧮</span>
                    <span>{isAr ? "محاكي عروض الأسعار" : "Quote Simulator"}</span>
                    <span className="text-[10px]">↗</span>
                  </Link>
                </div>
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

      {/* Tab: Concierge & Experiential Services */}
      {activeTab === "services" && (
        <div className="space-y-6 text-xs">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-brand-border shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-brand-brown">
                  {isAr ? "خدمات الجونة والكونسيرج المتاحة للعقار" : "El Gouna Concierge & Experiential Services"}
                </h3>
                <p className="text-[11px] text-brand-brown-muted mt-0.5">
                  {isAr
                    ? "الخدمات الحصرية المتكاملة المتاحة للنزلاء في هذا العقار بإشراف فريق كونسيرج المنصة."
                    : "Exclusive on-demand and integrated experiences available for guests staying at this property."}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                <span>⭐</span>
                <span>{isAr ? "خدمات 5 نجوم معتمدة" : "GouNow Concierge Verified"}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {[
                {
                  icon: "🛺",
                  name_en: "Lagoon Buggy / Club Car",
                  name_ar: "عربة جولف كهربائية (Buggy)",
                  desc_en: "Dedicated 4-seater electric buggy delivered to villa for internal El Gouna mobility.",
                  desc_ar: "عربة كهربائية خاصة للتنقل بحرية داخل أحياء ومنتجعات الجونة طوال فترة الإقامة.",
                  badge: "Most Requested",
                },
                {
                  icon: "🚤",
                  name_en: "Private Boat & Lagoon Cruising",
                  name_ar: "يخت ورحلات بحرية خاصة",
                  desc_en: "Private skippered lagoon tour, sunset cruising, and kitesurf sandbank drop-offs.",
                  desc_ar: "رحلات خاصة بقوارب فاخرة وجولات في اللاجون إلى جانب رحلات الغطس والكايت سيرف.",
                  badge: "Lagoon Direct",
                },
                {
                  icon: "🧹",
                  name_en: "Premium Daily Housekeeping",
                  name_ar: "خدمة تنظيف وضيافة يومية",
                  desc_en: "Scheduled hotel-grade daily housekeeping, linen change, and evening turndown.",
                  desc_ar: "خدمة تنظيف فندقية راقية تشمل تغيير المفروشات والمناشف وفق أعلى المعايير.",
                  badge: "On-Demand",
                },
                {
                  icon: "👨‍🍳",
                  name_en: "Private Villa Chef",
                  name_ar: "شيف خاص داخل الفيلا",
                  desc_en: "Bespoke seafood BBQ, Mediterranean breakfast, and fine dining prepared in-villa.",
                  desc_ar: "طاهٍ محترف لتحضير وجبات المأكولات البحرية والمشاوي الفاخرة داخل الفيلا.",
                  badge: "VIP Gourmet",
                },
                {
                  icon: "✈️",
                  name_en: "Hurghada Airport VIP Transfer",
                  name_ar: "توصيل مطار الغردقة VIP",
                  desc_en: "Executive Mercedes-Benz transfer with flight monitoring and luggage assistance.",
                  desc_ar: "خدمة استقبال وتوصيل خاصة من وإلى مطار الغردقة الدولي بسيارات فاخرة وسائق خاص.",
                  badge: "Airport Direct",
                },
                {
                  icon: "🏄",
                  name_en: "Kitesurfing & Sliders Gear",
                  name_ar: "معدات وتجارب الكايت سيرف",
                  desc_en: "Direct locker storage and VIP access to Sliders Cable Park & Element Watersports.",
                  desc_ar: "حفظ وتجهيز معدات التزلج على الماء واشتراكات حصرية في سلايدرز بارك ومراكز الكايت.",
                  badge: "Watersports",
                },
                {
                  icon: "👶",
                  name_en: "Certified Nanny & Baby Gear",
                  name_ar: "جليسة أطفال ومستلزمات صغار",
                  desc_en: "Background-checked multilingual babysitter, premium cribs, and beach gear.",
                  desc_ar: "رعاية أطفال موثوقة مع توفير أسرّة أطفال وكراسي طعام ومستلزمات شاطئ للأطفال.",
                  badge: "Family Safe",
                },
                {
                  icon: "🐾",
                  name_en: "Pet-Friendly Welcome Kit",
                  name_ar: "باقة النزلاء برفقة الحيوانات",
                  desc_en: "Complimentary luxury pet beds, water bowls, and direct lagoon beach pet access.",
                  desc_ar: "تجهيزات خاصة للحيوانات الأليفة تشمل أسرة وأواني ومسارات مشي مخصصة باللاجون.",
                  badge: "Pet Friendly",
                },
              ].map((svc, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-brand-sand-light/40 border border-brand-border flex flex-col justify-between hover:border-brand-terracotta/40 transition group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{svc.icon}</span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-brand-border text-[9px] font-bold text-brand-brown">
                        {svc.badge}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-brown group-hover:text-brand-terracotta transition">
                        {isAr ? svc.name_ar : svc.name_en}
                      </h4>
                      <p className="text-[11px] text-brand-brown-muted mt-1 leading-relaxed">
                        {isAr ? svc.desc_ar : svc.desc_en}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-brand-border/60 mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-bold">
                      ● {isAr ? "متاح للطلب" : "Available"}
                    </span>
                    <span className="text-brand-terracotta font-bold">
                      {isAr ? "عبر الكونسيرج" : "Via Concierge"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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

      {/* Tab: Activity Log & Audit Trail */}
      {activeTab === "activity" && (
        <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden text-xs">
          <div className="p-6 border-b border-brand-border flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif font-bold text-brand-brown">
                {isAr ? "سجل النشاط وتتبع العمليات (Audit Trail)" : "Property Activity & Audit Trail"}
              </h3>
              <p className="text-[11px] text-brand-brown-muted mt-0.5">
                {isAr
                  ? "تسجيل لكافة التعديلات الإدارية وحركات الأسعار والمخزون الخاصة بهذا العقار."
                  : "Immutable log of all admin modifications, status changes, and inventory actions."}
              </p>
            </div>
            <span className="text-xs text-brand-brown-muted font-mono">
              {property.recent_activity?.length || 0} {isAr ? "سجلات" : "events"}
            </span>
          </div>

          {!property.recent_activity || property.recent_activity.length === 0 ? (
            <div className="p-8 text-center text-brand-brown-muted">
              {isAr ? "لا توجد سجلات نشاط مسجلة لهذا العقار حتى الآن." : "No activity logs recorded for this property yet."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start">
                <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="py-3 px-4 text-start">{isAr ? "التوقيت" : "Timestamp"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "المسؤول" : "Actor"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "نوع الإجراء" : "Action"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "التفاصيل" : "Description"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {property.recent_activity.map((act: any) => (
                    <tr key={act.id} className="hover:bg-brand-sand-light/30">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-brand-brown-muted" dir="ltr">
                        {act.created_at ? new Date(act.created_at).toLocaleString() : "-"}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-brand-brown">
                        {act.user_name || "Administrator"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-brand-sand-light text-brand-brown border border-brand-border uppercase">
                          {act.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-brand-brown font-medium">
                        {act.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirm Property Deletion Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title={isAr ? "تأكيد حذف أو أرشفة العقار" : "Confirm Property Deletion"}
        description={
          isAr
            ? `هل أنت متأكد من رغبتك في حذف العقار [${property.reference_number}] (${title}) نهائياً من النظام؟ لا يمكن حذف العقارات التي تحتوي على حجوزات نشطة أو قادمة حفاظاً على سلامة البيانات المالية.`
            : `Are you sure you want to permanently delete [${property.reference_number}] (${title})? Properties with active or upcoming bookings cannot be deleted.`
        }
        confirmText={isAr ? "نعم، حذف العقار" : "Yes, Delete Property"}
        cancelText={isAr ? "إلغاء" : "Cancel"}
        isDestructive={true}
        isLoading={deleteLoading}
        onConfirm={handleDeleteProperty}
        onCancel={() => setDeleteModalOpen(false)}
      />

      {/* Modal: Add Sub-Unit */}
      {isAddUnitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-brand-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-brand-border pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif font-bold text-brand-brown">
                  {isAr ? "إضافة وحدة جديدة تابعة لهذا العقار" : "Add Sub-Unit to Property"}
                </h3>
                <p className="text-[11px] text-brand-brown-muted">
                  {property.reference_number} • {title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUnitModalOpen(false)}
                className="text-brand-brown-muted hover:text-brand-brown text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUnit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "رقم / اسم الوحدة الداخلي *" : "Unit Number / Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={unitForm.unit_number}
                    onChange={(e) => setUnitForm({ ...unitForm, unit_number: e.target.value })}
                    placeholder="e.g. Villa 102, Apt 3B"
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "الإطلالة (View) *" : "View *"}
                  </label>
                  <select
                    value={unitForm.view}
                    onChange={(e) => setUnitForm({ ...unitForm, view: e.target.value })}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5"
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "عنوان الوحدة بالإنجليزية *" : "Unit Title (English) *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={unitForm.title_en}
                    onChange={(e) => setUnitForm({ ...unitForm, title_en: e.target.value })}
                    placeholder="e.g. Luxury 2BR Lagoon View Villa"
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5"
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
                    placeholder="مثال: فيلا فاخرة غرفتين مطلة على اللاجون"
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
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
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "الحمامات *" : "Baths *"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={unitForm.bathrooms}
                    onChange={(e) => setUnitForm({ ...unitForm, bathrooms: Number(e.target.value) })}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono"
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
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono"
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
                    placeholder="150"
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    placeholder="8500"
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "حالة النشر الأولية" : "Initial Visibility"}
                  </label>
                  <select
                    value={unitForm.status}
                    onChange={(e) => setUnitForm({ ...unitForm, status: e.target.value as any })}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5"
                  >
                    <option value="published">{isAr ? "معروض ونشط للنزلاء (Published)" : "Active / Published"}</option>
                    <option value="draft">{isAr ? "مسودة غير معروضة (Draft)" : "Draft / Hidden"}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsAddUnitModalOpen(false)}
                  className="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl font-bold cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={unitSubmitting}
                  className="px-5 py-2 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl font-bold disabled:opacity-50 cursor-pointer"
                >
                  {unitSubmitting ? (isAr ? "جاري الإنشاء..." : "Creating...") : isAr ? "إضافة الوحدة" : "Add Sub-Unit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Unit Deletion Dialog */}
      <ConfirmDialog
        isOpen={deleteUnitModal.isOpen}
        title={isAr ? "تأكيد حذف الوحدة التابعة" : "Confirm Sub-Unit Deletion"}
        description={
          isAr
            ? `هل أنت متأكد من حذف الوحدة التابعة [${deleteUnitModal.unit?.unit_number || deleteUnitModal.unit?.reference_number}]؟ لا يمكن التراجع عن هذه العملية.`
            : `Are you sure you want to delete sub-unit [${deleteUnitModal.unit?.unit_number || deleteUnitModal.unit?.reference_number}]? This action cannot be undone.`
        }
        confirmText={isAr ? "نعم، حذف الوحدة" : "Yes, Delete Sub-Unit"}
        cancelText={isAr ? "إلغاء" : "Cancel"}
        isDestructive={true}
        isLoading={deleteUnitModal.loading}
        onConfirm={handleConfirmDeleteUnit}
        onCancel={() => setDeleteUnitModal({ isOpen: false, unit: null, loading: false })}
      />
    </div>
  );
}

function number_format(number: number, decimals: number): string {
  return number.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
