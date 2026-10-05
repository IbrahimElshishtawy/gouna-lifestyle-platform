"use client";

import React, { useEffect, useState } from "react";
import { getAdminStaff, createAdminStaff, deleteAdminStaff } from "@/features/admin/services/admin.api";
import type { AdminStaffItem, AdminRoleItem } from "@/features/admin/types";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PermissionGuard from "@/components/ui/PermissionGuard";

export default function AdminUsersPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [staff, setStaff] = useState<AdminStaffItem[]>([]);
  const [roles, setRoles] = useState<AdminRoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Create Staff Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "admin",
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    userId: number | null;
    userName: string;
    loading: boolean;
  }>({
    isOpen: false,
    userId: null,
    userName: "",
    loading: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAdminStaff();
      setStaff(res.staff);
      setRoles(res.roles);
    } catch {
      setStaff([]);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      setCreateForm({ name: "", email: "", password: "", phone: "", role: roles[0]?.name || "admin" });
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

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.userId) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    setFeedback(null);

    try {
      await deleteAdminStaff(deleteDialog.userId);
      setFeedback({
        type: "success",
        message: isAr ? "تم حذف حساب المشرف بنجاح." : "Staff member deleted successfully.",
      });
      setDeleteDialog((prev) => ({ ...prev, isOpen: false }));
      await fetchData();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر حذف الحساب." : "Failed to delete account."),
      });
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
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
              {isAr ? "تحكم السوبر أدمن الحصري" : "SUPER ADMIN EXCLUSIVE"}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown">
            {isAr ? "إدارة المشرفين وصلاحيات النظام" : "Staff & Administrative Roles"}
          </h1>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "التحكم في حسابات مديري الأقسام، وتعيين الصلاحيات، وإدارة مفاتيح الأمان والوصول."
              : "Manage executive accounts, assign department permissions, and audit authentication security."}
          </p>
        </div>

        <PermissionGuard permission="manage_users">
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

      {/* Feedback Alert */}
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

      {/* Staff Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-1">
            {isAr ? "إجمالي المشرفين النشطين" : "Active Staff Members"}
          </span>
          <span className="text-2xl sm:text-3xl font-serif font-bold text-brand-brown">
            {staff.length}{" "}
            <span className="text-xs font-sans font-normal text-brand-brown-muted">
              {isAr ? "حسابات معتمدة" : "Accounts"}
            </span>
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-1">
            {isAr ? "حماية المصادقة الثنائية (2FA)" : "Two-Factor Enforcement"}
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
              {isAr ? "المدير العام" : "Primary Key"}
            </span>
          </span>
        </div>
      </div>

      {/* Staff Table Card */}
      {loading ? (
        <LoadingState message={isAr ? "جارٍ تحميل قائمة المشرفين..." : "Loading staff directory..."} rows={4} />
      ) : (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-brand-border flex items-center justify-between">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-brand-brown">
              {isAr ? "قائمة فريق الإدارة والتشغيل" : "Authorized Personnel"}
            </h2>
            <span className="text-xs text-brand-brown-muted font-light">
              {isAr ? "محدث لحظياً" : "Realtime Active Directory"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-brand-sand-light/60 text-brand-brown-muted font-bold text-[10px] uppercase tracking-wider border-b border-brand-border">
                <tr>
                  <th className="py-3.5 px-4 text-start">{isAr ? "المشرف / الحساب" : "Personnel"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "الدور والصلاحية" : "Role & Department"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "الأمان (2FA)" : "Security"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "آخر تسجيل دخول" : "Last Login Activity"}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? "الحالة" : "Status"}</th>
                  <th className="py-3.5 px-4 text-end">{isAr ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {staff.map((u) => (
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
                            {r.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {u.two_factor_enabled ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          <span>{isAr ? "مفعل (TOTP)" : "2FA Active"}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          <span>{isAr ? "غير مفعل" : "Standard"}</span>
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
                        {u.is_active ? (isAr ? "نشط" : "ACTIVE") : (isAr ? "معطل" : "SUSPENDED")}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-end">
                      {u.email !== "superadmin@gounow.com" && (
                        <PermissionGuard permission="manage_users">
                          <button
                            onClick={() =>
                              setDeleteDialog({
                                isOpen: true,
                                userId: u.id,
                                userName: u.name,
                                loading: false,
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-white border border-brand-border text-brand-brown hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-[11px] font-semibold transition cursor-pointer"
                          >
                            {isAr ? "حذف" : "Remove"}
                          </button>
                        </PermissionGuard>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Staff Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-brand-border p-6 shadow-xl space-y-4">
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
                  {isAr ? "الاسم الكامل" : "Full Name"}
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
                  {isAr ? "البريد الإلكتروني" : "Email Address"}
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
                  {isAr ? "كلمة المرور الابتدائية" : "Initial Password"}
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

              <div>
                <label className="block font-bold text-brand-brown mb-1">
                  {isAr ? "الدور الإداري والصلاحيات" : "Assigned Role"}
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-terracotta focus:outline-none bg-white"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.display_name} ({r.permissions_count} permissions)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border/60">
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

      {/* Delete Staff Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={isAr ? "حذف حساب المشرف" : "Revoke Administrator Access"}
        description={
          isAr
            ? `هل أنت متأكد من حذف حساب ${deleteDialog.userName}؟ سيتم إلغاء كافة مفاتيح الوصول فوراً.`
            : `Are you sure you want to revoke access for ${deleteDialog.userName}? All access tokens will be terminated.`
        }
        confirmText={isAr ? "نعم، حذف الحساب" : "Revoke Access"}
        cancelText={isAr ? "تراجع" : "Cancel"}
        isDestructive={true}
        isLoading={deleteDialog.loading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
