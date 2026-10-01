import React from "react";

export default function AdminCustomersPage() {
  const leads = [
    {
      id: 1,
      name: "Tarek Khalil",
      phone: "+201011223344",
      email: "tarek.khalil@investments.eg",
      interest: "Real Estate Purchase (Fanadir Bay Waterfront Villa)",
      source: "Property Sale Lead Form",
      date: "Today, 10:14 AM",
      notes: "Interested in cash buyout or 2-year payment plan. Requires layout blueprint.",
      status: "Hot Lead",
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 2,
      name: "Dr. Marianne Weber",
      phone: "+49 170 555 4321",
      email: "m.weber@munich-health.de",
      interest: "Vacation Rental (Mangroovy Beachfront Chalet)",
      source: "Website Booking Quote Widget",
      date: "Yesterday, 04:30 PM",
      notes: "Requested 10 days in November with daily housekeeping and yacht charter.",
      status: "Negotiating",
      statusColor: "bg-amber-100 text-amber-800",
    },
    {
      id: 3,
      name: "Omar Al-Fassi",
      phone: "+971 50 123 9876",
      email: "omar.alfassi@dubaiholding.ae",
      interest: "Private Yacht Charter to Tawila Island",
      source: "WhatsApp VIP Concierge",
      date: "Sep 28, 2026",
      notes: "Birthday party for 10 guests. Requested sunset cruise with private sushi chef.",
      status: "Confirmed",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
    {
      id: 4,
      name: "Elena Rostova",
      phone: "+201000000000",
      email: "elena@example.com",
      interest: "VIP Private Kitesurf Coaching Session",
      source: "Experience Inquiry Form",
      date: "Sep 26, 2026",
      notes: "Intermediate kitesurfer, looking for 4 coaching sessions over a weekend.",
      status: "Followed Up",
      statusColor: "bg-blue-100 text-blue-800",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-brown">
            Customers &amp; Client Inquiries
          </h1>
          <p className="text-xs text-brand-brown-muted mt-1">
            Incoming high-net-worth client leads, villa rental inquiries, and yacht requests
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
            <span>Open WhatsApp CRM</span>
          </a>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto gounow-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-semibold border-b border-brand-border">
              <tr>
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Interest &amp; Requirements</th>
                <th className="py-3 px-4">Channel &amp; Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-brand-sand-light/30 transition">
                  <td className="py-3.5 px-4 font-bold text-brand-brown">
                    {lead.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-brand-brown font-mono">{lead.phone}</div>
                    <div className="text-[11px] text-brand-brown-muted">{lead.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-brand-brown">{lead.interest}</div>
                    <p className="text-[11px] text-brand-brown-muted line-clamp-1 mt-0.5">
                      {lead.notes}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-brand-brown-muted">
                    <div>{lead.source}</div>
                    <div className="text-[10px] text-brand-brown-muted">{lead.date}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${lead.statusColor}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hello ${lead.name}, this is GouNow VIP Concierge regarding your inquiry for ${lead.interest}.`
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
