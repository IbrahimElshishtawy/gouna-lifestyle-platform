"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import {
  getConciergeDashboard,
  getAdminConciergeRequests,
  createConciergeRequest,
  assignConciergeRequest,
  updateConciergeStatus,
  getAdminStaff,
} from "@/features/admin/services/admin.api";
import type {
  ConciergeRequestItem,
  ConciergeDashboardKPIs,
  AdminStaffItem,
  ConciergePriority,
  ConciergeType,
} from "@/features/admin/types";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import PermissionGuard from "@/components/ui/PermissionGuard";

const REQUEST_TYPES: Array<{ value: ConciergeType; labelEn: string; labelAr: string; icon: string }> = [
  { value: "yacht", labelEn: "Private Yacht & Charter", labelAr: "يخوت ورحلات بحرية", icon: "🛥️" },
  { value: "experience", labelEn: "Desert & Island Safari", labelAr: "سفاري وتجارب جبلية", icon: "🏜️" },
  { value: "event", labelEn: "VIP Event & Tables", labelAr: "حفلات وتذاكر VIP", icon: "🎟️" },
  { value: "dining", labelEn: "Private Chef & Dining", labelAr: "شيف خاص ومطاعم", icon: "🍽️" },
  { value: "vip", labelEn: "High-Net-Worth Bespoke", labelAr: "خدمات كبار الشخصيات", icon: "👑" },
  { value: "custom", labelEn: "Special Custom Request", labelAr: "ترتيبات خاصة ومخصصة", icon: "✨" },
];

const QUEUE_TABS = [
  { id: "all", labelEn: "All Requests", labelAr: "كافة الطلبات" },
  { id: "new", labelEn: "New Inquiries", labelAr: "الطلبات الجديدة" },
  { id: "urgent", labelEn: "Urgent Priority", labelAr: "عاجل ومهم 🔥" },
  { id: "unassigned", labelEn: "Unassigned", labelAr: "غير مسندة" },
  { id: "in_progress", labelEn: "In Progress", labelAr: "قيد المتابعة" },
  { id: "quoted", labelEn: "Pending Quotes", labelAr: "عروض أسعار معلقة" },
  { id: "confirmed", labelEn: "Confirmed", labelAr: "مؤكدة" },
  { id: "completed", labelEn: "Completed", labelAr: "مكتملة" },
];

export default function AdminConciergePage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const searchParams = useSearchParams();
  const initialQueue = searchParams.get("queue") || "all";

  const [activeQueue, setActiveQueue] = useState(initialQueue);
  const [requests, setRequests] = useState<ConciergeRequestItem[]>([]);
  const [kpis, setKpis] = useState<ConciergeDashboardKPIs | null>(null);
  const [staffList, setStaffList] = useState<AdminStaffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");

  // Create Request Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    type: "yacht",
    priority: "normal",
    subject: "",
    description: "",
    guest_count: 2,
    requested_date: "",
    preferred_time: "",
    location: "El Gouna",
    budget: "",
    assigned_to_user_id: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Quick Assign Modal
  const [assignDialog, setAssignDialog] = useState<{
    isOpen: boolean;
    requestId: number | null;
    requestNumber: string;
    currentAssignedId: number | null;
    selectedUserId: number | null;
    notes: string;
    loading: boolean;
  }>({
    isOpen: false,
    requestId: null,
    requestNumber: "",
    currentAssignedId: null,
    selectedUserId: null,
    notes: "",
    loading: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, reqsRes, staffRes] = await Promise.all([
        getConciergeDashboard().catch(() => null),
        getAdminConciergeRequests({
          queue: activeQueue !== "all" ? activeQueue : undefined,
          type: typeFilter || undefined,
          priority: priorityFilter || undefined,
          search: search || undefined,
        }),
        getAdminStaff({ scope: "concierge" }).catch(() => ({ staff: [], roles: [] })),
      ]);

      if (dashRes) setKpis(dashRes.kpis);
      setRequests(reqsRes.data || []);
      setStaffList(staffRes.staff || []);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر تحميل بيانات الكونسيرج." : "Failed to load concierge data."),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeQueue, typeFilter, priorityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      await createConciergeRequest({
        ...createForm,
        budget: createForm.budget ? parseFloat(createForm.budget) : undefined,
        assigned_to_user_id: createForm.assigned_to_user_id ? parseInt(createForm.assigned_to_user_id) : null,
      });

      setFeedback({
        type: "success",
        message: isAr ? "تم إنشاء طلب الكونسيرج بنجاح وإدراجه في طابور العمليات." : "Concierge request created and queued.",
      });
      setIsCreateModalOpen(false);
      setCreateForm({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        type: "yacht",
        priority: "normal",
        subject: "",
        description: "",
        guest_count: 2,
        requested_date: "",
        preferred_time: "",
        location: "El Gouna",
        budget: "",
        assigned_to_user_id: "",
      });
      await fetchData();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر إنشاء الطلب." : "Failed to create request."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickAssign = async () => {
    if (!assignDialog.requestId) return;
    setAssignDialog((prev) => ({ ...prev, loading: true }));
    setFeedback(null);

    try {
      await assignConciergeRequest(assignDialog.requestId, assignDialog.selectedUserId, assignDialog.notes);
      setFeedback({
        type: "success",
        message: isAr
          ? `تم إسناد الطلب ${assignDialog.requestNumber} بنجاح إلى المنسق.`
          : `Request ${assignDialog.requestNumber} assigned successfully.`,
      });
      setAssignDialog((prev) => ({ ...prev, isOpen: false }));
      await fetchData();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر إسناد الطلب." : "Failed to assign request."),
      });
    } finally {
      setAssignDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateConciergeStatus(id, newStatus);
      setFeedback({
        type: "success",
        message: isAr ? "تم تحديث حالة الطلب بنجاح." : "Request status updated successfully.",
      });
      await fetchData();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر تحديث الحالة وفقاً لقواعد المسار." : "Invalid status transition."),
      });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-terracotta font-bold">
              {isAr ? "مركز عمليات كونسيرج الجونة" : "24/7 VIP CONCIERGE OPERATIONS HUB"}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown">
            {isAr ? "طلبات وعمليات كبار الزوار (Concierge)" : "VIP Concierge & Custom Experiences"}
          </h1>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "متابعة طلبات اليخوت الخاصة، وحفلات الشاطئ، وخدمات الشيف الخاص، وإصدار عروض الأسعار المعتمدة وتحويلها لحجوزات حقيقية."
              : "Operate bespoke yacht charters, private dining, VIP events, generate authoritative quotes, and convert to bookings."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PermissionGuard permission="concierge.create">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span>+</span>
              <span>{isAr ? "تسجيل طلب جديد" : "New Concierge Request"}</span>
            </button>
          </PermissionGuard>

          <a
            href="https://wa.me/201000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <span>💬</span>
            <span className="hidden sm:inline">{isAr ? "ديسباتش واتساب" : "WhatsApp Dispatch"}</span>
          </a>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium border flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-sm font-bold opacity-60 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Operational KPIs */}
      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-1">
              {isAr ? "طلبات جديدة" : "New Inquiries"}
            </span>
            <span className="text-xl sm:text-2xl font-serif font-bold text-blue-600">
              {kpis.new_requests}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block mb-1">
              {isAr ? "عاجل ومهم 🔥" : "Urgent Priority 🔥"}
            </span>
            <span className="text-xl sm:text-2xl font-serif font-bold text-rose-600">
              {kpis.urgent_requests}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
              {isAr ? "غير مسندة" : "Unassigned"}
            </span>
            <span className="text-xl sm:text-2xl font-serif font-bold text-amber-600">
              {kpis.unassigned_requests}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-1">
              {isAr ? "عروض أسعار معلقة" : "Pending Quotes"}
            </span>
            <span className="text-xl sm:text-2xl font-serif font-bold text-purple-600">
              {kpis.quoted_requests}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
              {isAr ? "مؤكدة ومحجوزة" : "Confirmed"}
            </span>
            <span className="text-xl sm:text-2xl font-serif font-bold text-emerald-600">
              {kpis.confirmed_requests}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-terracotta block mb-1">
              {isAr ? "نسبة التحويل لحجز" : "Conversion Rate"}
            </span>
            <span className="text-xl sm:text-2xl font-serif font-bold text-brand-terracotta">
              {kpis.conversion_rate_percentage}%
            </span>
          </div>
        </div>
      )}

      {/* Operational Queue Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-brand-border gounow-scrollbar">
        {QUEUE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveQueue(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeQueue === tab.id
                ? "bg-brand-terracotta text-white shadow-xs"
                : "bg-white text-brand-brown border border-brand-border hover:bg-brand-sand/50"
            }`}
          >
            {isAr ? tab.labelAr : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <input
            type="text"
            placeholder={isAr ? "البحث برقم الطلب، اسم العميل، الهاتف أو الموضوع..." : "Search by request #, customer, phone, or subject..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-terracotta"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-brand-sand-light hover:bg-brand-sand text-brand-brown text-xs font-bold transition cursor-pointer shrink-0"
          >
            {isAr ? "بحث" : "Search"}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-brand-border text-xs bg-white text-brand-brown focus:outline-none focus:border-brand-terracotta"
          >
            <option value="">{isAr ? "كافة التصنيفات" : "All Types"}</option>
            {REQUEST_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.icon} {isAr ? t.labelAr : t.labelEn}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-brand-border text-xs bg-white text-brand-brown focus:outline-none focus:border-brand-terracotta"
          >
            <option value="">{isAr ? "كافة الأولويات" : "All Priorities"}</option>
            <option value="urgent">🔥 {isAr ? "عاجل" : "Urgent"}</option>
            <option value="high">{isAr ? "مرتفع" : "High"}</option>
            <option value="normal">{isAr ? "عادي" : "Normal"}</option>
            <option value="low">{isAr ? "منخفض" : "Low"}</option>
          </select>

          {(search || typeFilter || priorityFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setTypeFilter("");
                setPriorityFilter("");
              }}
              className="px-3 py-2 text-xs font-bold text-brand-brown-muted hover:text-brand-terracotta cursor-pointer"
            >
              {isAr ? "إعادة ضبط" : "Reset"}
            </button>
          )}
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <LoadingState message={isAr ? "جارٍ تحميل طابور طلبات الكونسيرج..." : "Loading concierge requests..."} rows={4} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon="🛎️"
          title={isAr ? "لا توجد طلبات في هذا الطابور" : "Queue is Empty"}
          description={
            isAr
              ? "لا توجد طلبات كونسيرج تطابق معايير التصفية المحددة."
              : "No requests found matching current queue or filters."
          }
        />
      ) : (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-brand-sand-light/60 text-brand-brown-muted font-bold text-[10px] uppercase tracking-wider border-b border-brand-border">
                <tr>
                  <th className="py-3.5 px-4 text-start">{isAr ? "رقم الطلب" : "Request #"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "العميل" : "Customer"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "النوع والأولوية" : "Type & Priority"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "الحالة" : "Status"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "المنسق المسند" : "Assigned Agent"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "الموعد والميزانية" : "Schedule / Budget"}</th>
                  <th className="py-3.5 px-4 text-end">{isAr ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {requests.map((item) => {
                  const typeObj = REQUEST_TYPES.find((t) => t.value === item.type);
                  const isUrgent = item.priority === "urgent";

                  return (
                    <tr key={item.id} className="hover:bg-brand-sand/30 transition-colors">
                      <td className="py-4 px-4">
                        <Link
                          href={`/admin/concierge/${item.id}`}
                          className="font-mono font-bold text-brand-terracotta hover:underline block"
                        >
                          {item.request_number}
                        </Link>
                        <span className="text-[10px] text-brand-brown-muted">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-brand-brown block">{item.customer?.name}</span>
                        <div className="flex items-center gap-2 text-[11px] text-brand-brown-muted font-mono" dir="ltr">
                          {item.customer?.phone && <span>{item.customer.phone}</span>}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-sand text-brand-brown">
                            <span>{typeObj?.icon || "✨"}</span>
                            <span>{isAr ? typeObj?.labelAr : typeObj?.labelEn}</span>
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                              isUrgent
                                ? "bg-rose-100 text-rose-800 border border-rose-300 font-extrabold"
                                : item.priority === "high"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-stone-100 text-stone-700"
                            }`}
                          >
                            {isUrgent ? "🔥 URGENT" : item.priority}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            item.status === "new"
                              ? "bg-blue-50 text-blue-800 border-blue-300"
                              : item.status === "quoted"
                              ? "bg-purple-50 text-purple-800 border-purple-300"
                              : item.status === "confirmed"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : item.status === "completed"
                              ? "bg-stone-100 text-stone-800 border-stone-300"
                              : "bg-amber-50 text-amber-800 border-amber-300"
                          }`}
                        >
                          {item.status.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {item.assigned_to ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-brand-terracotta/20 text-brand-terracotta font-bold flex items-center justify-center text-[10px]">
                              {item.assigned_to.name.substring(0, 1)}
                            </div>
                            <span className="font-semibold text-brand-brown text-xs">{item.assigned_to.name}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              setAssignDialog({
                                isOpen: true,
                                requestId: item.id,
                                requestNumber: item.request_number,
                                currentAssignedId: null,
                                selectedUserId: staffList[0]?.id || null,
                                notes: "",
                                loading: false,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold hover:bg-amber-100 transition cursor-pointer"
                          >
                            <span>⚠️ {isAr ? "إسناد لموظف" : "Assign Staff"}</span>
                          </button>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-xs">
                          {item.requested_date ? (
                            <div className="font-semibold text-brand-brown">{item.requested_date}</div>
                          ) : (
                            <span className="text-brand-brown-muted italic">{isAr ? "غير محدد" : "Flexible"}</span>
                          )}
                          {item.formatted_budget && (
                            <span className="font-mono text-[11px] text-brand-terracotta font-bold block">
                              {item.formatted_budget}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/concierge/${item.id}`}
                            className="px-3 py-1.5 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-[11px] font-bold transition shadow-2xs"
                          >
                            {isAr ? "فتح غرفة العمليات" : "Operations"}
                          </Link>

                          <button
                            onClick={() =>
                              setAssignDialog({
                                isOpen: true,
                                requestId: item.id,
                                requestNumber: item.request_number,
                                currentAssignedId: item.assigned_to_user_id,
                                selectedUserId: item.assigned_to_user_id || staffList[0]?.id || null,
                                notes: "",
                                loading: false,
                              })
                            }
                            className="p-1.5 rounded-lg border border-brand-border text-brand-brown hover:bg-brand-sand transition cursor-pointer"
                            title={isAr ? "إعادة إسناد المنسق" : "Reassign Agent"}
                          >
                            👤
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Concierge Request Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-brand-border p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto gounow-scrollbar animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <h3 className="font-serif text-lg font-bold text-brand-brown">
                {isAr ? "تسجيل طلب كونسيرج جديد (Bespoke Request)" : "Register New VIP Concierge Request"}
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-brand-brown-muted hover:text-brand-brown cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-brand-sand-light/40 p-3.5 rounded-2xl border border-brand-border/60">
                <div>
                  <label className="block font-bold text-brand-brown mb-1">
                    {isAr ? "اسم العميل" : "Customer Name"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.customer_name}
                    onChange={(e) => setCreateForm({ ...createForm, customer_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none bg-white"
                    placeholder="e.g. Tarek Mansour"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-brown mb-1">
                    {isAr ? "البريد الإلكتروني" : "Email"} *
                  </label>
                  <input
                    type="email"
                    required
                    value={createForm.customer_email}
                    onChange={(e) => setCreateForm({ ...createForm, customer_email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none bg-white"
                    placeholder="tarek@example.com"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-brown mb-1">
                    {isAr ? "رقم الهاتف / واتساب" : "Phone / WhatsApp"}
                  </label>
                  <input
                    type="text"
                    value={createForm.customer_phone}
                    onChange={(e) => setCreateForm({ ...createForm, customer_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none bg-white font-mono"
                    placeholder="+20 100 000 0000"
                  />
                </div>
              </div>

              {/* Request Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-brand-brown mb-1">
                    {isAr ? "نوع الطلب والقطاع" : "Service Domain Type"} *
                  </label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none bg-white"
                  >
                    {REQUEST_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.icon} {isAr ? t.labelAr : t.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-brand-brown mb-1">
                    {isAr ? "مستوى الأولوية" : "Priority"} *
                  </label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none bg-white"
                  >
                    <option value="normal">{isAr ? "عادي" : "Normal"}</option>
                    <option value="high">{isAr ? "مرتفع" : "High"}</option>
                    <option value="urgent">🔥 {isAr ? "عاجل وفوري" : "Urgent Dispatch"}</option>
                    <option value="low">{isAr ? "منخفض" : "Low"}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-brand-brown mb-1">
                  {isAr ? "عنوان / موضوع الطلب" : "Subject Summary"} *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.subject}
                  onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none"
                  placeholder={isAr ? "مثال: يخت خاص لعائلة مع شيف وتصوير لغروب الشمس" : "e.g. Sunset Private Yacht Charter with Chef"}
                />
              </div>

              <div>
                <label className="block font-bold text-brand-brown mb-1">
                  {isAr ? "تفاصيل الطلب والمواصفات المطلوبة" : "Detailed Description & Specs"} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none"
                  placeholder={isAr ? "اكتب كافة الرغبات والملاحظات والمواصفات التي طلبها العميل..." : "Specify guest preferences, catering needs, time windows..."}
                />
              </div>

              {/* Extra logistical fields */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-brand-brown mb-1">
                    {isAr ? "عدد الأفراد" : "Guests"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={createForm.guest_count}
                    onChange={(e) => setCreateForm({ ...createForm, guest_count: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-brown mb-1">
                    {isAr ? "التاريخ المطلوب" : "Date"}
                  </label>
                  <input
                    type="date"
                    value={createForm.requested_date}
                    onChange={(e) => setCreateForm({ ...createForm, requested_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-brown mb-1">
                    {isAr ? "الميزانية المتوقعة (EGP)" : "Budget (EGP)"}
                  </label>
                  <input
                    type="number"
                    value={createForm.budget}
                    onChange={(e) => setCreateForm({ ...createForm, budget: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none"
                    placeholder="25000"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-brown mb-1">
                    {isAr ? "إسناد لمنسق" : "Assign To"}
                  </label>
                  <select
                    value={createForm.assigned_to_user_id}
                    onChange={(e) => setCreateForm({ ...createForm, assigned_to_user_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none bg-white"
                  >
                    <option value="">{isAr ? "غير مسند حالياً" : "Unassigned"}</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-brown hover:bg-brand-sand-light transition cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-terracotta hover:bg-brand-terracotta-dark text-white transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (isAr ? "جارٍ الحفظ..." : "Creating...") : (isAr ? "تسجيل الطلب" : "Create Request")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Assign Dialog */}
      {assignDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl border border-brand-border p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <h3 className="font-serif text-lg font-bold text-brand-brown">
                {isAr ? `إسناد الطلب ${assignDialog.requestNumber}` : `Assign ${assignDialog.requestNumber}`}
              </h3>
              <button
                type="button"
                onClick={() => setAssignDialog((prev) => ({ ...prev, isOpen: false }))}
                className="text-brand-brown-muted hover:text-brand-brown cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-brand-brown mb-1.5">
                  {isAr ? "اختر المنسق المسؤول من فريق العمل" : "Select Authorized Agent"}
                </label>
                <select
                  value={assignDialog.selectedUserId || ""}
                  onChange={(e) =>
                    setAssignDialog((prev) => ({
                      ...prev,
                      selectedUserId: e.target.value ? parseInt(e.target.value) : null,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none bg-white"
                >
                  <option value="">{isAr ? "إلغاء الإسناد (غير مسند)" : "Unassigned"}</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.roles.join(", ")})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-brand-brown mb-1.5">
                  {isAr ? "ملاحظات الإسناد والتحويل (اختياري)" : "Assignment Handover Notes"}
                </label>
                <textarea
                  rows={2}
                  value={assignDialog.notes}
                  onChange={(e) => setAssignDialog((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder={isAr ? "مثال: يرجى التواصل مع العميل وتجهيز عرض اليخت قبل المساء" : "e.g. Please reach out to customer and prepare quote before 5 PM"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setAssignDialog((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-brown hover:bg-brand-sand-light transition cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="button"
                  disabled={assignDialog.loading}
                  onClick={handleQuickAssign}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-terracotta hover:bg-brand-terracotta-dark text-white transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {assignDialog.loading ? (isAr ? "جارٍ الإسناد..." : "Saving...") : (isAr ? "تأكيد الإسناد" : "Confirm Assignment")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
