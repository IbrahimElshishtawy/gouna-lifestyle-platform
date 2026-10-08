"use client";

import React, { useEffect, useState } from "react";
import {
  getAdminStaff,
  createAdminStaff,
  updateAdminStaff,
  deleteAdminStaff,
  suspendAdminStaff,
  reactivateAdminStaff,
  forceLogoutAdminStaff,
} from "@/features/admin/services/admin.api";
import type { AdminStaffItem, AdminRoleItem } from "@/features/admin/types";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PermissionGuard from "@/components/ui/PermissionGuard";

const SCOPES = [
  { value: "all", labelEn: "All Domains (Global)", labelAr: "كافة القطاعات (شامل)" },
  { value: "properties", labelEn: "Properties & Stays", labelAr: "العقارات والإقامات" },
  { value: "yachts", labelEn: "Yachts & Charters", labelAr: "اليخوت والرحلات البحرية" },
  { value: "experiences", labelEn: "Experiences & Safari", labelAr: "الأنشطة والتجارب" },
  { value: "events", labelEn: "Events & Ticketing", labelAr: "الفعاليات والتذاكر" },
  { value: "concierge", labelEn: "VIP Concierge", labelAr: "الكونسيرج والخدمات الخاصة" },
  { value: "finance", labelEn: "Finances & Payouts", labelAr: "المالية والمدفوعات" },
];

export default function AdminUsersPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [staff, setStaff] = useState<AdminStaffItem[]>([]);
  const [roles, setRoles] = useState<AdminRoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [scopeFilter, setScopeFilter] = useState("");

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "admin",
    scope: "all",
  });

  // Edit Modal State
  const [editingStaff, setEditingStaff] = useState<AdminStaffItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    role: "",
    scope: "all",
  });

  const [submitting, setSubmitting] = useState(false);

  // Dialog state for destructive actions
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    type: "delete" | "suspend" | "reactivate" | "force_logout";
    user: AdminStaffItem | null;
    loading: boolean;
    reason?: string;
  }>({
    isOpen: false,
    type: "delete",
    user: null,
    loading: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAdminStaff({
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        scope: scopeFilter || undefined,
      });
      setStaff(res.staff || []);
      setRoles(res.roles || []);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر تحميل بيانات فريق المشرفين." : "Failed to load staff list."),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [roleFilter, statusFilter, scopeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      await createAdminStaff(createForm);
      setFeedback({
        type: "success",
        message: isAr
          ? `تم إنشاء حساب المشرف ${createForm.name} بنجاح.`
          : `Staff member ${createForm.name} created successfully.`,
      });
      setShowCreateModal(false);
      setCreateForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: roles[0]?.name || "admin",
        scope: "all",
      });
      await fetchData();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر إنشاء الحساب." : "Failed to create staff member."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (u: AdminStaffItem) => {
    setEditingStaff(u);
    setEditForm({
      name: u.name,
      phone: u.phone || "",
      role: u.roles[0] || "admin",
      scope: u.scope || "all",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      await updateAdminStaff(editingStaff.id, {
        name: editForm.name,
        phone: editForm.phone,
        roles: [editForm.role],
        scope: editForm.scope,
      });
      setFeedback({
        type: "success",
        message: isAr
          ? `تم تحديث بيانات وصلاحيات المشرف ${editForm.name} بنجاح.`
          : `Staff member ${editForm.name} updated successfully.`,
      });
      setEditingStaff(null);
      await fetchData();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر تحديث الحساب." : "Failed to update staff member."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleActionConfirm = async () => {
    if (!actionDialog.user) return;
    setActionDialog((prev) => ({ ...prev, loading: true }));
    setFeedback(null);

    const { type, user } = actionDialog;

    try {
      if (type === "delete") {
        await deleteAdminStaff(user.id);
        setFeedback({
          type: "success",
          message: isAr ? `تم حذف حساب المشرف ${user.name} بنجاح.` : `Account for ${user.name} deleted.`,
        });
      } else if (type === "suspend") {
        await suspendAdminStaff(user.id, actionDialog.reason || "Administrative suspension");
        setFeedback({
          type: "success",
          message: isAr ? `تم تجميد حساب المشرف ${user.name} ومنع وصوله للنظام.` : `Account for ${user.name} has been suspended.`,
        });
      } else if (type === "reactivate") {
        await reactivateAdminStaff(user.id);
        setFeedback({
          type: "success",
          message: isAr ? `تمت إعادة تفعيل حساب المشرف ${user.name}.` : `Account for ${user.name} has been reactivated.`,
        });
      } else if (type === "force_logout") {
        await forceLogoutAdminStaff(user.id);
        setFeedback({
          type: "success",
          message: isAr ? `تم إنهاء كافة جلسات المشرف ${user.name} فوراً.` : `All active sessions for ${user.name} terminated.`,
        });
      }

      setActionDialog((prev) => ({ ...prev, isOpen: false }));
      await fetchData();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر تنفيذ الإجراء المطلوب." : "Failed to perform requested action."),
      });
    } finally {
      setActionDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const twoFactorCount = staff.filter((s) => s.two_factor_enabled).length;
  const twoFactorPercent = staff.length > 0 ? Math.round((twoFactorCount / staff.length) * 100) : 0;
  const superAdminCount = staff.filter((s) => s.roles.includes("super_admin")).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-brand-terracotta animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-terracotta font-bold">
              {isAr ? "إدارة فريق العمل التنفيذي" : "STAFF DIRECTORY & SCOPES"}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown">
            {isAr ? "إدارة المشرفين والقطاعات" : "Admin Staff & Domain Scopes"}
          </h1>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "التحكم في حسابات فريق الإدارة، وتعيين نطاقات العمل (Scopes) والأدوار، وإدارة الجلسات والأمان."
              : "Manage executive accounts, enforce domain scopes, control operational roles, and manage active sessions."}
          </p>
        </div>

        <PermissionGuard permission="admins.create">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer shrink-0"
          >
            <span>+</span>
            <span>{isAr ? "إضافة مشرف جديد" : "Add Administrator"}</span>
          </button>
        </PermissionGuard>
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-1">
            {isAr ? "إجمالي المشرفين" : "Total Staff Members"}
          </span>
          <span className="text-2xl sm:text-3xl font-serif font-bold text-brand-brown">
            {staff.length}{" "}
            <span className="text-xs font-sans font-normal text-brand-brown-muted">
              {isAr ? "حساب" : "Personnel"}
            </span>
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-1">
            {isAr ? "حماية المصادقة الثنائية (2FA)" : "Two-Factor Security"}
          </span>
          <span className="text-2xl sm:text-3xl font-serif font-bold text-emerald-600">
            {twoFactorPercent}%{" "}
            <span className="text-xs font-sans font-normal text-brand-brown-muted">
              ({twoFactorCount} of {staff.length})
            </span>
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-1">
            {isAr ? "صلاحيات الوصول المطلق" : "Root Super Admins"}
          </span>
          <span className="text-2xl sm:text-3xl font-serif font-bold text-brand-brown">
            {superAdminCount}{" "}
            <span className="text-xs font-sans font-normal text-brand-brown-muted">
              {isAr ? "سوبر أدمن" : "Master Keys"}
            </span>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <input
            type="text"
            placeholder={isAr ? "البحث بالاسم أو البريد الإلكتروني..." : "Search by name or email..."}
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
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-brand-border text-xs bg-white text-brand-brown focus:outline-none focus:border-brand-terracotta"
          >
            <option value="">{isAr ? "كافة الأدوار" : "All Roles"}</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.display_name}
              </option>
            ))}
          </select>

          {/* Scope Filter */}
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-brand-border text-xs bg-white text-brand-brown focus:outline-none focus:border-brand-terracotta"
          >
            <option value="">{isAr ? "كافة القطاعات (Scopes)" : "All Scopes"}</option>
            {SCOPES.map((sc) => (
              <option key={sc.value} value={sc.value}>
                {isAr ? sc.labelAr : sc.labelEn}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-brand-border text-xs bg-white text-brand-brown focus:outline-none focus:border-brand-terracotta"
          >
            <option value="">{isAr ? "كافة الحالات" : "All Statuses"}</option>
            <option value="active">{isAr ? "نشط" : "Active"}</option>
            <option value="suspended">{isAr ? "معطل / مجمّد" : "Suspended"}</option>
          </select>

          {(search || roleFilter || statusFilter || scopeFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("");
                setStatusFilter("");
                setScopeFilter("");
              }}
              className="px-3 py-2 text-xs font-bold text-brand-brown-muted hover:text-brand-terracotta cursor-pointer"
            >
              {isAr ? "إعادة ضبط" : "Reset"}
            </button>
          )}
        </div>
      </div>

      {/* Staff Table Card */}
      {loading ? (
        <LoadingState message={isAr ? "جارٍ تحميل قائمة المشرفين..." : "Loading staff directory..."} rows={4} />
      ) : staff.length === 0 ? (
        <div className="bg-white rounded-3xl border border-brand-border p-12 text-center shadow-xs">
          <p className="text-sm font-semibold text-brand-brown">
            {isAr ? "لم يتم العثور على أي مشرفين وفقاً لخيارات التصفية." : "No staff members found matching the filters."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-brand-sand-light/60 text-brand-brown-muted font-bold text-[10px] uppercase tracking-wider border-b border-brand-border">
                <tr>
                  <th className="py-3.5 px-4 text-start">{isAr ? "المشرف / الحساب" : "Personnel"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "الدور والصلاحية" : "Role"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "نطاق القطاع (Scope)" : "Domain Scope"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "الأمان (2FA)" : "Security"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "آخر تسجيل دخول" : "Last Login"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "الحالة" : "Status"}</th>
                  <th className="py-3.5 px-4 text-end">{isAr ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {staff.map((u) => {
                  const isSuperAdmin = u.roles.includes("super_admin");
                  const scopeObj = SCOPES.find((s) => s.value === (u.scope || "all"));

                  return (
                    <tr key={u.id} className="hover:bg-brand-sand/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-terracotta/15 text-brand-terracotta font-serif font-bold flex items-center justify-center text-xs">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-brand-brown block">{u.name}</span>
                            <span className="text-[11px] text-brand-brown-muted font-mono" dir="ltr">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r) => (
                            <span
                              key={r}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                r === "super_admin"
                                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                                  : "bg-stone-100 text-stone-800 border border-stone-200"
                              }`}
                            >
                              {r.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-brand-sand text-brand-brown border border-brand-border">
                          {isAr ? scopeObj?.labelAr : scopeObj?.labelEn}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {u.two_factor_enabled ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            <span>{isAr ? "مفعل (2FA)" : "2FA Active"}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            <span>{isAr ? "قياسي" : "Standard"}</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-mono text-[11px] text-brand-brown-muted" dir="ltr">
                        {u.last_login_at ? (
                          <div>
                            <div>{new Date(u.last_login_at).toLocaleDateString()}</div>
                            <div className="text-[10px] opacity-75">{u.last_login_ip || "Direct"}</div>
                          </div>
                        ) : (
                          <span className="opacity-50">Never</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            u.is_active
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-rose-100 text-rose-800 border-rose-300"
                          }`}
                        >
                          {u.is_active ? (isAr ? "نشط" : "ACTIVE") : (isAr ? "معطل / مجمّد" : "SUSPENDED")}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(u)}
                            className="px-2.5 py-1 rounded-lg bg-brand-sand-light hover:bg-brand-sand text-brand-brown text-[11px] font-semibold transition cursor-pointer"
                          >
                            {isAr ? "تعديل" : "Edit"}
                          </button>

                          {/* Suspend or Reactivate */}
                          {u.is_active ? (
                            <button
                              disabled={isSuperAdmin && superAdminCount <= 1}
                              onClick={() =>
                                setActionDialog({
                                  isOpen: true,
                                  type: "suspend",
                                  user: u,
                                  loading: false,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-semibold transition cursor-pointer disabled:opacity-40"
                              title={isSuperAdmin && superAdminCount <= 1 ? "Cannot suspend last super admin" : undefined}
                            >
                              {isAr ? "تجميد" : "Suspend"}
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                setActionDialog({
                                  isOpen: true,
                                  type: "reactivate",
                                  user: u,
                                  loading: false,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-semibold transition cursor-pointer"
                            >
                              {isAr ? "تفعيل" : "Reactivate"}
                            </button>
                          )}

                          {/* Force Logout */}
                          <button
                            onClick={() =>
                              setActionDialog({
                                isOpen: true,
                                type: "force_logout",
                                user: u,
                                loading: false,
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 text-[11px] font-semibold transition cursor-pointer"
                            title={isAr ? "إنهاء الجلسات فوراً" : "Force Logout"}
                          >
                            {isAr ? "تسجيل خروج" : "Logout"}
                          </button>

                          {/* Delete */}
                          <button
                            disabled={isSuperAdmin && superAdminCount <= 1}
                            onClick={() =>
                              setActionDialog({
                                isOpen: true,
                                type: "delete",
                                user: u,
                                loading: false,
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-white border border-brand-border text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-[11px] font-semibold transition cursor-pointer disabled:opacity-40"
                          >
                            {isAr ? "حذف" : "Delete"}
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

      {/* Create Staff Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-brand-border p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <h3 className="font-serif text-lg font-bold text-brand-brown">
                {isAr ? "إضافة مشرف جديد للنظام" : "Add Administrator Account"}
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-brand-brown-muted hover:text-brand-brown cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-brand-brown mb-1">
                  {isAr ? "الاسم الكامل" : "Full Name"} *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none"
                  placeholder="e.g. Karim Hassan"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-brown mb-1">
                  {isAr ? "البريد الإلكتروني" : "Email Address"} *
                </label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none"
                  placeholder="karim@gounow.com"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-brown mb-1">
                  {isAr ? "رقم الهاتف" : "Phone Number"}
                </label>
                <input
                  type="text"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none"
                  placeholder="+20 100 123 4567"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-brown mb-1">
                  {isAr ? "كلمة المرور الابتدائية" : "Initial Password"} *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none"
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-brand-brown mb-1">
                    {isAr ? "الدور الإداري والصلاحيات" : "Assigned Role"} *
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none bg-white"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-brand-brown mb-1">
                    {isAr ? "نطاق القطاع (Scope)" : "Domain Scope"} *
                  </label>
                  <select
                    value={createForm.scope}
                    onChange={(e) => setCreateForm({ ...createForm, scope: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none bg-white"
                  >
                    {SCOPES.map((sc) => (
                      <option key={sc.value} value={sc.value}>
                        {isAr ? sc.labelAr : sc.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-brown hover:bg-brand-sand-light transition cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-terracotta hover:bg-brand-terracotta-dark text-white transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (isAr ? "جارٍ الإنشاء..." : "Creating...") : (isAr ? "إنشاء الحساب" : "Create Account")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-brand-border p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <div>
                <h3 className="font-serif text-lg font-bold text-brand-brown">
                  {isAr ? `تعديل المشرف: ${editingStaff.name}` : `Edit Staff: ${editingStaff.name}`}
                </h3>
                <span className="text-[11px] font-mono text-brand-brown-muted">{editingStaff.email}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="text-brand-brown-muted hover:text-brand-brown cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-brand-brown mb-1">
                  {isAr ? "الاسم الكامل" : "Full Name"} *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-brown mb-1">
                  {isAr ? "رقم الهاتف" : "Phone Number"}
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-brand-brown mb-1">
                    {isAr ? "الدور الإداري والصلاحيات" : "Assigned Role"} *
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none bg-white"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-brand-brown mb-1">
                    {isAr ? "نطاق القطاع (Scope)" : "Domain Scope"} *
                  </label>
                  <select
                    value={editForm.scope}
                    onChange={(e) => setEditForm({ ...editForm, scope: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none bg-white"
                  >
                    {SCOPES.map((sc) => (
                      <option key={sc.value} value={sc.value}>
                        {isAr ? sc.labelAr : sc.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-brown hover:bg-brand-sand-light transition cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-terracotta hover:bg-brand-terracotta-dark text-white transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (isAr ? "جارٍ الحفظ..." : "Saving...") : (isAr ? "حفظ التغييرات" : "Save Changes")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Dialog (Delete, Suspend, Reactivate, Force Logout) */}
      <ConfirmDialog
        isOpen={actionDialog.isOpen}
        title={
          actionDialog.type === "delete"
            ? isAr ? "حذف حساب المشرف" : "Delete Staff Member"
            : actionDialog.type === "suspend"
            ? isAr ? "تجميد حساب المشرف" : "Suspend Staff Member"
            : actionDialog.type === "reactivate"
            ? isAr ? "إعادة تفعيل الحساب" : "Reactivate Staff Member"
            : isAr ? "إنهاء الجلسات فوراً" : "Force Logout & End Sessions"
        }
        description={
          actionDialog.user
            ? actionDialog.type === "delete"
              ? isAr ? `هل أنت متأكد من حذف حساب ${actionDialog.user.name}؟ هذا الإجراء نهائي ولا يمكن التراجع عنه.` : `Are you sure you want to permanently delete ${actionDialog.user.name}?`
              : actionDialog.type === "suspend"
              ? isAr ? `سيتم تعليق وصول ${actionDialog.user.name} لكافة لوحات التحكم والعمليات فوراً.` : `This will suspend access for ${actionDialog.user.name} immediately.`
              : actionDialog.type === "reactivate"
              ? isAr ? `سيتم إعادة تفعيل صلاحيات ${actionDialog.user.name} للسماح له بالدخول.` : `This will restore access for ${actionDialog.user.name}.`
              : isAr ? `سيتم إلغاء كافة التوكنات النشطة وجلسات ${actionDialog.user.name} وإجباره على تسجيل الدخول مجدداً.` : `This will terminate all active tokens and sessions for ${actionDialog.user.name}.`
            : ""
        }
        confirmText={
          actionDialog.type === "delete"
            ? isAr ? "نعم، حذف الحساب" : "Yes, Delete"
            : actionDialog.type === "suspend"
            ? isAr ? "تجميد الحساب" : "Suspend Account"
            : actionDialog.type === "reactivate"
            ? isAr ? "تفعيل الحساب" : "Reactivate Account"
            : isAr ? "تسجيل خروج إجباري" : "Force Logout"
        }
        cancelText={isAr ? "إلغاء" : "Cancel"}
        isDestructive={actionDialog.type === "delete" || actionDialog.type === "suspend"}
        isLoading={actionDialog.loading}
        onConfirm={handleActionConfirm}
        onCancel={() => setActionDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
