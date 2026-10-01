import React from "react";
import Link from "next/link";

interface Props {
  searchParams: Promise<{
    status?: string;
  }>;
}

export default async function AdminBookingsPage({ searchParams }: Props) {
  const { status } = await searchParams;

  const allBookings = [
    {
      ref: "GON-2026-641770",
      customer: "First Booker",
      email: "firstbooker@example.com",
      phone: "+201000000001",
      property: "Fanadir Bay Waterfront Villa",
      propertySlug: "fanadir-bay-sunlight-villa",
      checkIn: "Nov 18, 2026",
      checkOut: "Nov 23, 2026",
      nights: 5,
      guests: 2,
      total: "30,210",
      paid: "30,210",
      status: "confirmed",
    },
    {
      ref: "GON-2026-936084",
      customer: "Guest User",
      email: "guest@gounow.com",
      phone: "+201022334455",
      property: "Mangroovy Beachfront Luxury Chalet",
      propertySlug: "mangroovy-beachfront-chalet",
      checkIn: "Oct 14, 2026",
      checkOut: "Oct 17, 2026",
      nights: 3,
      guests: 3,
      total: "18,810",
      paid: "5,643 (Deposit)",
      status: "pending",
    },
    {
      ref: "GON-2026-118492",
      customer: "Sarah Jenkins",
      email: "sarah.j@londonmedia.co.uk",
      phone: "+44 7911 123456",
      property: "Abu Tig Marina Penthouse",
      propertySlug: "abu-tig-marina-penthouse",
      checkIn: "Dec 22, 2026",
      checkOut: "Dec 29, 2026",
      nights: 7,
      guests: 4,
      total: "74,400",
      paid: "74,400",
      status: "confirmed",
    },
    {
      ref: "GON-2026-552910",
      customer: "Karim Mansour",
      email: "kmansour@cairogroups.com",
      phone: "+201112223334",
      property: "West Golf Sunset Lagoon Villa",
      propertySlug: "west-golf-lagoon-villa",
      checkIn: "Nov 02, 2026",
      checkOut: "Nov 06, 2026",
      nights: 4,
      guests: 6,
      total: "58,000",
      paid: "58,000",
      status: "confirmed",
    },
  ];

  const filteredBookings = status
    ? allBookings.filter((b) => b.status === status)
    : allBookings;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-brown">
            Bookings &amp; Reservations
          </h1>
          <p className="text-xs text-brand-brown-muted mt-1">
            Real-time reservations, payment schedules, and guest check-in audits
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/201000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <span>💬</span>
            <span>Concierge Desk</span>
          </a>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-border pb-3">
        <Link
          href="/admin/bookings"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            !status
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          All ({allBookings.length})
        </Link>
        <Link
          href="/admin/bookings?status=pending"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            status === "pending"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          Pending Confirmation ({allBookings.filter((b) => b.status === "pending").length})
        </Link>
        <Link
          href="/admin/bookings?status=confirmed"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            status === "confirmed"
              ? "bg-brand-terracotta text-white shadow-xs"
              : "text-brand-brown-muted hover:text-brand-brown hover:bg-brand-sand-light"
          }`}
        >
          Confirmed ({allBookings.filter((b) => b.status === "confirmed").length})
        </Link>
      </div>

      {/* Bookings Table Card */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto gounow-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-semibold border-b border-brand-border">
              <tr>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Guest Details</th>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Stay Dates</th>
                <th className="py-3 px-4">Financials</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {filteredBookings.map((b) => (
                <tr
                  key={b.ref}
                  className="hover:bg-brand-sand-light/30 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-brand-brown">
                    {b.ref}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-brand-brown">{b.customer}</div>
                    <div className="text-[11px] text-brand-brown-muted">{b.email}</div>
                    <div className="text-[10px] text-brand-brown-muted">{b.phone}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/stays/${b.propertySlug}`}
                      target="_blank"
                      className="font-medium text-brand-brown hover:text-brand-terracotta line-clamp-1 max-w-[200px]"
                    >
                      {b.property}
                    </Link>
                    <span className="text-[10px] text-brand-brown-muted">
                      {b.nights} nights &bull; {b.guests} guests
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-brand-brown-muted whitespace-nowrap">
                    <div>{b.checkIn}</div>
                    <div className="text-[10px]">to {b.checkOut}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-brand-brown">
                      {b.total} <span className="text-[10px] font-normal text-brand-brown-muted">EGP</span>
                    </div>
                    <div className="text-[10px] text-emerald-700 font-medium">
                      Paid: {b.paid}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        b.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href={`https://wa.me/${b.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hello ${b.customer}, this is GouNow Concierge regarding your reservation ${b.ref}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-medium transition inline-flex items-center gap-1"
                    >
                      <span>💬</span> WhatsApp
                    </a>
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
