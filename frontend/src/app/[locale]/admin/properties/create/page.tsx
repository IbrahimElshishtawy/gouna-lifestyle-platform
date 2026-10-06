"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createAdminProperty, getAdminTaxonomies } from "@/features/admin/services/admin.api";
import type { AdminTaxonomiesResponse } from "@/features/admin/types";
import LocationPicker from "@/features/admin/components/LocationPicker";
import { useLanguage } from "@/context/LanguageContext";

export default function CreatePropertyPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [taxonomies, setTaxonomies] = useState<AdminTaxonomiesResponse | null>(null);
  const [loadingTaxonomies, setLoadingTaxonomies] = useState(true);

  // Form State
  const [listingType, setListingType] = useState<"rent" | "sale">("rent");
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [locationId, setLocationId] = useState<number | "">("");
  const [compound, setCompound] = useState("");
  const [address, setAddress] = useState("");

  // Location Geocoordinates State
  const [locationCoords, setLocationCoords] = useState<{
    latitude: number | null;
    longitude: number | null;
    address?: string;
    map_url?: string;
  }>({
    latitude: 27.3948,
    longitude: 33.6782,
    address: "El Gouna, Red Sea, Egypt",
    map_url: "https://www.google.com/maps?q=27.3948,33.6782",
  });

  // Physical specs
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(3);
  const [maxGuests, setMaxGuests] = useState(6);
  const [areaSqm, setAreaSqm] = useState(280);
  const [floor, setFloor] = useState<number | "">("");
  const [building, setBuilding] = useState("");

  // Pricing & Stay rules
  const [basePrice, setBasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [currency, setCurrency] = useState("EGP");
  const [cleaningFee, setCleaningFee] = useState("");
  const [serviceFee, setServiceFee] = useState("");
  const [taxPercentage, setTaxPercentage] = useState("14");
  const [minStayNights, setMinStayNights] = useState(2);
  const [maxStayNights, setMaxStayNights] = useState<number | "">("");

  // Content
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [houseRulesEn, setHouseRulesEn] = useState("");

  // Amenities selected
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    getAdminTaxonomies()
      .then((data) => {
        setTaxonomies(data);
        if (data.categories?.length > 0) {
          setCategoryId(data.categories[0].id);
        }
        if (data.locations?.length > 0) {
          setLocationId(data.locations[0].id);
        }
      })
      .catch(() => {
        setTaxonomies(null);
      })
      .finally(() => {
        setLoadingTaxonomies(false);
      });
  }, []);

  const handleAmenityToggle = (id: number) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      const payload: Record<string, any> = {
        title_en: titleEn.trim(),
        title_ar: titleAr.trim() || undefined,
        listing_type: listingType,
        property_category_id: categoryId || undefined,
        location_id: locationId || undefined,
        compound: compound.trim() || undefined,
        address: address.trim() || locationCoords.address || undefined,
        latitude: locationCoords.latitude,
        longitude: locationCoords.longitude,
        map_url: locationCoords.map_url || undefined,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        max_guests: Number(maxGuests),
        area_sqm: areaSqm ? Number(areaSqm) : undefined,
        floor: floor !== "" ? Number(floor) : undefined,
        building: building.trim() || undefined,
        min_stay_nights: Number(minStayNights) || 1,
        max_stay_nights: maxStayNights !== "" ? Number(maxStayNights) : undefined,
        currency,
        tax_percentage: taxPercentage ? parseFloat(taxPercentage) : 0,
        cleaning_fee_cents: cleaningFee ? Math.round(parseFloat(cleaningFee) * 100) : 0,
        service_fee_cents: serviceFee ? Math.round(parseFloat(serviceFee) * 100) : 0,
        description_en: descriptionEn.trim() || undefined,
        description_ar: descriptionAr.trim() || undefined,
        house_rules_en: houseRulesEn.trim() || undefined,
        amenity_ids: selectedAmenities,
        is_published: true,
        is_available: true,
        status: "published",
      };

      if (listingType === "rent") {
        const parsedBase = parseFloat(basePrice);
        if (isNaN(parsedBase) || parsedBase <= 0) {
          throw new Error(isAr ? "يرجى إدخال سعر ليلة صحيح للإيجار." : "Please enter a valid nightly rate.");
        }
        payload.base_price_cents = Math.round(parsedBase * 100);
      } else {
        const parsedSale = parseFloat(salePrice);
        if (isNaN(parsedSale) || parsedSale <= 0) {
          throw new Error(isAr ? "يرجى إدخال سعر بيع صحيح للعقار." : "Please enter a valid asking price.");
        }
        payload.sale_price_cents = Math.round(parsedSale * 100);
        payload.base_price_cents = Math.round(parsedSale * 100);
      }

      const res = await createAdminProperty(payload);

      setFeedback({
        type: "success",
        message: res.message || (isAr ? "تم إنشاء العقار بنجاح! جاري التوجيه..." : "Property listing created successfully! Redirecting..."),
      });

      setTimeout(() => {
        router.push("/admin/properties");
      }, 1200);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر إنشاء العقار، يرجى مراجعة البيانات." : "Failed to create property. Please review inputs."),
      });
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs text-brand-brown-muted mb-1 font-mono">
            <Link href="/admin/properties" className="hover:text-brand-brown transition">
              {isAr ? "محفظة العقارات" : "Properties Portfolio"}
            </Link>
            <span>/</span>
            <span className="text-brand-brown font-medium">
              {isAr ? "إضافة وحدة / عقار جديد" : "Create Listing"}
            </span>
          </nav>
          <h1 className="text-2xl font-serif font-bold text-brand-brown">
            {isAr ? "إضافة عقار أو فيلا جديدة" : "Add New Property / Villa"}
          </h1>
          <p className="text-xs text-brand-brown-muted mt-0.5">
            {isAr
              ? "إدخال المواصفات، تحديد الموقع الجغرافي الدقيق، وربط تسعير الليلة وقواعد الإقامة."
              : "Enter specifications, set authoritative geolocation coordinates, and configure pricing policies."}
          </p>
        </div>

        <Link
          href="/admin/properties"
          className="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown border border-brand-border rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer w-fit"
        >
          {isAr ? "← العودة للقائمة" : "← Back to Portfolio"}
        </Link>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {feedback.type === "success" ? "✓ " : "✕ "} {feedback.message}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Section 1: Classification & Type */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-brand-border shadow-xs space-y-4">
          <h2 className="text-sm font-serif font-bold text-brand-brown border-b border-brand-border pb-2">
            {isAr ? "1. تصنيف الوحدة ونوع القيد" : "1. Listing Classification & Category"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              onClick={() => setListingType("rent")}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                listingType === "rent"
                  ? "border-brand-terracotta bg-brand-sand-light/50 ring-1 ring-brand-terracotta"
                  : "border-brand-border bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  checked={listingType === "rent"}
                  onChange={() => setListingType("rent")}
                  className="text-brand-terracotta"
                />
                <span className="font-bold text-brand-brown">
                  {isAr ? "إيجار عطلات فاخر (Vacation Rental)" : "Vacation Rental (For Rent)"}
                </span>
              </div>
              <p className="text-[11px] text-brand-brown-muted mt-1 ml-5">
                {isAr
                  ? "حجز ليالي فندقية مرتبط بمحرك الأسعار، المواسم، والتقويم."
                  : "Nightly booking with seasonal pricing engine, min stay rules, and calendar."}
              </p>
            </label>

            <label
              onClick={() => setListingType("sale")}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                listingType === "sale"
                  ? "border-brand-terracotta bg-brand-sand-light/50 ring-1 ring-brand-terracotta"
                  : "border-brand-border bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  checked={listingType === "sale"}
                  onChange={() => setListingType("sale")}
                  className="text-brand-terracotta"
                />
                <span className="font-bold text-brand-brown">
                  {isAr ? "استثمار عقاري للبيع (Real Estate Sale)" : "Real Estate Investment (For Sale)"}
                </span>
              </div>
              <p className="text-[11px] text-brand-brown-muted mt-1 ml-5">
                {isAr
                  ? "عرض شراء عقاري متكامل مع طلبات المعاينة وكتيبات المطور."
                  : "Property purchase listing with buyer lead inquiries and brochure downloads."}
              </p>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {isAr ? "نوع الوحدة (Category) *" : "Unit Type / Category *"}
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                required
                className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-terracotta text-brand-brown"
              >
                {taxonomies?.categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {isAr ? c.name_ar || c.name_en : c.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {isAr ? "المنطقة / الحي بالجونة *" : "Location / Neighborhood *"}
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(Number(e.target.value))}
                required
                className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-terracotta text-brand-brown"
              >
                {taxonomies?.locations?.map((l) => (
                  <option key={l.id} value={l.id}>
                    {isAr ? l.name_ar || l.name_en : l.name_en}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Basic Information */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-brand-border shadow-xs space-y-4">
          <h2 className="text-sm font-serif font-bold text-brand-brown border-b border-brand-border pb-2">
            {isAr ? "2. البيانات الأساسية والعناوين" : "2. Basic Information & Bilingual Titles"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {isAr ? "اسم العقار (English) *" : "Property Title (English) *"}
              </label>
              <input
                type="text"
                required
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Ancient Sands Panoramic Lagoon Villa"
                className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-terracotta text-brand-brown"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {isAr ? "اسم العقار (عربي)" : "Property Title (Arabic)"}
              </label>
              <input
                type="text"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder="مثال: فيلا بانورامية على اللاجون بانشنت ساندز"
                className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-terracotta text-brand-brown text-right"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {isAr ? "الكمبوند / المشروع" : "Compound / Project"}
              </label>
              <input
                type="text"
                value={compound}
                onChange={(e) => setCompound(e.target.value)}
                placeholder="e.g. Tawila, Fanadir Bay, West Golf Phase 2"
                className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 text-brand-brown"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {isAr ? "العنوان بالتفصيل" : "Detailed Street Address"}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Villa 14, Lagoon Way, El Gouna"
                className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 text-brand-brown"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Authoritative Geolocation Picker */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-brand-border shadow-xs space-y-4">
          <h2 className="text-sm font-serif font-bold text-brand-brown border-b border-brand-border pb-2">
            {isAr ? "3. التحديد الجغرافي الدقيق والموقع (Location & GPS)" : "3. Authoritative Location & GPS Geolocation"}
          </h2>

          <LocationPicker
            value={{
              latitude: locationCoords.latitude,
              longitude: locationCoords.longitude,
              address: address || locationCoords.address,
              map_url: locationCoords.map_url,
            }}
            onChange={(loc) => {
              setLocationCoords(loc);
              if (loc.address && !address) {
                setAddress(loc.address);
              }
            }}
          />
        </div>

        {/* Section 4: Specifications & Capacity */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-brand-border shadow-xs space-y-4">
          <h2 className="text-sm font-serif font-bold text-brand-brown border-b border-brand-border pb-2">
            {isAr ? "4. المواصفات والسعة الاستيعابية" : "4. Specifications & Capacity"}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {isAr ? "غرف النوم *" : "Bedrooms *"}
              </label>
              <input
                type="number"
                min={0}
                required
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 text-brand-brown"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {isAr ? "الحمامات *" : "Bathrooms *"}
              </label>
              <input
                type="number"
                min={0}
                required
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 text-brand-brown"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {isAr ? "أقصى عدد ضيوف *" : "Max Guests *"}
              </label>
              <input
                type="number"
                min={1}
                required
                value={maxGuests}
                onChange={(e) => setMaxGuests(Number(e.target.value))}
                className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 text-brand-brown"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {isAr ? "المساحة (م²)" : "Area (SQM)"}
              </label>
              <input
                type="number"
                min={0}
                value={areaSqm}
                onChange={(e) => setAreaSqm(Number(e.target.value))}
                className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 text-brand-brown"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {isAr ? "الطابق (Floor)" : "Floor Number"}
              </label>
              <input
                type="number"
                value={floor}
                onChange={(e) => setFloor(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Ground / 1 / 2"
                className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 text-brand-brown"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {isAr ? "المبنى / رقم الفيلا" : "Building / Villa No."}
              </label>
              <input
                type="text"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="e.g. Villa 12B"
                className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 text-brand-brown"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Pricing & Operational Rules */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-brand-border shadow-xs space-y-4">
          <h2 className="text-sm font-serif font-bold text-brand-brown border-b border-brand-border pb-2">
            {isAr ? "5. محرك الأسعار وسياسات الحجز" : "5. Pricing Engine & Operational Policies"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {listingType === "rent"
                  ? isAr ? "سعر الليلة الأساسي (EGP) *" : "Base Nightly Rate (EGP) *"
                  : isAr ? "إجمالي سعر البيع المطلوب (EGP) *" : "Total Asking Price (EGP) *"}
              </label>
              <input
                type="number"
                required
                min={0}
                value={listingType === "rent" ? basePrice : salePrice}
                onChange={(e) => (listingType === "rent" ? setBasePrice(e.target.value) : setSalePrice(e.target.value))}
                placeholder={listingType === "rent" ? "8500" : "28000000"}
                className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-terracotta text-brand-brown font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {isAr ? "رسوم النظافة (Cleaning Fee EGP)" : "Cleaning Fee (EGP)"}
              </label>
              <input
                type="number"
                min={0}
                value={cleaningFee}
                onChange={(e) => setCleaningFee(e.target.value)}
                placeholder="e.g. 800"
                className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 text-brand-brown"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {isAr ? "رسوم الخدمة (Service Fee EGP)" : "Service Fee (EGP)"}
              </label>
              <input
                type="number"
                min={0}
                value={serviceFee}
                onChange={(e) => setServiceFee(e.target.value)}
                placeholder="e.g. 500"
                className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 text-brand-brown"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {isAr ? "الحد الأدنى لليالي الإقامة (Min Stay) *" : "Minimum Stay Nights *"}
              </label>
              <input
                type="number"
                min={1}
                required
                value={minStayNights}
                onChange={(e) => setMinStayNights(Number(e.target.value))}
                className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 text-brand-brown"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {isAr ? "الحد الأقصى لليالي الإقامة" : "Maximum Stay Nights"}
              </label>
              <input
                type="number"
                min={1}
                value={maxStayNights}
                onChange={(e) => setMaxStayNights(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g. 30"
                className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 text-brand-brown"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {isAr ? "نسبة الضريبة (Tax %)" : "Tax Percentage (%)"}
              </label>
              <input
                type="number"
                step="0.1"
                min={0}
                max={100}
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(e.target.value)}
                placeholder="14"
                className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 text-brand-brown"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Editorial Descriptions */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-brand-border shadow-xs space-y-4">
          <h2 className="text-sm font-serif font-bold text-brand-brown border-b border-brand-border pb-2">
            {isAr ? "6. الوصف التحريري وقواعد المنزل" : "6. Editorial Description & House Rules"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {isAr ? "الوصف التحريري (English)" : "Editorial Description (English)"}
              </label>
              <textarea
                rows={4}
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder="Compelling description detailing waterfront views, private amenities, and lifestyle highlights..."
                className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 text-brand-brown"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {isAr ? "الوصف التحريري (عربي)" : "Editorial Description (Arabic)"}
              </label>
              <textarea
                rows={4}
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                placeholder="وصف تفصيلي يشرح إطلالات اللاجون، حمام السباحة، وقرب الفيلا من المارينا..."
                className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 text-brand-brown text-right"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {isAr ? "قواعد المنزل والشروط (House Rules)" : "House Rules & Guidelines"}
              </label>
              <textarea
                rows={2}
                value={houseRulesEn}
                onChange={(e) => setHouseRulesEn(e.target.value)}
                placeholder="e.g. No smoking inside, quiet hours after 11 PM, pets allowed on request."
                className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 text-brand-brown"
              />
            </div>
          </div>
        </div>

        {/* Section 7: Amenities Checklist */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-brand-border shadow-xs space-y-4">
          <h2 className="text-sm font-serif font-bold text-brand-brown border-b border-brand-border pb-2">
            {isAr ? "7. المرافق والمميزات (Amenities)" : "7. Property Amenities & Features"}
          </h2>

          {loadingTaxonomies ? (
            <p className="text-xs text-brand-brown-muted">{isAr ? "جاري تحميل المرافق..." : "Loading amenities..."}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {taxonomies?.amenities?.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity.id)}
                    className={`p-2.5 rounded-xl border text-left text-[11px] font-medium transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-brand-sand-light border-brand-terracotta text-brand-brown font-bold ring-1 ring-brand-terracotta"
                        : "bg-white border-brand-border text-brand-brown hover:bg-brand-sand-light/40"
                    }`}
                  >
                    <span>{isAr ? amenity.name_ar || amenity.name_en : amenity.name_en}</span>
                    <span className="text-xs">{isSelected ? "✓" : "+"}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="p-4 bg-white rounded-3xl border border-brand-border flex items-center justify-between gap-4">
          <Link
            href="/admin/properties"
            className="px-5 py-2.5 text-brand-brown-muted hover:text-brand-brown text-xs font-bold transition"
          >
            {isAr ? "إلغاء التغييرات" : "Cancel"}
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {submitting
              ? isAr ? "جاري إنشاء ونشر العقار..." : "Creating Property..."
              : isAr ? "إنشاء وحفظ العقار في المحفظة" : "Save & Publish Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
