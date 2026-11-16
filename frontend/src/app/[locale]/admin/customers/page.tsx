"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import SectionExportButtons from "@/features/admin/components/SectionExportButtons";
import {
  getAdminCustomers,
  getAdminCustomer,
  getAdminConciergeRequests,
  type AdminCustomerDetail,
} from "@/features/admin/services/admin.api";
import type { AdminCustomerItem, ConciergeRequestItem } from "@/features/admin/types";

type ClientTierFilter = "All" | "VVIP" | "VIP" | "Returning" | "New";

function deriveTier(bookingsCount: number, totalSpentCents: number): Exclude<ClientTierFilter, "All"> {
  if (bookingsCount >= 5 || totalSpentCents >= 25000000) return "VVIP";
  if (bookingsCount >= 2 || totalSpentCents >= 10000000) return "VIP";
  if (bookingsCount === 1) return "Returning";
  return "New";
}

export default function AdminCustomersPage() {
  const { locale } = useLanguage();
  const { settings, buildWhatsAppUrl } = useSiteSettings();
  const isAr = locale === "ar";

  const [selectedTier, setSelectedTier] = useState<ClientTierFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"clients" | "leads">("clients");

  const [clients, setClients] = useState<AdminCustomerItem[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loadingClients, setLoadingClients] = useState(true);
  const [errorClients, setErrorClients] = useState<string | null>(null);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [customerDetail, setCustomerDetail] = useState<AdminCustomerDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [leads, setLeads] = useState<ConciergeRequestItem[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loadingLeads, setLoadingLeads] = useState(true);

  const loadCustomers = useCallback(async () => {
    setLoadingClients(true);
    setErrorClients(null);
    try {
      const res = await getAdminCustomers({
        page: currentPage,
        search: searchQuery.trim() || undefined,
      });
      setClients(Array.isArray(res.data) ? res.data : []);
      setTotalClients(res.meta?.total ?? (res.data?.length || 0));
      setLastPage(res.meta?.last_page ?? 1);
    } catch {
      setErrorClients(
        isAr ? "تعذر تحميل بيانات العملاء من الخادم." : "Failed to load customers from backend."
      );
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  }, [currentPage, searchQuery, isAr]);

  const loadLeads = useCallback(async () => {
    setLoadingLeads(true);
    try {
      const res = await getAdminConciergeRequests({ per_page: 25 });
      setLeads(Array.isArray(res.data) ? res.data : []);
      setTotalLeads(res.meta?.total ?? (res.data?.length || 0));
    } catch {
      setLeads([]);
    } finally {
      setLoadingLeads(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadCustomers]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleSelectCustomer = async (customer: AdminCustomerItem) => {
    setSelectedCustomerId(customer.id);
    setCustomerDetail(null);
    setLoadingDetail(true);
    try {
      const detail = await getAdminCustomer(customer.id);
      setCustomerDetail(detail);
    } catch {
      setCustomerDetail({
        ...customer,
        bookings: [],
        leads: [],
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  const getTagBadge = (tag: Exclude<ClientTierFilter, "All">) => {
    switch (tag) {
      case "VVIP":
        return "bg-rose-100 text-rose-900 border border-rose-300 font-bold";
      case "VIP":
        return "bg-amber-100 text-amber-900 border border-amber-300 font-bold";
      case "Returning":
        return "bg-emerald-100 text-emerald-900 border border-emerald-300 font-medium";
      case "New":
      default:
        return "bg-sky-100 text-sky-900 border border-sky-300 font-medium";
    }
  };

  const getTagLabel = (tag: ClientTierFilter) => {
    if (!isAr) return tag;
    switch (tag) {
      case "All":
        return "الكل";
      case "VVIP":
        return "كبار الشخصيات (VVIP)";
      case "VIP":
        return "عميل VIP";
      case "Returning":
        return "عميل متكرر";
      case "New":
        return "عميل جديد";
    }
  };

  const filteredClients = clients.filter((client) => {
    const tier = deriveTier(client.bookings_count, client.total_spent_cents);
    return selectedTier === "All" || tier === selectedTier;
  });

  const formatDate = (iso?: string | null) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-terracotta">
              {isAr ? "إدارة علاقات كبار العملاء والنزلاء" : "VIP Client Relationship Management"}
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-brand-brown">
            {isAr ? "سجل العملاء والمستثمرين" : "Customers & Client History"}
          </h1>
          <p className="text-xs text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "بيانات حقيقية ومباشرة من قاعدة بيانات العملاء وسجل الحجوزات والطلبات."
              : "Live directory of registered guests, booking spend, and concierge inquiries from the backend database."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SectionExportButtons sectionType="customers" />
          {settings?.whatsapp_number && (
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center shadow-xs cursor-pointer"
            >
              <span>{isAr ? "فتح واتساب كونسيرج CRM" : "Open WhatsApp CRM"}</span>
            </a>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-brand-border gap-4 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("clients")}
          className={`pb-3 px-1 border-b-2 transition cursor-pointer ${
            activeTab === "clients"
              ? "border-brand-terracotta text-brand-terracotta"
              : "border-transparent text-brand-brown-muted hover:text-brand-brown"
          }`}
        >
          {isAr
            ? `دليل العملاء وسجل الإقامات (${totalClients})`
            : `Client Directory & History (${totalClients})`}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("leads")}
          className={`pb-3 px-1 border-b-2 transition cursor-pointer ${
            activeTab === "leads"
              ? "border-brand-terracotta text-brand-terracotta"
              : "border-transparent text-brand-brown-muted hover:text-brand-brown"
          }`}
        >
          {isAr
            ? `طلبات الكونسيرج والاستفسارات (${totalLeads})`
            : `Live Concierge & Leads (${totalLeads})`}
        </button>
      </div>

      {activeTab === "clients" ? (
        <div className="space-y-4">
          {/* Filter Bar & Tier Selector */}
          <div className="bg-white p-4 rounded-2xl border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-brand-brown-muted uppercase mr-1">
                {isAr ? "تصفية بالتصنيف:" : "Filter by Tier:"}
              </span>
              {(["All", "VVIP", "VIP", "Returning", "New"] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedTier(tier)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedTier === tier
                      ? "bg-brand-brown text-white shadow-xs"
                      : "bg-brand-sand-light text-brand-brown hover:bg-brand-sand/60"
                  }`}
                >
                  {getTagLabel(tier)}
                </button>
              ))}
            </div>

            <div className="w-full md:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={isAr ? "بحث بالاسم أو البريد أو الهاتف..." : "Search client by name, email, phone..."}
                className="w-full text-xs p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/40 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
              />
            </div>
          </div>

          {errorClients && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorClients}
            </div>
          )}

          {/* Clients Table */}
          <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
            <div className="overflow-x-auto gounow-scrollbar">
              <table className="w-full text-start text-xs">
                <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-semibold border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-4 text-start">{isAr ? "العميل وبيانات الاتصال" : "Client Name & Contact"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "التصنيف" : "Tier"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "عدد الحجوزات" : "Bookings"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "إجمالي الإنفاق" : "Lifetime Spend"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "تاريخ التسجيل" : "Joined"}</th>
                    <th className="py-3 px-4 text-end">{isAr ? "الإجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {loadingClients ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-brand-brown-muted">
                        {isAr ? "جارٍ تحميل العملاء..." : "Loading customers..."}
                      </td>
                    </tr>
                  ) : filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-brand-brown-muted">
                        {isAr ? "لا يوجد عملاء مسجلون يطابقون البحث." : "No registered customers found."}
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => {
                      const tier = deriveTier(client.bookings_count, client.total_spent_cents);
                      return (
                        <tr
                          key={client.id}
                          className="hover:bg-brand-sand-light/30 transition cursor-pointer"
                          onClick={() => handleSelectCustomer(client)}
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-brand-brown">
                              {client.full_name || `${client.first_name} ${client.last_name}`}
                            </div>
                            <div className="text-[11px] text-brand-brown-muted">
                              {client.email}
                              {client.phone ? ` • ${client.phone}` : ""}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] ${getTagBadge(tier)}`}>
                              {getTagLabel(tier)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-brand-brown">
                            {client.bookings_count}{" "}
                            {isAr ? "حجز" : `booking${client.bookings_count === 1 ? "" : "s"}`}
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-brand-terracotta">
                            {client.formatted_total_spent}
                          </td>

                          <td className="py-3.5 px-4 text-brand-brown-muted text-[11px]">
                            {formatDate(client.created_at)}
                          </td>

                          <td className="py-3.5 px-4 text-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCustomer(client);
                              }}
                              className="px-3 py-1.5 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-lg font-bold text-[11px] transition cursor-pointer"
                            >
                              {isAr ? "عرض السجل" : "View History"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {lastPage > 1 && (
              <div className="px-4 py-3 border-t border-brand-border flex items-center justify-between text-xs">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-brand-border disabled:opacity-40 cursor-pointer"
                >
                  {isAr ? "السابق" : "Previous"}
                </button>
                <span className="text-brand-brown-muted">
                  {currentPage} / {lastPage}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= lastPage}
                  onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-brand-border disabled:opacity-40 cursor-pointer"
                >
                  {isAr ? "التالي" : "Next"}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Live Leads / Concierge Table */
        <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto gounow-scrollbar">
            <table className="w-full text-start text-xs">
              <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-semibold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4 text-start">{isAr ? "المرجع والعميل" : "Ref & Client"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "بيانات التواصل" : "Contact"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "الخدمة والتفاصيل" : "Request & Details"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "التاريخ" : "Date"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "الحالة" : "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {loadingLeads ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-brand-brown-muted">
                      {isAr ? "جارٍ تحميل الطلبات..." : "Loading concierge requests..."}
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-brand-brown-muted">
                      {isAr ? "لا توجد طلبات مسجلة حالياً." : "No concierge leads recorded yet."}
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-brand-sand-light/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brand-brown">
                          {lead.customer?.name || "—"}
                        </div>
                        <div className="text-[10px] font-mono text-brand-brown-muted">
                          {lead.request_number}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-brand-brown-muted">
                        <div>{lead.customer?.phone || "—"}</div>
                        <div className="text-[10px]">{lead.customer?.email || "—"}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-brand-brown">{lead.subject || lead.type}</div>
                        <div className="text-[11px] text-brand-brown-muted line-clamp-2">{lead.description}</div>
                      </td>
                      <td className="py-3.5 px-4 text-brand-brown-muted text-[11px]">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-sand-light text-brand-brown uppercase">
                          {lead.status.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Client History Modal */}
      {selectedCustomerId !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-brand-border shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto gounow-scrollbar">
            {loadingDetail || !customerDetail ? (
              <div className="py-12 text-center text-xs text-brand-brown-muted">
                {isAr ? "جارٍ تحميل سجل العميل..." : "Loading client history..."}
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between border-b border-brand-border pb-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-brand-brown">
                      {customerDetail.full_name || `${customerDetail.first_name} ${customerDetail.last_name}`}
                    </h2>
                    <p className="text-xs text-brand-brown-muted mt-0.5">
                      {customerDetail.email}
                      {customerDetail.phone ? ` • ${customerDetail.phone}` : ""}
                      {customerDetail.nationality ? ` • ${customerDetail.nationality}` : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomerId(null);
                      setCustomerDetail(null);
                    }}
                    className="text-brand-brown-muted hover:text-brand-brown text-lg font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-brand-sand-light/30 rounded-xl border border-brand-border">
                    <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                      {isAr ? "إجمالي الحجوزات" : "Total Bookings"}
                    </span>
                    <span className="text-lg font-bold text-brand-brown">
                      {customerDetail.bookings?.length ?? customerDetail.bookings_count ?? 0}
                    </span>
                  </div>
                  <div className="p-3 bg-brand-sand-light/30 rounded-xl border border-brand-border">
                    <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                      {isAr ? "إجمالي الإنفاق" : "Lifetime Spend"}
                    </span>
                    <span className="text-lg font-mono font-bold text-brand-terracotta">
                      {customerDetail.formatted_total_spent}
                    </span>
                  </div>
                  <div className="p-3 bg-brand-sand-light/30 rounded-xl border border-brand-border">
                    <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                      {isAr ? "تاريخ الانضمام" : "Member Since"}
                    </span>
                    <span className="text-sm font-bold text-brand-brown">
                      {formatDate(customerDetail.created_at)}
                    </span>
                  </div>
                </div>

                {/* Real Bookings History */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-brown-muted">
                    {isAr ? "سجل الحجوزات" : "Bookings History"}
                  </h3>
                  {customerDetail.bookings && customerDetail.bookings.length > 0 ? (
                    <div className="space-y-2.5">
                      {customerDetail.bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="p-3.5 rounded-xl border border-brand-border bg-white flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold font-mono text-brand-brown">{booking.reference}</div>
                            <div className="text-[11px] text-brand-brown-muted">
                              {booking.check_in || "—"} → {booking.check_out || "—"}
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="font-mono font-bold text-brand-brown">
                              {((booking.total_cents || 0) / 100).toLocaleString()} {booking.currency || "EGP"}
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-sand-light text-brand-brown uppercase">
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-brand-brown-muted italic">
                      {isAr ? "لا توجد حجوزات مسجلة لهذا العميل." : "No bookings recorded for this customer."}
                    </p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-2 flex justify-between items-center border-t border-brand-border">
                  {customerDetail.phone ? (
                    <a
                      href={`https://wa.me/${customerDetail.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center shadow-xs cursor-pointer"
                    >
                      <span>{isAr ? "محادثة واتساب مباشرة" : "Direct WhatsApp Contact"}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-brand-brown-muted italic">
                      {isAr ? "لا يوجد رقم هاتف مسجل" : "No phone number registered"}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomerId(null);
                      setCustomerDetail(null);
                    }}
                    className="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown font-bold text-xs rounded-xl cursor-pointer"
                  >
                    {isAr ? "إغلاق" : "Close"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
