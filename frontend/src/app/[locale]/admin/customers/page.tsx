"use client";

import React, { useState } from "react";

export type ClientTag = "First Time" | "New Client" | "VIP" | "VVIP";

export interface StayRecord {
  id: string;
  reference: string;
  property: string;
  dates: string;
  amountEgp: number;
  status: "Completed" | "Upcoming" | "Cancelled";
}

export interface ClientProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  tag: ClientTag;
  totalBookings: number;
  lifetimeSpendEgp: number;
  memberSince: string;
  lastActive: string;
  notes: string;
  history: StayRecord[];
}

export default function AdminCustomersPage() {
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"clients" | "leads">("clients");
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);

  const [clients, setClients] = useState<ClientProfile[]>([
    {
      id: 1,
      name: "Lord Henry Cavendish",
      email: "h.cavendish@mayfair-estates.co.uk",
      phone: "+44 20 7946 0912",
      nationality: "British",
      tag: "VVIP",
      totalBookings: 8,
      lifetimeSpendEgp: 485000,
      memberSince: "Nov 2024",
      lastActive: "Today, 11:30 AM",
      notes: "High-profile guest. Prefers private boat transfers, high security, and lagoon waterfront villas with private mooring. Always requests daily butler service.",
      history: [
        {
          id: "1",
          reference: "GON-2026-992140",
          property: "Fanadir Bay Waterfront Villa",
          dates: "Sep 15 - Sep 22, 2026 (7 nights)",
          amountEgp: 145000,
          status: "Completed",
        },
        {
          id: "2",
          reference: "GON-2026-641770",
          property: "West Golf Sunset Lagoon Villa",
          dates: "Nov 18 - Nov 23, 2026 (5 nights)",
          amountEgp: 120000,
          status: "Upcoming",
        },
        {
          id: "3",
          reference: "GON-2025-102941",
          property: "Abu Tig Marina Penthouse",
          dates: "Dec 20 - Dec 28, 2025 (8 nights)",
          amountEgp: 220000,
          status: "Completed",
        },
      ],
    },
    {
      id: 2,
      name: "Tarek Khalil",
      email: "tarek.khalil@investments.eg",
      phone: "+201011223344",
      nationality: "Egyptian",
      tag: "VIP",
      totalBookings: 4,
      lifetimeSpendEgp: 215000,
      memberSince: "Mar 2025",
      lastActive: "Yesterday",
      notes: "Investor evaluating Gouna real estate. Looking for beachfront acquisition while renting luxury units during negotiation periods.",
      history: [
        {
          id: "4",
          reference: "GON-2026-552910",
          property: "West Golf Sunset Lagoon Villa",
          dates: "Aug 02 - Aug 06, 2026 (4 nights)",
          amountEgp: 58000,
          status: "Completed",
        },
        {
          id: "5",
          reference: "GON-2025-441029",
          property: "Mangroovy Beachfront Luxury Chalet",
          dates: "May 10 - May 14, 2025 (4 nights)",
          amountEgp: 62000,
          status: "Completed",
        },
      ],
    },
    {
      id: 3,
      name: "Dr. Marianne Weber",
      email: "m.weber@munich-health.de",
      phone: "+49 170 555 4321",
      nationality: "German",
      tag: "New Client",
      totalBookings: 1,
      lifetimeSpendEgp: 38000,
      memberSince: "Sep 2026",
      lastActive: "2 days ago",
      notes: "First completed booking in Mangroovy. Inquired about kitesurfing instruction packages for winter season.",
      history: [
        {
          id: "6",
          reference: "GON-2026-302194",
          property: "Mangroovy Beachfront Luxury Chalet",
          dates: "Sep 01 - Sep 05, 2026 (4 nights)",
          amountEgp: 38000,
          status: "Completed",
        },
      ],
    },
    {
      id: 4,
      name: "Elena Rostova",
      email: "elena.rostova@design-studio.at",
      phone: "+201000000000",
      nationality: "Austrian",
      tag: "First Time",
      totalBookings: 1,
      lifetimeSpendEgp: 18810,
      memberSince: "Oct 2026",
      lastActive: "1 hour ago",
      notes: "Submitted first reservation request through web quote widget. Needs payment verification assistance.",
      history: [
        {
          id: "7",
          reference: "GON-2026-936084",
          property: "Mangroovy Beachfront Luxury Chalet",
          dates: "Oct 14 - Oct 17, 2026 (3 nights)",
          amountEgp: 18810,
          status: "Upcoming",
        },
      ],
    },
  ]);

  const leads = [
    {
      id: 1,
      name: "Tarek Khalil",
      phone: "+201011223344",
      email: "tarek.khalil@investments.eg",
      interest: "Real Estate Purchase (Fanadir Bay Waterfront Villa)",
      source: "Property Sale Lead Form",
      date: "Today, 10:14 AM",
      notes: "Interested in cash buyout or 2-year payment plan. Requires layout blueprint.",
      status: "Hot Lead",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 2,
      name: "Dr. Marianne Weber",
      phone: "+49 170 555 4321",
      email: "m.weber@munich-health.de",
      interest: "Vacation Rental (Mangroovy Beachfront Chalet)",
      source: "Website Booking Quote Widget",
      date: "Yesterday, 04:30 PM",
      notes: "Requested 10 days in November with daily housekeeping and yacht charter.",
      status: "Negotiating",
      statusColor: "bg-amber-100 text-amber-800",
    },
    {
      id: 3,
      name: "Omar Al-Fassi",
      phone: "+971 50 123 9876",
      email: "omar.alfassi@dubaiholding.ae",
      interest: "Private Yacht Charter to Tawila Island",
      source: "WhatsApp VIP Concierge",
      date: "Sep 28, 2026",
      notes: "Birthday party for 10 guests. Requested sunset cruise with private sushi chef.",
      status: "Confirmed",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
  ];

  const getTagBadge = (tag: ClientTag) => {
    switch (tag) {
      case "VVIP":
        return "bg-purple-100 text-purple-900 border border-purple-300 font-extrabold";
      case "VIP":
        return "bg-amber-100 text-amber-900 border border-amber-300 font-bold";
      case "New Client":
        return "bg-emerald-100 text-emerald-900 border border-emerald-300 font-medium";
      case "First Time":
        return "bg-sky-100 text-sky-900 border border-sky-300 font-medium";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleUpdateTag = (clientId: number, newTag: ClientTag) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, tag: newTag } : c))
    );
    if (selectedClient && selectedClient.id === clientId) {
      setSelectedClient({ ...selectedClient, tag: newTag });
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesTag = selectedTag === "All" || c.tag === selectedTag;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    return matchesTag && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-terracotta">
              VIP Client Relationship Management
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-brand-brown">
            Customers &amp; Client History
          </h1>
          <p className="text-xs text-brand-brown-muted mt-1">
            Track repeat guest history, lifetime value, VIP statuses (First Time, New Client, VIP, VVIP) and concierge inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/201000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <span>💬</span>
            <span>Open WhatsApp CRM</span>
          </a>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-brand-border gap-4 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("clients")}
          className={`pb-3 px-1 border-b-2 transition ${
            activeTab === "clients"
              ? "border-brand-terracotta text-brand-terracotta"
              : "border-transparent text-brand-brown-muted hover:text-brand-brown"
          }`}
        >
          Client Directory &amp; History ({clients.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("leads")}
          className={`pb-3 px-1 border-b-2 transition ${
            activeTab === "leads"
              ? "border-brand-terracotta text-brand-terracotta"
              : "border-transparent text-brand-brown-muted hover:text-brand-brown"
          }`}
        >
          Live Inquiries &amp; Leads ({leads.length})
        </button>
      </div>

      {activeTab === "clients" ? (
        <div className="space-y-4">
          {/* Filter Bar & Tag Selector */}
          <div className="bg-white p-4 rounded-2xl border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tag Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-brand-brown-muted uppercase mr-1">
                Filter by Tag:
              </span>
              {(["All", "VVIP", "VIP", "New Client", "First Time"] as const).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedTag === tag
                      ? "bg-brand-brown text-white shadow-xs"
                      : "bg-brand-sand-light text-brand-brown hover:bg-brand-sand/60"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="w-full md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search client by name, email, phone..."
                className="w-full text-xs p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/40 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
              />
            </div>
          </div>

          {/* Clients Table */}
          <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
            <div className="overflow-x-auto gounow-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-semibold border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-4">Client Name &amp; Origin</th>
                    <th className="py-3 px-4">Client Tag</th>
                    <th className="py-3 px-4">Stays Count</th>
                    <th className="py-3 px-4">Lifetime Spend</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-brand-sand-light/30 transition cursor-pointer"
                      onClick={() => setSelectedClient(client)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brand-brown">{client.name}</div>
                        <div className="text-[11px] text-brand-brown-muted">
                          {client.email} &bull; {client.phone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[10px] ${getTagBadge(
                            client.tag
                          )}`}
                        >
                          ★ {client.tag}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-brand-brown">
                        {client.totalBookings} stay{client.totalBookings > 1 ? "s" : ""}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-brand-terracotta">
                        {client.lifetimeSpendEgp.toLocaleString()} EGP
                      </td>

                      <td className="py-3.5 px-4 text-brand-brown-muted text-[11px]">
                        {client.lastActive}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClient(client);
                          }}
                          className="px-3 py-1.5 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-lg font-bold text-[11px] transition"
                        >
                          View History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Leads Table */
        <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto gounow-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-semibold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Interest &amp; Requirements</th>
                  <th className="py-3 px-4">Channel &amp; Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-brand-sand-light/30 transition">
                    <td className="py-3.5 px-4 font-bold text-brand-brown">{lead.name}</td>
                    <td className="py-3.5 px-4 text-brand-brown-muted">
                      <div>{lead.phone}</div>
                      <div className="text-[10px]">{lead.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-brand-brown">{lead.interest}</div>
                      <div className="text-[11px] text-brand-brown-muted">{lead.notes}</div>
                    </td>
                    <td className="py-3.5 px-4 text-brand-brown-muted">
                      <div>{lead.source}</div>
                      <div className="text-[10px]">{lead.date}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${lead.statusColor}`}>
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Client History Modal Drawer */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-brand-border shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto gounow-scrollbar">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-brand-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-serif font-bold text-brand-brown">
                    {selectedClient.name}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] ${getTagBadge(selectedClient.tag)}`}>
                    ★ {selectedClient.tag}
                  </span>
                </div>
                <p className="text-xs text-brand-brown-muted mt-0.5">
                  {selectedClient.email} &bull; {selectedClient.phone} &bull; {selectedClient.nationality}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="text-brand-brown-muted hover:text-brand-brown text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Tag Quick Switcher */}
            <div className="p-4 bg-brand-sand-light/50 rounded-2xl border border-brand-border flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-brand-brown block">Update Client VIP Tier:</span>
                <span className="text-[10px] text-brand-brown-muted">Changes the classification across concierge workflows</span>
              </div>
              <div className="flex gap-1.5">
                {(["First Time", "New Client", "VIP", "VVIP"] as ClientTag[]).map((tagOption) => (
                  <button
                    key={tagOption}
                    type="button"
                    onClick={() => handleUpdateTag(selectedClient.id, tagOption)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                      selectedClient.tag === tagOption
                        ? "bg-brand-brown text-white shadow-xs"
                        : "bg-white text-brand-brown border border-brand-border hover:bg-brand-sand-light"
                    }`}
                  >
                    {tagOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Lifetime Metrics */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-brand-sand-light/30 rounded-xl border border-brand-border">
                <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">Total Stays</span>
                <span className="text-lg font-bold text-brand-brown">{selectedClient.totalBookings}</span>
              </div>
              <div className="p-3 bg-brand-sand-light/30 rounded-xl border border-brand-border">
                <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">Lifetime Spend</span>
                <span className="text-lg font-mono font-bold text-brand-terracotta">
                  {selectedClient.lifetimeSpendEgp.toLocaleString()} EGP
                </span>
              </div>
              <div className="p-3 bg-brand-sand-light/30 rounded-xl border border-brand-border">
                <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">Member Since</span>
                <span className="text-lg font-bold text-brand-brown">{selectedClient.memberSince}</span>
              </div>
            </div>

            {/* Concierge Notes */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-brown-muted">
                Concierge Notes &amp; Preferences
              </h3>
              <p className="text-xs text-brand-brown leading-relaxed p-3.5 bg-brand-sand-light/30 rounded-xl border border-brand-border">
                {selectedClient.notes}
              </p>
            </div>

            {/* Complete Stays & Bookings History */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-brown-muted">
                Complete Stays &amp; Bookings History
              </h3>
              <div className="space-y-2.5">
                {selectedClient.history.map((stay) => (
                  <div
                    key={stay.id}
                    className="p-3.5 rounded-xl border border-brand-border bg-white flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-brand-brown">{stay.property}</div>
                      <div className="text-[11px] text-brand-brown-muted">
                        Ref: <span className="font-mono">{stay.reference}</span> &bull; {stay.dates}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-brand-brown">
                        {stay.amountEgp.toLocaleString()} EGP
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          stay.status === "Completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {stay.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-2 flex justify-between items-center border-t border-brand-border">
              <a
                href={`https://wa.me/${selectedClient.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `Hello ${selectedClient.name}, GouNow VIP Reservations Desk is checking in.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <span>💬</span>
                <span>Direct WhatsApp Contact</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
