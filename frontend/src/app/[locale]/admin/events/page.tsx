"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getAdminEvents,
  getEventDashboard,
  getEventTaxonomies,
  createAdminEvent,
  updateAdminEvent,
  deleteAdminEvent,
  toggleAdminEventStatus,
  performEventCheckIn,
  searchEventTicketsForCheckin,
  AdminEventItem,
  EventDashboardData,
  EventTaxonomies,
  CheckInResult,
} from "@/features/events/services/events.api";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";

interface EventFormState {
  id?: number;
  title_en: string;
  title_ar: string;
  category: string;
  organizer: string;
  venue_id: number | "";
  event_date: string;
  start_time: string;
  end_time: string;
  doors_open_time: string;
  age_restriction: string;
  dress_code: string;
  rules_en: string;
  short_description_en: string;
  description_en: string;
  status: "draft" | "published" | "cancelled" | "completed";
  // Initial ticket types
  ticket_name_en: string;
  ticket_price: string;
  ticket_capacity: string;
}

const INITIAL_EVENT_FORM: EventFormState = {
  title_en: "",
  title_ar: "",
  category: "Party",
  organizer: "GouNow Nightlife Dispatch",
  venue_id: "",
  event_date: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
  start_time: "21:00",
  end_time: "03:00",
  doors_open_time: "19:30",
  age_restriction: "21+",
  dress_code: "Bohemian Chic / Resort Glam",
  rules_en: "Original ID required at the gate. Strictly 21+. No outside drinks permitted.",
  short_description_en: "Exclusive seaside electronic session featuring international DJs and VIP lagoon deck access.",
  description_en: "Experience El Gouna's premier nightlife event under the stars with state-of-the-art acoustics and curated mixology.",
  status: "published",
  ticket_name_en: "General Admission",
  ticket_price: "1800",
  ticket_capacity: "250",
};

export default function AdminEventsPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [events, setEvents] = useState<AdminEventItem[]>([]);
  const [dashboard, setDashboard] = useState<EventDashboardData | null>(null);
  const [taxonomies, setTaxonomies] = useState<EventTaxonomies | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedVenue, setSelectedVenue] = useState<number | "">("");
  const [activeTab, setActiveTab] = useState<"catalog" | "checkin">("catalog");

  // Create / Edit Modal
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AdminEventItem | null>(null);
  const [eventForm, setEventForm] = useState<EventFormState>(INITIAL_EVENT_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Check-In Station State
  const [checkinEventId, setCheckinEventId] = useState<number | "">("");
  const [ticketInputCode, setTicketInputCode] = useState("");
  const [checkinResult, setCheckinResult] = useState<CheckInResult | null>(null);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [eventsRes, dashRes, taxRes] = await Promise.all([
        getAdminEvents({
          q: searchQuery || undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          status: selectedStatus !== "all" ? selectedStatus : undefined,
          venue_id: selectedVenue ? Number(selectedVenue) : undefined,
        }),
        getEventDashboard(),
        getEventTaxonomies(),
      ]);

      if (eventsRes && eventsRes.data) {
        setEvents(eventsRes.data);
        if (!checkinEventId && eventsRes.data.length > 0) {
          setCheckinEventId(eventsRes.data[0].id);
        }
      }
      if (dashRes) setDashboard(dashRes);
      if (taxRes) {
        setTaxonomies(taxRes);
        if (taxRes.venues && taxRes.venues.length > 0 && !eventForm.venue_id) {
          setEventForm((prev) => ({ ...prev, venue_id: taxRes.venues[0].id }));
        }
      }
    } catch (err: any) {
      console.error("Failed to load events data:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedStatus, selectedVenue]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingEvent(null);
    setEventForm({
      ...INITIAL_EVENT_FORM,
      venue_id: taxonomies?.venues && taxonomies.venues.length > 0 ? taxonomies.venues[0].id : "",
    });
    setEventModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (evt: AdminEventItem) => {
    setEditingEvent(evt);
    setEventForm({
      id: evt.id,
      title_en: evt.title_en,
      title_ar: evt.title_ar || "",
      category: evt.category,
      organizer: evt.organizer || "",
      venue_id: evt.venue_id || (evt.venue ? evt.venue.id : ""),
      event_date: evt.event_date,
      start_time: evt.start_time ? evt.start_time.substring(0, 5) : "20:00",
      end_time: evt.end_time ? evt.end_time.substring(0, 5) : "02:00",
      doors_open_time: evt.doors_open_time ? evt.doors_open_time.substring(0, 5) : "19:00",
      age_restriction: evt.age_restriction || "21+",
      dress_code: evt.dress_code || "",
      rules_en: evt.rules_en || "",
      short_description_en: evt.short_description_en || "",
      description_en: evt.description_en || "",
      status: evt.status,
      ticket_name_en: "General Admission",
      ticket_price: "1500",
      ticket_capacity: "200",
    });
    setEventModalOpen(true);
  };

  // Submit Event Form
  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = {
        title_en: eventForm.title_en,
        title_ar: eventForm.title_ar || null,
        category: eventForm.category,
        organizer: eventForm.organizer || null,
        venue_id: eventForm.venue_id ? Number(eventForm.venue_id) : null,
        event_date: eventForm.event_date,
        start_time: eventForm.start_time,
        end_time: eventForm.end_time || null,
        doors_open_time: eventForm.doors_open_time || null,
        age_restriction: eventForm.age_restriction || null,
        dress_code: eventForm.dress_code || null,
        rules_en: eventForm.rules_en || null,
        short_description_en: eventForm.short_description_en || null,
        description_en: eventForm.description_en || null,
        status: eventForm.status,
      };

      if (!editingEvent && eventForm.ticket_name_en && eventForm.ticket_price) {
        payload.tickets = [
          {
            name_en: eventForm.ticket_name_en,
            price: parseFloat(eventForm.ticket_price),
            capacity: Number(eventForm.ticket_capacity || 200),
            max_per_order: 4,
          },
        ];
      }

      if (editingEvent) {
        await updateAdminEvent(editingEvent.id, payload);
      } else {
        await createAdminEvent(payload);
      }

      setEventModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to save event");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Event Status
  const handleToggleStatus = async (id: number) => {
    try {
      await toggleAdminEventStatus(id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to toggle status");
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: number) => {
    if (!confirm(isAr ? "هل أنت متأكد من حذف هذه الفعالية؟" : "Are you sure you want to delete this event?")) return;
    try {
      await deleteAdminEvent(id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to delete event");
    }
  };

  // Check-In Ticket Code
  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkinEventId || !ticketInputCode.trim()) return;
    try {
      setCheckinLoading(true);
      setCheckinResult(null);
      const res = await performEventCheckIn(Number(checkinEventId), { ticket_code: ticketInputCode.trim() });
      setCheckinResult(res);
      setTicketInputCode("");
      loadData(); // reload dashboard stats
    } catch (err: any) {
      setCheckinResult({
        success: false,
        result: err.result || "invalid",
        message: err.message || "Check-in failed: Invalid ticket code or unauthorized entry.",
      });
    } finally {
      setCheckinLoading(false);
    }
  };

  // Search Tickets For Manual Check-in
  const handleQuickSearch = async (val: string) => {
    setQuickSearchQuery(val);
    if (!checkinEventId || val.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await searchEventTicketsForCheckin(Number(checkinEventId), val);
      setSearchResults(res);
    } catch (err: any) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">Published</span>;
      case "completed":
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-100 text-blue-800 border border-blue-200">Completed</span>;
      case "cancelled":
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-100 text-rose-800 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-100 text-gray-800 border border-gray-200">Draft</span>;
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
              {isAr ? "إدارة الفعاليات والتذاكر" : "TICKETING & NIGHTLIFE DISPATCH"}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown">
            {isAr ? "إدارة الفعاليات والحفلات بالجونة" : "El Gouna Events & Festival Management"}
          </h1>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "جدولة حفلات المارينا، وتذاكر المهرجانات، والتحكم في بوابات الدخول والـ Check-in المباشر."
              : "Schedule marina parties, festival tickets, table allocations, and live QR gate check-in stations."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(activeTab === "catalog" ? "checkin" : "catalog")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
              activeTab === "checkin"
                ? "bg-purple-700 text-white"
                : "bg-brand-sand-light text-brand-brown hover:bg-brand-sand"
            }`}
          >
            {activeTab === "checkin" ? "← Back to Events List" : "⚡ Gate Check-in Station"}
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer shrink-0"
          >
            <span>+</span>
            <span>{isAr ? "إضافة فعالية جديدة" : "Create Event"}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs">
            <span className="text-[10px] uppercase tracking-wider text-brand-brown-muted font-bold block mb-1">
              Upcoming Events
            </span>
            <span className="text-2xl font-serif font-bold text-brand-brown">{dashboard.upcoming_events}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs">
            <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold block mb-1">
              Tickets Sold
            </span>
            <span className="text-2xl font-serif font-bold text-emerald-700">{dashboard.tickets_sold}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs">
            <span className="text-[10px] uppercase tracking-wider text-blue-600 font-bold block mb-1">
              Available Inventory
            </span>
            <span className="text-2xl font-serif font-bold text-blue-700">{dashboard.tickets_remaining}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs">
            <span className="text-[10px] uppercase tracking-wider text-purple-600 font-bold block mb-1">
              Gate Check-ins
            </span>
            <span className="text-2xl font-serif font-bold text-purple-700">{dashboard.total_checkins}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs">
            <span className="text-[10px] uppercase tracking-wider text-amber-600 font-bold block mb-1">
              Today&apos;s Shows
            </span>
            <span className="text-2xl font-serif font-bold text-amber-700">{dashboard.today_events}</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs">
            <span className="text-[10px] uppercase tracking-wider text-brand-terracotta font-bold block mb-1">
              Ticket Revenue
            </span>
            <span className="text-lg font-serif font-bold text-brand-terracotta">
              {Number(dashboard.revenue_egp).toLocaleString()} EGP
            </span>
          </div>
        </div>
      )}

      {/* VIEW: LIVE CHECK-IN STATION */}
      {activeTab === "checkin" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Scanning Pad */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-sand-light pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 font-bold">
                    PHASE 10 SECURE EVENT CHECK-IN ENGINE
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-brown">
                    Live Ticket Scanner & Gate Verification
                  </h2>
                </div>

                <div className="min-w-[200px]">
                  <label className="block text-[10px] uppercase font-bold text-brand-brown-muted mb-1">Target Event:</label>
                  <select
                    value={checkinEventId}
                    onChange={(e) => setCheckinEventId(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-brand-border bg-brand-sand-light/50 text-xs font-bold text-brand-brown outline-hidden"
                  >
                    {events.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.title_en} ({evt.event_date})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Scan Input Box */}
              <form onSubmit={handleCheckInSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-brown mb-1.5">
                    Scan Barcode / QR Token or Enter Ticket Reference:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      required
                      placeholder="e.g. TCK-918293 or QR-TOKEN-..."
                      value={ticketInputCode}
                      onChange={(e) => setTicketInputCode(e.target.value)}
                      className="flex-1 p-3.5 rounded-2xl border-2 border-brand-terracotta/40 bg-brand-sand-light/20 text-sm font-mono font-bold text-brand-brown focus:border-brand-terracotta focus:outline-hidden tracking-wider"
                    />
                    <button
                      type="submit"
                      disabled={checkinLoading}
                      className="px-6 py-3.5 rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      {checkinLoading ? "Verifying..." : "Validate"}
                    </button>
                  </div>
                </div>
              </form>

              {/* Instant Verification Feedback Card */}
              {checkinResult && (
                <div
                  className={`p-6 rounded-3xl border-2 transition-all space-y-3 ${
                    checkinResult.result === "success"
                      ? "bg-emerald-50/90 border-emerald-500 text-emerald-950"
                      : checkinResult.result === "already_used"
                      ? "bg-rose-50/90 border-rose-500 text-rose-950"
                      : checkinResult.result === "wrong_event"
                      ? "bg-amber-50/90 border-amber-500 text-amber-950"
                      : "bg-red-50/90 border-red-500 text-red-950"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">
                      {checkinResult.result === "success" ? "✅" : checkinResult.result === "already_used" ? "🚨" : "⛔"}
                    </span>
                    <div>
                      <h4 className="font-serif text-lg font-bold tracking-tight">
                        {checkinResult.result === "success"
                          ? "ENTRY APPROVED — WELCOME!"
                          : checkinResult.result === "already_used"
                          ? "DOUBLE ENTRY ALERT — ALREADY USED"
                          : checkinResult.result === "wrong_event"
                          ? "WRONG EVENT TICKET"
                          : "ENTRY REJECTED"}
                      </h4>
                      <p className="text-xs font-medium mt-0.5">{checkinResult.message}</p>
                    </div>
                  </div>

                  {checkinResult.ticket && (
                    <div className="pt-3 border-t border-current/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="block opacity-75 text-[10px] uppercase font-bold">Ticket Number</span>
                        <span className="font-mono font-bold">{checkinResult.ticket.ticket_number}</span>
                      </div>
                      <div>
                        <span className="block opacity-75 text-[10px] uppercase font-bold">Customer Name</span>
                        <span className="font-bold">{checkinResult.ticket.customer_name}</span>
                      </div>
                      <div>
                        <span className="block opacity-75 text-[10px] uppercase font-bold">Ticket Tier</span>
                        <span className="font-bold">{checkinResult.ticket.ticket_tier || "General"}</span>
                      </div>
                      <div>
                        <span className="block opacity-75 text-[10px] uppercase font-bold">Phone Number</span>
                        <span className="font-mono">{checkinResult.ticket.customer_phone || "—"}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Fast Manual Search */}
              <div className="pt-4 border-t border-brand-sand-light space-y-3">
                <h4 className="font-bold text-brand-brown text-xs uppercase tracking-wider">
                  Manual Attendee Search (By Name / Phone)
                </h4>
                <input
                  type="text"
                  placeholder="Search guest name or mobile number..."
                  value={quickSearchQuery}
                  onChange={(e) => handleQuickSearch(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/40 text-xs text-brand-brown outline-hidden"
                />

                {searchResults.length > 0 && (
                  <div className="divide-y divide-brand-sand-light border border-brand-border rounded-2xl overflow-hidden max-h-52 overflow-y-auto">
                    {searchResults.map((t) => (
                      <div key={t.id} className="p-3 bg-white flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-brand-brown block">
                            {t.customer ? `${t.customer.first_name} ${t.customer.last_name}` : "Guest"}
                          </span>
                          <span className="font-mono text-[11px] text-brand-brown-muted">
                            {t.ticket_number} • {t.ticket_type?.name_en || "General"}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setTicketInputCode(t.ticket_number);
                            setSearchResults([]);
                          }}
                          className="px-3 py-1 rounded-lg bg-brand-terracotta text-white font-bold text-[11px] cursor-pointer"
                        >
                          Select & Scan
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Rail: Gate Stream */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-brand-border p-6 space-y-4 shadow-sm text-xs">
              <h3 className="font-serif text-base font-bold text-brand-brown">Recent Gate Check-ins</h3>
              {dashboard?.recent_checkins && dashboard.recent_checkins.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.recent_checkins.map((item, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-brand-sand-light/40 border border-brand-border/60 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-brand-brown block">
                          {item.customer ? `${item.customer.first_name} ${item.customer.last_name}` : "Guest"}
                        </span>
                        <span className="text-[10px] text-brand-brown-muted block">
                          {item.ticket_type?.name_en || "General"} • {item.event?.title_en || "Event"}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-brand-brown-muted font-light text-center py-4">No check-ins recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* VIEW: EVENTS CATALOG */
        <>
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs flex flex-wrap gap-3 items-center justify-between">
            <div className="flex-1 flex flex-wrap gap-3 items-center min-w-[240px]">
              <input
                type="text"
                placeholder={isAr ? "بحث في الفعاليات..." : "Search events by title or organizer..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 px-3.5 py-2 rounded-xl bg-brand-sand-light/50 border border-brand-border text-xs text-brand-brown focus:outline-hidden focus:border-brand-terracotta"
              />

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-brand-sand-light/50 border border-brand-border text-xs text-brand-brown focus:outline-hidden focus:border-brand-terracotta cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Party">Party & Nightlife</option>
                <option value="Festival">Festival & Gala</option>
                <option value="Concert">Concert</option>
                <option value="Wedding">Wedding</option>
                <option value="Corporate">Corporate</option>
                <option value="Sports">Sports</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-brand-sand-light/50 border border-brand-border text-xs text-brand-brown focus:outline-hidden focus:border-brand-terracotta cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <LoadingState message="Loading events schedule..." rows={6} />
          ) : events.length === 0 ? (
            <EmptyState
              icon="🎟️"
              title="No Events Found"
              description="No events match your criteria. Create your first scheduled event to start issuing tickets."
              actionText="Create Event"
              onAction={handleOpenCreate}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-48 w-full bg-brand-sand-light">
                      <Image
                        src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80"
                        alt={event.title_en}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 start-3 flex gap-2">
                        {getStatusBadge(event.status)}
                        <span className="px-2 py-0.5 rounded-lg bg-black/60 text-white text-[10px] font-mono tracking-wider backdrop-blur-xs">
                          {event.category}
                        </span>
                      </div>
                      <div className="absolute bottom-3 end-3 px-2.5 py-1 rounded-xl bg-white/95 text-brand-brown text-xs font-bold backdrop-blur-xs shadow-xs">
                        📅 {event.event_date}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-brand-brown-muted">
                        <span>🏛️ {event.venue?.name_en || event.venue_name || "Abu Tig Marina Deck"}</span>
                        <span>⏰ {event.start_time?.substring(0, 5)} - {event.end_time?.substring(0, 5) || "Late"}</span>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-brand-brown group-hover:text-brand-terracotta transition-colors line-clamp-1">
                        {isAr && event.title_ar ? event.title_ar : event.title_en}
                      </h3>
                      <p className="text-xs text-brand-brown-muted line-clamp-2">
                        {isAr && event.short_description_ar ? event.short_description_ar : event.short_description_en}
                      </p>

                      {/* Ticket Progress */}
                      <div className="space-y-1.5 pt-3 border-t border-brand-sand-light text-xs">
                        <div className="flex justify-between font-bold text-brand-brown text-[11px]">
                          <span>Ticket Tiers: {event.ticket_types_count || event.ticket_types?.length || 0}</span>
                          <span className="font-mono text-brand-terracotta">
                            {event.tickets_count || 0} Sold
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-5 pt-0 flex justify-between items-center border-t border-brand-sand-light mt-4 pt-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="px-3 py-1.5 rounded-xl bg-brand-sand-light hover:bg-brand-sand text-brand-brown text-xs font-bold transition"
                      >
                        Manage & Orders
                      </Link>
                      <button
                        onClick={() => handleOpenEdit(event)}
                        className="px-2.5 py-1.5 rounded-xl bg-brand-sand-light hover:bg-brand-sand text-brand-brown text-xs font-medium cursor-pointer"
                        title="Edit Event"
                      >
                        ✎
                      </button>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleToggleStatus(event.id)}
                        className="p-1.5 rounded-lg text-xs hover:bg-brand-sand text-brand-brown cursor-pointer"
                        title="Toggle Status"
                      >
                        {event.status === "published" ? "⏸" : "▶"}
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-1.5 rounded-lg text-xs hover:bg-rose-50 text-rose-600 cursor-pointer"
                        title="Delete"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* CREATE / EDIT EVENT MODAL */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl border border-brand-border shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto gounow-scrollbar text-xs">
            <div className="flex justify-between items-center border-b border-brand-border/60 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-terracotta font-bold">
                  {editingEvent ? "EDIT EVENT" : "NEW EVENT DISPATCH"}
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-brown">
                  {editingEvent ? "Edit Event Details" : "Schedule New Event & Ticketing"}
                </h2>
              </div>
              <button onClick={() => setEventModalOpen(false)} className="text-brand-brown font-bold text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEvent} className="space-y-5">
              {/* Basic Event Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Event Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={eventForm.title_en}
                    onChange={(e) => setEventForm({ ...eventForm, title_en: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-brown mb-1">عنوان الفعالية (عربي)</label>
                  <input
                    type="text"
                    value={eventForm.title_ar}
                    onChange={(e) => setEventForm({ ...eventForm, title_ar: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden text-right"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Category *</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                  >
                    <option value="Party">Party & Nightlife</option>
                    <option value="Festival">Festival & Gala</option>
                    <option value="Concert">Concert</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Birthday">Birthday / Celebration</option>
                    <option value="Corporate">Corporate Summit</option>
                    <option value="Sports">Sports Regatta</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Select Venue *</label>
                  <select
                    value={eventForm.venue_id}
                    onChange={(e) => setEventForm({ ...eventForm, venue_id: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                  >
                    {taxonomies?.venues?.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name_en} ({v.venue_type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Schedule and Timings */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={eventForm.event_date}
                    onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={eventForm.start_time}
                    onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-brown mb-1">End Time</label>
                  <input
                    type="time"
                    value={eventForm.end_time}
                    onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Doors Open</label>
                  <input
                    type="time"
                    value={eventForm.doors_open_time}
                    onChange={(e) => setEventForm({ ...eventForm, doors_open_time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                  />
                </div>
              </div>

              {/* Extra info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Age Restriction</label>
                  <input
                    type="text"
                    value={eventForm.age_restriction}
                    onChange={(e) => setEventForm({ ...eventForm, age_restriction: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Dress Code</label>
                  <input
                    type="text"
                    value={eventForm.dress_code}
                    onChange={(e) => setEventForm({ ...eventForm, dress_code: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Status *</label>
                  <select
                    value={eventForm.status}
                    onChange={(e) => setEventForm({ ...eventForm, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Initial Ticket Tier (Only on Create) */}
              {!editingEvent && (
                <div className="p-4 rounded-2xl bg-brand-sand-light/40 border border-brand-border/60 space-y-3">
                  <h4 className="font-bold text-brand-brown text-xs uppercase tracking-wider">
                    Initial Ticket Tier Setup
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-brand-brown mb-1">Tier Name *</label>
                      <input
                        type="text"
                        value={eventForm.ticket_name_en}
                        onChange={(e) => setEventForm({ ...eventForm, ticket_name_en: e.target.value })}
                        className="w-full p-2 rounded-xl border border-brand-border bg-white outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-brand-brown mb-1">Price (EGP) *</label>
                      <input
                        type="number"
                        value={eventForm.ticket_price}
                        onChange={(e) => setEventForm({ ...eventForm, ticket_price: e.target.value })}
                        className="w-full p-2 rounded-xl border border-brand-border bg-white outline-hidden font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-brand-brown mb-1">Capacity *</label>
                      <input
                        type="number"
                        value={eventForm.ticket_capacity}
                        onChange={(e) => setEventForm({ ...eventForm, ticket_capacity: e.target.value })}
                        className="w-full p-2 rounded-xl border border-brand-border bg-white outline-hidden font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-brand-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-brand-brown font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white font-bold transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
