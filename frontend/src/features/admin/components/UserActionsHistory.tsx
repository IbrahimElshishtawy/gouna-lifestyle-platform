"use client";

import React, { useState } from "react";

export interface AuditActionItem {
  id: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  timestamp: string;
  relativeTime: string;
  ipAddress: string;
  category: "auth" | "pricing" | "booking" | "crm" | "system";
  status: "success" | "warning" | "info";
}

export default function UserActionsHistory() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const actions: AuditActionItem[] = [
    {
      id: "act-101",
      actor: "admin@gounow.com",
      role: "Super Admin",
      action: "Two-Factor Authentication Confirmed & Session Initialized",
      target: "Admin Security Portal",
      timestamp: "2026-10-05 00:50:12",
      relativeTime: "12 mins ago",
      ipAddress: "197.38.120.44 (Cairo, EG)",
      category: "auth",
      status: "success",
    },
    {
      id: "act-102",
      actor: "admin@gounow.com",
      role: "Super Admin",
      action: "Updated Seasonal Pricing Schedule (High Season 2026/2027)",
      target: "Fanadir Bay Waterfront Villa",
      timestamp: "2026-10-05 00:25:34",
      relativeTime: "37 mins ago",
      ipAddress: "197.38.120.44 (Cairo, EG)",
      category: "pricing",
      status: "info",
    },
    {
      id: "act-103",
      actor: "Elena Rostova",
      role: "New Client",
      action: "Created Booking Reservation Hold via Express Checkout",
      target: "Booking Ref: GON-2026-936084",
      timestamp: "2026-10-04 23:45:10",
      relativeTime: "1 hour ago",
      ipAddress: "89.144.20.11 (Vienna, AT)",
      category: "booking",
      status: "success",
    },
    {
      id: "act-104",
      actor: "concierge@gounow.com",
      role: "VIP Concierge",
      action: "Updated Client Tier Tag to 'VVIP' with Custom Preferences",
      target: "Client: Lord Henry Cavendish",
      timestamp: "2026-10-04 22:30:18",
      relativeTime: "2 hours ago",
      ipAddress: "197.38.120.44 (Cairo, EG)",
      category: "crm",
      status: "success",
    },
    {
      id: "act-105",
      actor: "Tarek Khalil",
      role: "Buyer Lead",
      action: "Submitted Real Estate Acquisition Viewing Request",
      target: "Lead: Fanadir Bay Waterfront Villa",
      timestamp: "2026-10-04 21:14:02",
      relativeTime: "3 hours ago",
      ipAddress: "156.204.18.90 (Alexandria, EG)",
      category: "crm",
      status: "info",
    },
    {
      id: "act-106",
      actor: "system_worker",
      role: "Platform Daemon",
      action: "Exported Real Estate Portal XML Feed (Bayut & Property Finder format)",
      target: "/api/v1/properties/feed.xml",
      timestamp: "2026-10-04 20:00:00",
      relativeTime: "5 hours ago",
      ipAddress: "127.0.0.1 (Localhost)",
      category: "system",
      status: "info",
    },
    {
      id: "act-107",
      actor: "system_cron",
      role: "Inventory Guard",
      action: "Released Expired Unconfirmed Booking Hold to Public Inventory",
      target: "Inventory: Mangroovy Chalet Unit B",
      timestamp: "2026-10-04 18:30:00",
      relativeTime: "6 hours ago",
      ipAddress: "127.0.0.1 (Cron Task)",
      category: "booking",
      status: "warning",
    },
  ];

  const filteredActions = actions.filter((act) => {
    const matchesCategory =
      selectedCategory === "all" || act.category === selectedCategory;
    const matchesSearch =
      act.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.ipAddress.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadge = (cat: AuditActionItem["category"]) => {
    switch (cat) {
      case "auth":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "pricing":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "booking":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "crm":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "system":
        return "bg-sky-100 text-sky-800 border-sky-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden space-y-4 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-terracotta">
              Live Audit Trail
            </span>
          </div>
          <h3 className="text-lg font-serif font-bold text-brand-brown">
            History for All User Actions
          </h3>
          <p className="text-xs text-brand-brown-muted mt-0.5">
            Immutable log of staff sessions, pricing alterations, customer inquiries, and booking transactions.
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, actor, or IP..."
            className="w-full text-xs p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/40 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { id: "all", label: "All Events" },
          { id: "auth", label: "Authentication & 2FA" },
          { id: "booking", label: "Booking Engine" },
          { id: "pricing", label: "Pricing & Calendar" },
          { id: "crm", label: "Client CRM & Tags" },
          { id: "system", label: "System & XML Feeds" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              selectedCategory === tab.id
                ? "bg-brand-brown text-white shadow-xs"
                : "bg-brand-sand-light text-brand-brown hover:bg-brand-sand/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Action Table */}
      <div className="overflow-x-auto gounow-scrollbar pt-2">
        <table className="w-full text-left text-xs">
          <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-semibold border-b border-brand-border">
            <tr>
              <th className="py-3 px-4">User / Actor</th>
              <th className="py-3 px-4">Action Performed</th>
              <th className="py-3 px-4">Target Entity</th>
              <th className="py-3 px-4">Client IP / Origin</th>
              <th className="py-3 px-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/60">
            {filteredActions.map((act) => (
              <tr key={act.id} className="hover:bg-brand-sand-light/30 transition">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-brand-brown">{act.actor}</div>
                  <div className="text-[10px] text-brand-brown-muted font-medium">
                    {act.role}
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="font-semibold text-brand-brown flex items-center gap-1.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getCategoryBadge(
                        act.category
                      )}`}
                    >
                      {act.category}
                    </span>
                    <span>{act.action}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 font-mono text-[11px] text-brand-brown">
                  {act.target}
                </td>

                <td className="py-3.5 px-4 text-[11px] text-brand-brown-muted font-mono">
                  {act.ipAddress}
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="font-bold text-brand-brown">{act.relativeTime}</div>
                  <div className="text-[10px] text-brand-brown-muted font-mono">
                    {act.timestamp}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
