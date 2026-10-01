import React from "react";
import AdminLayoutClient from "./AdminLayoutClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | GouNow El Gouna Management",
  description: "Executive control panel for GouNow properties, bookings, experiences, and client leads.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
