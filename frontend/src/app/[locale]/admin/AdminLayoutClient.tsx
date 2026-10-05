"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/features/admin/components/AdminSidebar";
import AdminHeader from "@/features/admin/components/AdminHeader";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If on login page, render clean layout without sidebar/header
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-brand-brown flex">
      {/* Sidebar */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto gounow-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
