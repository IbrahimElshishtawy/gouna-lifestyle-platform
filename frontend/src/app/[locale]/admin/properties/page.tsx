import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getProperties } from "@/features/properties/services/properties.api";

interface Props {
  searchParams: Promise<{
    type?: string;
  }>;
}

export default async function AdminPropertiesPage({ searchParams }: Props) {
  const { type } = await searchParams;
  const properties = await getProperties();

  const filtered = type
    ? properties.filter((p) => p.listing_type === type)
    : properties;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-brown">
            Properties Portfolio
          </h1>
          <p className="text-xs text-brand-brown-muted mt-1">
            Manage holiday rental villas, chalets, and luxury real estate listings in El Gouna
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/properties/create"
            className="px-4 py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-xs flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Add Property</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-border pb-3">
        <Link
          href="/admin/properties"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            !type
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          All ({properties.length})
        </Link>
        <Link
          href="/admin/properties?type=rent"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            type === "rent"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          Vacation Rentals ({properties.filter((p) => p.listing_type === "rent").length})
        </Link>
        <Link
          href="/admin/properties?type=sale"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            type === "sale"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          Real Estate For Sale ({properties.filter((p) => p.listing_type === "sale").length})
        </Link>
      </div>

      {/* Properties Table Card */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto gounow-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-semibold border-b border-brand-border">
              <tr>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Specs</th>
                <th className="py-3 px-4">Pricing</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {filtered.map((prop) => {
                const img = prop.images?.[0]?.url || "/assets/images/bg-sand-texture.jpg";
                return (
                  <tr
                    key={prop.id}
                    className="hover:bg-brand-sand-light/30 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-brand-sand relative shrink-0 border border-brand-border">
                          <Image
                            src={img}
                            alt={prop.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/stays/${prop.slug}`}
                            target="_blank"
                            className="font-bold text-brand-brown hover:text-brand-terracotta line-clamp-1 max-w-[200px]"
                          >
                            {prop.title}
                          </Link>
                          <span className="text-[10px] text-brand-brown-muted">
                            {prop.category?.name || "Villa"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-brown">
                      {prop.reference_code}
                    </td>
                    <td className="py-3.5 px-4 text-brand-brown">
                      📍 {prop.location?.name || "El Gouna"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          prop.listing_type === "rent"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {prop.listing_type === "rent" ? "For Rent" : "For Sale"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-brand-brown-muted">
                      {prop.bedrooms} Bed &bull; {prop.bathrooms} Bath
                      {prop.max_guests ? ` • ${prop.max_guests} Guests` : ""}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-brand-brown">
                      {prop.price_formatted}{" "}
                      <span className="text-[10px] font-normal text-brand-brown-muted">
                        {prop.currency}
                        {prop.listing_type === "rent" ? " / night" : ""}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/stays/${prop.slug}`}
                          target="_blank"
                          className="px-2 py-1 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded text-[11px] font-medium"
                          title="View on site"
                        >
                          View ↗
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
