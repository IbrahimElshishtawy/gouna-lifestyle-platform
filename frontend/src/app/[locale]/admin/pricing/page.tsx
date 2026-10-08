"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getPricingOverview,
  getPricingCalendarMatrix,
  previewPriceQuote,
  analyzeSeasonalOverlap,
  getPricingRules,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
  applyPriceOverride,
  getAdminDiscounts,
  createAdminDiscount,
  toggleAdminDiscount,
  deleteAdminDiscount,
  updateAdminProperty,
} from "@/features/admin/services/admin.api";
import type {
  PricingOverviewResponse,
  PricingOverviewPropertyItem,
  PricingCalendarDayItem,
  PricePreviewResponse,
  SeasonalPriceItem,
  AdminDiscountItem,
  SeasonalOverlapResponse,
} from "@/features/admin/types";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type PricingTab = "overview" | "seasons" | "calendar" | "preview" | "discounts";

export default function AdminPricingPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as PricingTab) || "overview";
  const initialPropertyId = searchParams.get("property_id")
    ? parseInt(searchParams.get("property_id")!, 10)
    : null;

  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [activeTab, setActiveTab] = useState<PricingTab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // 1. Overview State
  const [overviewData, setOverviewData] = useState<PricingOverviewResponse | null>(null);

  // 2. Base Price Modal State
  const [editingProperty, setEditingProperty] = useState<PricingOverviewPropertyItem | null>(null);
  const [newBasePrice, setNewBasePrice] = useState<string>("");
  const [updatingBasePrice, setUpdatingBasePrice] = useState(false);

  // 3. Seasonal Rules State
  const [rules, setRules] = useState<SeasonalPriceItem[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [ruleSearch, setRuleSearch] = useState("");
  const [rulePropertyFilter, setRulePropertyFilter] = useState<number | "">("");

  // Rule Create / Edit Modal State
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [ruleForm, setRuleForm] = useState({
    property_id: initialPropertyId || 0,
    is_global: false,
    rule_type: "season" as "season" | "holiday" | "weekend" | "override",
    adjustment_type: "fixed" as "fixed" | "percentage",
    adjustment_percent: 0,
    days_of_week: ["Friday", "Saturday"] as string[],
    name_en: "",
    name_ar: "",
    start_date: "",
    end_date: "",
    price_cents: 0,
    priority: 1,
    min_stay_nights: 1,
    notes: "",
  });
  const [ruleSubmitting, setRuleSubmitting] = useState(false);
  const [overlapWarning, setOverlapWarning] = useState<SeasonalOverlapResponse | null>(null);

  // 4. Calendar State
  const [selectedPropertyId, setSelectedPropertyId] = useState<number>(initialPropertyId || 0);
  const [calendarYear, setCalendarYear] = useState<number>(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(new Date().getMonth() + 1);
  const [calendarDays, setCalendarDays] = useState<PricingCalendarDayItem[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  // Date Override Modal State
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    start_date: "",
    end_date: "",
    price: "",
    min_stay: "",
    reason: "",
  });
  const [overrideSubmitting, setOverrideSubmitting] = useState(false);

  // 5. Price Preview Calculator State
  const [previewPropertyId, setPreviewPropertyId] = useState<number>(initialPropertyId || 0);
  const [previewCheckIn, setPreviewCheckIn] = useState<string>("");
  const [previewCheckOut, setPreviewCheckOut] = useState<string>("");
  const [previewGuests, setPreviewGuests] = useState<number>(2);
  const [previewPromoCode, setPreviewPromoCode] = useState<string>("");
  const [previewResult, setPreviewResult] = useState<PricePreviewResponse | null>(null);
  const [previewCalculating, setPreviewCalculating] = useState(false);

  // 6. Discounts State
  const [discounts, setDiscounts] = useState<AdminDiscountItem[]>([]);
  const [discountsLoading, setDiscountsLoading] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountForm, setDiscountForm] = useState({
    name_en: "",
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: 10,
    valid_from: "",
    valid_until: "",
    min_stay_nights: 1,
  });
  const [discountSubmitting, setDiscountSubmitting] = useState(false);

  // Confirm Dialog State for Deletions
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: async () => {},
  });

  // Sync tab from URL if changed
  useEffect(() => {
    const tabParam = searchParams.get("tab") as PricingTab;
    if (tabParam && ["overview", "seasons", "calendar", "preview", "discounts"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Load Overview
  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPricingOverview();
      setOverviewData(data);
      if (data.properties.length > 0) {
        if (!selectedPropertyId) {
          setSelectedPropertyId(initialPropertyId || data.properties[0].id);
        }
        if (!previewPropertyId) {
          setPreviewPropertyId(initialPropertyId || data.properties[0].id);
        }
        if (!ruleForm.property_id) {
          setRuleForm((prev) => ({ ...prev, property_id: data.properties[0].id }));
        }
      }
    } catch {
      setOverviewData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedPropertyId, previewPropertyId, ruleForm.property_id, initialPropertyId]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Load Rules when tab is seasons
  const fetchRules = useCallback(async () => {
    setRulesLoading(true);
    try {
      const res = await getPricingRules({
        property_id: rulePropertyFilter ? Number(rulePropertyFilter) : undefined,
        search: ruleSearch.trim() || undefined,
      });
      setRules(res.data);
    } catch {
      setRules([]);
    } finally {
      setRulesLoading(false);
    }
  }, [rulePropertyFilter, ruleSearch]);

  useEffect(() => {
    if (activeTab === "seasons") {
      fetchRules();
    }
  }, [activeTab, fetchRules]);

  // Load Calendar Matrix
  const fetchCalendar = useCallback(async () => {
    if (!selectedPropertyId) return;
    setCalendarLoading(true);
    try {
      const res = await getPricingCalendarMatrix(selectedPropertyId, calendarYear, calendarMonth);
      setCalendarDays(res.calendar || []);
    } catch {
      setCalendarDays([]);
    } finally {
      setCalendarLoading(false);
    }
  }, [selectedPropertyId, calendarYear, calendarMonth]);

  useEffect(() => {
    if (activeTab === "calendar" && selectedPropertyId) {
      fetchCalendar();
    }
  }, [activeTab, selectedPropertyId, calendarYear, calendarMonth, fetchCalendar]);

  // Load Discounts
  const fetchDiscounts = useCallback(async () => {
    setDiscountsLoading(true);
    try {
      const res = await getAdminDiscounts();
      setDiscounts(res.data);
    } catch {
      setDiscounts([]);
    } finally {
      setDiscountsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "discounts") {
      fetchDiscounts();
    }
  }, [activeTab, fetchDiscounts]);

  // Base Price Update
  const handleSaveBasePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    setUpdatingBasePrice(true);
    setFeedback(null);
    try {
      const priceVal = parseFloat(newBasePrice);
      if (isNaN(priceVal) || priceVal < 0) {
        throw new Error(isAr ? "يرجى إدخال سعر صحيح." : "Please enter a valid price.");
      }
      await updateAdminProperty(editingProperty.id, {
        base_price_cents: Math.round(priceVal * 100),
      });
      setFeedback({
        type: "success",
        message: isAr ? "تم تحديث سعر الليلة الأساسي بنجاح." : "Base nightly price updated successfully.",
      });
      setEditingProperty(null);
      await fetchOverview();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر تحديث السعر." : "Failed to update base rate."),
      });
    } finally {
      setUpdatingBasePrice(false);
    }
  };

  // Seasonal Rule Overlap Verification
  const handleCheckOverlap = async () => {
    if (!ruleForm.property_id || !ruleForm.start_date || !ruleForm.end_date) return;
    try {
      const res = await analyzeSeasonalOverlap({
        property_id: ruleForm.property_id,
        start_date: ruleForm.start_date,
        end_date: ruleForm.end_date,
        priority: ruleForm.priority || 1,
        ignore_season_id: editingRuleId || undefined,
      });
      setOverlapWarning(res.data);
    } catch {
      setOverlapWarning(null);
    }
  };

  // Rule Save
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleForm.is_global && !ruleForm.property_id) return;
    if (ruleForm.rule_type !== "weekend" && (!ruleForm.start_date || !ruleForm.end_date)) return;
    setRuleSubmitting(true);
    setFeedback(null);
    try {
      const payload: any = {
        property_id: ruleForm.is_global ? null : ruleForm.property_id,
        rule_type: ruleForm.rule_type,
        adjustment_type: ruleForm.adjustment_type,
        adjustment_percent: ruleForm.adjustment_type === "percentage" ? Number(ruleForm.adjustment_percent) : null,
        days_of_week: ruleForm.rule_type === "weekend" ? ruleForm.days_of_week : null,
        name_en: ruleForm.name_en,
        name_ar: ruleForm.name_ar || undefined,
        start_date: ruleForm.start_date || "2026-01-01",
        end_date: ruleForm.end_date || "2026-12-31",
        price_cents: ruleForm.adjustment_type === "percentage" ? 0 : ruleForm.price_cents,
        priority: ruleForm.priority,
        min_stay_nights: ruleForm.min_stay_nights,
        notes: ruleForm.notes,
      };

      if (editingRuleId) {
        await updatePricingRule(editingRuleId, payload);
        setFeedback({
          type: "success",
          message: isAr ? "تم تحديث قاعدة السعر بنجاح." : "Pricing rule updated successfully.",
        });
      } else {
        await createPricingRule(payload);
        setFeedback({
          type: "success",
          message: isAr ? "تم إنشاء قاعدة السعر بنجاح." : "Pricing rule created successfully.",
        });
      }

      setIsRuleModalOpen(false);
      setEditingRuleId(null);
      setOverlapWarning(null);
      fetchRules();
      fetchOverview();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر حفظ قاعدة السعر." : "Failed to save seasonal rule."),
      });
    } finally {
      setRuleSubmitting(false);
    }
  };

  // Rule Delete
  const handleDeleteRule = (rule: SeasonalPriceItem) => {
    setConfirmDialog({
      isOpen: true,
      title: isAr ? "حذف قاعدة السعر الموسمي" : "Delete Pricing Rule",
      description: isAr
        ? `هل أنت متأكد من حذف قاعدة السعر «${rule.name_en}»؟ سيعود العقار لسعر الليلة الأساسي لهذه التواريخ.`
        : `Are you sure you want to delete rule "${rule.name_en}"? Nights will revert to the property's base rate.`,
      action: async () => {
        await deletePricingRule(rule.id);
        setFeedback({
          type: "success",
          message: isAr ? "تم حذف قاعدة السعر بنجاح." : "Pricing rule deleted successfully.",
        });
        fetchRules();
        fetchOverview();
      },
    });
  };

  // Price Override Save
  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId || !overrideForm.start_date || !overrideForm.end_date || !overrideForm.price) return;
    setOverrideSubmitting(true);
    setFeedback(null);
    try {
      await applyPriceOverride({
        property_id: selectedPropertyId,
        start_date: overrideForm.start_date,
        end_date: overrideForm.end_date,
        price_cents: Math.round(parseFloat(overrideForm.price) * 100),
        min_stay_nights: overrideForm.min_stay ? Number(overrideForm.min_stay) : undefined,
        reason: overrideForm.reason || undefined,
      });

      setFeedback({
        type: "success",
        message: isAr ? "تم تطبيق السعر المخصص بنجاح." : "Price override applied successfully.",
      });

      setIsOverrideModalOpen(false);
      setOverrideForm({ start_date: "", end_date: "", price: "", min_stay: "", reason: "" });
      fetchCalendar();
      fetchOverview();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر تطبيق السعر المخصص." : "Failed to apply price override."),
      });
    } finally {
      setOverrideSubmitting(false);
    }
  };

  // Price Preview Calculation
  const handleCalculatePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewPropertyId || !previewCheckIn || !previewCheckOut) return;
    setPreviewCalculating(true);
    setFeedback(null);
    try {
      const res = await previewPriceQuote({
        property_id: previewPropertyId,
        check_in: previewCheckIn,
        check_out: previewCheckOut,
        guests: previewGuests,
        promo_code: previewPromoCode || undefined,
      });

      setPreviewResult(res);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر حساب السعر." : "Failed to compute quote."),
      });
    } finally {
      setPreviewCalculating(false);
    }
  };

  // Discount Create
  const handleSaveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDiscountSubmitting(true);
    setFeedback(null);
    try {
      await createAdminDiscount({
        name_en: discountForm.name_en,
        code: discountForm.code ? discountForm.code.toUpperCase() : undefined,
        type: discountForm.type,
        value: Number(discountForm.value),
        valid_from: discountForm.valid_from || undefined,
        valid_until: discountForm.valid_until || undefined,
        min_stay_nights: Number(discountForm.min_stay_nights) || 1,
        is_active: true,
      });

      setFeedback({
        type: "success",
        message: isAr ? "تم إنشاء كود الخصم بنجاح." : "Promotional discount created successfully.",
      });

      setIsDiscountModalOpen(false);
      setDiscountForm({
        name_en: "",
        code: "",
        type: "percentage",
        value: 10,
        valid_from: "",
        valid_until: "",
        min_stay_nights: 1,
      });
      fetchDiscounts();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر إنشاء كود الخصم." : "Failed to create discount."),
      });
    } finally {
      setDiscountSubmitting(false);
    }
  };

  // Toggle Discount Active
  const handleToggleDiscount = async (id: number) => {
    try {
      await toggleAdminDiscount(id);
      fetchDiscounts();
    } catch {
      setFeedback({
        type: "error",
        message: isAr ? "تعذر تغيير حالة الخصم." : "Failed to toggle discount.",
      });
    }
  };

  // Delete Discount
  const handleDeleteDiscount = (d: AdminDiscountItem) => {
    setConfirmDialog({
      isOpen: true,
      title: isAr ? "حذف كود الخصم" : "Delete Discount",
      description: isAr
        ? `هل أنت متأكد من حذف كود الخصم «${d.code || d.name_en}»؟`
        : `Are you sure you want to delete promo code "${d.code || d.name_en}"?`,
      action: async () => {
        await deleteAdminDiscount(d.id);
        fetchDiscounts();
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-brown">
            {isAr ? "محرك الأسعار الديناميكي والعطلات" : "Dynamic Pricing Engine & Seasons"}
          </h1>
          <p className="text-xs text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "التحكم في أسعار الليالي، القواعد الموسمية، عطلات نهاية الأسبوع، والأكواد الترويجية مع حاسبة المعاينة اللحظية."
              : "Manage nightly base rates, seasonal rules, holiday markups, date overrides, and authoritative price previews."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingRuleId(null);
              setRuleForm({
                property_id: selectedPropertyId || overviewData?.properties[0]?.id || 0,
                is_global: false,
                rule_type: "season",
                adjustment_type: "fixed",
                adjustment_percent: 0,
                days_of_week: ["Friday", "Saturday"],
                name_en: "",
                name_ar: "",
                start_date: "",
                end_date: "",
                price_cents: 0,
                priority: 1,
                min_stay_nights: 1,
                notes: "",
              });
              setOverlapWarning(null);
              setIsRuleModalOpen(true);
            }}
            className="px-4 py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>+</span>
            <span>{isAr ? "إضافة قاعدة تسعير" : "Add Pricing Rule"}</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs hover:underline cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Executive Metric Badges */}
      {overviewData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-2xs">
            <span className="block text-[10px] font-bold uppercase text-brand-brown-muted">
              {isAr ? "وحدات الإيجار النشطة" : "Rent Inventory"}
            </span>
            <span className="text-xl font-serif font-bold text-brand-brown mt-1 block">
              {overviewData.summary.total_rent_inventory}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-2xs">
            <span className="block text-[10px] font-bold uppercase text-brand-brown-muted">
              {isAr ? "القواعد الموسمية المفعلة" : "Active Seasonal Rules"}
            </span>
            <span className="text-xl font-serif font-bold text-brand-terracotta mt-1 block">
              {overviewData.summary.total_active_seasonal_rules}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-2xs">
            <span className="block text-[10px] font-bold uppercase text-brand-brown-muted">
              {isAr ? "أكواد الخصم الترويجية" : "Active Promo Codes"}
            </span>
            <span className="text-xl font-serif font-bold text-emerald-700 mt-1 block">
              {overviewData.summary.total_active_discounts}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-2xs">
            <span className="block text-[10px] font-bold uppercase text-brand-brown-muted">
              {isAr ? "متوسط سعر الليلة" : "Avg Nightly Rate"}
            </span>
            <span className="text-xl font-serif font-bold text-brand-brown mt-1 block font-mono">
              {overviewData.summary.formatted_average_nightly_rate}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Subsections / Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-border pb-3 overflow-x-auto gounow-scrollbar">
        {[
          { key: "overview", label_en: "Base Prices & Overview", label_ar: "الأسعار الأساسية والمحفظة", icon: "📊" },
          { key: "seasons", label_en: "Seasonal Rules & Holidays", label_ar: "قواعد المواسم والعطلات", icon: "☀️" },
          { key: "calendar", label_en: "Pricing Calendar & Overrides", label_ar: "تقويم الأسعار والاستثناءات", icon: "📅" },
          { key: "preview", label_en: "Price Preview Calculator", label_ar: "حاسبة معاينة السعر وتفاصيله", icon: "🧮" },
          { key: "discounts", label_en: "Discounts & Promo Codes", label_ar: "الخصومات وأكواد الترويج", icon: "🏷️" },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as PricingTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-brand-terracotta text-white shadow-xs"
                  : "text-brand-brown hover:bg-brand-sand-light"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{isAr ? tab.label_ar : tab.label_en}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Base Prices & Inventory Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
            <div className="p-5 border-b border-brand-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-serif font-bold text-brand-brown">
                  {isAr ? "أسعار الليلة الأساسية لجميع وحدات الإيجار" : "Authoritative Nightly Base Rates"}
                </h3>
                <p className="text-[11px] text-brand-brown-muted mt-0.5">
                  {isAr
                    ? "السعر الافتراضي لكل ليلة في حالة عدم وجود قاعدة موسمية ذات أولوية أعلى."
                    : "Default nightly rate applied when no higher-priority seasonal rule covers the date."}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="p-8">
                <LoadingState message={isAr ? "جاري تحميل الأسعار..." : "Loading base prices..."} />
              </div>
            ) : overviewData?.properties?.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title={isAr ? "لا توجد عقارات إيجار" : "No rent properties found"}
                  description={isAr ? "أضف وحدات للإيجار للبدء في إدارة تسعيرها." : "Add vacation rental inventory to manage pricing."}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left rtl:text-right border-collapse">
                  <thead>
                    <tr className="bg-brand-sand-light/50 border-b border-brand-border text-brand-brown-muted uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4 font-bold">{isAr ? "الوحدة / العقار" : "Property / Unit"}</th>
                      <th className="py-3.5 px-4 font-bold">{isAr ? "المنطقة" : "Location"}</th>
                      <th className="py-3.5 px-4 font-bold">{isAr ? "سعر الليلة الأساسي" : "Base Nightly Rate"}</th>
                      <th className="py-3.5 px-4 font-bold">{isAr ? "الحد الأدنى لليالي" : "Min Stay"}</th>
                      <th className="py-3.5 px-4 font-bold">{isAr ? "رسوم النظافة والخدمة" : "Fees (Clean / Service)"}</th>
                      <th className="py-3.5 px-4 font-bold">{isAr ? "القواعد النشطة" : "Active Rules"}</th>
                      <th className="py-3.5 px-4 text-end font-bold">{isAr ? "الإجراءات" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border text-brand-brown">
                    {overviewData?.properties.map((prop) => (
                      <tr key={prop.id} className="hover:bg-brand-sand-light/20 transition">
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold block">{prop.title_en}</span>
                            <span className="text-[10px] text-brand-brown-muted font-mono">{prop.reference_number}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-brand-brown-muted">{prop.location_name}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-brand-terracotta text-sm">
                          {prop.formatted_base_price}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-brand-sand-light text-brand-brown font-mono font-bold text-[11px]">
                            {prop.min_stay_nights} {isAr ? "ليالٍ" : "nights"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-brand-brown-muted">
                          {prop.cleaning_fee_cents / 100} / {prop.service_fee_cents / 100} EGP
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {prop.active_seasons_count} {isAr ? "قواعد" : "rules"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-end">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProperty(prop);
                                setNewBasePrice((prop.base_price_cents / 100).toString());
                              }}
                              className="px-2.5 py-1 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-lg text-[11px] font-bold transition border border-brand-border cursor-pointer"
                            >
                              {isAr ? "تعديل السعر" : "Edit Base Rate"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPropertyId(prop.id);
                                setActiveTab("calendar");
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-brand-sand-light text-brand-terracotta rounded-lg text-[11px] font-bold transition border border-brand-border cursor-pointer"
                            >
                              {isAr ? "التقويم" : "Calendar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Seasonal Rules & Holidays */}
      {activeTab === "seasons" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
            <div className="p-5 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-serif font-bold text-brand-brown">
                  {isAr ? "قواعد المواسم، العطلات، ونهاية الأسبوع" : "Seasonal, Weekend & Holiday Pricing Rules"}
                </h3>
                <p className="text-[11px] text-brand-brown-muted mt-0.5">
                  {isAr
                    ? "القاعدة ذات الأولوية (Priority) الأعلى هي التي تسود وتتحكم في سعر الليلة والحد الأدنى للإقامة."
                    : "The highest priority rule wins date overlaps and overrides property default base prices."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={isAr ? "بحث بالاسم أو العقار..." : "Search rule name..."}
                  value={ruleSearch}
                  onChange={(e) => setRuleSearch(e.target.value)}
                  className="text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl px-3 py-1.5 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setEditingRuleId(null);
                    setRuleForm({
                      property_id: selectedPropertyId || overviewData?.properties[0]?.id || 0,
                      is_global: false,
                      rule_type: "season",
                      adjustment_type: "fixed",
                      adjustment_percent: 0,
                      days_of_week: ["Friday", "Saturday"],
                      name_en: "",
                      name_ar: "",
                      start_date: "",
                      end_date: "",
                      price_cents: 0,
                      priority: 1,
                      min_stay_nights: 1,
                      notes: "",
                    });
                    setOverlapWarning(null);
                    setIsRuleModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  {isAr ? "+ قاعدة جديدة" : "+ New Rule"}
                </button>
              </div>
            </div>

            {rulesLoading ? (
              <div className="p-8">
                <LoadingState message={isAr ? "جاري تحميل القواعد الموسمية..." : "Loading seasonal rules..."} />
              </div>
            ) : rules.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title={isAr ? "لا توجد قواعد تسعير موسمية" : "No seasonal rules configured"}
                  description={isAr ? "أضف مواسم الصيف أو الأعياد للتحكم الديناميكي في الأسعار." : "Add summer seasons, holidays, or festival rates."}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left rtl:text-right border-collapse">
                  <thead>
                    <tr className="bg-brand-sand-light/50 border-b border-brand-border text-brand-brown-muted uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4 font-bold">{isAr ? "اسم القاعدة والموسم" : "Rule Name"}</th>
                      <th className="py-3.5 px-4 font-bold">{isAr ? "العقار المستهدف" : "Target Inventory"}</th>
                      <th className="py-3.5 px-4 font-bold">{isAr ? "الفترة الزمنية" : "Date Range"}</th>
                      <th className="py-3.5 px-4 font-bold">{isAr ? "السعر الموسمي" : "Nightly Rate"}</th>
                      <th className="py-3.5 px-4 font-bold">{isAr ? "الأولوية (Priority)" : "Priority"}</th>
                      <th className="py-3.5 px-4 font-bold">{isAr ? "الحد الأدنى للإقامة" : "Min Stay"}</th>
                      <th className="py-3.5 px-4 text-end font-bold">{isAr ? "الإجراءات" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border text-brand-brown">
                    {rules.map((rule: any) => (
                      <tr key={rule.id} className="hover:bg-brand-sand-light/20 transition">
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold block">{rule.name_en}</span>
                            {rule.name_ar && <span className="text-[10px] text-brand-brown-muted">{rule.name_ar}</span>}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-brand-brown">{rule.property_title}</span>
                          <span className="text-[10px] text-brand-brown-muted block font-mono">{rule.property_reference}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          {rule.start_date} → {rule.end_date}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-brand-terracotta text-sm">
                          {rule.formatted_price}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rule.priority >= 10
                              ? "bg-purple-100 text-purple-900 border border-purple-200"
                              : rule.priority >= 5
                              ? "bg-amber-100 text-amber-900 border border-amber-200"
                              : "bg-blue-100 text-blue-900 border border-blue-200"
                          }`}>
                            P{rule.priority} {rule.priority >= 90 ? "★ OVERRIDE" : ""}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs text-brand-brown">
                            {rule.min_stay_nights ? `${rule.min_stay_nights} nts` : "Default"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-end">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRuleId(rule.id);
                                setRuleForm({
                                  property_id: rule.property_id || 0,
                                  is_global: !rule.property_id,
                                  rule_type: rule.rule_type || "season",
                                  adjustment_type: rule.adjustment_type || "fixed",
                                  adjustment_percent: rule.adjustment_percent || 0,
                                  days_of_week: rule.days_of_week || ["Friday", "Saturday"],
                                  name_en: rule.name_en,
                                  name_ar: rule.name_ar || "",
                                  start_date: rule.start_date,
                                  end_date: rule.end_date,
                                  price_cents: rule.price_cents,
                                  priority: rule.priority,
                                  min_stay_nights: rule.min_stay_nights || 1,
                                  notes: rule.notes || "",
                                });
                                setIsRuleModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-lg text-[11px] font-bold transition border border-brand-border cursor-pointer"
                            >
                              {isAr ? "تعديل" : "Edit"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRule(rule)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold transition border border-rose-200 cursor-pointer"
                            >
                              {isAr ? "حذف" : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Interactive Pricing Calendar & Price Overrides */}
      {activeTab === "calendar" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-brand-border shadow-xs p-6 space-y-6">
            {/* Filter Bar: Select Property & Month */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-brand-brown uppercase tracking-wider">
                  {isAr ? "العقار المستهدف:" : "Property:"}
                </label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
                  className="text-xs bg-brand-sand-light border border-brand-border rounded-xl px-3 py-2 font-bold text-brand-brown focus:ring-1 focus:ring-brand-terracotta"
                >
                  {overviewData?.properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title_en} ({p.formatted_base_price}/night)
                    </option>
                  ))}
                </select>
              </div>

              {/* Month / Year Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (calendarMonth === 1) {
                      setCalendarMonth(12);
                      setCalendarYear((y) => y - 1);
                    } else {
                      setCalendarMonth((m) => m - 1);
                    }
                  }}
                  className="w-8 h-8 rounded-xl bg-brand-sand-light hover:bg-brand-sand flex items-center justify-center font-bold text-xs"
                >
                  ‹
                </button>
                <span className="font-serif font-bold text-sm text-brand-brown min-w-[120px] text-center">
                  {new Date(calendarYear, calendarMonth - 1).toLocaleString(locale === "ar" ? "ar-EG" : "en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (calendarMonth === 12) {
                      setCalendarMonth(1);
                      setCalendarYear((y) => y + 1);
                    } else {
                      setCalendarMonth((m) => m + 1);
                    }
                  }}
                  className="w-8 h-8 rounded-xl bg-brand-sand-light hover:bg-brand-sand flex items-center justify-center font-bold text-xs"
                >
                  ›
                </button>

                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(true)}
                  className="ms-3 px-3.5 py-1.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  {isAr ? "⚡ سعر مخصص (Override)" : "⚡ Set Price Override"}
                </button>
              </div>
            </div>

            {/* Calendar Matrix View */}
            {calendarLoading ? (
              <div className="p-12">
                <LoadingState message={isAr ? "جاري احتساب أسعار التقويم اليومية..." : "Computing daily pricing matrix..."} />
              </div>
            ) : calendarDays.length === 0 ? (
              <EmptyState
                title={isAr ? "لا توجد بيانات تقويم" : "No calendar data available"}
                description={isAr ? "يرجى اختيار عقار وشهر صالحين لعرض مصفوفة الأسعار." : "Please select a property and month to view the daily rates."}
              />
            ) : (
              <div>
                <div className="grid grid-cols-7 gap-2">
                  {/* Days of Week Header */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                    <div
                      key={dayName}
                      className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted bg-brand-sand-light/40 rounded-lg"
                    >
                      {dayName}
                    </div>
                  ))}

                  {/* Day Tiles */}
                  {calendarDays.map((day) => {
                    const isWeekend = day.day_of_week === "Fri" || day.day_of_week === "Sat";
                    return (
                      <div
                        key={day.date}
                        className={`p-2.5 rounded-2xl border transition relative min-h-[90px] flex flex-col justify-between ${
                          !day.is_base_price
                            ? "bg-amber-50/60 border-amber-300 ring-1 ring-amber-200"
                            : isWeekend
                            ? "bg-brand-sand-light/30 border-brand-border"
                            : "bg-white border-brand-border"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-brand-brown">
                            {day.day}
                          </span>
                          {!day.is_base_price && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-200/80 text-amber-900 font-bold uppercase truncate max-w-[80px]" title={day.season_name}>
                              {day.season_name}
                            </span>
                          )}
                        </div>

                        <div className="mt-2">
                          <span className="text-xs font-bold font-mono text-brand-terracotta block">
                            {day.price_formatted} <span className="text-[9px] font-normal text-brand-brown-muted">EGP</span>
                          </span>
                          <span className="text-[9px] text-brand-brown-muted block font-mono">
                            Min: {day.min_stay_nights} {isAr ? "ل" : "nt"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Price Preview & Quote Simulator */}
      {activeTab === "preview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulator Controls */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-serif font-bold text-brand-brown border-b border-brand-border pb-2">
              {isAr ? "معايير محاكاة السعر" : "Quote Simulation Parameters"}
            </h3>

            <form onSubmit={handleCalculatePreview} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "العقار المستهدف *" : "Select Property *"}
                </label>
                <select
                  value={previewPropertyId}
                  onChange={(e) => setPreviewPropertyId(Number(e.target.value))}
                  required
                  className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3 font-medium text-brand-brown"
                >
                  {overviewData?.properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title_en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "تاريخ الوصول *" : "Check-in Date *"}
                  </label>
                  <input
                    type="date"
                    required
                    value={previewCheckIn}
                    onChange={(e) => setPreviewCheckIn(e.target.value)}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "تاريخ المغادرة *" : "Check-out Date *"}
                  </label>
                  <input
                    type="date"
                    required
                    value={previewCheckOut}
                    onChange={(e) => setPreviewCheckOut(e.target.value)}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "عدد الضيوف" : "Number of Guests"}
                </label>
                <input
                  type="number"
                  min={1}
                  value={previewGuests}
                  onChange={(e) => setPreviewGuests(Number(e.target.value))}
                  className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "كود الخصم (اختياري)" : "Promo Code (Optional)"}
                </label>
                <input
                  type="text"
                  value={previewPromoCode}
                  onChange={(e) => setPreviewPromoCode(e.target.value.toUpperCase())}
                  placeholder="e.g. VIP10, SUMMER2026"
                  className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={previewCalculating}
                className="w-full py-3 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {previewCalculating
                  ? isAr ? "جاري احتساب التسعير..." : "Calculating..."
                  : isAr ? "حساب السعر من المحرك الخلفي" : "Calculate Authoritative Quote"}
              </button>
            </form>
          </div>

          {/* Breakdown & Explanation Result */}
          <div className="lg:col-span-2 space-y-6">
            {previewResult ? (
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-brand-border shadow-xs space-y-6 text-xs">
                <div className="flex items-center justify-between border-b border-brand-border pb-3">
                  <div>
                    <h3 className="text-base font-serif font-bold text-brand-brown">
                      {isAr ? "تفاصيل التسعير والشرح الكامل" : "Price Breakdown & Explanation"}
                    </h3>
                    <p className="text-[11px] text-brand-brown-muted">
                      {previewResult.property.title_en} ({previewResult.quote.nights} {isAr ? "ليالٍ" : "nights"})
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      previewResult.quote.satisfies_min_stay
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-rose-100 text-rose-800 border border-rose-300"
                    }`}
                  >
                    {previewResult.explanation.min_stay_check.message}
                  </span>
                </div>

                {/* Nightly Matrix Table */}
                <div className="space-y-2">
                  <h4 className="font-bold text-brand-brown uppercase tracking-wider text-[10px]">
                    {isAr ? "حساب كل ليلة بشكل منفرد (Night-by-night breakdown):" : "Night-by-Night Breakdown:"}
                  </h4>
                  <div className="border border-brand-border rounded-xl overflow-hidden">
                    <table className="w-full text-[11px] text-left rtl:text-right">
                      <thead className="bg-brand-sand-light/50 border-b border-brand-border font-bold uppercase text-[10px] text-brand-brown-muted">
                        <tr>
                          <th className="py-2 px-3">Date</th>
                          <th className="py-2 px-3">Day</th>
                          <th className="py-2 px-3">Applied Rule</th>
                          <th className="py-2 px-3 text-end">Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border">
                        {previewResult.quote.nightly_prices.map((n) => (
                          <tr key={n.night_date} className="hover:bg-brand-sand-light/20">
                            <td className="py-2 px-3 font-mono">{n.night_date}</td>
                            <td className="py-2 px-3 text-brand-brown-muted">{n.day_of_week}</td>
                            <td className="py-2 px-3">
                              {n.is_base_price ? (
                                <span className="text-brand-brown-muted">Base Rate</span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                                  {n.season_name} (P{n.priority})
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-end font-mono font-bold text-brand-terracotta">
                              {n.price_formatted} {n.currency}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Financial Summary Breakdown */}
                <div className="bg-brand-sand-light/30 p-4 rounded-2xl border border-brand-border space-y-2 font-mono">
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-brown-muted">Subtotal ({previewResult.quote.nights} nights):</span>
                    <span className="font-bold text-brand-brown">{previewResult.explanation.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-brown-muted">Cleaning Fee:</span>
                    <span>+{previewResult.explanation.cleaning_fee}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-brown-muted">Service Charge:</span>
                    <span>+{previewResult.explanation.service_fee}</span>
                  </div>
                  {previewResult.quote.discount_cents > 0 && (
                    <div className="flex justify-between text-xs text-emerald-700 font-bold">
                      <span>Promo Discount ({previewResult.quote.promo_code}):</span>
                      <span>-{previewResult.explanation.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-brown-muted">Tax &amp; Government VAT:</span>
                    <span>+{previewResult.explanation.tax}</span>
                  </div>
                  <div className="pt-2 border-t border-brand-border flex justify-between text-base font-bold text-brand-terracotta">
                    <span className="font-serif">Final Total:</span>
                    <span>{previewResult.explanation.final_total}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-brand-brown-muted pt-1">
                    <span>Upfront Deposit Required:</span>
                    <span>{previewResult.explanation.deposit_required}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-brand-border text-center">
                <span className="text-4xl block mb-2">🧮</span>
                <h4 className="font-serif font-bold text-brand-brown text-base">
                  {isAr ? "حاسبة الأسعار الإدارية" : "Admin Quote Simulator"}
                </h4>
                <p className="text-xs text-brand-brown-muted mt-1 max-w-md mx-auto">
                  {isAr
                    ? "اختر العقار وتواريخ الإقامة على اليسار ثم اضغط «حساب السعر» للحصول على الشرح الكامل المعتمد من محرك الأسعار الخلفي."
                    : "Select a property and dates to query the backend Pricing Engine. Displays nightly rules, fees, discounts, and minimum stay validation."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Discounts & Promo Codes */}
      {activeTab === "discounts" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
            <div className="p-5 border-b border-brand-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-serif font-bold text-brand-brown">
                  {isAr ? "أكواد الخصم الترويجية والحملات" : "Promotional Discount Codes"}
                </h3>
                <p className="text-[11px] text-brand-brown-muted mt-0.5">
                  {isAr
                    ? "إدارة الأكواد الترويجية الصالحة للحجوزات، الخصم بالنسبة المئوية أو القيمة الثابتة."
                    : "Manage promotion codes with percentage or fixed discounts, minimum stay limits, and usage caps."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsDiscountModalOpen(true)}
                className="px-3 py-1.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {isAr ? "+ كود خصم جديد" : "+ New Promo Code"}
              </button>
            </div>

            {discountsLoading ? (
              <div className="p-8">
                <LoadingState message={isAr ? "جاري تحميل أكواد الخصم..." : "Loading promo codes..."} />
              </div>
            ) : discounts.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title={isAr ? "لا توجد أكواد خصم" : "No promo codes configured"}
                  description={isAr ? "أنشئ كود ترويجي جديد مثل VIP10 أو SUMMER2026." : "Create promo codes like VIP10 or SUMMER2026."}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left rtl:text-right border-collapse">
                  <thead>
                    <tr className="bg-brand-sand-light/50 border-b border-brand-border text-brand-brown-muted uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4 font-bold">{isAr ? "الكود" : "Promo Code"}</th>
                      <th className="py-3.5 px-4 font-bold">{isAr ? "اسم الحملة" : "Campaign Name"}</th>
                      <th className="py-3.5 px-4 font-bold">{isAr ? "قيمة الخصم" : "Value"}</th>
                      <th className="py-3.5 px-4 font-bold">{isAr ? "الصلاحية" : "Valid Period"}</th>
                      <th className="py-3.5 px-4 font-bold">{isAr ? "الاستخدامات" : "Uses"}</th>
                      <th className="py-3.5 px-4 font-bold">{isAr ? "الحالة" : "Status"}</th>
                      <th className="py-3.5 px-4 text-end font-bold">{isAr ? "الإجراءات" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border text-brand-brown">
                    {discounts.map((d) => (
                      <tr key={d.id} className="hover:bg-brand-sand-light/20 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-brand-terracotta">
                          {d.code || "GLOBAL_RULE"}
                        </td>
                        <td className="py-3.5 px-4">{d.name_en}</td>
                        <td className="py-3.5 px-4 font-mono font-bold">
                          {d.type === "percentage" ? `${d.value}%` : `${d.value} EGP`}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-brand-brown-muted">
                          {d.valid_from || "Always"} → {d.valid_until || "Always"}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {d.used_count} {d.max_uses ? `/ ${d.max_uses}` : ""}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleDiscount(d.id)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                              d.is_active
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-amber-100 text-amber-900 border border-amber-300"
                            }`}
                          >
                            {d.is_active ? (isAr ? "مفعل" : "Active") : (isAr ? "معطل" : "Inactive")}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-end">
                          <button
                            type="button"
                            onClick={() => handleDeleteDiscount(d)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold transition border border-rose-200 cursor-pointer"
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
      )}

      {/* MODAL 1: Base Price Quick Edit */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-brand-border space-y-4">
            <h3 className="text-base font-serif font-bold text-brand-brown">
              {isAr ? "تعديل سعر الليلة الأساسي" : "Edit Nightly Base Rate"}
            </h3>
            <p className="text-xs text-brand-brown-muted">
              {editingProperty.title_en} ({editingProperty.reference_number})
            </p>

            <form onSubmit={handleSaveBasePrice} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "سعر الليلة الأساسي (EGP) *" : "Base Nightly Price (EGP) *"}
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  value={newBasePrice}
                  onChange={(e) => setNewBasePrice(e.target.value)}
                  className="w-full text-sm bg-brand-sand-light/50 border border-brand-border rounded-xl p-3 font-mono font-bold text-brand-brown"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setEditingProperty(null)}
                  className="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl font-bold"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={updatingBasePrice}
                  className="px-5 py-2 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {updatingBasePrice ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "حفظ السعر" : "Save Rate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create / Edit Seasonal Rule */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-brand-border space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-serif font-bold text-brand-brown border-b border-brand-border pb-2">
              {editingRuleId ? (isAr ? "تعديل قاعدة التسعير" : "Edit Pricing Rule") : (isAr ? "إضافة قاعدة تسعير جديدة" : "Create Pricing Rule")}
            </h3>

            <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
              {/* Target Inventory Scope */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "نطاق التطبيق والمخزون *" : "Target Inventory Scope *"}
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRuleForm({ ...ruleForm, is_global: true, property_id: 0 });
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      ruleForm.is_global
                        ? "bg-brand-sand text-brand-brown border-brand-brown/40 shadow-xs"
                        : "bg-white text-brand-brown-muted border-brand-border hover:bg-brand-sand-light"
                    }`}
                  >
                    <span>🌐</span>
                    <span>{isAr ? "عام لجميع العقارات (Global)" : "All Inventory (Global)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRuleForm({
                        ...ruleForm,
                        is_global: false,
                        property_id: ruleForm.property_id || (overviewData?.properties[0]?.id || 0),
                      });
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      !ruleForm.is_global
                        ? "bg-brand-sand text-brand-brown border-brand-brown/40 shadow-xs"
                        : "bg-white text-brand-brown-muted border-brand-border hover:bg-brand-sand-light"
                    }`}
                  >
                    <span>🏠</span>
                    <span>{isAr ? "عقار / وحدة محددة" : "Specific Property"}</span>
                  </button>
                </div>

                {!ruleForm.is_global && (
                  <select
                    value={ruleForm.property_id}
                    onChange={(e) => {
                      setRuleForm({ ...ruleForm, property_id: Number(e.target.value) });
                      setTimeout(handleCheckOverlap, 50);
                    }}
                    required={!ruleForm.is_global}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3"
                  >
                    <option value="">{isAr ? "-- اختر العقار المستهدف --" : "-- Select Property --"}</option>
                    {overviewData?.properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title_en} ({p.reference_number})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Rule Type */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "season", labelEn: "Seasonal", labelAr: "موسم محدد", icon: "☀️" },
                  { id: "weekend", labelEn: "Weekend", labelAr: "عطلة نهاية أسبوع", icon: "🏖️" },
                  { id: "holiday", labelEn: "Holiday / Event", labelAr: "عيد / فعالية", icon: "🎉" },
                  { id: "override", labelEn: "Override", labelAr: "تجاوز يدوي", icon: "⚡" },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setRuleForm({ ...ruleForm, rule_type: type.id as any })}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition text-center cursor-pointer ${
                      ruleForm.rule_type === type.id
                        ? "bg-brand-terracotta text-white border-brand-terracotta shadow-xs"
                        : "bg-brand-sand-light/50 text-brand-brown border-brand-border hover:bg-brand-sand"
                    }`}
                  >
                    <span className="block text-sm mb-0.5">{type.icon}</span>
                    <span>{isAr ? type.labelAr : type.labelEn}</span>
                  </button>
                ))}
              </div>

              {/* Weekend Days Selection (if weekend rule) */}
              {ruleForm.rule_type === "weekend" && (
                <div className="p-3 bg-brand-sand-light/40 border border-brand-border rounded-2xl space-y-2">
                  <label className="block text-[11px] font-bold text-brand-brown">
                    {isAr ? "أيام عطلة نهاية الأسبوع المستهدفة:" : "Target Weekend Days:"}
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    {["Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                      const isChecked = ruleForm.days_of_week.includes(day);
                      return (
                        <label key={day} className="flex items-center gap-1.5 text-xs text-brand-brown cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setRuleForm({ ...ruleForm, days_of_week: [...ruleForm.days_of_week, day] });
                              } else {
                                setRuleForm({
                                  ...ruleForm,
                                  days_of_week: ruleForm.days_of_week.filter((d) => d !== day),
                                });
                              }
                            }}
                            className="rounded text-brand-terracotta focus:ring-brand-terracotta"
                          />
                          <span>{day}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "اسم القاعدة (English) *" : "Rule Name (English) *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={ruleForm.name_en}
                    onChange={(e) => setRuleForm({ ...ruleForm, name_en: e.target.value })}
                    placeholder="e.g. Summer Peak 2026, Weekend Markup"
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "اسم القاعدة (عربي)" : "Rule Name (Arabic)"}
                  </label>
                  <input
                    type="text"
                    value={ruleForm.name_ar}
                    onChange={(e) => setRuleForm({ ...ruleForm, name_ar: e.target.value })}
                    placeholder="مثال: ذروة الصيف، عطلة نهاية الأسبوع"
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 text-right"
                  />
                </div>
              </div>

              {/* Date Range (optional if full year weekend rule) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "تاريخ البدء *" : "Start Date *"}
                  </label>
                  <input
                    type="date"
                    required={ruleForm.rule_type !== "weekend"}
                    value={ruleForm.start_date}
                    onChange={(e) => {
                      setRuleForm({ ...ruleForm, start_date: e.target.value });
                      setTimeout(handleCheckOverlap, 100);
                    }}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "تاريخ الانتهاء *" : "End Date *"}
                  </label>
                  <input
                    type="date"
                    required={ruleForm.rule_type !== "weekend"}
                    value={ruleForm.end_date}
                    onChange={(e) => {
                      setRuleForm({ ...ruleForm, end_date: e.target.value });
                      setTimeout(handleCheckOverlap, 100);
                    }}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              {/* Adjustment Type: Fixed Price vs Percentage */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRuleForm({ ...ruleForm, adjustment_type: "fixed" })}
                  className={`p-2 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                    ruleForm.adjustment_type === "fixed"
                      ? "bg-brand-sand text-brand-brown border-brand-brown/40"
                      : "bg-white text-brand-brown-muted border-brand-border hover:bg-brand-sand-light"
                  }`}
                >
                  💵 {isAr ? "سعر ثابت لليلة (Fixed EGP)" : "Fixed Nightly Rate (EGP)"}
                </button>
                <button
                  type="button"
                  onClick={() => setRuleForm({ ...ruleForm, adjustment_type: "percentage" })}
                  className={`p-2 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                    ruleForm.adjustment_type === "percentage"
                      ? "bg-brand-sand text-brand-brown border-brand-brown/40"
                      : "bg-white text-brand-brown-muted border-brand-border hover:bg-brand-sand-light"
                  }`}
                >
                  📈 {isAr ? "زيادة / خصم نسبي (Percentage %)" : "Percentage Markup (+%)"}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {ruleForm.adjustment_type === "percentage" ? (
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                      {isAr ? "نسبة الزيادة (%) *" : "Markup Percentage (%) *"}
                    </label>
                    <input
                      type="number"
                      min="-50"
                      max="200"
                      required
                      value={ruleForm.adjustment_percent}
                      onChange={(e) => setRuleForm({ ...ruleForm, adjustment_percent: Number(e.target.value) })}
                      placeholder="20"
                      className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono font-bold"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                      {isAr ? "سعر الليلة (EGP) *" : "Nightly Rate (EGP) *"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={ruleForm.price_cents ? ruleForm.price_cents / 100 : ""}
                      onChange={(e) => setRuleForm({ ...ruleForm, price_cents: Math.round(parseFloat(e.target.value || "0") * 100) })}
                      placeholder="12000"
                      className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono font-bold"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "الأولوية (Priority) *" : "Priority (1-100) *"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={ruleForm.priority}
                    onChange={(e) => {
                      setRuleForm({ ...ruleForm, priority: Number(e.target.value) });
                      setTimeout(handleCheckOverlap, 100);
                    }}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "الحد الأدنى لليالي" : "Min Stay Nights"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={ruleForm.min_stay_nights}
                    onChange={(e) => setRuleForm({ ...ruleForm, min_stay_nights: Number(e.target.value) })}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              {/* Overlap Detection Warning Banner */}
              {overlapWarning?.has_overlap && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1">
                  <span className="font-bold text-amber-900 block text-[11px]">
                    ⚠️ {isAr ? "تنبيه تداخل مواسم التسعير:" : "Pricing Overlap Detected:"}
                  </span>
                  {overlapWarning.overlaps.map((o, idx) => (
                    <p key={idx} className="text-[10px] text-amber-800">
                      • {o.message}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl font-bold"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={ruleSubmitting}
                  className="px-5 py-2 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {ruleSubmitting ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "حفظ القاعدة" : "Save Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Price Override on Calendar */}
      {isOverrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-brand-border space-y-4">
            <h3 className="text-base font-serif font-bold text-brand-brown">
              {isAr ? "تطبيق سعر استثنائي مخصص (Date Override)" : "Apply Date-Specific Price Override"}
            </h3>
            <p className="text-xs text-brand-brown-muted">
              {overviewData?.properties.find((p) => p.id === selectedPropertyId)?.title_en}
            </p>

            <form onSubmit={handleSaveOverride} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "من تاريخ *" : "Start Date *"}
                  </label>
                  <input
                    type="date"
                    required
                    value={overrideForm.start_date}
                    onChange={(e) => setOverrideForm({ ...overrideForm, start_date: e.target.value })}
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
                    value={overrideForm.end_date}
                    onChange={(e) => setOverrideForm({ ...overrideForm, end_date: e.target.value })}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "السعر المخصص لليلة (EGP) *" : "Override Nightly Rate (EGP) *"}
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={overrideForm.price}
                  onChange={(e) => setOverrideForm({ ...overrideForm, price: e.target.value })}
                  placeholder="e.g. 15000"
                  className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "سبب الاستثناء" : "Reason / Event Description"}
                </label>
                <input
                  type="text"
                  value={overrideForm.reason}
                  onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                  placeholder="e.g. Private Yacht Party / Festival Weekend"
                  className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl font-bold"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={overrideSubmitting}
                  className="px-5 py-2 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {overrideSubmitting ? (isAr ? "جاري التطبيق..." : "Applying...") : isAr ? "تطبيق السعر" : "Apply Override"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Create Promo Code */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-brand-border space-y-4">
            <h3 className="text-base font-serif font-bold text-brand-brown">
              {isAr ? "إنشاء كود خصم جديد" : "Create Promo Code"}
            </h3>

            <form onSubmit={handleSaveDiscount} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "كود الترويج *" : "Coupon Code *"}
                </label>
                <input
                  type="text"
                  required
                  value={discountForm.code}
                  onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SUMMER26, VIP15"
                  className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                  {isAr ? "اسم الحملة *" : "Campaign Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={discountForm.name_en}
                  onChange={(e) => setDiscountForm({ ...discountForm, name_en: e.target.value })}
                  placeholder="e.g. Summer Early Bird Discount"
                  className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "نوع الخصم *" : "Discount Type *"}
                  </label>
                  <select
                    value={discountForm.type}
                    onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value as any })}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (EGP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "القيمة *" : "Discount Value *"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discountForm.value}
                    onChange={(e) => setDiscountForm({ ...discountForm, value: Number(e.target.value) })}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "ساري من" : "Valid From"}
                  </label>
                  <input
                    type="date"
                    value={discountForm.valid_from}
                    onChange={(e) => setDiscountForm({ ...discountForm, valid_from: e.target.value })}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    {isAr ? "ساري حتى" : "Valid Until"}
                  </label>
                  <input
                    type="date"
                    value={discountForm.valid_until}
                    onChange={(e) => setDiscountForm({ ...discountForm, valid_until: e.target.value })}
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsDiscountModalOpen(false)}
                  className="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl font-bold"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={discountSubmitting}
                  className="px-5 py-2 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {discountSubmitting ? (isAr ? "جاري الإنشاء..." : "Creating...") : isAr ? "إنشاء الكود" : "Create Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={async () => {
          await confirmDialog.action();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
