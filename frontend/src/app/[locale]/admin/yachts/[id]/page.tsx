"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getYachtById,
  getYachtAvailability,
  getYachtBookings,
  addYachtAvailabilityBlock,
  removeYachtAvailabilityBlock,
  addYachtPackage,
  deleteYachtPackage,
  addYachtAddon,
  deleteYachtAddon,
  calculateYachtPrice,
  toggleAdminYachtStatus,
  AdminYachtItem,
} from "@/features/yachts/services/yachts.api";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default function YachtDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const yachtId = Number(resolvedParams.id);
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [yacht, setYacht] = useState<AdminYachtItem | null>(null);
  const [availabilityData, setAvailabilityData] = useState<any>(null);
  const [bookingsData, setBookingsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "availability" | "packages" | "addons" | "bookings" | "calculator" | "media"
  >("overview");

  // Modals
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockForm, setBlockForm] = useState({
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    status: "maintenance",
    reason: "Routine maintenance and engine inspection",
  });

  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [packageForm, setPackageForm] = useState({
    name_en: "Sunset Toast Cruise",
    name_ar: "جولة الغروب الخاصة مع الشمبانيا",
    duration_hours: 3,
    price: 35000,
    inclusions_en: "Captain & Crew, Refreshments, Light Snacks, Sound System",
  });

  const [addonModalOpen, setAddonModalOpen] = useState(false);
  const [addonForm, setAddonForm] = useState({
    name_en: "Artisan BBQ & Seafood Grill",
    name_ar: "بوفيه باربيكيو ومأكولات بحرية فاخرة",
    price: 8500,
    pricing_model: "per_booking",
  });

  // Price Simulation
  const [simForm, setSimForm] = useState({
    date: new Date().toISOString().split("T")[0],
    duration_hours: 4,
    package_id: "",
  });
  const [simResult, setSimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);

  const loadAll = React.useCallback(async () => {
    try {
      setLoading(true);
      const [yachtRes, availRes, bookingsRes] = await Promise.all([
        getYachtById(yachtId),
        getYachtAvailability(yachtId),
        getYachtBookings(yachtId),
      ]);

      if (yachtRes) setYacht(yachtRes);
      if (availRes) setAvailabilityData(availRes);
      if (bookingsRes && bookingsRes.data) setBookingsData(bookingsRes.data);
    } catch (err: any) {
      console.error("Failed to load yacht details:", err);
    } finally {
      setLoading(false);
    }
  }, [yachtId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleToggleStatus = async () => {
    if (!yacht) return;
    try {
      await toggleAdminYachtStatus(yacht.id);
      loadAll();
    } catch (err: any) {
      alert(err.message || "Failed to toggle status");
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yacht) return;
    try {
      await addYachtAvailabilityBlock(yacht.id, blockForm);
      setBlockModalOpen(false);
      loadAll();
      alert("Block added successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to add availability block.");
    }
  };

  const handleDeleteBlock = async (blockId: number) => {
    if (!yacht) return;
    if (!confirm("Remove this block?")) return;
    try {
      await removeYachtAvailabilityBlock(yacht.id, blockId);
      loadAll();
    } catch (err: any) {
      alert(err.message || "Failed to remove block.");
    }
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yacht) return;
    try {
      const inclusions = packageForm.inclusions_en.split(",").map((s) => s.trim()).filter(Boolean);
      await addYachtPackage(yacht.id, {
        name_en: packageForm.name_en,
        name_ar: packageForm.name_ar,
        duration_hours: Number(packageForm.duration_hours),
        price: Number(packageForm.price),
        inclusions_en: inclusions,
      });
      setPackageModalOpen(false);
      loadAll();
      alert("Package created successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to create package.");
    }
  };

  const handleDeletePackage = async (packageId: number) => {
    if (!yacht) return;
    if (!confirm("Delete this package?")) return;
    try {
      await deleteYachtPackage(yacht.id, packageId);
      loadAll();
    } catch (err: any) {
      alert(err.message || "Failed to delete package.");
    }
  };

  const handleAddAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yacht) return;
    try {
      await addYachtAddon(yacht.id, {
        name_en: addonForm.name_en,
        name_ar: addonForm.name_ar,
        price: Number(addonForm.price),
        pricing_model: addonForm.pricing_model,
      });
      setAddonModalOpen(false);
      loadAll();
      alert("Add-on added successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to create add-on.");
    }
  };

  const handleDeleteAddon = async (addonId: number) => {
    if (!yacht) return;
    if (!confirm("Delete this add-on?")) return;
    try {
      await deleteYachtAddon(yacht.id, addonId);
      loadAll();
    } catch (err: any) {
      alert(err.message || "Failed to delete add-on.");
    }
  };

  const handleSimulatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yacht) return;
    try {
      setSimLoading(true);
      const res = await calculateYachtPrice(yacht.id, {
        date: simForm.date,
        duration_hours: Number(simForm.duration_hours),
        package_id: simForm.package_id ? Number(simForm.package_id) : undefined,
      });
      setSimResult(res);
    } catch (err: any) {
      alert(err.message || "Price calculation failed.");
    } finally {
      setSimLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading yacht specifications & availability..." rows={8} />;
  }

  if (!yacht) {
    return (
      <EmptyState
        icon="⛵"
        title="Yacht Not Found"
        description="This yacht does not exist or has been archived."
        actionText="Back to Fleet"
        actionHref="/admin/yachts"
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand-brown-muted mb-1">
            <Link href="/admin/yachts" className="hover:text-brand-terracotta transition">
              ← {isAr ? "العودة لأسطول اليخوت" : "Back to Yachts Fleet"}
            </Link>
            <span>/</span>
            <span className="font-mono text-brand-terracotta">{yacht.slug}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown">
              {isAr && yacht.name_ar ? yacht.name_ar : yacht.name_en}
            </h1>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                yacht.status === "active"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : yacht.status === "maintenance"
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-rose-100 text-rose-800 border border-rose-200"
              }`}
            >
              {yacht.status.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-brand-brown-muted mt-1">
            ⚓ {yacht.marina_berth || "Abu Tig Marina"} • {yacht.brand || "Custom"} {yacht.model || ""} • {yacht.length_ft ? `${yacht.length_ft} FT` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleStatus}
            className="px-4 py-2 rounded-xl border border-brand-border bg-white hover:bg-brand-sand-light text-brand-brown text-xs font-bold transition cursor-pointer"
          >
            {yacht.status === "active" ? "⏸ Suspend Yacht" : "▶ Activate Yacht"}
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-brand-border flex gap-2 sm:gap-6 overflow-x-auto text-xs font-bold">
        {[
          { id: "overview", label: isAr ? "المواصفات العامة" : "Overview & Specs" },
          { id: "availability", label: isAr ? "التقويم والإتاحة" : `Availability (${yacht.availability_blocks?.length || 0})` },
          { id: "packages", label: isAr ? "الباقات البحرية" : `Packages (${yacht.packages?.length || 0})` },
          { id: "addons", label: isAr ? "الإضافات والخدمات" : `Add-ons (${yacht.addons?.length || 0})` },
          { id: "bookings", label: isAr ? "سجل الحجوزات" : `Bookings (${bookingsData.length})` },
          { id: "calculator", label: isAr ? "حاسبة التسعير الرسمية" : "Authoritative Price Calc" },
          { id: "media", label: isAr ? "معرض الصور" : "Media Gallery" },
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

      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-brand-border p-6 space-y-4 shadow-xs">
              <h3 className="font-serif text-lg font-bold text-brand-brown">Yacht Overview</h3>
              <p className="text-xs text-brand-brown leading-relaxed">
                {isAr && yacht.description_ar ? yacht.description_ar : yacht.description_en}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-brand-sand-light text-xs">
                <div>
                  <span className="text-brand-brown-muted block text-[10px] uppercase font-bold">Yacht Type</span>
                  <span className="font-bold text-brand-brown">{yacht.yacht_type}</span>
                </div>
                <div>
                  <span className="text-brand-brown-muted block text-[10px] uppercase font-bold">Category</span>
                  <span className="font-bold text-brand-brown">{yacht.category}</span>
                </div>
                <div>
                  <span className="text-brand-brown-muted block text-[10px] uppercase font-bold">Length</span>
                  <span className="font-bold text-brand-brown">{yacht.length_ft || "—"} FT</span>
                </div>
                <div>
                  <span className="text-brand-brown-muted block text-[10px] uppercase font-bold">Year Built</span>
                  <span className="font-bold text-brand-brown">{yacht.year || "—"}</span>
                </div>
                <div>
                  <span className="text-brand-brown-muted block text-[10px] uppercase font-bold">Guest Capacity</span>
                  <span className="font-bold text-brand-brown">{yacht.capacity} Guests</span>
                </div>
                <div>
                  <span className="text-brand-brown-muted block text-[10px] uppercase font-bold">Crew Capacity</span>
                  <span className="font-bold text-brand-brown">{yacht.crew_capacity} Crew</span>
                </div>
                <div>
                  <span className="text-brand-brown-muted block text-[10px] uppercase font-bold">Cabins / Baths</span>
                  <span className="font-bold text-brand-brown">{yacht.cabins} Cabins / {yacht.bathrooms} Baths</span>
                </div>
                <div>
                  <span className="text-brand-brown-muted block text-[10px] uppercase font-bold">Min Duration</span>
                  <span className="font-bold text-brand-brown">{yacht.min_duration_hours} Hours</span>
                </div>
              </div>
            </div>

            {/* Rules & Policies */}
            <div className="bg-white rounded-3xl border border-brand-border p-6 space-y-3 shadow-xs text-xs">
              <h3 className="font-serif text-base font-bold text-brand-brown">Operating Rules & Cancellation Policy</h3>
              <div className="p-3 rounded-2xl bg-brand-sand-light/50 border border-brand-border/60">
                <span className="font-bold text-brand-terracotta block mb-1">Safety & Guest Rules:</span>
                <p className="text-brand-brown">{yacht.rules_en || "Standard maritime safety regulations apply."}</p>
              </div>
              <div className="p-3 rounded-2xl bg-brand-sand-light/50 border border-brand-border/60">
                <span className="font-bold text-brand-terracotta block mb-1">Cancellation Policy:</span>
                <p className="text-brand-brown">{yacht.cancellation_policy_en || "Standard 48-hour free cancellation policy."}</p>
              </div>
            </div>
          </div>

          {/* Right Rail: Financial Rates & Location */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-brand-border p-6 space-y-4 shadow-xs text-xs">
              <h3 className="font-serif text-base font-bold text-brand-brown">Charter Rates</h3>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center py-2 border-b border-brand-sand-light">
                  <span className="text-brand-brown-muted">Pricing Model:</span>
                  <span className="font-bold text-brand-brown uppercase">{yacht.pricing_model}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-brand-sand-light">
                  <span className="text-brand-brown-muted">Base Hourly Rate:</span>
                  <span className="font-mono font-bold text-brand-brown">{(yacht.base_price_cents / 100).toLocaleString()} {yacht.currency}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-brand-sand-light">
                  <span className="text-brand-brown-muted">Weekend Rate:</span>
                  <span className="font-mono font-bold text-brand-brown">
                    {yacht.weekend_price_cents ? `${(yacht.weekend_price_cents / 100).toLocaleString()} ${yacht.currency}` : "Standard"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-brand-sand-light">
                  <span className="text-brand-brown-muted">Extra Hour Rate:</span>
                  <span className="font-mono font-bold text-brand-brown">
                    {yacht.extra_hour_price_cents ? `${(yacht.extra_hour_price_cents / 100).toLocaleString()} ${yacht.currency}` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-brand-brown-muted">Security Deposit:</span>
                  <span className="font-mono font-bold text-brand-brown">
                    {yacht.security_deposit_cents ? `${(yacht.security_deposit_cents / 100).toLocaleString()} ${yacht.currency}` : "0"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-brand-border p-6 space-y-3 shadow-xs text-xs">
              <h3 className="font-serif text-base font-bold text-brand-brown">Berth & Partner Contact</h3>
              <div>
                <span className="text-brand-brown-muted block text-[10px] uppercase font-bold">Marina Location</span>
                <span className="font-bold text-brand-brown">{yacht.marina_berth || "Abu Tig Marina"}</span>
                <span className="block text-brand-brown-muted">{yacht.address || "El Gouna"}</span>
              </div>
              <div className="pt-2 border-t border-brand-sand-light">
                <span className="text-brand-brown-muted block text-[10px] uppercase font-bold">Partner / Owner</span>
                <span className="font-bold text-brand-brown">{yacht.owner_partner_name || "GouNow Partner"}</span>
                <span className="block font-mono text-brand-brown-muted">{yacht.owner_partner_contact || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. AVAILABILITY & BLOCKS TAB */}
      {activeTab === "availability" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-brown">Availability Blocks & Holds</h3>
              <p className="text-xs text-brand-brown-muted">
                Manage scheduled maintenance and private booking blocks. Conflicting bookings are automatically guarded.
              </p>
            </div>
            <button
              onClick={() => setBlockModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              + Block Dates
            </button>
          </div>

          {availabilityData?.blocks?.length === 0 ? (
            <EmptyState
              icon="📅"
              title="No Availability Blocks"
              description="This yacht is currently fully available for bookings without any maintenance blocks."
              actionText="Add Block"
              onAction={() => setBlockModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availabilityData?.blocks?.map((block: any) => (
                <div key={block.id} className="p-4 rounded-2xl bg-white border border-brand-border space-y-2 shadow-xs text-xs">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold uppercase text-[10px]">
                      {block.status}
                    </span>
                    <button
                      onClick={() => handleDeleteBlock(block.id)}
                      className="text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="font-mono font-bold text-brand-brown text-sm">
                    {block.start_date} → {block.end_date}
                  </div>
                  <p className="text-brand-brown-muted font-light">{block.reason || "No reason specified"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. PACKAGES TAB */}
      {activeTab === "packages" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-brown">Yacht Charter Packages</h3>
              <p className="text-xs text-brand-brown-muted">Specialized curated charter packages (Sunset, Island Hopping, Snorkeling).</p>
            </div>
            <button
              onClick={() => setPackageModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold transition cursor-pointer"
            >
              + Add Package
            </button>
          </div>

          {yacht.packages?.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No Packages Configured"
              description="Create packages to allow guests to book fixed-duration luxury experiences."
              actionText="Create Package"
              onAction={() => setPackageModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {yacht.packages?.map((pkg) => (
                <div key={pkg.id} className="p-5 rounded-3xl bg-white border border-brand-border flex flex-col justify-between space-y-4 shadow-xs text-xs">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-serif text-base font-bold text-brand-brown">{pkg.name_en}</h4>
                      <button
                        onClick={() => handleDeletePackage(pkg.id!)}
                        className="text-rose-500 hover:text-rose-700 cursor-pointer font-bold"
                      >
                        ✕
                      </button>
                    </div>
                    <span className="font-mono text-sm font-bold text-brand-terracotta block mb-2">
                      {(pkg.price_cents / 100).toLocaleString()} EGP • {pkg.duration_hours} Hours
                    </span>
                    <p className="text-brand-brown-muted font-light mb-3">{pkg.description_en || "Premium charter package."}</p>

                    {pkg.inclusions_en && pkg.inclusions_en.length > 0 && (
                      <div className="space-y-1 border-t border-brand-sand-light pt-3">
                        <span className="text-[10px] font-bold uppercase text-brand-brown-muted">Inclusions:</span>
                        <ul className="list-disc list-inside text-brand-brown text-[11px] space-y-0.5">
                          {pkg.inclusions_en.map((inc, i) => (
                            <li key={i}>{inc}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. ADD-ONS TAB */}
      {activeTab === "addons" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-brown">Optional Add-ons</h3>
              <p className="text-xs text-brand-brown-muted">Custom services guests can attach to their charter (DJ, Catering, Water Sports).</p>
            </div>
            <button
              onClick={() => setAddonModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold transition cursor-pointer"
            >
              + Add Add-on
            </button>
          </div>

          {yacht.addons?.length === 0 ? (
            <EmptyState
              icon="✨"
              title="No Add-ons Available"
              description="Add optional extras such as barbecue buffets, drone photography, or live musicians."
              actionText="Add Service"
              onAction={() => setAddonModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {yacht.addons?.map((addon) => (
                <div key={addon.id} className="p-4 rounded-2xl bg-white border border-brand-border space-y-2 shadow-xs text-xs flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-brand-brown text-sm">{addon.name_en}</h4>
                    <span className="font-mono text-brand-terracotta font-bold">
                      {(addon.price_cents / 100).toLocaleString()} EGP
                    </span>
                    <span className="text-[10px] text-brand-brown-muted block">({addon.pricing_model})</span>
                  </div>
                  <button
                    onClick={() => handleDeleteAddon(addon.id!)}
                    className="p-1.5 text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. BOOKINGS TAB */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-brand-brown">Yacht Charter Bookings</h3>
          {bookingsData.length === 0 ? (
            <EmptyState
              icon="📑"
              title="No Bookings Yet"
              description="This yacht currently has no reservations registered in the central booking engine."
            />
          ) : (
            <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-xs">
              <table className="w-full text-start text-xs">
                <thead className="bg-brand-sand-light text-[10px] uppercase font-bold tracking-wider text-brand-brown border-b border-brand-border">
                  <tr>
                    <th className="p-4 text-start">Reference</th>
                    <th className="p-4 text-start">Customer</th>
                    <th className="p-4 text-start">Dates</th>
                    <th className="p-4 text-start">Guests</th>
                    <th className="p-4 text-start">Total</th>
                    <th className="p-4 text-start">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-sand-light">
                  {bookingsData.map((b) => (
                    <tr key={b.id} className="hover:bg-brand-sand/20">
                      <td className="p-4 font-mono font-bold text-brand-terracotta">{b.reference}</td>
                      <td className="p-4 font-bold text-brand-brown">
                        {b.customer ? `${b.customer.first_name} ${b.customer.last_name}` : "Guest"}
                      </td>
                      <td className="p-4 text-brand-brown">{b.check_in} → {b.check_out}</td>
                      <td className="p-4 text-brand-brown">{b.guests}</td>
                      <td className="p-4 font-mono font-bold text-brand-brown">{(b.total_cents / 100).toLocaleString()} {b.currency}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px]">
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

      {/* 6. AUTHORITATIVE PRICE CALCULATOR TAB */}
      {activeTab === "calculator" && (
        <div className="max-w-xl bg-white rounded-3xl border border-brand-border p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <span className="text-[10px] font-mono uppercase text-purple-700 font-bold">PHASE 28 SERVER-SIDE PRICING ENGINE</span>
            <h3 className="font-serif text-xl font-bold text-brand-brown">Live Authoritative Price Calculator</h3>
            <p className="text-xs text-brand-brown-muted mt-1">
              Backend calculation breakdown enforced with zero frontend tampering.
            </p>
          </div>

          <form onSubmit={handleSimulatePrice} className="space-y-4 text-xs">
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

            {yacht.packages && yacht.packages.length > 0 && (
              <div>
                <label className="block font-bold text-brand-brown mb-1">Select Package (Optional)</label>
                <select
                  value={simForm.package_id}
                  onChange={(e) => setSimForm({ ...simForm, package_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                >
                  <option value="">None (Standard Charter Rate)</option>
                  {yacht.packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name_en} — {(pkg.price_cents / 100).toLocaleString()} EGP
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={simLoading}
              className="w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition cursor-pointer"
            >
              {simLoading ? "Calculating on server..." : "Calculate Authoritative Quote"}
            </button>
          </form>

          {simResult && simResult.data && (
            <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2 text-xs">
              <span className="font-bold text-purple-950 block text-xs uppercase tracking-wider mb-2">
                Server-Generated Quote Breakdown:
              </span>
              <div className="flex justify-between text-brand-brown">
                <span>Base Charter / Package Rate:</span>
                <span className="font-mono font-bold">{simResult.data.base_price} EGP</span>
              </div>
              <div className="flex justify-between text-brand-brown">
                <span>Weekend Surcharge (Friday/Saturday):</span>
                <span className="font-mono font-bold">+{simResult.data.weekend_adjustment} EGP</span>
              </div>
              <div className="flex justify-between text-brand-brown">
                <span>Extra Hours ({simResult.data.extra_hours}h):</span>
                <span className="font-mono font-bold">+{simResult.data.extra_hours_cost} EGP</span>
              </div>
              <div className="border-t border-purple-200 pt-3 flex justify-between text-brand-brown text-base font-bold">
                <span>Final Authorized Price:</span>
                <span className="font-mono text-purple-900 text-lg">{simResult.data.final_price} EGP</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. MEDIA GALLERY TAB */}
      {activeTab === "media" && (
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-brand-brown">Yacht Media Assets</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative h-64 rounded-2xl overflow-hidden border border-brand-border bg-brand-sand">
              <Image
                src={yacht.cover_image || "/assets/images/tawila-yacht.jpg"}
                alt="Cover"
                fill
                className="object-cover"
              />
              <span className="absolute bottom-2 start-2 px-2 py-1 rounded bg-black/70 text-white text-[10px] font-bold">
                Cover Image
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BLOCK AVAILABILITY */}
      {blockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-brand-border shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="font-serif text-lg font-bold text-brand-brown">Block Dates</h3>
            <form onSubmit={handleAddBlock} className="space-y-4">
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
                <label className="block font-bold text-brand-brown mb-1">Status *</label>
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
                <label className="block font-bold text-brand-brown mb-1">Reason</label>
                <input
                  type="text"
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
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
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold">
                  Save Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PACKAGE */}
      {packageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-brand-border shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="font-serif text-lg font-bold text-brand-brown">Create Charter Package</h3>
            <form onSubmit={handleAddPackage} className="space-y-4">
              <div>
                <label className="block font-bold text-brand-brown mb-1">Package Name (EN) *</label>
                <input
                  type="text"
                  required
                  value={packageForm.name_en}
                  onChange={(e) => setPackageForm({ ...packageForm, name_en: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                />
              </div>
              <div>
                <label className="block font-bold text-brand-brown mb-1">اسم الباقة (عربي)</label>
                <input
                  type="text"
                  value={packageForm.name_ar}
                  onChange={(e) => setPackageForm({ ...packageForm, name_ar: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden text-right"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Duration (Hours) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={packageForm.duration_hours}
                    onChange={(e) => setPackageForm({ ...packageForm, duration_hours: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Price (EGP) *</label>
                  <input
                    type="number"
                    required
                    value={packageForm.price}
                    onChange={(e) => setPackageForm({ ...packageForm, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-brand-brown mb-1">Inclusions (Comma separated)</label>
                <input
                  type="text"
                  value={packageForm.inclusions_en}
                  onChange={(e) => setPackageForm({ ...packageForm, inclusions_en: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPackageModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-brand-brown font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white font-bold">
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ADDON */}
      {addonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-brand-border shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="font-serif text-lg font-bold text-brand-brown">Create Add-on Service</h3>
            <form onSubmit={handleAddAddon} className="space-y-4">
              <div>
                <label className="block font-bold text-brand-brown mb-1">Service Name (EN) *</label>
                <input
                  type="text"
                  required
                  value={addonForm.name_en}
                  onChange={(e) => setAddonForm({ ...addonForm, name_en: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                />
              </div>
              <div>
                <label className="block font-bold text-brand-brown mb-1">Price (EGP) *</label>
                <input
                  type="number"
                  required
                  value={addonForm.price}
                  onChange={(e) => setAddonForm({ ...addonForm, price: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-brand-brown mb-1">Pricing Model *</label>
                <select
                  value={addonForm.pricing_model}
                  onChange={(e) => setAddonForm({ ...addonForm, pricing_model: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                >
                  <option value="per_booking">Per Booking</option>
                  <option value="per_person">Per Person</option>
                  <option value="per_hour">Per Hour</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddonModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-brand-brown font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white font-bold">
                  Save Add-on
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
