"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAdminProperties, togglePropertyStatus, deleteAdminProperty } from "@/features/admin/services/admin.api";
import type { AdminPropertyItem, AdminPropertySummary } from "@/features/admin/types";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function AdminPropertiesPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [properties, setProperties] = useState<AdminPropertyItem[]>([]);
  const [summary, setSummary] = useState<AdminPropertySummary>({
    total: 0,
    published: 0,
    paused: 0,
    rent: 0,
    sale: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Action Dialog State for Pause/Resume Display
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    property: AdminPropertyItem | null;
    action: "pause" | "activate";
    loading: boolean;
  }>({
    isOpen: false,
    property: null,
    action: "pause",
    loading: false,
  });

  // Action Dialog State for Property Deletion
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    property: AdminPropertyItem | null;
    loading: boolean;
  }>({
    isOpen: false,
    property: null,
    loading: false,
  });

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const typeParam = filterType !== "all" ? filterType : undefined;
      const statusParam = filterStatus !== "all" ? filterStatus : undefined;
      const searchParam = searchQuery.trim() || undefined;

      const res = await getAdminProperties({
        type: typeParam,
        status: statusParam,
        search: searchParam,
      });

      setProperties(res.data);
      if (res.summary) {
        setSummary(res.summary);
      }
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProperties();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchProperties]);

  const handleToggleClick = (prop: AdminPropertyItem) => {
    const action = prop.is_published ? "pause" : "activate";
    setDialogState({
      isOpen: true,
      property: prop,
      action,
      loading: false,
    });
  };

  const handleConfirmToggle = async () => {
    if (!dialogState.property) return;
    setDialogState((prev) => ({ ...prev, loading: true }));

    try {
      const res = await togglePropertyStatus(dialogState.property.id);
      setFeedback({
        type: "success",
        message: res.message || (dialogState.action === "pause"
          ? (isAr ? "تم إيقاف عرض الوحدة بنجاح." : "Property display paused successfully.")
          : (isAr ? "تم تفعيل عرض الوحدة بنجاح." : "Property activated and displayed successfully.")),
      });

      // Update local state immediately
      setProperties((prev) =>
        prev.map((item) =>
          item.id === dialogState.property?.id
            ? {
                ...item,
                is_published: res.data.is_published,
                status: res.data.is_published ? "published" : "draft",
              }
            : item
        )
      );

      // Refresh aggregate counts
      setSummary((prev) => ({
        ...prev,
        published: dialogState.action === "pause" ? Math.max(0, prev.published - 1) : prev.published + 1,
        paused: dialogState.action === "pause" ? prev.paused + 1 : Math.max(0, prev.paused - 1),
      }));

      setDialogState({ isOpen: false, property: null, action: "pause", loading: false });
    } catch {
      setFeedback({
        type: "error",
        message: isAr
          ? "تعذر تغيير حالة عرض الوحدة، يرجى المحاولة مرة أخرى."
          : "Failed to update property display status.",
      });
      setDialogState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteClick = (prop: AdminPropertyItem) => {
    setDeleteDialog({
      isOpen: true,
      property: prop,
      loading: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.property) return;
    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      await deleteAdminProperty(deleteDialog.property.id);
      setFeedback({
        type: "success",
        message: isAr ? "تم حذف العقار بنجاح." : "Property deleted successfully.",
      });
      setProperties((prev) => prev.filter((p) => p.id !== deleteDialog.property?.id));
      setSummary((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        published: deleteDialog.property?.is_published ? Math.max(0, prev.published - 1) : prev.published,
        paused: !deleteDialog.property?.is_published ? Math.max(0, prev.paused - 1) : prev.paused,
      }));
      setDeleteDialog({ isOpen: false, property: null, loading: false });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر حذف العقار لوجود حجوزات نشطة مرتبطة به." : "Cannot delete property with active bookings."),
      });
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-brown">
            {isAr ? "محفظة العقارات والوحدات الفاخرة" : "Properties & Units Portfolio"}
          </h1>
          <p className="text-xs text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "إدارة الفلل، الشاليهات، والشقق المتاحة للإيجار أو الشراء، مع التحكم اللحظي في حالة ظهورها للعملاء."
              : "Manage vacation villas, chalets, and real estate listings with instant public visibility controls."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/properties/create"
            className="px-4 py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-xs flex items-center justify-center cursor-pointer"
          >
            <span>{isAr ? "+ إضافة وحدة جديدة" : "+ Add Property"}</span>
          </Link>
        </div>
      </div>

      {/* KPI Counters Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs">
          <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
            {isAr ? "إجمالي الوحدات" : "Total Units"}
          </span>
          <span className="text-xl font-bold font-serif text-brand-brown mt-0.5 block">
            {summary.total}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-800 block">
            {isAr ? "معروض للعملاء (نشط)" : "Active Displayed"}
          </span>
          <span className="text-xl font-bold font-serif text-emerald-700 mt-0.5 block">
            {summary.published}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-800 block">
            {isAr ? "متوقف عن العرض (مخفي)" : "Display Paused"}
          </span>
          <span className="text-xl font-bold font-serif text-amber-700 mt-0.5 block">
            {summary.paused}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs">
          <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
            {isAr ? "إقامات العطلات" : "Vacation Rentals"}
          </span>
          <span className="text-xl font-bold font-serif text-brand-brown mt-0.5 block">
            {summary.rent}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs">
          <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
            {isAr ? "عقارات للبيع" : "For Sale"}
          </span>
          <span className="text-xl font-bold font-serif text-brand-brown mt-0.5 block">
            {summary.sale}
          </span>
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
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline cursor-pointer"
          >
            {isAr ? "إغلاق" : "Dismiss"}
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-brand-border shadow-xs">
        {/* Type Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              filterType === "all"
                ? "bg-brand-terracotta text-white shadow-xs"
                : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
            }`}
          >
            {isAr ? "جميع الأنواع" : "All Types"} ({summary.total})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("rent")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              filterType === "rent"
                ? "bg-brand-terracotta text-white shadow-xs"
                : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
            }`}
          >
            {isAr ? "إيجار العطلات" : "Rentals"} ({summary.rent})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("sale")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              filterType === "sale"
                ? "bg-brand-terracotta text-white shadow-xs"
                : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
            }`}
          >
            {isAr ? "بيع وتملك" : "For Sale"} ({summary.sale})
          </button>
        </div>

        {/* Status Dropdown & Search */}
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-brand-border text-xs font-medium text-brand-brown bg-brand-sand-light/50 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
          >
            <option value="all">{isAr ? "جميع حالات العرض" : "All Visibility"}</option>
            <option value="published">{isAr ? "معروض فقط (نشط)" : "Active Display Only"}</option>
            <option value="paused">{isAr ? "متوقف عن العرض (مخفي)" : "Paused Only"}</option>
          </select>

          <input
            type="text"
            placeholder={isAr ? "بحث بالاسم أو الكود أو المنطقة..." : "Search by name, code, compound..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-brand-border text-xs text-brand-brown bg-brand-sand-light/50 placeholder:text-brand-brown-muted focus:outline-none focus:ring-1 focus:ring-brand-terracotta w-full sm:w-64"
          />
        </div>
      </div>

      {/* Properties Table Card */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingState message={isAr ? "جارٍ تحميل محفظة العقارات..." : "Loading properties portfolio..."} />
          </div>
        ) : properties.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={isAr ? "لا توجد عقارات مطابقة للبحث" : "No properties found"}
              description={
                isAr
                  ? "جرّب تغيير فلاتر البحث أو إضافة وحدة جديدة للمنظومة."
                  : "Try adjusting your search criteria or add a new property listing."
              }
              actionText={isAr ? "إعادة ضبط الفلاتر" : "Reset Filters"}
              onAction={() => {
                setFilterType("all");
                setFilterStatus("all");
                setSearchQuery("");
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto gounow-scrollbar">
            <table className="w-full text-start text-xs">
              <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-semibold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4 text-start">{isAr ? "العقار / الوحدة" : "Property"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "كود الوحدة" : "Reference"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "المنطقة" : "Location"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "نوع الإدراج" : "Listing"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "المواصفات" : "Specs"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "السعر" : "Pricing"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "حالة العرض للجمهور" : "Display Status"}</th>
                  <th className="py-3 px-4 text-end">{isAr ? "إجراءات التحكم" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {properties.map((prop) => {
                  const title = isAr && prop.title_ar ? prop.title_ar : prop.title_en;
                  const locName = isAr && prop.location?.name_ar ? prop.location.name_ar : prop.location?.name_en || "الجونة";
                  const catName = isAr && prop.category?.name_ar ? prop.category.name_ar : prop.category?.name_en || "فيلا";

                  return (
                    <tr
                      key={prop.id}
                      className={`hover:bg-brand-sand-light/30 transition-colors ${
                        !prop.is_published ? "bg-amber-50/20" : ""
                      }`}
                    >
                      {/* Property Title & Image */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl overflow-hidden bg-brand-sand relative shrink-0 border border-brand-border">
                            <Image
                              src={prop.primary_image}
                              alt={title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <Link
                              href={`/stays/${prop.slug}`}
                              target="_blank"
                              className="font-bold text-brand-brown hover:text-brand-terracotta line-clamp-1 max-w-[220px]"
                            >
                              {title}
                            </Link>
                            <span className="text-[10px] text-brand-brown-muted block">
                              {catName} {prop.compound ? `• ${prop.compound}` : ""}
                            </span>
                            {typeof prop.units_count === "number" && prop.units_count > 0 && (
                              <Link
                                href={`/admin/properties/${prop.id}?tab=units`}
                                className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-sand-light hover:bg-brand-sand text-brand-brown border border-brand-border transition"
                                title={isAr ? "عرض وإدارة الوحدات التابعة" : "View and manage sub-units"}
                              >
                                <span>🏨 {prop.units_count} {isAr ? "وحدات تابعة" : "Sub-Units"}</span>
                              </Link>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Reference Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-brown">
                        {prop.reference_number}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-brand-brown font-medium">
                        {locName}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            prop.listing_type === "rent"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-purple-50 text-purple-700 border border-purple-200"
                          }`}
                        >
                          {prop.listing_type === "rent"
                            ? isAr ? "إيجار عطلات" : "Rent"
                            : isAr ? "بيع وتملك" : "Sale"}
                        </span>
                      </td>

                      {/* Specs */}
                      <td className="py-3.5 px-4 text-brand-brown-muted">
                        <span>{prop.bedrooms} {isAr ? "غرف" : "Bed"}</span> &bull;{" "}
                        <span>{prop.bathrooms} {isAr ? "حمام" : "Bath"}</span>
                        {prop.max_guests ? ` • ${prop.max_guests} ${isAr ? "ضيوف" : "Guests"}` : ""}
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4 font-bold text-brand-brown">
                        {prop.formatted_price}
                        <span className="text-[10px] font-normal text-brand-brown-muted block">
                          {prop.listing_type === "rent" ? (isAr ? "/ الليلة" : "/ night") : ""}
                        </span>
                      </td>

                      {/* Display Status Badge */}
                      <td className="py-3.5 px-4">
                        {prop.is_published ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            <span>{isAr ? "معروض للعملاء (نشط)" : "Active Displayed"}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            <span>{isAr ? "متوقف عن العرض (مخفي)" : "Display Paused"}</span>
                          </span>
                        )}
                      </td>

                      {/* Control Actions */}
                      <td className="py-3.5 px-4 text-end">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Manage Listing Link */}
                          <Link
                            href={`/admin/properties/${prop.id}`}
                            className="px-2.5 py-1.5 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-lg text-xs font-bold border border-brand-border transition"
                            title={isAr ? "إدارة وتعديل الوحدة والموقع" : "Manage property and geolocation"}
                          >
                            {isAr ? "إدارة" : "Manage"}
                          </Link>

                          {/* Dedicated Pricing & Calendar Jump */}
                          <Link
                            href={`/admin/pricing?property_id=${prop.id}`}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold border border-amber-200 transition"
                            title={isAr ? "قواعد الأسعار والتقويم والخصومات" : "Pricing rules, calendar & discounts"}
                          >
                            <span>📅 {isAr ? "الأسعار" : "Pricing"}</span>
                          </Link>

                          {/* Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleClick(prop)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              prop.is_published
                                ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                                : "bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300"
                            }`}
                            title={
                              prop.is_published
                                ? isAr ? "إيقاف عرض الوحدة للجمهور" : "Pause displaying this unit to the public"
                                : isAr ? "إعادة تفعيل وعرض الوحدة" : "Resume and activate display of this unit"
                            }
                          >
                            {prop.is_published
                              ? isAr ? "إيقاف" : "Pause"
                              : isAr ? "تفعيل" : "Activate"}
                          </button>

                          {/* Public View Link */}
                          <Link
                            href={`/stays/${prop.slug}`}
                            target="_blank"
                            className="px-2 py-1.5 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-lg text-xs font-medium border border-brand-border"
                            title={isAr ? "معاينة الوحدة على الموقع العام" : "View on public website"}
                          >
                            {isAr ? "عرض" : "View"}
                          </Link>

                          {/* Delete Action */}
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(prop)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200 cursor-pointer transition"
                            title={isAr ? "حذف الوحدة نهائياً" : "Delete property listing"}
                          >
                            🗑️
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

      {/* Confirmation Dialog for Pause/Activate Display */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={
          dialogState.action === "pause"
            ? isAr ? "إيقاف عرض الوحدة للعملاء" : "Pause Public Display"
            : isAr ? "تفعيل وإعادة عرض الوحدة للعملاء" : "Activate Public Display"
        }
        description={
          dialogState.action === "pause"
            ? isAr
              ? `هل أنت متأكد من رغبتك في إيقاف عرض الوحدة [${dialogState.property?.reference_number}] (${dialogState.property?.title_ar || dialogState.property?.title_en})؟ سيتم إخفاؤها فوراً من نتائج البحث والصفحة الرئيسية ولا يمكن للزوار حجزها حتى تعيد تفعيلها.`
              : `Are you sure you want to pause public display for [${dialogState.property?.reference_number}]? It will immediately disappear from search results and the homepage.`
            : isAr
              ? `هل أنت متأكد من رغبتك في إعادة تفعيل وعرض الوحدة [${dialogState.property?.reference_number}] (${dialogState.property?.title_ar || dialogState.property?.title_en})؟ ستظهر فوراً في نتائج البحث والصفحة الرئيسية ويتمكن النزلاء من حجزها.`
              : `Are you sure you want to activate and display [${dialogState.property?.reference_number}]? It will become publicly visible and bookable immediately.`
        }
        confirmText={
          dialogState.action === "pause"
            ? isAr ? "تأكيد إيقاف العرض" : "Confirm Pause"
            : isAr ? "تأكيد تفعيل العرض" : "Confirm Activation"
        }
        cancelText={isAr ? "إلغاء" : "Cancel"}
        isDestructive={dialogState.action === "pause"}
        isLoading={dialogState.loading}
        onConfirm={handleConfirmToggle}
        onCancel={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Confirmation Dialog for Property Deletion */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={isAr ? "تأكيد حذف أو أرشفة العقار" : "Confirm Property Deletion"}
        description={
          isAr
            ? `هل أنت متأكد من رغبتك في حذف العقار [${deleteDialog.property?.reference_number}] (${deleteDialog.property?.title_ar || deleteDialog.property?.title_en}) نهائياً من النظام؟ لا يمكن حذف العقارات المرتبطة بحجوزات نشطة حفاظاً على سلامة العمليات المالية.`
            : `Are you sure you want to permanently delete [${deleteDialog.property?.reference_number}]? Properties with active bookings cannot be deleted.`
        }
        confirmText={isAr ? "نعم، حذف العقار" : "Yes, Delete Property"}
        cancelText={isAr ? "إلغاء" : "Cancel"}
        isDestructive={true}
        isLoading={deleteDialog.loading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
