"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getEventById,
  getEventTickets,
  createEventTicketType,
  deleteEventTicketType,
  getEventOrders,
  cancelEventOrder,
  refundEventOrder,
  performEventCheckIn,
  searchEventTicketsForCheckin,
  toggleAdminEventStatus,
  AdminEventItem,
  CheckInResult,
} from "@/features/events/services/events.api";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default function EventDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const eventId = Number(resolvedParams.id);
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [event, setEvent] = useState<AdminEventItem | null>(null);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "tickets" | "orders" | "schedule" | "checkin">("overview");

  // Modals & Forms
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [tierForm, setTierForm] = useState({
    name_en: "VIP Backstage Deck",
    name_ar: "منصة كبار الشخصيات خلف الكواليس",
    price: 3500,
    capacity: 50,
    max_per_order: 2,
    description_en: "Exclusive high table seating with dedicated bottle service and stage view.",
  });

  // Check-In Station State
  const [ticketInputCode, setTicketInputCode] = useState("");
  const [checkinResult, setCheckinResult] = useState<CheckInResult | null>(null);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const loadAll = React.useCallback(async () => {
    try {
      setLoading(true);
      const [evtRes, ticketsRes, ordersRes] = await Promise.all([
        getEventById(eventId),
        getEventTickets(eventId),
        getEventOrders(eventId),
      ]);

      if (evtRes) setEvent(evtRes);
      if (ticketsRes) setTicketTypes(ticketsRes);
      if (ordersRes && ordersRes.data) setOrders(ordersRes.data);
    } catch (err: any) {
      console.error("Failed to load event details:", err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleToggleStatus = async () => {
    if (!event) return;
    try {
      await toggleAdminEventStatus(event.id);
      loadAll();
    } catch (err: any) {
      alert(err.message || "Failed to toggle status");
    }
  };

  const handleCreateTicketType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    try {
      await createEventTicketType(event.id, {
        name_en: tierForm.name_en,
        name_ar: tierForm.name_ar,
        price: Number(tierForm.price),
        capacity: Number(tierForm.capacity),
        max_per_order: Number(tierForm.max_per_order),
        description_en: tierForm.description_en,
      });
      setTierModalOpen(false);
      loadAll();
      alert("Ticket tier created.");
    } catch (err: any) {
      alert(err.message || "Failed to create ticket tier.");
    }
  };

  const handleDeleteTicketType = async (tierId: number) => {
    if (!event) return;
    if (!confirm("Delete this ticket tier?")) return;
    try {
      await deleteEventTicketType(event.id, tierId);
      loadAll();
    } catch (err: any) {
      alert(err.message || "Failed to delete ticket tier.");
    }
  };

  const handleRefundOrder = async (orderId: number) => {
    if (!event) return;
    if (!confirm("Are you sure you want to refund this order and invalidate its tickets?")) return;
    try {
      await refundEventOrder(event.id, orderId);
      loadAll();
      alert("Order refunded and tickets marked as refunded.");
    } catch (err: any) {
      alert(err.message || "Refund failed.");
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!event) return;
    if (!confirm("Cancel this order?")) return;
    try {
      await cancelEventOrder(event.id, orderId);
      loadAll();
    } catch (err: any) {
      alert(err.message || "Cancellation failed.");
    }
  };

  // Live Check-in Scanner
  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !ticketInputCode.trim()) return;
    try {
      setCheckinLoading(true);
      setCheckinResult(null);
      const res = await performEventCheckIn(event.id, ticketInputCode.trim());
      setCheckinResult(res);
      setTicketInputCode("");
      loadAll();
    } catch (err: any) {
      setCheckinResult({
        success: false,
        result: err.result || "invalid",
        message: err.message || "Verification failed.",
      });
    } finally {
      setCheckinLoading(false);
    }
  };

  const handleSearchTickets = async (val: string) => {
    setSearchQuery(val);
    if (!event || val.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await searchEventTicketsForCheckin(event.id, val);
      setSearchResults(res);
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingState message="Loading event and ticketing manifest..." rows={8} />;
  }

  if (!event) {
    return (
      <EmptyState
        icon="🎟️"
        title="Event Not Found"
        description="This event does not exist or has been cancelled."
        actionText="Back to Events"
        actionHref="/admin/events"
      />
    );
  }

  const totalCapacity = ticketTypes.reduce((acc, t) => acc + (t.capacity || 0), 0);
  const totalSold = ticketTypes.reduce((acc, t) => acc + (t.sold_count || 0), 0);
  const totalRevenue = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((acc, o) => acc + (o.total_cents || 0), 0) / 100;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-brand-brown-muted mb-1">
            <Link href="/admin/events" className="hover:text-brand-terracotta transition">
              ← {isAr ? "العودة للفعاليات" : "Back to Events List"}
            </Link>
            <span>/</span>
            <span className="font-mono text-brand-terracotta">{event.category}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown">
              {isAr && event.title_ar ? event.title_ar : event.title_en}
            </h1>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                event.status === "published"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : event.status === "completed"
                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                  : "bg-rose-100 text-rose-800 border border-rose-200"
              }`}
            >
              {event.status.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-brand-brown-muted mt-1">
            📅 {event.event_date} • ⏰ {event.start_time?.substring(0, 5)} - {event.end_time?.substring(0, 5) || "Late"} • 🏛️{" "}
            {event.venue?.name_en || event.venue_name || "Abu Tig Marina Deck"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleStatus}
            className="px-4 py-2 rounded-xl border border-brand-border bg-white hover:bg-brand-sand-light text-brand-brown text-xs font-bold transition cursor-pointer"
          >
            {event.status === "published" ? "⏸ Unpublish Event" : "▶ Publish Event"}
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-brand-brown-muted font-bold block mb-1">
            Total Capacity
          </span>
          <span className="text-2xl font-serif font-bold text-brand-brown">{totalCapacity || "Flexible"}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold block mb-1">
            Tickets Sold
          </span>
          <span className="text-2xl font-serif font-bold text-emerald-700">{totalSold}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-blue-600 font-bold block mb-1">
            Orders Processed
          </span>
          <span className="text-2xl font-serif font-bold text-blue-700">{orders.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-brand-terracotta font-bold block mb-1">
            Gross Ticket Sales
          </span>
          <span className="text-xl font-serif font-bold text-brand-terracotta">
            {totalRevenue.toLocaleString()} EGP
          </span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-brand-border flex gap-3 sm:gap-6 overflow-x-auto text-xs font-bold">
        {[
          { id: "overview", label: "Overview & Venue" },
          { id: "tickets", label: `Ticket Types (${ticketTypes.length})` },
          { id: "orders", label: `Orders & Attendees (${orders.length})` },
          { id: "schedule", label: `Timeline (${event.schedules?.length || 0})` },
          { id: "checkin", label: "Gate Check-In Station" },
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
              <h3 className="font-serif text-lg font-bold text-brand-brown">Event Synopsis</h3>
              <p className="text-xs text-brand-brown leading-relaxed">
                {isAr && event.description_ar ? event.description_ar : event.description_en}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-brand-sand-light text-xs">
                <div>
                  <span className="text-brand-brown-muted block text-[10px] uppercase font-bold">Organizer</span>
                  <span className="font-bold text-brand-brown">{event.organizer || "GouNow Dispatch"}</span>
                </div>
                <div>
                  <span className="text-brand-brown-muted block text-[10px] uppercase font-bold">Age Restriction</span>
                  <span className="font-bold text-brand-brown">{event.age_restriction || "None"}</span>
                </div>
                <div>
                  <span className="text-brand-brown-muted block text-[10px] uppercase font-bold">Dress Code</span>
                  <span className="font-bold text-brand-brown">{event.dress_code || "Smart Casual"}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-brand-border p-6 space-y-3 shadow-xs text-xs">
              <h3 className="font-serif text-base font-bold text-brand-brown">Gate Guidelines & Entry Regulations</h3>
              <p className="text-brand-brown-muted leading-relaxed">
                {event.rules_en || "Strict door selection. Tickets must be presented with matching photo identification."}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-brand-border p-6 space-y-4 shadow-xs text-xs">
              <h3 className="font-serif text-base font-bold text-brand-brown">Venue Information</h3>
              <div className="space-y-2">
                <span className="font-bold text-brand-brown text-sm block">
                  {event.venue?.name_en || event.venue_name || "Abu Tig Marina Deck"}
                </span>
                <span className="text-brand-brown-muted block">
                  📍 {event.venue?.address || event.venue_address || "Abu Tig Marina North, El Gouna"}
                </span>
                <div className="pt-2 border-t border-brand-sand-light">
                  <span className="text-brand-brown-muted block text-[10px] uppercase font-bold">Doors Opening:</span>
                  <span className="font-bold text-brand-brown">{event.doors_open_time ? event.doors_open_time.substring(0, 5) : "19:00"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TICKETS TAB */}
      {activeTab === "tickets" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-brown">Ticket Tiers & Inventory</h3>
              <p className="text-xs text-brand-brown-muted">Manage pricing tiers, capacity, and sales windows.</p>
            </div>
            <button
              onClick={() => setTierModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              + Create Ticket Tier
            </button>
          </div>

          {ticketTypes.length === 0 ? (
            <EmptyState
              icon="🎟️"
              title="No Ticket Tiers Configured"
              description="Add ticket categories (Early Bird, Regular, VIP) to begin sales."
              actionText="Add Ticket Tier"
              onAction={() => setTierModalOpen(true)}
            />
          ) : (
            <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-xs">
              <table className="w-full text-start text-xs">
                <thead className="bg-brand-sand-light text-[10px] uppercase font-bold tracking-wider text-brand-brown border-b border-brand-border">
                  <tr>
                    <th className="p-4 text-start">Tier Name</th>
                    <th className="p-4 text-start">Price</th>
                    <th className="p-4 text-start">Capacity</th>
                    <th className="p-4 text-start">Sold</th>
                    <th className="p-4 text-start">Remaining</th>
                    <th className="p-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-sand-light">
                  {ticketTypes.map((tier) => (
                    <tr key={tier.id} className="hover:bg-brand-sand/20">
                      <td className="p-4 font-bold text-brand-brown">{tier.name_en}</td>
                      <td className="p-4 font-mono font-bold text-brand-terracotta">
                        {(tier.price_cents / 100).toLocaleString()} {tier.currency || "EGP"}
                      </td>
                      <td className="p-4 text-brand-brown">{tier.capacity || "Unlimited"}</td>
                      <td className="p-4 font-bold text-emerald-700">{tier.sold_count || 0}</td>
                      <td className="p-4 font-bold text-blue-700">{tier.available || (tier.capacity - (tier.sold_count || 0))}</td>
                      <td className="p-4 text-end">
                        <button
                          onClick={() => handleDeleteTicketType(tier.id)}
                          className="text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. ORDERS TAB */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-brand-brown">Ticket Orders & Attendees</h3>
          {orders.length === 0 ? (
            <EmptyState
              icon="💳"
              title="No Orders Yet"
              description="No tickets have been purchased for this event yet."
            />
          ) : (
            <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="bg-brand-sand-light text-[10px] uppercase font-bold tracking-wider text-brand-brown border-b border-brand-border">
                    <tr>
                      <th className="p-4 text-start">Order #</th>
                      <th className="p-4 text-start">Attendee</th>
                      <th className="p-4 text-start">Tickets</th>
                      <th className="p-4 text-start">Total Amount</th>
                      <th className="p-4 text-start">Payment</th>
                      <th className="p-4 text-start">Order Status</th>
                      <th className="p-4 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-sand-light">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-brand-sand/20">
                        <td className="p-4 font-mono font-bold text-brand-terracotta">{o.order_number}</td>
                        <td className="p-4 text-brand-brown">
                          <span className="font-bold block">
                            {o.customer ? `${o.customer.first_name} ${o.customer.last_name}` : "Guest"}
                          </span>
                          <span className="text-[11px] text-brand-brown-muted">{o.customer?.email}</span>
                        </td>
                        <td className="p-4 font-bold text-brand-brown">
                          {o.tickets?.length || 1} Tickets
                        </td>
                        <td className="p-4 font-mono font-bold text-brand-brown">
                          {(o.total_cents / 100).toLocaleString()} {o.currency || "EGP"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              o.payment_status === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : o.payment_status === "refunded"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {o.payment_status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              o.status === "paid" || o.status === "completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : o.status === "refunded"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {o.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-end">
                          <div className="flex justify-end gap-1.5">
                            {o.status !== "refunded" && (
                              <button
                                onClick={() => handleRefundOrder(o.id)}
                                className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold cursor-pointer"
                              >
                                Refund
                              </button>
                            )}
                            {o.status !== "cancelled" && o.status !== "refunded" && (
                              <button
                                onClick={() => handleCancelOrder(o.id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. SCHEDULE TAB */}
      {activeTab === "schedule" && (
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-brand-brown">Event Timeline & Lineup</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-white border border-brand-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-brand-terracotta">
                  {event.doors_open_time ? event.doors_open_time.substring(0, 5) : "19:00"}
                </span>
                <span className="font-bold text-brand-brown">Doors Open & Welcome Lounge</span>
              </div>
              <span className="text-brand-brown-muted">Gate Staff & Security</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-brand-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-brand-terracotta">
                  {event.start_time ? event.start_time.substring(0, 5) : "21:00"}
                </span>
                <span className="font-bold text-brand-brown">Main Headliner Performance</span>
              </div>
              <span className="text-brand-brown-muted">DJ & Visuals Show</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-brand-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-brand-terracotta">
                  {event.end_time ? event.end_time.substring(0, 5) : "03:00"}
                </span>
                <span className="font-bold text-brand-brown">Event Conclusion</span>
              </div>
              <span className="text-brand-brown-muted">Closing Sets</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. CHECK-IN TAB */}
      {activeTab === "checkin" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-brand-border p-6 sm:p-8 space-y-6 shadow-xs text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 font-bold">
                GATE VALIDATOR FOR: {event.title_en}
              </span>
              <h3 className="font-serif text-xl font-bold text-brand-brown">Scan or Enter Ticket Code</h3>
            </div>

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="Ticket Number or QR Token..."
                  value={ticketInputCode}
                  onChange={(e) => setTicketInputCode(e.target.value)}
                  className="flex-1 p-3.5 rounded-2xl border-2 border-brand-terracotta/40 bg-brand-sand-light/20 text-sm font-mono font-bold text-brand-brown focus:border-brand-terracotta focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={checkinLoading}
                  className="px-6 py-3.5 rounded-2xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white font-bold uppercase cursor-pointer"
                >
                  {checkinLoading ? "Checking..." : "Verify Gate"}
                </button>
              </div>
            </form>

            {checkinResult && (
              <div
                className={`p-6 rounded-3xl border-2 space-y-3 ${
                  checkinResult.result === "success"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-950"
                    : checkinResult.result === "already_used"
                    ? "bg-rose-50 border-rose-500 text-rose-950"
                    : checkinResult.result === "wrong_event"
                    ? "bg-amber-50 border-amber-500 text-amber-950"
                    : "bg-red-50 border-red-500 text-red-950"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {checkinResult.result === "success" ? "✅" : checkinResult.result === "already_used" ? "🚨" : "⛔"}
                  </span>
                  <div>
                    <h4 className="font-serif text-lg font-bold">
                      {checkinResult.result === "success"
                        ? "ENTRY PERMITTED"
                        : checkinResult.result === "already_used"
                        ? "DOUBLE CHECK-IN PREVENTED"
                        : "REJECTED"}
                    </h4>
                    <p className="text-xs">{checkinResult.message}</p>
                  </div>
                </div>

                {checkinResult.ticket && (
                  <div className="pt-3 border-t border-current/20 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="opacity-75 block text-[10px]">Attendee:</span>
                      <span className="font-bold">{checkinResult.ticket.customer_name}</span>
                    </div>
                    <div>
                      <span className="opacity-75 block text-[10px]">Tier:</span>
                      <span className="font-bold">{checkinResult.ticket.ticket_tier}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Attendee Search */}
            <div className="pt-4 border-t border-brand-sand-light space-y-3">
              <h4 className="font-bold text-brand-brown text-xs uppercase tracking-wider">
                Fast Manual Lookup for this Event
              </h4>
              <input
                type="text"
                placeholder="Search attendee by name or phone..."
                value={searchQuery}
                onChange={(e) => handleSearchTickets(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/40 text-xs outline-hidden"
              />

              {searchResults.length > 0 && (
                <div className="divide-y divide-brand-sand-light border border-brand-border rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
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
      )}

      {/* CREATE TICKET TIER MODAL */}
      {tierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-brand-border shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="font-serif text-lg font-bold text-brand-brown">Create Ticket Tier</h3>
            <form onSubmit={handleCreateTicketType} className="space-y-4">
              <div>
                <label className="block font-bold text-brand-brown mb-1">Tier Name (English) *</label>
                <input
                  type="text"
                  required
                  value={tierForm.name_en}
                  onChange={(e) => setTierForm({ ...tierForm, name_en: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Price (EGP) *</label>
                  <input
                    type="number"
                    required
                    value={tierForm.price}
                    onChange={(e) => setTierForm({ ...tierForm, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-brown mb-1">Capacity *</label>
                  <input
                    type="number"
                    required
                    value={tierForm.capacity}
                    onChange={(e) => setTierForm({ ...tierForm, capacity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-brand-brown mb-1">Max per Order</label>
                <input
                  type="number"
                  value={tierForm.max_per_order}
                  onChange={(e) => setTierForm({ ...tierForm, max_per_order: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/30 outline-hidden font-mono"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTierModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-brand-brown font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white font-bold"
                >
                  Save Tier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
