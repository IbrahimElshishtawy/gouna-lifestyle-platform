"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SafeImage from "@/components/ui/SafeImage";
import {
  getAdminVenues,
  createAdminVenue,
  updateAdminVenue,
  deleteAdminVenue,
  AdminVenueItem,
} from "@/features/venues/services/venues.api";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";

interface VenueFormState {
  id?: number;
  name_en: string;
  name_ar: string;
  venue_type: string;
  capacity: number | "";
  address: string;
  latitude: string;
  longitude: string;
  map_url: string;
  description_en: string;
  description_ar: string;
  facilities: string;
  cover_image: string;
  status: "active" | "inactive" | "maintenance";
}

const INITIAL_VENUE_FORM: VenueFormState = {
  name_en: "",
  name_ar: "",
  venue_type: "beach_club",
  capacity: 350,
  address: "Abu Tig Marina, El Gouna",
  latitude: "27.3972",
  longitude: "33.6822",
  map_url: "https://maps.google.com/?q=27.3972,33.6822",
  description_en: "Premier open-air venue with Red Sea panorama and luxury deck facilities.",
  description_ar: "أرقى ساحة احتفالات مفتوحة بإطلالة مباشرة على مارينا أبو تيج والبحر الأحمر.",
  facilities: "VIP Lounge, Full Sound Rig, Stage, Cocktail Bar, Security, Beach Access",
  cover_image: "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=1200&q=80",
  status: "active",
};

export default function AdminVenuesPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [venues, setVenues] = useState<AdminVenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<AdminVenueItem | null>(null);
  const [form, setForm] = useState<VenueFormState>(INITIAL_VENUE_FORM);
  const [submitting, setSubmitting] = useState(false);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminVenues({
        q: searchQuery || undefined,
        venue_type: selectedType !== "all" ? selectedType : undefined,
      });
      if (res && res.data) {
        setVenues(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load venues:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingVenue(null);
    setForm(INITIAL_VENUE_FORM);
    setModalOpen(true);
  };

  const handleOpenEdit = (v: AdminVenueItem) => {
    setEditingVenue(v);
    setForm({
      id: v.id,
      name_en: v.name_en,
      name_ar: v.name_ar || "",
      venue_type: v.venue_type,
      capacity: v.capacity || "",
      address: v.address || "",
      latitude: v.latitude ? String(v.latitude) : "",
      longitude: v.longitude ? String(v.longitude) : "",
      map_url: v.map_url || "",
      description_en: v.description_en || "",
      description_ar: v.description_ar || "",
      facilities: v.facilities ? v.facilities.join(", ") : "",
      cover_image: v.cover_image || "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=1200&q=80",
      status: v.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const facilitiesList = form.facilities.split(",").map((s) => s.trim()).filter(Boolean);
      const payload: any = {
        name_en: form.name_en,
        name_ar: form.name_ar || null,
        venue_type: form.venue_type,
        capacity: form.capacity ? Number(form.capacity) : null,
        address: form.address || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        map_url: form.map_url || null,
        description_en: form.description_en || null,
        description_ar: form.description_ar || null,
        facilities: facilitiesList,
        cover_image: form.cover_image,
        status: form.status,
      };

      if (editingVenue) {
        await updateAdminVenue(editingVenue.id, payload);
      } else {
        await createAdminVenue(payload);
      }

      setModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to save venue");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this venue?")) return;
    try {
      await deleteAdminVenue(id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to delete venue");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-brand-terracotta animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-terracotta font-bold">
              {isAr ? "مواقع وساحات الحفلات بالجونة" : "EL GOUNA VENUES & PLAZAS"}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown">
            {isAr ? "إدارة المواقع والساحات (Venues)" : "Event Venues & Beach Clubs"}
          </h1>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "إدارة ساحات المهرجانات، نوادي الشاطئ، مسارح الحفلات، والمواقع الخارجية المرتبطة بالفعاليات."
              : "Register and manage beach clubs, festival plazas, hotel open-air decks, and private villa venues."}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer shrink-0"
        >
          <span>+</span>
          <span>{isAr ? "إضافة موقع جديد" : "Add Venue"}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex-1 flex gap-3 items-center min-w-[240px]">
          <input
            type="text"
            placeholder={isAr ? "بحث في المواقع..." : "Search venues by name or address..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-brand-sand-light/50 border border-brand-border text-xs text-brand-brown focus:outline-hidden focus:border-brand-terracotta"
          />

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-brand-sand-light/50 border border-brand-border text-xs text-brand-brown focus:outline-hidden focus:border-brand-terracotta cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="beach_club">Beach Club</option>
            <option value="plaza">Plaza / Festival Ground</option>
            <option value="marina">Marina Deck</option>
            <option value="hotel">Hotel Ballroom / Terrace</option>
            <option value="villa">Private Villa</option>
            <option value="club">Nightclub</option>
          </select>
        </div>
      </div>

      {/* Venues Grid */}
      {loading ? (
        <LoadingState message="Loading venues..." rows={5} />
      ) : venues.length === 0 ? (
        <EmptyState
          icon="🏛️"
          title="No Venues Found"
          description="Register venues such as beach clubs or festival plazas to attach them to events."
          actionText="Add Venue"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {venues.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full bg-brand-sand-light">
                  <SafeImage
                    src={v.cover_image || "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=600&q=80"}
                    alt={v.name_en}
                    fill
                    fallbackSrc="/assets/images/fanadir-villa.jpg"
                    className="object-cover"
                  />
                  <div className="absolute top-3 start-3">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 text-white text-[10px] font-bold uppercase backdrop-blur-xs">
                      {v.venue_type ? v.venue_type.replace(/_/g, " ") : ""}
                    </span>
                  </div>
                  <div className="absolute bottom-3 end-3 px-2 py-0.5 rounded-lg bg-white/90 text-brand-brown text-[11px] font-bold backdrop-blur-xs">
                    👥 Capacity: {v.capacity || "Flexible"}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-serif text-lg font-bold text-brand-brown">
                    {isAr && v.name_ar ? v.name_ar : v.name_en}
                  </h3>
                  <p className="text-xs text-brand-brown-muted line-clamp-2">
                    {isAr && v.description_ar ? v.description_ar : v.description_en}
                  </p>

                  <div className="text-[11px] text-brand-brown-muted space-y-1 border-t border-brand-sand-light pt-3">
                    <div>📍 {v.address || "El Gouna"}</div>
                    {v.facilities && v.facilities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {v.facilities.slice(0, 4).map((f, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-brand-sand-light text-brand-brown text-[10px]">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex justify-between items-center border-t border-brand-sand-light mt-4 pt-3">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                    v.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {v.status}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(v)}
                    className="px-3 py-1.5 rounded-xl bg-brand-sand-light hover:bg-brand-sand text-brand-brown text-xs font-bold cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer text-xs"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-brand-border shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto gounow-scrollbar text-xs">
            <div className="flex justify-between items-center border-b border-brand-border/60 pb-3">
              <h2 className="font-serif text-xl font-bold text-brand-brown">
                {editingVenue ? "Edit Venue" : "Register New Venue"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-brand-brown font-bold text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Venue Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={form.name_en}
                    onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-brown mb-1">اسم الموقع (عربي)</label>
                  <input
                    type="text"
                    value={form.name_ar}
                    onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden text-right"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Venue Type *</label>
                  <select
                    value={form.venue_type}
                    onChange={(e) => setForm({ ...form, venue_type: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                  >
                    <option value="beach_club">Beach Club</option>
                    <option value="plaza">Festival Plaza</option>
                    <option value="marina">Marina Deck</option>
                    <option value="hotel">Hotel Terrace / Ballroom</option>
                    <option value="villa">Private Villa</option>
                    <option value="club">Nightclub</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Capacity (Guests)</label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value ? Number(e.target.value) : "" })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-brand-brown mb-1">Address / Marina Gate</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Latitude</label>
                  <input
                    type="text"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Longitude</label>
                  <input
                    type="text"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-brand-brown mb-1">Facilities (Comma-separated)</label>
                <input
                  type="text"
                  value={form.facilities}
                  onChange={(e) => setForm({ ...form, facilities: e.target.value })}
                  placeholder="VIP Lounge, Sound Rig, Beach Access, Parking"
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-brown mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={form.cover_image}
                  onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden font-mono"
                />
              </div>

              <div className="pt-3 border-t border-brand-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-brand-brown font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white font-bold disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Venue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
