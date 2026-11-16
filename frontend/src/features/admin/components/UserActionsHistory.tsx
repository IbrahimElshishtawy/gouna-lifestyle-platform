"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getAdminAuditLogs } from "@/features/admin/services/admin.api";
import type { ActivityLogItem } from "@/features/admin/types";

export default function UserActionsHistory() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<string>("all");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminAuditLogs({
        search: searchQuery.trim() || undefined,
      });
      setLogs(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  const entityTypes = Array.from(
    new Set(logs.map((l) => l.entity_type).filter(Boolean))
  );

  const filteredLogs =
    selectedEntity === "all"
      ? logs
      : logs.filter((l) => l.entity_type === selectedEntity);

  const getActionBadge = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes("login") || a.includes("2fa") || a.includes("auth") || a.includes("logout")) {
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    }
    if (a.includes("price") || a.includes("discount") || a.includes("season")) {
      return "bg-amber-100 text-amber-800 border-amber-200";
    }
    if (a.includes("book") || a.includes("check") || a.includes("payment")) {
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
    if (a.includes("delete") || a.includes("reject") || a.includes("suspend")) {
      return "bg-rose-100 text-rose-800 border-rose-200";
    }
    return "bg-sky-100 text-sky-800 border-sky-200";
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
            Live audit log from backend activity records.
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, entity, description..."
            className="w-full text-xs p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/40 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
          />
        </div>
      </div>

      {/* Entity Type Filter Pills */}
      {entityTypes.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => setSelectedEntity("all")}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              selectedEntity === "all"
                ? "bg-brand-brown text-white shadow-xs"
                : "bg-brand-sand-light text-brand-brown hover:bg-brand-sand/60"
            }`}
          >
            All Events
          </button>
          {entityTypes.map((entity) => (
            <button
              key={entity}
              type="button"
              onClick={() => setSelectedEntity(entity)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                selectedEntity === entity
                  ? "bg-brand-brown text-white shadow-xs"
                  : "bg-brand-sand-light text-brand-brown hover:bg-brand-sand/60"
              }`}
            >
              {entity}
            </button>
          ))}
        </div>
      )}

      {/* Action Table */}
      <div className="overflow-x-auto gounow-scrollbar pt-2">
        {loading ? (
          <div className="py-10 text-center text-xs text-brand-brown-muted">
            Loading audit logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-10 text-center text-xs text-brand-brown-muted">
            No activity logs found.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-semibold border-b border-brand-border">
              <tr>
                <th className="py-3 px-4">User / Actor</th>
                <th className="py-3 px-4">Action Performed</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Client IP</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {filteredLogs.map((act) => (
                <tr key={act.id} className="hover:bg-brand-sand-light/30 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-brand-brown">
                      {act.user_name || "System"}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-brand-brown flex items-center gap-1.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getActionBadge(
                          act.action
                        )}`}
                      >
                        {act.action}
                      </span>
                      <span>{act.description}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-brand-brown">
                    {act.entity_type}
                    {act.entity_id ? ` #${act.entity_id}` : ""}
                  </td>

                  <td className="py-3.5 px-4 text-[11px] text-brand-brown-muted font-mono">
                    {act.ip_address || "—"}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="text-[11px] text-brand-brown-muted font-mono">
                      {act.created_at
                        ? new Date(act.created_at).toLocaleString()
                        : "—"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
