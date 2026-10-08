"use client";

import React, { useEffect, useState, use } from "react";
import { Link } from "@/i18n/routing";
import {
  getAdminConciergeRequest,
  updateConciergeStatus,
  assignConciergeRequest,
  addConciergeNote,
  createConciergeQuote,
  acceptConciergeQuote,
  getAdminStaff,
} from "@/features/admin/services/admin.api";
import type {
  ConciergeRequestItem,
  AdminStaffItem,
  ConciergeStatus,
} from "@/features/admin/types";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PermissionGuard from "@/components/ui/PermissionGuard";

// Allowed state transitions map strictly conforming to ConciergeService backend
const ALLOWED_TRANSITIONS: Record<ConciergeStatus, ConciergeStatus[]> = {
  new: ["assigned", "in_progress", "cancelled", "rejected"],
  assigned: ["in_progress", "waiting_customer", "waiting_partner", "escalated", "cancelled"],
  in_progress: ["quoted", "waiting_customer", "waiting_partner", "confirmed", "escalated", "cancelled"],
  waiting_customer: ["in_progress", "quoted", "cancelled"],
  waiting_partner: ["in_progress", "quoted", "cancelled"],
  quoted: ["confirmed", "in_progress", "rejected", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  rejected: [],
  escalated: ["in_progress", "assigned", "cancelled"],
};

export default function ConciergeRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const requestId = parseInt(resolvedParams.id, 10);

  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [request, setRequest] = useState<ConciergeRequestItem | null>(null);
  const [staffList, setStaffList] = useState<AdminStaffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Communication tabs: 'internal' vs 'customer'
  const [activeTab, setActiveTab] = useState<"internal" | "customer">("internal");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Status transition state
  const [statusNotes, setStatusNotes] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Assignment state
  const [isReassigning, setIsReassigning] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);

  // Create Quote Modal state
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteItems, setQuoteItems] = useState<Array<{
    item_type: string;
    title: string;
    description: string;
    quantity: number;
    unit_price: number;
  }>>([
    { item_type: "yacht", title: "", description: "", quantity: 1, unit_price: 0 },
  ]);
  const [quoteDiscount, setQuoteDiscount] = useState("0");
  const [quoteFees, setQuoteFees] = useState("0");
  const [quoteValidUntil, setQuoteValidUntil] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  // Accept Quote Dialog state
  const [acceptDialog, setAcceptDialog] = useState<{
    isOpen: boolean;
    quoteId: number | null;
    quoteNumber: string;
    loading: boolean;
  }>({
    isOpen: false,
    quoteId: null,
    quoteNumber: "",
    loading: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqData, staffRes] = await Promise.all([
        getAdminConciergeRequest(requestId),
        getAdminStaff({ scope: "concierge" }).catch(() => ({ staff: [], roles: [] })),
      ]);
      setRequest(reqData);
      setStaffList(staffRes.staff || []);
      setSelectedStaffId(reqData.assigned_to_user_id);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر تحميل بيانات الطلب." : "Failed to load concierge request."),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [requestId]);

  const handleStatusTransition = async (nextStatus: ConciergeStatus) => {
    setIsUpdatingStatus(true);
    setFeedback(null);

    try {
      await updateConciergeStatus(requestId, nextStatus, statusNotes || undefined);
      setFeedback({
        type: "success",
        message: isAr
          ? `تم تحديث حالة الطلب إلى "${nextStatus.replace(/_/g, " ")}" بنجاح.`
          : `Status transitioned to "${nextStatus.replace(/_/g, " ")}" successfully.`,
      });
      setStatusNotes("");
      await fetchData();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر تغيير الحالة وفقاً لقواعد المسار." : "Status transition failed."),
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleReassignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAssignment(true);
    setFeedback(null);

    try {
      await assignConciergeRequest(requestId, selectedStaffId, assignmentNotes || undefined);
      setFeedback({
        type: "success",
        message: isAr ? "تم إسناد الطلب للمنسق المعتمد بنجاح." : "Request assigned successfully.",
      });
      setIsReassigning(false);
      setAssignmentNotes("");
      await fetchData();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر إسناد الطلب." : "Failed to assign request."),
      });
    } finally {
      setIsSubmittingAssignment(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    setIsSubmittingNote(true);
    setFeedback(null);

    const isCustomerVisible = activeTab === "customer";

    try {
      await addConciergeNote(requestId, newNoteContent.trim(), isCustomerVisible);
      setFeedback({
        type: "success",
        message: isCustomerVisible
          ? isAr ? "تم إرسال التحديث المخصص للعميل." : "Customer message added."
          : isAr ? "تمت إضافة الملاحظة الداخلية الخاصة بفريق العمل." : "Private internal staff note added.",
      });
      setNewNoteContent("");
      await fetchData();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر حفظ الملاحظة." : "Failed to add note."),
      });
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleAddQuoteItem = () => {
    setQuoteItems((prev) => [
      ...prev,
      { item_type: "custom", title: "", description: "", quantity: 1, unit_price: 0 },
    ]);
  };

  const handleRemoveQuoteItem = (index: number) => {
    if (quoteItems.length <= 1) return;
    setQuoteItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingQuote(true);
    setFeedback(null);

    try {
      await createConciergeQuote(requestId, {
        items: quoteItems,
        discount: parseFloat(quoteDiscount) || 0,
        fees: parseFloat(quoteFees) || 0,
        valid_until: quoteValidUntil || undefined,
        notes: quoteNotes || undefined,
      });

      setFeedback({
        type: "success",
        message: isAr
          ? "تم إنشاء عرض السعر المعتمد بنجاح وتحويل الطلب لحالة (Quoted)."
          : "Authoritative quote created and request moved to Quoted status.",
      });
      setIsQuoteModalOpen(false);
      setQuoteItems([{ item_type: "yacht", title: "", description: "", quantity: 1, unit_price: 0 }]);
      setQuoteDiscount("0");
      setQuoteFees("0");
      setQuoteValidUntil("");
      setQuoteNotes("");
      await fetchData();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر إنشاء عرض السعر." : "Failed to create quote."),
      });
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const handleAcceptQuoteConfirm = async () => {
    if (!acceptDialog.quoteId) return;
    setAcceptDialog((prev) => ({ ...prev, loading: true }));
    setFeedback(null);

    try {
      const res = await acceptConciergeQuote(requestId, acceptDialog.quoteId);
      setFeedback({
        type: "success",
        message: isAr
          ? `تم قبول عرض السعر وتحويله بنجاح إلى حجز حقيقي برقم: ${res.data?.booking?.reference || ""}`
          : `Quote accepted! Atomic Booking created with reference: ${res.data?.booking?.reference || ""}`,
      });
      setAcceptDialog((prev) => ({ ...prev, isOpen: false }));
      await fetchData();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر قبول العرض أو تحويله لحجز." : "Failed to accept quote."),
      });
    } finally {
      setAcceptDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  if (loading) {
    return <LoadingState message={isAr ? "جارٍ فتح غرفة عمليات الطلب..." : "Loading operational workspace..."} rows={6} />;
  }

  if (!request) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-brand-border">
        <p className="text-sm font-semibold text-brand-brown">
          {isAr ? "لم يتم العثور على هذا الطلب." : "Concierge request not found."}
        </p>
        <Link
          href="/admin/concierge"
          className="mt-4 inline-block px-5 py-2 rounded-xl bg-brand-terracotta text-white text-xs font-bold"
        >
          {isAr ? "العودة للوحة الكونسيرج" : "Back to Concierge Queue"}
        </Link>
      </div>
    );
  }

  const allowedNextStatuses = ALLOWED_TRANSITIONS[request.status] || [];
  const internalNotes = request.notes?.filter((n) => !n.is_customer_visible) || [];
  const customerNotes = request.notes?.filter((n) => n.is_customer_visible) || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs text-brand-brown-muted">
            <Link href="/admin/concierge" className="hover:text-brand-terracotta transition">
              {isAr ? "طلبات الكونسيرج" : "Concierge Queue"}
            </Link>
            <span>/</span>
            <span className="font-mono font-bold text-brand-terracotta">{request.request_number}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown">
              {request.subject}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                request.status === "new"
                  ? "bg-blue-50 text-blue-800 border-blue-300"
                  : request.status === "quoted"
                  ? "bg-purple-50 text-purple-800 border-purple-300"
                  : request.status === "confirmed"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : request.status === "completed"
                  ? "bg-stone-100 text-stone-800 border-stone-300"
                  : "bg-amber-50 text-amber-800 border-amber-300"
              }`}
            >
              {request.status.replace(/_/g, " ")}
            </span>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                request.priority === "urgent"
                  ? "bg-rose-100 text-rose-800 border border-rose-300 font-extrabold"
                  : request.priority === "high"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-stone-100 text-stone-700"
              }`}
            >
              {request.priority === "urgent" ? "🔥 URGENT" : request.priority}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PermissionGuard permission="concierge.quote">
            <button
              onClick={() => setIsQuoteModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span>📄</span>
              <span>{isAr ? "إصدار عرض سعر معتمد" : "Generate Custom Quote"}</span>
            </button>
          </PermissionGuard>

          <a
            href={`https://wa.me/${request.customer?.phone?.replace(/\D/g, "") || "201000000000"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <span>💬</span>
            <span className="hidden sm:inline">{isAr ? "مراسلة العميل" : "WhatsApp"}</span>
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

      {/* State Machine Transition Bar */}
      {allowedNextStatuses.length > 0 && (
        <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-brand-brown">
              {isAr ? "المسارات المسموحة قانونياً:" : "Valid Lifecycle Transitions:"}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {allowedNextStatuses.map((st) => (
                <button
                  key={st}
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusTransition(st)}
                  className="px-3 py-1 rounded-xl bg-brand-sand-light hover:bg-brand-sand text-brand-brown text-xs font-bold border border-brand-border transition cursor-pointer disabled:opacity-50"
                >
                  → {st.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={isAr ? "ملاحظات الانتقال (اختياري)..." : "Transition audit notes..."}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-terracotta w-full sm:w-64"
            />
          </div>
        </div>
      )}

      {/* Main Grid: Details + Operational Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer & Operational Specs */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <h2 className="font-serif text-base font-bold text-brand-brown">
                {isAr ? "بيانات العميل (VIP Client)" : "VIP Customer Profile"}
              </h2>
              {request.customer?.vip_status && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  ★ VIP
                </span>
              )}
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-brown-muted block">
                  {isAr ? "الاسم الكامل" : "Name"}
                </span>
                <span className="font-bold text-brand-brown text-sm">{request.customer?.name}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-brand-brown-muted block">
                  {isAr ? "البريد الإلكتروني" : "Email"}
                </span>
                <span className="font-mono text-brand-brown">{request.customer?.email}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-brand-brown-muted block">
                  {isAr ? "رقم الهاتف / واتساب" : "Phone / WhatsApp"}
                </span>
                <span className="font-mono text-brand-brown" dir="ltr">
                  {request.customer?.phone || "N/A"}
                </span>
              </div>

              <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-brand-brown-muted block">{isAr ? "إجمالي الحجوزات" : "Bookings"}</span>
                  <span className="font-bold text-brand-brown">{request.customer?.bookings_count || 0}</span>
                </div>
                <div className="text-end">
                  <span className="text-brand-brown-muted block">{isAr ? "حجم الإنفاق" : "Total Spent"}</span>
                  <span className="font-bold text-brand-terracotta">
                    {request.customer?.total_spent_cents
                      ? `${(request.customer.total_spent_cents / 100).toLocaleString()} EGP`
                      : "0 EGP"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment & Operational Lead Card */}
          <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <h2 className="font-serif text-base font-bold text-brand-brown">
                {isAr ? "المنسق المسؤول (Assigned Agent)" : "Assignment & Ownership"}
              </h2>
              <button
                onClick={() => setIsReassigning(!isReassigning)}
                className="text-xs font-bold text-brand-terracotta hover:underline cursor-pointer"
              >
                {isReassigning ? (isAr ? "إلغاء" : "Cancel") : (isAr ? "تعديل الإسناد" : "Reassign")}
              </button>
            </div>

            {isReassigning ? (
              <form onSubmit={handleReassignment} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-brand-brown mb-1">
                    {isAr ? "اختر المنسق المسؤول" : "Select Staff Member"}
                  </label>
                  <select
                    value={selectedStaffId || ""}
                    onChange={(e) => setSelectedStaffId(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none bg-white"
                  >
                    <option value="">{isAr ? "غير مسند" : "Unassigned"}</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.scope})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-brand-brown mb-1">
                    {isAr ? "ملاحظات التحويل والإسناد" : "Handover Audit Notes"}
                  </label>
                  <textarea
                    rows={2}
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none"
                    placeholder={isAr ? "سبب التكليف أو توجيهات المتابعة..." : "Reason or handover instructions..."}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAssignment}
                  className="w-full py-2 rounded-xl bg-brand-terracotta text-white font-bold transition hover:bg-brand-terracotta-dark disabled:opacity-50"
                >
                  {isSubmittingAssignment ? (isAr ? "جارٍ الحفظ..." : "Saving...") : (isAr ? "حفظ التكليف" : "Confirm Handover")}
                </button>
              </form>
            ) : request.assigned_to ? (
              <div className="flex items-center gap-3 text-xs">
                <div className="w-10 h-10 rounded-2xl bg-brand-terracotta/15 text-brand-terracotta font-serif font-bold flex items-center justify-center text-sm">
                  {request.assigned_to.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="font-bold text-brand-brown block">{request.assigned_to.name}</span>
                  <span className="font-mono text-[11px] text-brand-brown-muted">{request.assigned_to.email}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 text-xs">
                ⚠️ {isAr ? "هذا الطلب غير مسند لأي منسق حتى الآن." : "This request is currently unassigned."}
              </div>
            )}
          </div>

          {/* Linked Authoritative Booking Card */}
          {request.booking && (
            <div className="bg-emerald-50 rounded-3xl border border-emerald-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  {isAr ? "الحجز الرسمي المعتمد" : "CONVERTED REAL BOOKING"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 uppercase">
                  {request.booking.status}
                </span>
              </div>
              <div>
                <span className="font-mono font-bold text-lg text-emerald-950 block">
                  {request.booking.reference}
                </span>
                <span className="text-xs font-semibold text-emerald-800">
                  {request.booking.formatted_total || `${(request.booking.total_cents / 100).toLocaleString()} EGP`}
                </span>
              </div>
              <Link
                href={`/admin/bookings?search=${request.booking.reference}`}
                className="inline-block mt-2 text-xs font-bold text-emerald-900 underline"
              >
                {isAr ? "عرض تفاصيل الحجز وإدارة السداد →" : "View Booking & Payments →"}
              </Link>
            </div>
          )}

          {/* Logistics & Request Specs */}
          <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-3 text-xs">
            <h2 className="font-serif text-base font-bold text-brand-brown pb-3 border-b border-brand-border/60">
              {isAr ? "المحددات اللوجستية" : "Logistical Specifications"}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-brown-muted block">
                  {isAr ? "التاريخ المطلوب" : "Date"}
                </span>
                <span className="font-semibold text-brand-brown">
                  {request.requested_date || (isAr ? "مرن / غير محدد" : "Flexible")}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-brand-brown-muted block">
                  {isAr ? "التوقيت المفضل" : "Preferred Time"}
                </span>
                <span className="font-semibold text-brand-brown">
                  {request.preferred_time || (isAr ? "طوال اليوم" : "Anytime")}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-brand-brown-muted block">
                  {isAr ? "عدد الأفراد" : "Guests"}
                </span>
                <span className="font-semibold text-brand-brown">{request.guest_count || 1}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-brand-brown-muted block">
                  {isAr ? "الموقع" : "Location"}
                </span>
                <span className="font-semibold text-brand-brown">{request.location || "El Gouna"}</span>
              </div>
            </div>

            {request.formatted_budget && (
              <div className="pt-3 border-t border-brand-border/60">
                <span className="text-[10px] font-bold uppercase text-brand-brown-muted block">
                  {isAr ? "الميزانية المخصصة للطلب" : "Allocated Customer Budget"}
                </span>
                <span className="font-mono text-sm font-bold text-brand-terracotta">
                  {request.formatted_budget}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Description, Quotes & Realtime Communication Stream */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Overview Description */}
          <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-3">
            <h2 className="font-serif text-base font-bold text-brand-brown">
              {isAr ? "وصف ومواصفات الطلب" : "Request Description & Notes"}
            </h2>
            <p className="text-xs text-brand-brown leading-relaxed whitespace-pre-line bg-brand-sand-light/40 p-4 rounded-2xl border border-brand-border/60">
              {request.description}
            </p>
          </div>

          {/* Authoritative Quotes Section */}
          <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <div>
                <h2 className="font-serif text-base font-bold text-brand-brown">
                  {isAr ? "عروض الأسعار المعتمدة (Authoritative Quotes)" : "Authoritative Custom Quotes"}
                </h2>
                <p className="text-[11px] text-brand-brown-muted font-light">
                  {isAr
                    ? "عروض الأسعار المحسوبة والموثقة من الخادم والتي تتحول مباشرة لحجوزات فعلية."
                    : "Server-calculated quotes ready for customer approval and atomic booking conversion."}
                </p>
              </div>

              <PermissionGuard permission="concierge.quote">
                <button
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition cursor-pointer"
                >
                  + {isAr ? "عرض جديد" : "New Quote"}
                </button>
              </PermissionGuard>
            </div>

            {(!request.quotes || request.quotes.length === 0) ? (
              <div className="p-6 text-center text-xs text-brand-brown-muted italic bg-brand-sand-light/20 rounded-2xl">
                {isAr ? "لم يتم إصدار عروض أسعار لهذا الطلب بعد." : "No quotes generated for this request yet."}
              </div>
            ) : (
              <div className="space-y-4">
                {request.quotes.map((q) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl border border-brand-border bg-white shadow-2xs hover:border-purple-300 transition space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-purple-800 text-sm">{q.quote_number}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            q.status === "accepted"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : q.status === "sent"
                              ? "bg-purple-100 text-purple-800 border border-purple-300"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {q.status}
                        </span>
                      </div>

                      <div className="text-end">
                        <span className="font-mono text-base font-bold text-brand-brown">
                          {q.formatted_total}
                        </span>
                      </div>
                    </div>

                    {/* Items table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-start text-xs">
                        <thead className="bg-brand-sand-light/60 text-brand-brown-muted text-[10px] uppercase">
                          <tr>
                            <th className="py-2 px-3 text-start">{isAr ? "البند والخدمة" : "Service Item"}</th>
                            <th className="py-2 px-3 text-center">{isAr ? "الكمية" : "Qty"}</th>
                            <th className="py-2 px-3 text-end">{isAr ? "سعر الوحدة" : "Unit Price"}</th>
                            <th className="py-2 px-3 text-end">{isAr ? "الإجمالي" : "Total"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/40">
                          {q.items.map((item) => (
                            <tr key={item.id}>
                              <td className="py-2 px-3">
                                <span className="font-semibold text-brand-brown block">{item.title}</span>
                                {item.description && (
                                  <span className="text-[10px] text-brand-brown-muted">{item.description}</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-center font-mono">{item.quantity}</td>
                              <td className="py-2 px-3 text-end font-mono">
                                {item.formatted_unit_price || `${(item.unit_price_cents / 100).toLocaleString()} EGP`}
                              </td>
                              <td className="py-2 px-3 text-end font-mono font-bold">
                                {item.formatted_total_price || `${(item.total_price_cents / 100).toLocaleString()} EGP`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Breakdown & Acceptance Action */}
                    <div className="pt-3 border-t border-brand-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="text-brand-brown-muted text-[11px] space-y-0.5">
                        {q.discount_cents > 0 && (
                          <div>{isAr ? "الخصم الممنوح:" : "Discount:"} -{(q.discount_cents / 100).toLocaleString()} EGP</div>
                        )}
                        {q.fees_cents > 0 && (
                          <div>{isAr ? "الرسوم والخدمات:" : "Fees:"} +{(q.fees_cents / 100).toLocaleString()} EGP</div>
                        )}
                        {q.valid_until && (
                          <div>{isAr ? "صالح حتى:" : "Valid Until:"} {new Date(q.valid_until).toLocaleDateString()}</div>
                        )}
                      </div>

                      {q.status !== "accepted" && !request.booking_id && (
                        <PermissionGuard permission="concierge.quote">
                          <button
                            onClick={() =>
                              setAcceptDialog({
                                isOpen: true,
                                quoteId: q.id,
                                quoteNumber: q.quote_number,
                                loading: false,
                              })
                            }
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                          >
                            ✓ {isAr ? "قبول وتحويل لحجز فوري" : "Accept & Convert to Real Booking"}
                          </button>
                        </PermissionGuard>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Communication Hub: Internal Notes vs Customer Messages */}
          <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("internal")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === "internal"
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "text-brand-brown-muted hover:text-brand-brown"
                  }`}
                >
                  🔒 {isAr ? "ملاحظات داخلية خاصة بالموظفين" : "Private Staff Notes"} ({internalNotes.length})
                </button>
                <button
                  onClick={() => setActiveTab("customer")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === "customer"
                      ? "bg-blue-100 text-blue-900 border border-blue-300"
                      : "text-brand-brown-muted hover:text-brand-brown"
                  }`}
                >
                  💬 {isAr ? "رسائل وتحديثات موجهة للعميل" : "Customer Updates"} ({customerNotes.length})
                </button>
              </div>
            </div>

            {/* Stream */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 gounow-scrollbar">
              {activeTab === "internal" ? (
                internalNotes.length === 0 ? (
                  <p className="text-xs text-brand-brown-muted italic p-4 text-center">
                    {isAr ? "لا توجد ملاحظات داخلية سرية بعد." : "No internal staff notes recorded."}
                  </p>
                ) : (
                  internalNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] text-amber-900">
                        <span className="font-bold">🔒 {note.user_name || "Internal Staff"}</span>
                        <span className="font-mono opacity-75">{new Date(note.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-amber-950 font-normal leading-relaxed whitespace-pre-line">
                        {note.content}
                      </p>
                    </div>
                  ))
                )
              ) : customerNotes.length === 0 ? (
                <p className="text-xs text-brand-brown-muted italic p-4 text-center">
                  {isAr ? "لا توجد رسائل موجهة للعميل مسجلة." : "No customer messages recorded."}
                </p>
              ) : (
                customerNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/60 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-blue-900">
                      <span className="font-bold">💬 {note.user_name || "Concierge Desk"}</span>
                      <span className="font-mono opacity-75">{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-blue-950 font-normal leading-relaxed whitespace-pre-line">
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add note input */}
            <form onSubmit={handleAddNote} className="space-y-3 pt-3 border-t border-brand-border/60">
              <textarea
                required
                rows={2}
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder={
                  activeTab === "internal"
                    ? isAr
                      ? "اكتب ملاحظة داخلية سرية (لن يراها العميل أبداً)..."
                      : "Write private internal note (NEVER visible to customer)..."
                    : isAr
                    ? "اكتب رسالة أو تحديثاً مرئياً للعميل..."
                    : "Write update visible to customer..."
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-terracotta"
              />

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-brand-brown-muted font-medium">
                  {activeTab === "internal"
                    ? isAr ? "🔒 ملاحظة محمية ومخصصة لفريق التشغيل" : "🔒 Staff confidential only"
                    : isAr ? "👁️ مرئية في ملف العميل والتقرير" : "👁️ Visible to client"}
                </span>

                <button
                  type="submit"
                  disabled={isSubmittingNote}
                  className="px-5 py-2 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingNote ? (isAr ? "جارٍ الإرسال..." : "Posting...") : (isAr ? "نشر الملاحظة" : "Post Note")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Quote Builder Modal */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-3xl border border-brand-border p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto gounow-scrollbar animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <div>
                <h3 className="font-serif text-lg font-bold text-brand-brown">
                  {isAr ? "إنشاء وتوثيق عرض سعر رسمي" : "Build Authoritative Custom Quote"}
                </h3>
                <span className="text-xs text-brand-brown-muted font-mono">{request.request_number}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsQuoteModalOpen(false)}
                className="text-brand-brown-muted hover:text-brand-brown cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuoteSubmit} className="space-y-4 text-xs">
              {/* Quote Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-brown uppercase text-[10px] tracking-wider">
                    {isAr ? "بنود العرض والخدمات" : "Quote Line Items"}
                  </span>
                  <button
                    type="button"
                    onClick={handleAddQuoteItem}
                    className="text-purple-700 font-bold hover:underline cursor-pointer"
                  >
                    + {isAr ? "إضافة بند إضافي" : "Add Another Item"}
                  </button>
                </div>

                {quoteItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-2xl bg-brand-sand-light/40 border border-brand-border/60 space-y-2.5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-brown mb-1">
                          {isAr ? "نوع الخدمة" : "Category"}
                        </label>
                        <select
                          value={item.item_type}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuoteItems((prev) =>
                              prev.map((it, i) => (i === index ? { ...it, item_type: val } : it))
                            );
                          }}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-brand-border focus:border-purple-600 focus:outline-none bg-white text-xs"
                        >
                          <option value="yacht">{isAr ? "يخت خاص" : "Yacht Charter"}</option>
                          <option value="package">{isAr ? "باقة جاهزة" : "Package"}</option>
                          <option value="addon">{isAr ? "إضافة (Add-on)" : "Add-on"}</option>
                          <option value="experience">{isAr ? "نشاط وتجربة" : "Experience"}</option>
                          <option value="tickets">{isAr ? "تذاكر فعاليات" : "Tickets"}</option>
                          <option value="custom">{isAr ? "خدمة مخصصة" : "Custom Service"}</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-brand-brown mb-1">
                          {isAr ? "عنوان البند / الخدمة" : "Item Title"} *
                        </label>
                        <input
                          type="text"
                          required
                          value={item.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuoteItems((prev) =>
                              prev.map((it, i) => (i === index ? { ...it, title: val } : it))
                            );
                          }}
                          placeholder={isAr ? "مثال: إيجار يخت 50 قدم لمدة 4 ساعات" : "e.g. 50ft Yacht Charter (4 hrs)"}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-brand-border focus:border-purple-600 focus:outline-none text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-20">
                          <label className="block text-[10px] font-bold text-brand-brown mb-1">
                            {isAr ? "الكمية" : "Qty"}
                          </label>
                          <input
                            type="number"
                            min={1}
                            required
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              setQuoteItems((prev) =>
                                prev.map((it, i) => (i === index ? { ...it, quantity: val } : it))
                              );
                            }}
                            className="w-full px-2 py-1.5 rounded-xl border border-brand-border focus:border-purple-600 focus:outline-none text-xs text-center"
                          />
                        </div>

                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-brand-brown mb-1">
                            {isAr ? "سعر الوحدة" : "Unit (EGP)"}
                          </label>
                          <input
                            type="number"
                            min={0}
                            step="any"
                            required
                            value={item.unit_price}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setQuoteItems((prev) =>
                                prev.map((it, i) => (i === index ? { ...it, unit_price: val } : it))
                              );
                            }}
                            className="w-full px-2 py-1.5 rounded-xl border border-brand-border focus:border-purple-600 focus:outline-none text-xs text-end"
                          />
                        </div>

                        {quoteItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuoteItem(index)}
                            className="mt-4 p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount, Fees & Validity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-brand-border/60">
                <div>
                  <label className="block font-bold text-brand-brown mb-1">
                    {isAr ? "الخصم الممنوح (EGP)" : "Discount (EGP)"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={quoteDiscount}
                    onChange={(e) => setQuoteDiscount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-brown mb-1">
                    {isAr ? "الرسوم الإدارية / الخدمة (EGP)" : "Fees / Surcharge (EGP)"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={quoteFees}
                    onChange={(e) => setQuoteFees(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-brown mb-1">
                    {isAr ? "صلاحية العرض حتى" : "Valid Until Date"}
                  </label>
                  <input
                    type="date"
                    value={quoteValidUntil}
                    onChange={(e) => setQuoteValidUntil(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-brand-brown mb-1">
                  {isAr ? "شروط وملاحظات العرض (Quote Notes)" : "Quote Notes & Terms"}
                </label>
                <textarea
                  rows={2}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder={isAr ? "شروط الإلغاء، أو متطلبات الرسو، أو تفاصيل الوجبات..." : "Cancellation policies, arrival dock terms..."}
                  className="w-full px-3.5 py-2 rounded-xl border border-brand-border focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-brown hover:bg-brand-sand-light transition cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuote}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingQuote ? (isAr ? "جارٍ الحساب والتوثيق..." : "Calculating...") : (isAr ? "توثيق وإصدار العرض" : "Issue Authoritative Quote")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accept & Convert Quote Dialog */}
      <ConfirmDialog
        isOpen={acceptDialog.isOpen}
        title={isAr ? "تأكيد قبول العرض والتحويل لحجز فعلي" : "Accept Quote & Convert to Real Booking"}
        description={
          isAr
            ? `سيقوم النظام بإعادة التحقق من التوافر وتوثيق حجز حقيقي مؤكد لعرض السعر "${acceptDialog.quoteNumber}". هل ترغب في المتابعة؟`
            : `System will revalidate availability with concurrency locks and convert quote "${acceptDialog.quoteNumber}" into an authoritative platform Booking. Proceed?`
        }
        confirmText={isAr ? "تأكيد وتحويل الحجز" : "Accept & Convert"}
        cancelText={isAr ? "إلغاء" : "Cancel"}
        isLoading={acceptDialog.loading}
        onConfirm={handleAcceptQuoteConfirm}
        onCancel={() => setAcceptDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
