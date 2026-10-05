import React from "react";
import { Link } from "@/i18n/routing";
import PropertyCard from "@/features/properties/components/PropertyCard";
import { getProperties } from "@/features/properties/services/properties.api";
import { setRequestLocale } from "next-intl/server";
import { getDictionary } from "@/locales/dictionary";
import type { Metadata } from "next";

interface Props {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    listing_type?: "rent" | "sale";
    location?: string;
    category?: string;
    bedrooms?: string;
    guests?: string;
    sort?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    title: isAr
      ? "إقامات وعقارات الجونة الفاخرة | GouNow"
      : "Luxury Stays & Real Estate in El Gouna | GouNow",
    description: isAr
      ? "اكتشف فيلات الإيجار الفاخرة على البحيرات الشاطئية وأرقى العقارات للبيع في الجونة، البحر الأحمر."
      : "Discover private lagoon waterfront villas and signature real estate in El Gouna, Red Sea.",
  };
}

export default async function StaysPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = getDictionary(locale);

  const queryParams = await searchParams;
  const listingType = queryParams.listing_type || "rent";
  const isRent = listingType === "rent";

  const properties = await getProperties({
    listing_type: listingType,
    location: queryParams.location,
    category: queryParams.category,
    bedrooms: queryParams.bedrooms,
    guests: queryParams.guests,
    sort: queryParams.sort,
  });

  return (
    <div className="bg-[#FAF8F5]">
      {/* Top Header & Filter Banner */}
      <div className="bg-white border-b border-brand-border py-10 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-2">
              {t.staysPage.eyebrow}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
              {isRent ? t.staysPage.titleRent : t.staysPage.titleSale}
            </h1>
            <p className="text-xs sm:text-sm text-brand-brown-muted leading-relaxed font-light mt-2">
              {isRent ? t.staysPage.subtitleRent : t.staysPage.subtitleSale}
            </p>
          </div>

          {/* Filter Bar */}
          <div className="mt-8 bg-brand-sand-card p-5 rounded-3xl border border-brand-border shadow-xs">
            <form method="GET" action={`/${locale}/stays`} className="space-y-4">
              {/* Listing Type Toggle & Sort */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
                {/* Type Tabs */}
                <div className="flex items-center gap-2">
                  <Link
                    href="/stays?listing_type=rent"
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                      isRent
                        ? "bg-brand-terracotta text-white shadow-xs"
                        : "bg-brand-sand-light text-brand-brown hover:bg-brand-sand/50"
                    }`}
                  >
                    {t.staysPage.vacationRentals}
                  </Link>
                  <Link
                    href="/stays?listing_type=sale"
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                      !isRent
                        ? "bg-brand-terracotta text-white shadow-xs"
                        : "bg-brand-sand-light text-brand-brown hover:bg-brand-sand/50"
                    }`}
                  >
                    {t.staysPage.propertiesForSale}
                  </Link>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-brand-brown-muted">{t.staysPage.sortBy}</span>
                  <select
                    name="sort"
                    defaultValue={queryParams.sort || "featured"}
                    className="bg-white border border-brand-border rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none"
                  >
                    <option value="featured">{t.staysPage.sortFeatured}</option>
                    <option value="price_asc">{t.staysPage.sortPriceAsc}</option>
                    <option value="price_desc">{t.staysPage.sortPriceDesc}</option>
                  </select>
                </div>
              </div>

              {/* Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <input type="hidden" name="listing_type" value={listingType} />

                {/* Location */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                    {t.staysPage.location}
                  </label>
                  <select
                    name="location"
                    defaultValue={queryParams.location || "all"}
                    className="w-full text-xs bg-white border border-brand-border rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="all">{t.staysPage.allLocations}</option>
                    <option value="abu-tig-marina">Abu Tig Marina</option>
                    <option value="fanadir-bay">Fanadir Bay</option>
                    <option value="mangroovy-beach">Mangroovy &amp; Kite Beach</option>
                    <option value="west-golf">West Golf</option>
                    <option value="tawila-island">Tawila Island</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                    {t.staysPage.category}
                  </label>
                  <select
                    name="category"
                    defaultValue={queryParams.category || "all"}
                    className="w-full text-xs bg-white border border-brand-border rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="all">{t.staysPage.allCategories}</option>
                    <option value="luxury-villas">{t.staysPage.luxuryVillas}</option>
                    <option value="waterfront-chalets">{t.staysPage.waterfrontChalets}</option>
                    <option value="marina-apartments">{t.staysPage.marinaApartments}</option>
                    <option value="signature-villas">{t.staysPage.signatureRealEstate}</option>
                  </select>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                    {t.staysPage.bedrooms}
                  </label>
                  <select
                    name="bedrooms"
                    defaultValue={queryParams.bedrooms || ""}
                    className="w-full text-xs bg-white border border-brand-border rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="">{t.staysPage.any}</option>
                    <option value="2">{t.staysPage.beds2Plus}</option>
                    <option value="3">{t.staysPage.beds3Plus}</option>
                    <option value="4">{t.staysPage.beds4Plus}</option>
                    <option value="5">{t.staysPage.beds5Plus}</option>
                  </select>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1">
                    {t.staysPage.minGuests}
                  </label>
                  <select
                    name="guests"
                    defaultValue={queryParams.guests || ""}
                    className="w-full text-xs bg-white border border-brand-border rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="">{t.staysPage.any}</option>
                    <option value="2">{t.staysPage.guests2Plus}</option>
                    <option value="4">{t.staysPage.guests4Plus}</option>
                    <option value="6">{t.staysPage.guests6Plus}</option>
                    <option value="8">{t.staysPage.guests8Plus}</option>
                  </select>
                </div>

                {/* Submit & Reset */}
                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    {t.staysPage.filter}
                  </button>
                  <Link
                    href={`/stays?listing_type=${listingType}`}
                    className="p-2.5 text-brand-brown-muted hover:text-brand-brown rounded-xl border border-brand-border text-xs text-center bg-white"
                    title={t.staysPage.resetFilters}
                  >
                    ✕
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Main Results Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex items-center justify-between mb-8">
          <span className="text-xs text-brand-brown-muted font-medium">
            {t.staysPage.showing} <strong className="text-brand-brown">{properties.length}</strong>{" "}
            {isRent ? t.staysPage.vacationStaysCount : t.staysPage.propertiesSaleCount}
          </span>
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-brand-border text-center max-w-lg mx-auto">
            <span className="text-4xl block mb-3">🏖️</span>
            <h3 className="font-serif text-lg font-bold text-brand-brown mb-1">
              {t.staysPage.noPropertiesFound}
            </h3>
            <p className="text-xs text-brand-brown-muted mb-6">
              {t.staysPage.noPropertiesSub}
            </p>
            <Link
              href="/stays?listing_type=rent"
              className="px-5 py-2.5 bg-brand-terracotta text-white rounded-xl text-xs font-bold uppercase tracking-wider inline-block"
            >
              {t.staysPage.resetFilters}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

