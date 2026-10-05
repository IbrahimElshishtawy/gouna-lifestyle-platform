"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/features/admin/components/AdminSidebar";
import AdminHeader from "@/features/admin/components/AdminHeader";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";

function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoading, user } = useAdminAuth();

  // If on login page, render clean layout without sidebar/header
  if (pathname.endsWith("/admin/login")) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-terracotta/10 border border-brand-terracotta/30 flex items-center justify-center animate-pulse">
          <span className="w-4 h-4 rounded-full bg-brand-terracotta animate-ping"></span>
        </div>
        <p className="text-xs text-brand-brown-muted font-mono tracking-widest uppercase">
          Verifying Security &amp; Executive Credentials...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-brand-brown flex">
      {/* Sidebar */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ps-72">
        <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto gounow-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </AdminAuthProvider>
  );
}
