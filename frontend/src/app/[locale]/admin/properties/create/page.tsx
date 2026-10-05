"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreatePropertyPage() {
  const router = useRouter();
  const [listingType, setListingType] = useState<"rent" | "sale">("rent");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/properties");
      }, 1200);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="flex items-center gap-2 text-xs text-brand-brown-muted mb-1">
            <Link href="/admin/properties" className="hover:text-brand-brown">
              Properties
            </Link>
            <span>/</span>
            <span className="text-brand-brown font-medium">Create Listing</span>
          </nav>
          <h1 className="text-2xl font-serif font-bold text-brand-brown">
            Add New Property
          </h1>
        </div>

        <Link
          href="/admin/properties"
          className="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl text-xs font-bold transition"
        >
          &larr; Back to Portfolio
        </Link>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl">
          ✓ Property listing created successfully! Redirecting to properties portfolio...
        </div>
      )}

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs space-y-6 text-xs"
      >
        {/* Listing Type Toggle */}
        <div>
          <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-2">
            Listing Classification *
          </label>
          <div className="flex gap-4">
            <label
              onClick={() => setListingType("rent")}
              className={`flex-1 p-4 rounded-2xl border cursor-pointer transition-all ${
                listingType === "rent"
                  ? "border-brand-terracotta bg-brand-sand-light/50 ring-1 ring-brand-terracotta"
                  : "border-brand-border bg-white"
              }`}
            >
              <input
                type="radio"
                name="type"
                checked={listingType === "rent"}
                onChange={() => setListingType("rent")}
                className="text-brand-terracotta"
              />
              <span className="font-bold text-brand-brown ml-2">
                Vacation Rental (For Rent)
              </span>
              <p className="text-[11px] text-brand-brown-muted mt-1 ml-5">
                Nightly stay booking with pricing engine and seasonal rules.
              </p>
            </label>

            <label
              onClick={() => setListingType("sale")}
              className={`flex-1 p-4 rounded-2xl border cursor-pointer transition-all ${
                listingType === "sale"
                  ? "border-brand-terracotta bg-brand-sand-light/50 ring-1 ring-brand-terracotta"
                  : "border-brand-border bg-white"
              }`}
            >
              <input
                type="radio"
                name="type"
                checked={listingType === "sale"}
                onChange={() => setListingType("sale")}
                className="text-brand-terracotta"
              />
              <span className="font-bold text-brand-brown ml-2">
                Real Estate Investment (For Sale)
              </span>
              <p className="text-[11px] text-brand-brown-muted mt-1 ml-5">
                Property sale with buyer lead inquiries and brochure downloads.
              </p>
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
              Property Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ancient Sands Panoramic Lagoon Villa"
              className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
              Location / Neighborhood *
            </label>
            <select
              required
              className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
            >
              <option value="Abu Tig Marina">Abu Tig Marina</option>
              <option value="Fanadir Bay">Fanadir Bay</option>
              <option value="West Golf">West Golf</option>
              <option value="Mangroovy Beach">Mangroovy Beach</option>
              <option value="Tawila Island">Tawila Island</option>
              <option value="Ancient Sands">Ancient Sands</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
              Category *
            </label>
            <select
              required
              className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
            >
              <option value="Luxury Villas">Luxury Villas</option>
              <option value="Waterfront Lagoons">Waterfront Lagoons</option>
              <option value="Marina Penthouses">Marina Penthouses</option>
              <option value="Beachfront Chalets">Beachfront Chalets</option>
            </select>
          </div>
        </div>

        {/* Specifications */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
              Bedrooms *
            </label>
            <input
              type="number"
              min={1}
              defaultValue={3}
              required
              className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
              Bathrooms *
            </label>
            <input
              type="number"
              min={1}
              defaultValue={3}
              required
              className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
              Max Guests
            </label>
            <input
              type="number"
              min={1}
              defaultValue={6}
              className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
              Area (SQM)
            </label>
            <input
              type="number"
              defaultValue={280}
              className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
              {listingType === "rent" ? "Base Price per Night (EGP) *" : "Total Asking Price (EGP) *"}
            </label>
            <input
              type="number"
              required
              placeholder={listingType === "rent" ? "12000" : "25000000"}
              className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
              Hero Image URL
            </label>
            <input
              type="url"
              defaultValue="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80"
              className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
            Editorial Description *
          </label>
          <textarea
            rows={4}
            required
            placeholder="Write a compelling editorial description of the villa, lagoon views, private pool, and proximity to Abu Tig Marina..."
            className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl p-3"
          />
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-brand-border flex items-center justify-end gap-3">
          <Link
            href="/admin/properties"
            className="px-5 py-3 text-brand-brown-muted hover:text-brand-brown text-xs font-bold uppercase"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Publishing..." : "Publish Property Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
