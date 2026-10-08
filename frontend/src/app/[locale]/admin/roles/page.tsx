"use client";

import React, { useEffect, useState } from "react";
import {
  getAdminRoles,
  getAdminPermissionsGrouped,
  createAdminRole,
  updateAdminRole,
  deleteAdminRole,
} from "@/features/admin/services/admin.api";
import type { AdminRoleItem, GroupedPermissionsMap } from "@/features/admin/types";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PermissionGuard from "@/components/ui/PermissionGuard";

export default function AdminRolesPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [roles, setRoles] = useState<AdminRoleItem[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissionsMap>({});
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal / Drawer state for Create & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminRoleItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formDisplayName, setFormDisplayName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    roleId: number | null;
    roleName: string;
    loading: boolean;
  }>({
    isOpen: false,
    roleId: null,
    roleName: "",
    loading: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        getAdminRoles(),
        getAdminPermissionsGrouped().catch(() => ({})),
      ]);
      setRoles(rolesRes || []);
      setGroupedPermissions(permsRes || {});
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر تحميل بيانات الأدوار والصلاحيات." : "Failed to load roles and permissions."),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingRole(null);
    setFormName("");
    setFormDisplayName("");
    setFormDescription("");
    setSelectedPermissions([]);
    setIsModalOpen(true);
  };

  const openEditModal = (role: AdminRoleItem) => {
    setEditingRole(role);
    setFormName(role.name);
    setFormDisplayName(role.display_name || role.name);
    setFormDescription(role.description || "");
    setSelectedPermissions(role.permissions || []);
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permissionName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionName)
        ? prev.filter((p) => p !== permissionName)
        : [...prev, permissionName]
    );
  };

  const handleToggleGroup = (groupPerms: Array<{ name: string }>) => {
    const groupPermNames = groupPerms.map((p) => p.name);
    const allSelected = groupPermNames.every((p) => selectedPermissions.includes(p));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !groupPermNames.includes(p)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...groupPermNames])));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      if (editingRole) {
        await updateAdminRole(editingRole.id, {
          display_name: formDisplayName,
          description: formDescription,
          permissions: selectedPermissions,
        });
        setFeedback({
          type: "success",
          message: isAr
            ? `تم تحديث الدور "${formDisplayName}" ومصفوفة صلاحياته بنجاح.`
            : `Role "${formDisplayName}" and its permission matrix updated successfully.`,
        });
      } else {
        await createAdminRole({
          name: formName.trim().toLowerCase().replace(/\s+/g, "_"),
          display_name: formDisplayName,
          description: formDescription,
          permissions: selectedPermissions,
        });
        setFeedback({
          type: "success",
          message: isAr
            ? `تم إنشاء الدور الجديد "${formDisplayName}" بنجاح.`
            : `Role "${formDisplayName}" created successfully.`,
        });
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر حفظ الدور." : "Failed to save role."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.roleId) return;
    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    setFeedback(null);

    try {
      await deleteAdminRole(deleteDialog.roleId);
      setFeedback({
        type: "success",
        message: isAr ? "تم حذف الدور بنجاح." : "Role deleted successfully.",
      });
      setDeleteDialog((prev) => ({ ...prev, isOpen: false }));
      await fetchData();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر حذف الدور." : "Failed to delete role."),
      });
    } finally {
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
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
              {isAr ? "نظام الصلاحيات والحماية" : "RBAC & ACCESS CONTROL MATRIX"}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown">
            {isAr ? "الأدوار ومصفوفة الصلاحيات" : "Roles & Permission Matrix"}
          </h1>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "إدارة الأدوار التنفيذية، وتوزيع الصلاحيات الحبيبية (Granular Permissions) على المشرفين وفرق العمل."
              : "Manage operational roles and assign granular domain permissions across admin staff and service modules."}
          </p>
        </div>

        <PermissionGuard permission="roles.create">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <span>+</span>
            <span>{isAr ? "إنشاء دور جديد" : "Create New Role"}</span>
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

      {/* Roles Grid */}
      {loading ? (
        <LoadingState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => {
            const isSuperAdmin = role.name === "super_admin";
            const permCount = role.permissions?.length || role.permissions_count || 0;

            return (
              <div
                key={role.id}
                className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        isSuperAdmin
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : role.is_system
                          ? "bg-blue-50 text-blue-800 border border-blue-200"
                          : "bg-brand-sand text-brand-brown"
                      }`}
                    >
                      {isSuperAdmin
                        ? isAr
                          ? "سوبر أدمن"
                          : "Super Admin"
                        : role.is_system
                        ? isAr
                          ? "دور نظامي"
                          : "System Role"
                        : isAr
                        ? "دور مخصص"
                        : "Custom Role"}
                    </span>
                    <span className="text-xs font-mono text-brand-brown-muted">
                      #{role.name}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-brand-brown">
                    {role.display_name || role.name}
                  </h3>
                  <p className="text-xs text-brand-brown-muted mt-1.5 min-h-[36px] line-clamp-2">
                    {role.description || (isAr ? "لا يوجد وصف مدخل لهذا الدور." : "No description provided.")}
                  </p>

                  <div className="mt-4 pt-4 border-t border-brand-border/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-brand-brown-muted">
                        {isAr ? "المستخدمون" : "Staff Assigned"}
                      </span>
                      <span className="font-bold text-brand-brown">
                        {role.users_count !== undefined ? role.users_count : 0} {isAr ? "مشرف" : "Staff"}
                      </span>
                    </div>
                    <div className="text-end">
                      <span className="block text-[10px] uppercase font-bold text-brand-brown-muted">
                        {isAr ? "الصلاحيات" : "Permissions"}
                      </span>
                      <span className="font-bold text-brand-terracotta">
                        {isSuperAdmin ? (isAr ? "كافة الصلاحيات (All)" : "Full Wildcard (*)") : `${permCount} ${isAr ? "صلاحية" : "Perms"}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-brand-border flex items-center justify-between">
                  <button
                    onClick={() => openEditModal(role)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-brand-terracotta hover:bg-brand-sand/50 transition cursor-pointer"
                  >
                    {isAr ? "تعديل الصلاحيات" : "Edit Permissions"}
                  </button>

                  {!role.is_system && !isSuperAdmin && (
                    <button
                      onClick={() =>
                        setDeleteDialog({
                          isOpen: true,
                          roleId: role.id,
                          roleName: role.display_name || role.name,
                          loading: false,
                        })
                      }
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      {isAr ? "حذف" : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-brand-border animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-brand-border flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-brand-brown">
                  {editingRole
                    ? isAr
                      ? `تعديل الدور: ${editingRole.display_name || editingRole.name}`
                      : `Edit Role: ${editingRole.display_name || editingRole.name}`
                    : isAr
                    ? "إنشاء دور تنفيذي جديد"
                    : "Create Operational Role"}
                </h2>
                <p className="text-xs text-brand-brown-muted mt-1 font-light">
                  {isAr
                    ? "حدد تفاصيل الدور ومصفوفة الصلاحيات الممنوحة لهذا المستوى."
                    : "Configure role specifications and granular domain permissions."}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-brand-brown-muted hover:text-brand-brown cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-6 gounow-scrollbar">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {!editingRole && (
                    <div>
                      <label className="block text-xs font-bold text-brand-brown mb-1.5">
                        {isAr ? "المعرف الفريد (Slug)" : "Unique Identifier (Slug)"} *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. yacht_operations_lead"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-terracotta font-mono"
                      />
                    </div>
                  )}

                  <div className={editingRole ? "sm:col-span-2" : ""}>
                    <label className="block text-xs font-bold text-brand-brown mb-1.5">
                      {isAr ? "الاسم المعروض (Display Name)" : "Display Name"} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isAr ? "مثال: مسؤول حجوزات اليخوت" : "e.g. Yacht Charter Specialist"}
                      value={formDisplayName}
                      onChange={(e) => setFormDisplayName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-terracotta"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-brown mb-1.5">
                    {isAr ? "الوصف والمهام" : "Description & Scope"}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={isAr ? "اكتب نبذة عن صلاحيات ومهام هذا الدور..." : "Brief overview of responsibilities and scope..."}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-terracotta"
                  />
                </div>

                {/* Grouped Permission Matrix */}
                <div className="border-t border-brand-border pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-serif text-sm font-bold text-brand-brown">
                        {isAr ? "مصفوفة الصلاحيات الحبيبية (Grouped Permissions)" : "Grouped Permission Matrix"}
                      </h3>
                      <p className="text-[11px] text-brand-brown-muted">
                        {isAr
                          ? `تم تحديد ${selectedPermissions.length} صلاحية لهذا الدور.`
                          : `${selectedPermissions.length} permissions currently selected.`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          const allNames = Object.values(groupedPermissions).flatMap((group) => group.map((p) => p.name));
                          setSelectedPermissions(Array.from(new Set(allNames)));
                        }}
                        className="text-brand-terracotta hover:underline font-bold cursor-pointer"
                      >
                        {isAr ? "تحديد الكل" : "Select All"}
                      </button>
                      <span className="text-brand-border">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedPermissions([])}
                        className="text-brand-brown-muted hover:underline cursor-pointer"
                      >
                        {isAr ? "إلغاء التحديد" : "Deselect All"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(groupedPermissions).map(([groupKey, perms]) => {
                      const allInGroupSelected = perms.every((p) => selectedPermissions.includes(p.name));
                      const someInGroupSelected = perms.some((p) => selectedPermissions.includes(p.name));

                      return (
                        <div
                          key={groupKey}
                          className="bg-brand-sand-light/40 rounded-2xl border border-brand-border p-4"
                        >
                          <div className="flex items-center justify-between pb-3 border-b border-brand-border/60 mb-3">
                            <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-brown">
                              {groupKey.toUpperCase()}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleGroup(perms)}
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition cursor-pointer ${
                                allInGroupSelected
                                  ? "bg-brand-terracotta text-white"
                                  : someInGroupSelected
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-white border border-brand-border text-brand-brown-muted"
                              }`}
                            >
                              {allInGroupSelected
                                ? isAr
                                  ? "محدد بالكامل ✓"
                                  : "All Selected ✓"
                                : isAr
                                ? "تحديد المجموعة"
                                : "Toggle Group"}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {perms.map((perm) => {
                              const checked = selectedPermissions.includes(perm.name);
                              return (
                                <label
                                  key={perm.name}
                                  className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition ${
                                    checked
                                      ? "bg-white border-brand-terracotta/60 shadow-2xs"
                                      : "bg-white/60 border-brand-border hover:bg-white"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => handleTogglePermission(perm.name)}
                                    className="mt-0.5 rounded border-brand-border text-brand-terracotta focus:ring-brand-terracotta"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <span className="block font-medium text-brand-brown truncate">
                                      {perm.display_name || perm.name}
                                    </span>
                                    <span className="block font-mono text-[10px] text-brand-brown-muted/80 truncate">
                                      {perm.name}
                                    </span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-brand-border flex items-center justify-end gap-3 bg-brand-sand-light/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-brand-border text-xs font-bold text-brand-brown hover:bg-brand-sand/50 transition cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting
                    ? isAr
                      ? "جارٍ الحفظ..."
                      : "Saving..."
                    : isAr
                    ? "حفظ الدور والصلاحيات"
                    : "Save Role & Permissions"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={isAr ? "تأكيد حذف الدور" : "Confirm Role Deletion"}
        description={
          isAr
            ? `هل أنت متأكد من رغبتك في حذف الدور "${deleteDialog.roleName}"؟ لن تتمكن من الحذف إذا كان هناك مشرفون نشطون مسندون لهذا الدور.`
            : `Are you sure you want to delete role "${deleteDialog.roleName}"? Role cannot be deleted if active staff members are assigned.`
        }
        confirmText={isAr ? "نعم، حذف الدور" : "Yes, Delete Role"}
        cancelText={isAr ? "إلغاء" : "Cancel"}
        isDestructive={true}
        isLoading={deleteDialog.loading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
