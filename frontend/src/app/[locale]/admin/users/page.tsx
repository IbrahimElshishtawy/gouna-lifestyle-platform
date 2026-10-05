import React from "react";
import Link from "next/link";

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminUsersPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const staffMembers = [
    {
      id: 1,
      name: "GouNow Super Admin",
      arabicName: "المدير العام (سوبر أدمن)",
      email: "superadmin@gounow.com",
      role: "Super Admin",
      roleAr: "سوبر أدمن - صلاحيات كاملة",
      department: "Executive Management",
      departmentAr: "الإدارة العليا والتنفيذية",
      status: "Active",
      twoFactor: true,
      lastLogin: "Today, 15:20 (Red Sea Node)",
      lastLoginAr: "اليوم، 15:20 (خادم البحر الأحمر)",
      avatarBg: "bg-[#181311] text-amber-400",
      initials: "SA",
    },
    {
      id: 2,
      name: "Operations Admin",
      arabicName: "مدير العمليات والتشغيل",
      email: "admin@gounow.com",
      role: "Operations Admin",
      roleAr: "مدير العمليات والحجوزات",
      department: "Bookings & Charters",
      departmentAr: "إدارة الحجوزات واليخوت",
      status: "Active",
      twoFactor: true,
      lastLogin: "Yesterday, 19:40",
      lastLoginAr: "أمس، 19:40",
      avatarBg: "bg-brand-terracotta text-white",
      initials: "AD",
    },
    {
      id: 3,
      name: "Portfolio Director",
      arabicName: "مدير المحفظة العقارية",
      email: "sales@gounow.com",
      role: "Real Estate Director",
      roleAr: "مدير مبيعات الفلل والعقارات",
      department: "High-Net-Worth Sales",
      departmentAr: "المبيعات والاستثمار العقاري",
      status: "Active",
      twoFactor: false,
      lastLogin: "Oct 03, 11:15",
      lastLoginAr: "03 أكتوبر، 11:15",
      avatarBg: "bg-stone-700 text-white",
      initials: "RE",
    },
  ];

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
              ? "التحكم في حسابات المديرين، وتعيين الصلاحيات، وإدارة مفاتيح الأمان والوصول."
              : "Manage executive accounts, assign department permissions, and audit authentication security."}
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer shrink-0"
        >
          <span>+</span>
          <span>{isAr ? "إضافة مشرف جديد" : "Add Administrator"}</span>
        </button>
      </div>

      {/* Staff Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-1">
            {isAr ? "إجمالي المشرفين النشطين" : "Active Staff Members"}
          </span>
          <span className="text-2xl sm:text-3xl font-serif font-bold text-brand-brown">
            3 <span className="text-xs font-sans font-normal text-brand-brown-muted">{isAr ? "حسابات معتمدة" : "Accounts"}</span>
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-1">
            {isAr ? "حماية المصادقة الثنائية (2FA)" : "Two-Factor Enforcement"}
          </span>
          <span className="text-2xl sm:text-3xl font-serif font-bold text-emerald-600">
            66.7% <span className="text-xs font-sans font-normal text-brand-brown-muted">(2 of 3)</span>
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted block mb-1">
            {isAr ? "صلاحيات الوصول المطلق" : "Root Super Admins"}
          </span>
          <span className="text-2xl sm:text-3xl font-serif font-bold text-brand-brown">
            1 <span className="text-xs font-sans font-normal text-brand-brown-muted">{isAr ? "المدير العام" : "Primary Key"}</span>
          </span>
        </div>
      </div>

      {/* Staff Table Card */}
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
                <th className="py-3.5 px-4 text-start">{isAr ? "الدور والصلاحية" : "Role"}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? "القسم" : "Department"}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? "المصادقة 2FA" : "2FA Security"}</th>
                <th className="py-3.5 px-4 text-start">{isAr ? "آخر تسجيل دخول" : "Last Session"}</th>
                <th className="py-3.5 px-4 text-end">{isAr ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {staffMembers.map((member) => (
                <tr key={member.id} className="hover:bg-brand-sand/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${member.avatarBg} flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                        {member.initials}
                      </div>
                      <div>
                        <span className="font-bold text-brand-brown block">
                          {isAr ? member.arabicName : member.name}
                        </span>
                        <span className="text-[11px] text-brand-brown-muted font-mono" dir="ltr">
                          {member.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {isAr ? member.roleAr : member.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-brand-brown font-medium">
                    {isAr ? member.departmentAr : member.department}
                  </td>
                  <td className="py-4 px-4">
                    {member.twoFactor ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <span>🛡️</span>
                        <span>{isAr ? "مفعلة ومحمية" : "Enforced"}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                        <span>⚠️</span>
                        <span>{isAr ? "غير مفعلة" : "Pending"}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-[11px] text-brand-brown-muted font-light">
                    {isAr ? member.lastLoginAr : member.lastLogin}
                  </td>
                  <td className="py-4 px-4 text-end">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg border border-brand-border hover:border-brand-terracotta hover:text-brand-terracotta text-brand-brown text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {isAr ? "تعديل الصلاحيات" : "Edit Role"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
