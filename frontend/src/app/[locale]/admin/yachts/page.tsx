"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getAdminYachts,
  getYachtDashboard,
  getYachtTaxonomies,
  createAdminYacht,
  updateAdminYacht,
  deleteAdminYacht,
  toggleAdminYachtStatus,
  addYachtAvailabilityBlock,
  addYachtPackage,
  deleteYachtPackage,
  addYachtAddon,
  deleteYachtAddon,
  calculateYachtPrice,
  AdminYachtItem,
  YachtDashboardData,
  YachtTaxonomies,
} from "@/features/yachts/services/yachts.api";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";

interface YachtFormState {
  id?: number;
  name_en: string;
  name_ar: string;
  location_id: number | "";
  yacht_type: string;
  category: string;
  brand: string;
  model: string;
  year: number | "";
  length_ft: number | "";
  capacity: number;
  crew_capacity: number;
  cabins: number;
  bathrooms: number;
  owner_partner_name: string;
  owner_partner_contact: string;
  pricing_model: "hourly" | "half_day" | "full_day" | "per_trip";
  base_price: string;
  weekend_price: string;
  extra_hour_price: string;
  security_deposit: string;
  min_duration_hours: number;
  marina_berth: string;
  address: string;
  latitude: string;
  longitude: string;
  map_url: string;
  short_description_en: string;
  short_description_ar: string;
  description_en: string;
  description_ar: string;
  rules_en: string;
  rules_ar: string;
  cancellation_policy_en: string;
  cancellation_policy_ar: string;
  cover_image: string;
  is_featured: boolean;
  status: "draft" | "pending_approval" | "active" | "suspended" | "maintenance" | "inactive" | "archived";
}

const INITIAL_YACHT_FORM: YachtFormState = {
  name_en: "",
  name_ar: "",
  location_id: "",
  yacht_type: "motor_yacht",
  category: "luxury",
  brand: "Gulf Craft",
  model: "Majesty",
  year: new Date().getFullYear(),
  length_ft: 50,
  capacity: 12,
  crew_capacity: 2,
  cabins: 2,
  bathrooms: 2,
  owner_partner_name: "Red Sea Charters",
  owner_partner_contact: "+201001234567",
  pricing_model: "hourly",
  base_price: "12000",
  weekend_price: "15000",
  extra_hour_price: "4000",
  security_deposit: "5000",
  min_duration_hours: 2,
  marina_berth: "Abu Tig Marina, Dock B",
  address: "Abu Tig Marina, El Gouna",
  latitude: "27.3972",
  longitude: "33.6822",
  map_url: "https://maps.google.com/?q=27.3972,33.6822",
  short_description_en: "Luxurious motor yacht for private charters, sunset cruises, and island exploration.",
  short_description_ar: "يخت فاخر مجهز بالكامل للرحلات البحرية الخاصة وجولات الغروب في الجونة.",
  description_en: "Experience the ultimate Red Sea luxury charter with top-tier sound system, sun deck, and dedicated crew.",
  description_ar: "استمتع بأفخم رحلة بحرية في البحر الأحمر مع طاقم محترف وتجهيزات متكاملة.",
  rules_en: "No smoking in cabins. Life jackets must be worn during high speed. Maximum guest capacity strictly enforced.",
  rules_ar: "ممنوع التدخين داخل الكبائن. الالتزام بتعليمات السلامة والحد الأقصى لعدد الركاب.",
  cancellation_policy_en: "Free cancellation up to 48 hours before departure. 50% fee thereafter.",
  cancellation_policy_ar: "إلغاء مجاني حتى 48 ساعة قبل موعد الإبحار.",
  cover_image: "/assets/images/tawila-yacht.jpg",
  is_featured: true,
  status: "active",
};

export default function AdminYachtsPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [yachts, setYachts] = useState<AdminYachtItem[]>([]);
  const [dashboard, setDashboard] = useState<YachtDashboardData | null>(null);
  const [taxonomies, setTaxonomies] = useState<YachtTaxonomies | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  // Modals
  const [yachtModalOpen, setYachtModalOpen] = useState(false);
  const [editingYacht, setEditingYacht] = useState<AdminYachtItem | null>(null);
  const [yachtForm, setYachtForm] = useState<YachtFormState>(INITIAL_YACHT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Availability Block Modal
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [selectedYachtForBlock, setSelectedYachtForBlock] = useState<AdminYachtItem | null>(null);
  const [blockForm, setBlockForm] = useState({
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    status: "maintenance",
    reason: "Engine routine service & deck buffing",
  });

  // Package Modal
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [selectedYachtForPackage, setSelectedYachtForPackage] = useState<AdminYachtItem | null>(null);
  const [packageForm, setPackageForm] = useState({
    name_en: "Sunset Champagne Cruise",
    name_ar: "جولة الغروب مع الشمبانيا",
    duration_hours: 3,
    price: 35000,
    inclusions_en: "Captain, Fuel, Premium Soft Drinks, Fresh Fruit Platter",
  });

  // Add-on Modal
  const [addonModalOpen, setAddonModalOpen] = useState(false);
  const [selectedYachtForAddon, setSelectedYachtForAddon] = useState<AdminYachtItem | null>(null);
  const [addonForm, setAddonForm] = useState({
    name_en: "Private DJ & Sound Equipment",
    name_ar: "دي جي خاص مع نظام صوتي متكامل",
    price: 6000,
    pricing_model: "per_booking",
  });

  // Pricing Simulator Modal
  const [priceSimOpen, setPriceSimOpen] = useState(false);
  const [selectedYachtForSim, setSelectedYachtForSim] = useState<AdminYachtItem | null>(null);
  const [simForm, setSimForm] = useState({
    date: new Date().toISOString().split("T")[0],
    duration_hours: 4,
  });
  const [simResult, setSimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);

  const [, startTransition] = useTransition();

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [yachtRes, dashRes, taxRes] = await Promise.all([
        getAdminYachts({
          q: searchQuery || undefined,
          yacht_type: selectedType !== "all" ? selectedType : undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          status: selectedStatus !== "all" ? selectedStatus : undefined,
        }),
        getYachtDashboard(),
        getYachtTaxonomies(),
      ]);

      if (yachtRes && yachtRes.data) {
        setYachts(yachtRes.data);
      }
      if (dashRes) {
        setDashboard(dashRes);
      }
      if (taxRes) {
        setTaxonomies(taxRes);
      }
    } catch (err: any) {
      console.error("Failed to load yachts data:", err);
      setFeedback({ type: "error", message: err.message || "Failed to fetch yachts data." });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType, selectedCategory, selectedStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingYacht(null);
    setYachtForm({
      ...INITIAL_YACHT_FORM,
      location_id: taxonomies?.locations && taxonomies.locations.length > 0 ? taxonomies.locations[0].id : "",
    });
    setFeedback(null);
    setYachtModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (yacht: AdminYachtItem) => {
    setEditingYacht(yacht);
    setYachtForm({
      id: yacht.id,
      name_en: yacht.name_en,
      name_ar: yacht.name_ar || "",
      location_id: yacht.location?.id || "",
      yacht_type: yacht.yacht_type,
      category: yacht.category,
      brand: yacht.brand || "",
      model: yacht.model || "",
      year: yacht.year || "",
      length_ft: yacht.length_ft || "",
      capacity: yacht.capacity,
      crew_capacity: yacht.crew_capacity,
      cabins: yacht.cabins,
      bathrooms: yacht.bathrooms,
      owner_partner_name: yacht.owner_partner_name || "",
      owner_partner_contact: yacht.owner_partner_contact || "",
      pricing_model: yacht.pricing_model,
      base_price: String(yacht.base_price_cents / 100),
      weekend_price: yacht.weekend_price_cents ? String(yacht.weekend_price_cents / 100) : "",
      extra_hour_price: yacht.extra_hour_price_cents ? String(yacht.extra_hour_price_cents / 100) : "",
      security_deposit: yacht.security_deposit_cents ? String(yacht.security_deposit_cents / 100) : "",
      min_duration_hours: yacht.min_duration_hours,
      marina_berth: yacht.marina_berth || "",
      address: yacht.address || "",
      latitude: yacht.latitude ? String(yacht.latitude) : "",
      longitude: yacht.longitude ? String(yacht.longitude) : "",
      map_url: yacht.map_url || "",
      short_description_en: yacht.short_description_en || "",
      short_description_ar: yacht.short_description_ar || "",
      description_en: yacht.description_en || "",
      description_ar: yacht.description_ar || "",
      rules_en: yacht.rules_en || "",
      rules_ar: yacht.rules_ar || "",
      cancellation_policy_en: yacht.cancellation_policy_en || "",
      cancellation_policy_ar: yacht.cancellation_policy_ar || "",
      cover_image: yacht.cover_image || "/assets/images/tawila-yacht.jpg",
      is_featured: yacht.is_featured,
      status: yacht.status,
    });
    setFeedback(null);
    setYachtModalOpen(true);
  };

  // Submit Yacht (Create or Update)
  const handleSubmitYacht = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const payload: any = {
        name_en: yachtForm.name_en,
        name_ar: yachtForm.name_ar || null,
        location_id: yachtForm.location_id ? Number(yachtForm.location_id) : null,
        yacht_type: yachtForm.yacht_type,
        category: yachtForm.category,
        brand: yachtForm.brand || null,
        model: yachtForm.model || null,
        year: yachtForm.year ? Number(yachtForm.year) : null,
        length_ft: yachtForm.length_ft ? Number(yachtForm.length_ft) : null,
        capacity: Number(yachtForm.capacity),
        crew_capacity: Number(yachtForm.crew_capacity),
        cabins: Number(yachtForm.cabins),
        bathrooms: Number(yachtForm.bathrooms),
        owner_partner_name: yachtForm.owner_partner_name || null,
        owner_partner_contact: yachtForm.owner_partner_contact || null,
        pricing_model: yachtForm.pricing_model,
        base_price: parseFloat(yachtForm.base_price),
        weekend_price: yachtForm.weekend_price ? parseFloat(yachtForm.weekend_price) : null,
        extra_hour_price: yachtForm.extra_hour_price ? parseFloat(yachtForm.extra_hour_price) : null,
        security_deposit: yachtForm.security_deposit ? parseFloat(yachtForm.security_deposit) : null,
        min_duration_hours: Number(yachtForm.min_duration_hours),
        marina_berth: yachtForm.marina_berth || null,
        address: yachtForm.address || null,
        latitude: yachtForm.latitude ? parseFloat(yachtForm.latitude) : null,
        longitude: yachtForm.longitude ? parseFloat(yachtForm.longitude) : null,
        map_url: yachtForm.map_url || null,
        short_description_en: yachtForm.short_description_en || null,
        short_description_ar: yachtForm.short_description_ar || null,
        description_en: yachtForm.description_en || null,
        description_ar: yachtForm.description_ar || null,
        rules_en: yachtForm.rules_en || null,
        rules_ar: yachtForm.rules_ar || null,
        cancellation_policy_en: yachtForm.cancellation_policy_en || null,
        cancellation_policy_ar: yachtForm.cancellation_policy_ar || null,
        cover_image: yachtForm.cover_image,
        is_featured: yachtForm.is_featured,
        status: yachtForm.status,
      };

      if (editingYacht) {
        await updateAdminYacht(editingYacht.id, payload);
        setFeedback({ type: "success", message: isAr ? "تم تحديث بيانات اليخت بنجاح." : "Yacht updated successfully." });
      } else {
        await createAdminYacht(payload);
        setFeedback({ type: "success", message: isAr ? "تم تسجيل اليخت في الأسطول بنجاح." : "Yacht registered successfully." });
      }

      setYachtModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error("Yacht save error:", err);
      setFeedback({ type: "error", message: err.message || (isAr ? "حدث خطأ أثناء حفظ اليخت." : "Error saving yacht.") });
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (id: number) => {
    try {
      await toggleAdminYachtStatus(id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to toggle status");
    }
  };

  // Delete Yacht
  const handleDeleteYacht = async (id: number) => {
    if (!confirm(isAr ? "هل أنت متأكد من أرشفة هذا اليخت؟" : "Are you sure you want to archive this yacht?")) {
      return;
    }
    try {
      await deleteAdminYacht(id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to delete yacht");
    }
  };

  // Add Availability Block
  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYachtForBlock) return;
    try {
      await addYachtAvailabilityBlock(selectedYachtForBlock.id, blockForm);
      setBlockModalOpen(false);
      loadData();
      alert(isAr ? "تم حظر الموعد بنجاح" : "Availability block added successfully");
    } catch (err: any) {
      alert(err.message || "Error blocking availability");
    }
  };

  // Add Package
  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYachtForPackage) return;
    try {
      const inclusions = packageForm.inclusions_en.split(",").map((s) => s.trim()).filter(Boolean);
      await addYachtPackage(selectedYachtForPackage.id, {
        name_en: packageForm.name_en,
        name_ar: packageForm.name_ar,
        duration_hours: Number(packageForm.duration_hours),
        price: Number(packageForm.price),
        inclusions_en: inclusions,
      });
      setPackageModalOpen(false);
      loadData();
      alert(isAr ? "تم إضافة الباقة بنجاح" : "Package added successfully");
    } catch (err: any) {
      alert(err.message || "Error adding package");
    }
  };

  // Add Addon
  const handleAddAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYachtForAddon) return;
    try {
      await addYachtAddon(selectedYachtForAddon.id, {
        name_en: addonForm.name_en,
        name_ar: addonForm.name_ar,
        price: Number(addonForm.price),
        pricing_model: addonForm.pricing_model,
      });
      setAddonModalOpen(false);
      loadData();
      alert(isAr ? "تم إضافة الميزة الإضافية بنجاح" : "Add-on added successfully");
    } catch (err: any) {
      alert(err.message || "Error adding add-on");
    }
  };

  // Test Authoritative Price Calculation
  const handleRunPricingSim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYachtForSim) return;
    try {
      setSimLoading(true);
      const res = await calculateYachtPrice(selectedYachtForSim.id, {
        date: simForm.date,
        duration_hours: Number(simForm.duration_hours),
      });
      setSimResult(res);
    } catch (err: any) {
      alert(err.message || "Price simulation failed");
    } finally {
      setSimLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">Active</span>;
      case "maintenance":
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-100 text-amber-800 border border-amber-200">Maintenance</span>;
      case "suspended":
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-100 text-rose-800 border border-rose-200">Suspended</span>;
      case "pending_approval":
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-100 text-blue-800 border border-blue-200">Pending</span>;
      default:
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-100 text-gray-800 border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-brand-terracotta animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-terracotta font-bold">
              {isAr ? "أسطول الجونة لليخوت الفاخرة" : "EL GOUNA LUXURY FLEET MANAGEMENT"}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown">
            {isAr ? "إدارة أسطول اليخوت والشارتر" : "Yachts & Charters Fleet Command"}
          </h1>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "تحكم كامل في مواعيد الإبحار، جداول الإتاحة، باقات الغروب، والإضافات الخاصة."
              : "End-to-end administration for yacht specifications, availability calendars, pricing tiers, and packages."}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer shrink-0"
        >
          <span>+</span>
          <span>{isAr ? "إضافة يخت للأسطول" : "Register Yacht"}</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-sm font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards Strip */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs">
            <span className="text-[10px] uppercase tracking-wider text-brand-brown-muted font-bold block mb-1">
              {isAr ? "إجمالي الأسطول" : "Total Yachts"}
            </span>
            <span className="text-2xl font-serif font-bold text-brand-brown">{dashboard.total_yachts}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs">
            <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold block mb-1">
              {isAr ? "نشط ومتاح" : "Active Yachts"}
            </span>
            <span className="text-2xl font-serif font-bold text-emerald-700">{dashboard.active_yachts}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs">
            <span className="text-[10px] uppercase tracking-wider text-amber-600 font-bold block mb-1">
              {isAr ? "في الصيانة" : "In Maintenance"}
            </span>
            <span className="text-2xl font-serif font-bold text-amber-700">{dashboard.maintenance_yachts}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs">
            <span className="text-[10px] uppercase tracking-wider text-blue-600 font-bold block mb-1">
              {isAr ? "حجوزات اليوم" : "Booked Today"}
            </span>
            <span className="text-2xl font-serif font-bold text-blue-700">{dashboard.booked_today}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs">
            <span className="text-[10px] uppercase tracking-wider text-purple-600 font-bold block mb-1">
              {isAr ? "قيد المراجعة" : "Pending Review"}
            </span>
            <span className="text-2xl font-serif font-bold text-purple-700">{dashboard.pending_approval}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs">
            <span className="text-[10px] uppercase tracking-wider text-brand-terracotta font-bold block mb-1">
              {isAr ? "إيراد الحجوزات" : "Revenue (EGP)"}
            </span>
            <span className="text-lg font-serif font-bold text-brand-terracotta">
              {Number(dashboard.revenue_egp).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder={isAr ? "بحث بالاسم، الموديل، الماركة، أو رقم الرصيف..." : "Search name, brand, model, berth..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-brand-sand-light/50 border border-brand-border text-xs text-brand-brown focus:outline-hidden focus:border-brand-terracotta"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-brand-sand-light/50 border border-brand-border text-xs text-brand-brown focus:outline-hidden focus:border-brand-terracotta cursor-pointer"
          >
            <option value="all">{isAr ? "كل أنواع اليخوت" : "All Yacht Types"}</option>
            <option value="motor_yacht">Motor Yacht</option>
            <option value="sailing_yacht">Sailing Yacht</option>
            <option value="catamaran">Catamaran</option>
            <option value="superyacht">Superyacht</option>
            <option value="speedboat">Speedboat</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-brand-sand-light/50 border border-brand-border text-xs text-brand-brown focus:outline-hidden focus:border-brand-terracotta cursor-pointer"
          >
            <option value="all">{isAr ? "كل التصنيفات" : "All Categories"}</option>
            <option value="luxury">Luxury</option>
            <option value="sunset">Sunset Cruise</option>
            <option value="island_hopping">Island Hopping</option>
            <option value="family">Family</option>
            <option value="party">Party / Events</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-brand-sand-light/50 border border-brand-border text-xs text-brand-brown focus:outline-hidden focus:border-brand-terracotta cursor-pointer"
          >
            <option value="all">{isAr ? "كل الحالات" : "All Statuses"}</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="suspended">Suspended</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="flex items-center gap-1 self-end md:self-auto shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewMode === "grid" ? "bg-brand-sand text-brand-brown shadow-xs" : "text-brand-brown-muted hover:bg-brand-sand-light"
            }`}
            title="Grid View"
          >
            ▦ Grid
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewMode === "table" ? "bg-brand-sand text-brand-brown shadow-xs" : "text-brand-brown-muted hover:bg-brand-sand-light"
            }`}
            title="Table View"
          >
            ☰ Table
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingState message={isAr ? "جاري تحميل أسطول اليخوت..." : "Loading yacht fleet..."} rows={6} />
      ) : yachts.length === 0 ? (
        <EmptyState
          icon="🛥️"
          title={isAr ? "لا توجد يخوت مسجلة" : "No Yachts Found"}
          description={
            isAr
              ? "لم يتم العثور على يخوت مطابقة للشروط المحددة. يمكنك إضافة يخت جديد للبدء في إدارة أسطول الجونة."
              : "No yachts matching your search criteria. Register your first yacht to begin fleet operations."
          }
          actionText={isAr ? "إضافة يخت للأسطول" : "Register First Yacht"}
          onAction={handleOpenCreate}
        />
      ) : viewMode === "grid" ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {yachts.map((yacht) => (
            <div
              key={yacht.id}
              className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative h-48 w-full bg-brand-sand-light overflow-hidden">
                <Image
                  src={yacht.cover_image || "/assets/images/tawila-yacht.jpg"}
                  alt={yacht.name_en}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 start-3 flex gap-2">
                  {getStatusBadge(yacht.status)}
                  <span className="px-2 py-0.5 rounded-lg bg-black/60 text-white text-[10px] font-mono tracking-wider backdrop-blur-xs">
                    {yacht.length_ft ? `${yacht.length_ft} FT` : "YACHT"}
                  </span>
                </div>
                <div className="absolute bottom-3 end-3 px-2.5 py-1 rounded-xl bg-white/95 text-brand-brown text-xs font-bold backdrop-blur-xs shadow-xs">
                  {yacht.base_price_cents ? (yacht.base_price_cents / 100).toLocaleString() : 0} {yacht.currency || "EGP"} / hr
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-terracotta">
                      {yacht.brand || "Charter"} • {yacht.category}
                    </span>
                    <span className="text-[11px] text-brand-brown-muted font-light">
                      👥 Up to {yacht.capacity} Guests
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-brand-brown group-hover:text-brand-terracotta transition-colors line-clamp-1">
                    {isAr && yacht.name_ar ? yacht.name_ar : yacht.name_en}
                  </h3>
                  <p className="text-xs text-brand-brown-muted font-light mt-1 line-clamp-2">
                    {isAr && yacht.short_description_ar ? yacht.short_description_ar : yacht.short_description_en}
                  </p>

                  <div className="mt-3 flex items-center gap-4 text-[11px] text-brand-brown-muted border-t border-brand-sand-light pt-3">
                    <div>⚓ {yacht.marina_berth || "Abu Tig Marina"}</div>
                    <div>🛏️ {yacht.cabins} Cabins</div>
                    <div>📦 {yacht.packages_count || yacht.packages?.length || 0} Packages</div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-brand-border/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/admin/yachts/${yacht.id}`}
                      className="px-3 py-1.5 rounded-xl bg-brand-sand-light hover:bg-brand-sand text-brand-brown text-xs font-bold transition"
                    >
                      {isAr ? "التفاصيل" : "Details"}
                    </Link>
                    <button
                      onClick={() => handleOpenEdit(yacht)}
                      className="px-2.5 py-1.5 rounded-xl bg-brand-sand-light hover:bg-brand-sand text-brand-brown text-xs font-medium transition cursor-pointer"
                      title="Edit Yacht"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => {
                        setSelectedYachtForBlock(yacht);
                        setBlockModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-medium transition cursor-pointer"
                      title="Block Dates"
                    >
                      📅 Block
                    </button>
                    <button
                      onClick={() => {
                        setSelectedYachtForSim(yacht);
                        setSimResult(null);
                        setPriceSimOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-medium transition cursor-pointer"
                      title="Test Pricing Calculation"
                    >
                      💲 Price Calc
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleStatus(yacht.id)}
                      className="p-1.5 rounded-lg text-xs hover:bg-brand-sand text-brand-brown cursor-pointer"
                      title={yacht.status === "active" ? "Suspend" : "Activate"}
                    >
                      {yacht.status === "active" ? "⏸" : "▶"}
                    </button>
                    <button
                      onClick={() => handleDeleteYacht(yacht.id)}
                      className="p-1.5 rounded-lg text-xs hover:bg-rose-50 text-rose-600 cursor-pointer"
                      title="Archive"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Data Table View */
        <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-brand-sand-light text-[10px] uppercase font-bold tracking-wider text-brand-brown border-b border-brand-border">
                <tr>
                  <th className="p-4 text-start">Yacht</th>
                  <th className="p-4 text-start">Type & Brand</th>
                  <th className="p-4 text-start">Capacity</th>
                  <th className="p-4 text-start">Berth / Location</th>
                  <th className="p-4 text-start">Hourly Rate</th>
                  <th className="p-4 text-start">Status</th>
                  <th className="p-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-sand-light">
                {yachts.map((yacht) => (
                  <tr key={yacht.id} className="hover:bg-brand-sand/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-brand-sand shrink-0">
                          <Image
                            src={yacht.cover_image || "/assets/images/tawila-yacht.jpg"}
                            alt={yacht.name_en}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <Link href={`/admin/yachts/${yacht.id}`} className="font-bold text-brand-brown hover:text-brand-terracotta text-sm">
                            {isAr && yacht.name_ar ? yacht.name_ar : yacht.name_en}
                          </Link>
                          <span className="block text-[11px] text-brand-brown-muted font-light">
                            {yacht.length_ft ? `${yacht.length_ft} ft` : ""} {yacht.year ? `(${yacht.year})` : ""}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-brand-brown">
                      <span className="font-medium block">{yacht.yacht_type}</span>
                      <span className="text-[11px] text-brand-brown-muted">{yacht.brand || "—"}</span>
                    </td>
                    <td className="p-4 text-brand-brown">
                      <span className="font-bold">{yacht.capacity} Guests</span>
                      <span className="block text-[11px] text-brand-brown-muted">{yacht.crew_capacity} Crew</span>
                    </td>
                    <td className="p-4 text-brand-brown">
                      <span className="block font-medium">{yacht.marina_berth || "Abu Tig Marina"}</span>
                      <span className="text-[11px] text-brand-brown-muted">{yacht.location?.name_en || "El Gouna"}</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-brand-brown">
                      {(yacht.base_price_cents / 100).toLocaleString()} {yacht.currency}
                    </td>
                    <td className="p-4">{getStatusBadge(yacht.status)}</td>
                    <td className="p-4 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/yachts/${yacht.id}`}
                          className="px-2.5 py-1 rounded-lg bg-brand-sand-light hover:bg-brand-sand text-brand-brown font-semibold text-xs"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(yacht)}
                          className="p-1.5 rounded-lg text-brand-brown hover:bg-brand-sand cursor-pointer"
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleToggleStatus(yacht.id)}
                          className="p-1.5 rounded-lg text-brand-brown hover:bg-brand-sand cursor-pointer"
                          title="Toggle Status"
                        >
                          {yacht.status === "active" ? "⏸" : "▶"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT YACHT MODAL */}
      {yachtModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl border border-brand-border shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto gounow-scrollbar">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-terracotta">
                  {editingYacht ? "EDIT FLEET UNIT" : "REGISTER FLEET UNIT"}
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-brown">
                  {editingYacht ? (isAr ? "تعديل مواصفات اليخت" : "Edit Yacht Specifications") : (isAr ? "تسجيل يخت جديد في الأسطول" : "Register New Yacht")}
                </h2>
              </div>
              <button
                onClick={() => setYachtModalOpen(false)}
                className="p-2 rounded-xl text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitYacht} className="space-y-6 text-xs">
              {/* 1. Basic Info */}
              <div className="space-y-3">
                <h4 className="font-bold text-brand-brown text-sm border-s-4 border-brand-terracotta ps-2">
                  1. {isAr ? "البيانات الأساسية والاسم" : "Identification & Brand"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Yacht Name (English) *</label>
                    <input
                      type="text"
                      required
                      value={yachtForm.name_en}
                      onChange={(e) => setYachtForm({ ...yachtForm, name_en: e.target.value })}
                      placeholder="e.g. Majesty 56 Flybridge Luxury"
                      className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 focus:border-brand-terracotta outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-brown mb-1">اسم اليخت (عربي)</label>
                    <input
                      type="text"
                      value={yachtForm.name_ar}
                      onChange={(e) => setYachtForm({ ...yachtForm, name_ar: e.target.value })}
                      placeholder="مثال: يخت ماجستي 56 الفاخر"
                      className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 focus:border-brand-terracotta outline-hidden text-right"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Yacht Type *</label>
                    <select
                      value={yachtForm.yacht_type}
                      onChange={(e) => setYachtForm({ ...yachtForm, yacht_type: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 focus:border-brand-terracotta outline-hidden"
                    >
                      <option value="motor_yacht">Motor Yacht</option>
                      <option value="sailing_yacht">Sailing Yacht</option>
                      <option value="catamaran">Catamaran</option>
                      <option value="superyacht">Superyacht</option>
                      <option value="speedboat">Speedboat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Category *</label>
                    <select
                      value={yachtForm.category}
                      onChange={(e) => setYachtForm({ ...yachtForm, category: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 focus:border-brand-terracotta outline-hidden"
                    >
                      <option value="luxury">Ultra Luxury</option>
                      <option value="sunset">Sunset Lagoon Cruise</option>
                      <option value="island_hopping">Island Hopping & Sandbars</option>
                      <option value="family">Family & Group</option>
                      <option value="party">Celebrations & Events</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Brand / Builder</label>
                    <input
                      type="text"
                      value={yachtForm.brand}
                      onChange={(e) => setYachtForm({ ...yachtForm, brand: e.target.value })}
                      placeholder="e.g. Gulf Craft / Sunseeker"
                      className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 focus:border-brand-terracotta outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Model & Year</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={yachtForm.model}
                        onChange={(e) => setYachtForm({ ...yachtForm, model: e.target.value })}
                        placeholder="Model"
                        className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                      />
                      <input
                        type="number"
                        value={yachtForm.year}
                        onChange={(e) => setYachtForm({ ...yachtForm, year: e.target.value ? Number(e.target.value) : "" })}
                        placeholder="Year"
                        className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Specs & Capacity */}
              <div className="space-y-3">
                <h4 className="font-bold text-brand-brown text-sm border-s-4 border-brand-terracotta ps-2">
                  2. {isAr ? "السعة والمواصفات البحرية" : "Specs & Dimensions"}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Length (FT)</label>
                    <input
                      type="number"
                      value={yachtForm.length_ft}
                      onChange={(e) => setYachtForm({ ...yachtForm, length_ft: e.target.value ? Number(e.target.value) : "" })}
                      className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Max Guests *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={yachtForm.capacity}
                      onChange={(e) => setYachtForm({ ...yachtForm, capacity: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Crew Count</label>
                    <input
                      type="number"
                      min={0}
                      value={yachtForm.crew_capacity}
                      onChange={(e) => setYachtForm({ ...yachtForm, crew_capacity: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Cabins</label>
                    <input
                      type="number"
                      min={0}
                      value={yachtForm.cabins}
                      onChange={(e) => setYachtForm({ ...yachtForm, cabins: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Bathrooms</label>
                    <input
                      type="number"
                      min={0}
                      value={yachtForm.bathrooms}
                      onChange={(e) => setYachtForm({ ...yachtForm, bathrooms: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Pricing Architecture */}
              <div className="space-y-3">
                <h4 className="font-bold text-brand-brown text-sm border-s-4 border-brand-terracotta ps-2">
                  3. {isAr ? "هيكل التسعير والقواعد المالية" : "Pricing Architecture & Rates"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Pricing Model *</label>
                    <select
                      value={yachtForm.pricing_model}
                      onChange={(e) => setYachtForm({ ...yachtForm, pricing_model: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                    >
                      <option value="hourly">Hourly Rate</option>
                      <option value="half_day">Half-Day (4h)</option>
                      <option value="full_day">Full-Day (8h)</option>
                      <option value="per_trip">Per Fixed Trip</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Base Rate (EGP) *</label>
                    <input
                      type="number"
                      required
                      step="any"
                      value={yachtForm.base_price}
                      onChange={(e) => setYachtForm({ ...yachtForm, base_price: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Weekend Rate (EGP)</label>
                    <input
                      type="number"
                      step="any"
                      value={yachtForm.weekend_price}
                      onChange={(e) => setYachtForm({ ...yachtForm, weekend_price: e.target.value })}
                      placeholder="Optional weekend rate"
                      className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Extra Hour Rate (EGP)</label>
                    <input
                      type="number"
                      step="any"
                      value={yachtForm.extra_hour_price}
                      onChange={(e) => setYachtForm({ ...yachtForm, extra_hour_price: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Location & Berth */}
              <div className="space-y-3">
                <h4 className="font-bold text-brand-brown text-sm border-s-4 border-brand-terracotta ps-2">
                  4. {isAr ? "موقع الإبحار ورقم الرصيف" : "Berth & Location System"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Marina Berth / Dock</label>
                    <input
                      type="text"
                      value={yachtForm.marina_berth}
                      onChange={(e) => setYachtForm({ ...yachtForm, marina_berth: e.target.value })}
                      placeholder="e.g. Abu Tig Marina, Dock C-12"
                      className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Coordinates (Lat, Lng)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={yachtForm.latitude}
                        onChange={(e) => setYachtForm({ ...yachtForm, latitude: e.target.value })}
                        placeholder="27.3972"
                        className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden font-mono"
                      />
                      <input
                        type="text"
                        value={yachtForm.longitude}
                        onChange={(e) => setYachtForm({ ...yachtForm, longitude: e.target.value })}
                        placeholder="33.6822"
                        className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-brand-brown mb-1">Status *</label>
                    <select
                      value={yachtForm.status}
                      onChange={(e) => setYachtForm({ ...yachtForm, status: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden font-bold"
                    >
                      <option value="active">Active (Bookable)</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="suspended">Suspended</option>
                      <option value="draft">Draft</option>
                      <option value="pending_approval">Pending Approval</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 5. Media Image */}
              <div className="space-y-3">
                <h4 className="font-bold text-brand-brown text-sm border-s-4 border-brand-terracotta ps-2">
                  5. {isAr ? "الصورة الرئيسية" : "Cover Media"}
                </h4>
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    value={yachtForm.cover_image}
                    onChange={(e) => setYachtForm({ ...yachtForm, cover_image: e.target.value })}
                    placeholder="/assets/images/tawila-yacht.jpg or https://..."
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-brand-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setYachtModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-brand-border text-brand-brown font-bold hover:bg-brand-sand-light cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (isAr ? "جاري الحفظ..." : "Saving...") : (editingYacht ? (isAr ? "تحديث اليخت" : "Update Yacht") : (isAr ? "تسجيل اليخت" : "Save Yacht"))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AVAILABILITY BLOCK MODAL */}
      {blockModalOpen && selectedYachtForBlock && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-brand-border shadow-2xl p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-brand-brown">
              {isAr ? "حظر تواريخ الصيانة / الحجز الخاص" : `Block Availability: ${selectedYachtForBlock.name_en}`}
            </h3>
            <p className="text-xs text-brand-brown-muted">
              {isAr
                ? "يتم حظر التواريخ فورياً ومنع أي حجوزات جديدة عليها، مع حماية الحجوزات المؤكدة مسبقاً."
                : "Block dates for maintenance or private holds. Authoritative server rules prevent conflicting slots."}
            </p>

            <form onSubmit={handleAddBlock} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-brand-brown mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={blockForm.start_date}
                  onChange={(e) => setBlockForm({ ...blockForm, start_date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                />
              </div>
              <div>
                <label className="block font-bold text-brand-brown mb-1">End Date *</label>
                <input
                  type="date"
                  required
                  value={blockForm.end_date}
                  onChange={(e) => setBlockForm({ ...blockForm, end_date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                />
              </div>
              <div>
                <label className="block font-bold text-brand-brown mb-1">Block Type *</label>
                <select
                  value={blockForm.status}
                  onChange={(e) => setBlockForm({ ...blockForm, status: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="blocked">Blocked / Private Hold</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-brand-brown mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  placeholder="e.g. Annual Hull Inspection"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBlockModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-brand-brown font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Confirm Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUTHORITATIVE PRICING SIMULATOR MODAL */}
      {priceSimOpen && selectedYachtForSim && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-brand-border shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 font-bold">
                  PHASE 28 SERVER-SIDE PRICING ENGINE
                </span>
                <h3 className="font-serif text-lg font-bold text-brand-brown">
                  {selectedYachtForSim.name_en}
                </h3>
              </div>
              <button onClick={() => setPriceSimOpen(false)} className="text-brand-brown font-bold text-lg">
                ✕
              </button>
            </div>

            <p className="text-xs text-brand-brown-muted font-light">
              {isAr
                ? "يتم حساب السعر النهائي بواسطة الباك إند فقط ولا يمكن التلاعب به من الفرونت إند. (سعر أساسي + تعديل عطلة + ساعات إضافية + ميزات = السعر النهائي)."
                : "Test backend authoritative price calculation. The server is the sole source of truth."}
            </p>

            <form onSubmit={handleRunPricingSim} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Charter Date *</label>
                  <input
                    type="date"
                    required
                    value={simForm.date}
                    onChange={(e) => setSimForm({ ...simForm, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Duration (Hours) *</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    required
                    value={simForm.duration_hours}
                    onChange={(e) => setSimForm({ ...simForm, duration_hours: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={simLoading}
                className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition cursor-pointer"
              >
                {simLoading ? "Calculating on Server..." : "Simulate Authoritative Quote"}
              </button>
            </form>

            {simResult && simResult.data && (
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2 text-xs">
                <span className="font-bold text-purple-900 block text-xs uppercase tracking-wider">
                  Server Price Breakdown:
                </span>
                <div className="flex justify-between text-brand-brown">
                  <span>Base Charter Rate:</span>
                  <span className="font-mono font-bold">{simResult.data.base_price} EGP</span>
                </div>
                <div className="flex justify-between text-brand-brown">
                  <span>Weekend Adjustment:</span>
                  <span className="font-mono font-bold">+{simResult.data.weekend_adjustment} EGP</span>
                </div>
                <div className="flex justify-between text-brand-brown">
                  <span>Extra Hours ({simResult.data.extra_hours}h):</span>
                  <span className="font-mono font-bold">+{simResult.data.extra_hours_cost} EGP</span>
                </div>
                <div className="border-t border-purple-200 pt-2 flex justify-between text-brand-brown text-sm font-bold">
                  <span>Authoritative Final Price:</span>
                  <span className="font-mono text-purple-900 text-base">{simResult.data.final_price} EGP</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
