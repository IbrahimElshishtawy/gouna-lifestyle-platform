"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export type ClientTag = "First Time" | "New Client" | "VIP" | "VVIP";

export interface StayRecord {
  id: string;
  reference: string;
  property: string;
  dates: string;
  amountEgp: number;
  status: "Completed" | "Upcoming" | "Cancelled";
}

export interface ClientProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  tag: ClientTag;
  totalBookings: number;
  lifetimeSpendEgp: number;
  memberSince: string;
  lastActive: string;
  notes: string;
  history: StayRecord[];
}

export default function AdminCustomersPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"clients" | "leads">("clients");
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);

  const [clients, setClients] = useState<ClientProfile[]>([
    {
      id: 1,
      name: "Lord Henry Cavendish",
      email: "h.cavendish@mayfair-estates.co.uk",
      phone: "+44 20 7946 0912",
      nationality: "British",
      tag: "VVIP",
      totalBookings: 8,
      lifetimeSpendEgp: 485000,
      memberSince: "Nov 2024",
      lastActive: "Today, 11:30 AM",
      notes: "High-profile guest. Prefers private boat transfers, high security, and lagoon waterfront villas with private mooring. Always requests daily butler service.",
      history: [
        {
          id: "1",
          reference: "GON-2026-992140",
          property: "Fanadir Bay Waterfront Villa",
          dates: "Sep 15 - Sep 22, 2026 (7 nights)",
          amountEgp: 145000,
          status: "Completed",
        },
        {
          id: "2",
          reference: "GON-2026-641770",
          property: "West Golf Sunset Lagoon Villa",
          dates: "Nov 18 - Nov 23, 2026 (5 nights)",
          amountEgp: 120000,
          status: "Upcoming",
        },
        {
          id: "3",
          reference: "GON-2025-102941",
          property: "Abu Tig Marina Penthouse",
          dates: "Dec 20 - Dec 28, 2025 (8 nights)",
          amountEgp: 220000,
          status: "Completed",
        },
      ],
    },
    {
      id: 2,
      name: "Tarek Khalil",
      email: "tarek.khalil@investments.eg",
      phone: "+20 100 892 4110",
      nationality: "Egyptian",
      tag: "VIP",
      totalBookings: 4,
      lifetimeSpendEgp: 195000,
      memberSince: "Jan 2025",
      lastActive: "Yesterday",
      notes: "Regular investor in El Gouna. Frequently books high-end chalets and private yacht excursions for business partners.",
      history: [
        {
          id: "4",
          reference: "GON-2026-310928",
          property: "Marina Luxury Residence 4B",
          dates: "Jul 10 - Jul 15, 2026 (5 nights)",
          amountEgp: 85000,
          status: "Completed",
        },
        {
          id: "5",
          reference: "GON-2025-559201",
          property: "Ancient Sands Golf Villa",
          dates: "Oct 12 - Oct 17, 2025 (5 nights)",
          amountEgp: 110000,
          status: "Completed",
        },
      ],
    },
    {
      id: 3,
      name: "Elena Rostova",
      email: "elena.rostova@geneva-wealth.ch",
      phone: "+41 22 710 4490",
      nationality: "Swiss",
      tag: "VVIP",
      totalBookings: 5,
      lifetimeSpendEgp: 360000,
      memberSince: "Mar 2025",
      lastActive: "3 days ago",
      notes: "Kitesurfing enthusiast. Demands Mangroovy beachfront villas with gear storage and direct water access. Prefers organic catering.",
      history: [
        {
          id: "6",
          reference: "GON-2026-881023",
          property: "Mangroovy Beachfront Estate",
          dates: "Aug 01 - Aug 10, 2026 (9 nights)",
          amountEgp: 210000,
          status: "Completed",
        },
        {
          id: "7",
          reference: "GON-2025-440192",
          property: "Fanadir Lagoon Palace",
          dates: "Apr 20 - Apr 27, 2025 (7 nights)",
          amountEgp: 150000,
          status: "Completed",
        },
      ],
    },
    {
      id: 4,
      name: "Marc Dubost",
      email: "marc.dubost@luxury-travel.fr",
      phone: "+33 6 40 91 88 23",
      nationality: "French",
      tag: "New Client",
      totalBookings: 1,
      lifetimeSpendEgp: 78000,
      memberSince: "Aug 2026",
      lastActive: "1 week ago",
      notes: "First time booking a lagoon villa. Inquired about private chef arrangements and luxury airport transfer from HRG.",
      history: [
        {
          id: "8",
          reference: "GON-2026-102948",
          property: "Waterside Chalet Abu Tig",
          dates: "Oct 25 - Oct 30, 2026 (5 nights)",
          amountEgp: 78000,
          status: "Upcoming",
        },
      ],
    },
    {
      id: 5,
      name: "Sophie Van Der Bilt",
      email: "sophie.vdb@amsterdam-capital.nl",
      phone: "+31 20 891 0029",
      nationality: "Dutch",
      tag: "First Time",
      totalBookings: 1,
      lifetimeSpendEgp: 54000,
      memberSince: "Sep 2026",
      lastActive: "5 hours ago",
      notes: "Recently signed up and confirmed first reservation. Inquired about yacht day trips to Tawila Island.",
      history: [
        {
          id: "9",
          reference: "GON-2026-771920",
          property: "South Marina Lagoon Loft",
          dates: "Nov 02 - Nov 07, 2026 (5 nights)",
          amountEgp: 54000,
          status: "Upcoming",
        },
      ],
    },
  ]);

  const [leads] = useState([
    {
      id: "LD-2026-01",
      name: "Countess Beatrice Von Habsburg",
      email: "b.habsburg@salzburg-estates.at",
      phone: "+43 662 840 991",
      interest: isAr ? "استئجار فيلا بحيرة خاصة لمدة شهر" : "1-Month Private Lagoon Villa Lease",
      notes: isAr ? "تطلب فيلا خاصة ذات رصيف بحري لليخوت ومسبح مدفأ وحراسة خاصة." : "Requires private mooring, heated pool, and round-the-clock security.",
      source: "WhatsApp Concierge",
      date: isAr ? "اليوم، 14:15" : "Today, 14:15",
      status: isAr ? "قيد المتابعة الفورية" : "In Progress",
      statusColor: "bg-amber-100 text-amber-800",
    },
    {
      id: "LD-2026-02",
      name: "Karim Mansour",
      email: "k.mansour@cairo-holding.com",
      phone: "+20 122 400 8192",
      interest: isAr ? "شراء قصر على الواجهة المائية بالفنادير" : "Acquisition of Fanadir Waterfront Estate",
      notes: isAr ? "ميزانية استثمارية تتجاوز 45 مليون ج.م. طلب معاينة خاصة الأسبوع القادم." : "Investor with budget > 45M EGP. Requested private walkthrough next week.",
      source: "Real Estate Portal",
      date: isAr ? "أمس" : "Yesterday",
      status: isAr ? "مؤهل للاستثمار" : "Qualified",
      statusColor: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "LD-2026-03",
      name: "Alexander Becker",
      email: "a.becker@berlin-tech.de",
      phone: "+49 30 9102 384",
      interest: isAr ? "حجز يخت خاص لجزيرة طوّيلة" : "Private Tawila Island Yacht Charter",
      notes: isAr ? "مجموعة من 10 ضيوف بمناسبة خاصة مع عشاء فاخر على متن اليخت." : "Party of 10 celebrating special anniversary with private onboard chef.",
      source: "Website Direct",
      date: isAr ? "منذ يومين" : "2 days ago",
      status: isAr ? "تم التواصل وتأكيد العرض" : "Proposal Sent",
      statusColor: "bg-blue-100 text-blue-800",
    },
  ]);

  const getTagBadge = (tag: ClientTag) => {
    switch (tag) {
      case "VVIP":
        return "bg-rose-100 text-rose-900 border border-rose-300 font-bold";
      case "VIP":
        return "bg-amber-100 text-amber-900 border border-amber-300 font-bold";
      case "New Client":
        return "bg-emerald-100 text-emerald-900 border border-emerald-300 font-medium";
      case "First Time":
        return "bg-sky-100 text-sky-900 border border-sky-300 font-medium";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTagLabel = (tag: string) => {
    if (!isAr) return tag;
    switch (tag) {
      case "All": return "الكل";
      case "VVIP": return "كبار الشخصيات (VVIP)";
      case "VIP": return "عميل مميز (VIP)";
      case "New Client": return "عميل جديد";
      case "First Time": return "حجز أول مرة";
      default: return tag;
    }
  };

  const handleUpdateTag = (clientId: number, newTag: ClientTag) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, tag: newTag } : c))
    );
    if (selectedClient && selectedClient.id === clientId) {
      setSelectedClient({ ...selectedClient, tag: newTag });
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesTag = selectedTag === "All" || c.tag === selectedTag;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    return matchesTag && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-terracotta">
              {isAr ? "إدارة علاقات كبار العملاء والنزلاء" : "VIP Client Relationship Management"}
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-brand-brown">
            {isAr ? "سجل العملاء والمستثمرين" : "Customers & Client History"}
          </h1>
          <p className="text-xs text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "متابعة سجل إقامات النزلاء المتكررة، القيمة المالية الإجمالية، تصنيفات الـ VIP، والطلبات الخاصة."
              : "Track repeat guest history, lifetime value, VIP statuses (First Time, New Client, VIP, VVIP) and concierge inquiries."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/201000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center shadow-xs cursor-pointer"
          >
            <span>{isAr ? "فتح واتساب كونسيرج CRM" : "Open WhatsApp CRM"}</span>
          </a>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-brand-border gap-4 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("clients")}
          className={`pb-3 px-1 border-b-2 transition cursor-pointer ${
            activeTab === "clients"
              ? "border-brand-terracotta text-brand-terracotta"
              : "border-transparent text-brand-brown-muted hover:text-brand-brown"
          }`}
        >
          {isAr
            ? `دليل العملاء وسجل الإقامات (${clients.length})`
            : `Client Directory & History (${clients.length})`}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("leads")}
          className={`pb-3 px-1 border-b-2 transition cursor-pointer ${
            activeTab === "leads"
              ? "border-brand-terracotta text-brand-terracotta"
              : "border-transparent text-brand-brown-muted hover:text-brand-brown"
          }`}
        >
          {isAr
            ? `طلبات الاهتمام المباشرة (${leads.length})`
            : `Live Inquiries & Leads (${leads.length})`}
        </button>
      </div>

      {activeTab === "clients" ? (
        <div className="space-y-4">
          {/* Filter Bar & Tag Selector */}
          <div className="bg-white p-4 rounded-2xl border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tag Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-brand-brown-muted uppercase mr-1">
                {isAr ? "تصفية بالتصنيف:" : "Filter by Tag:"}
              </span>
              {(["All", "VVIP", "VIP", "New Client", "First Time"] as const).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedTag === tag
                      ? "bg-brand-brown text-white shadow-xs"
                      : "bg-brand-sand-light text-brand-brown hover:bg-brand-sand/60"
                  }`}
                >
                  {getTagLabel(tag)}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="w-full md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? "بحث بالاسم أو البريد أو الهاتف..." : "Search client by name, email, phone..."}
                className="w-full text-xs p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/40 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
              />
            </div>
          </div>

          {/* Clients Table */}
          <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
            <div className="overflow-x-auto gounow-scrollbar">
              <table className="w-full text-start text-xs">
                <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-semibold border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-4 text-start">{isAr ? "العميل وبيانات الاتصال" : "Client Name & Origin"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "التصنيف" : "Client Tag"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "عدد الإقامات" : "Stays Count"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "إجمالي الإنفاق" : "Lifetime Spend"}</th>
                    <th className="py-3 px-4 text-start">{isAr ? "آخر نشاط" : "Last Activity"}</th>
                    <th className="py-3 px-4 text-end">{isAr ? "الإجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-brand-sand-light/30 transition cursor-pointer"
                      onClick={() => setSelectedClient(client)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brand-brown">{client.name}</div>
                        <div className="text-[11px] text-brand-brown-muted">
                          {client.email} &bull; {client.phone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[10px] ${getTagBadge(
                            client.tag
                          )}`}
                        >
                          {client.tag}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-brand-brown">
                        {client.totalBookings} {isAr ? "إقامات" : `stay${client.totalBookings > 1 ? "s" : ""}`}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-brand-terracotta">
                        {client.lifetimeSpendEgp.toLocaleString()} EGP
                      </td>

                      <td className="py-3.5 px-4 text-brand-brown-muted text-[11px]">
                        {client.lastActive}
                      </td>

                      <td className="py-3.5 px-4 text-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClient(client);
                          }}
                          className="px-3 py-1.5 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-lg font-bold text-[11px] transition cursor-pointer"
                        >
                          {isAr ? "عرض السجل" : "View History"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Leads Table */
        <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto gounow-scrollbar">
            <table className="w-full text-start text-xs">
              <thead className="bg-brand-sand-light/60 text-brand-brown-muted uppercase tracking-wider font-semibold border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4 text-start">{isAr ? "اسم العميل" : "Client Name"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "بيانات التواصل" : "Contact"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "نوع الطلب والمواصفات" : "Interest & Requirements"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "قناة الاتصال والتاريخ" : "Channel & Date"}</th>
                  <th className="py-3 px-4 text-start">{isAr ? "الحالة" : "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-brand-sand-light/30 transition">
                    <td className="py-3.5 px-4 font-bold text-brand-brown">{lead.name}</td>
                    <td className="py-3.5 px-4 text-brand-brown-muted">
                      <div>{lead.phone}</div>
                      <div className="text-[10px]">{lead.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-brand-brown">{lead.interest}</div>
                      <div className="text-[11px] text-brand-brown-muted">{lead.notes}</div>
                    </td>
                    <td className="py-3.5 px-4 text-brand-brown-muted">
                      <div>{lead.source}</div>
                      <div className="text-[10px]">{lead.date}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${lead.statusColor}`}>
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Client History Modal Drawer */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-brand-border shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto gounow-scrollbar">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-brand-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-serif font-bold text-brand-brown">
                    {selectedClient.name}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] ${getTagBadge(selectedClient.tag)}`}>
                    {selectedClient.tag}
                  </span>
                </div>
                <p className="text-xs text-brand-brown-muted mt-0.5">
                  {selectedClient.email} &bull; {selectedClient.phone} &bull; {selectedClient.nationality}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="text-brand-brown-muted hover:text-brand-brown text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tag Quick Switcher */}
            <div className="p-4 bg-brand-sand-light/50 rounded-2xl border border-brand-border flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-brand-brown block">
                  {isAr ? "تعديل تصنيف VIP للعميل:" : "Update Client VIP Tier:"}
                </span>
                <span className="text-[10px] text-brand-brown-muted">
                  {isAr ? "يغيّر مستوى الأولوية في إجراءات الكونسيرج" : "Changes the classification across concierge workflows"}
                </span>
              </div>
              <div className="flex gap-1.5">
                {(["First Time", "New Client", "VIP", "VVIP"] as ClientTag[]).map((tagOption) => (
                  <button
                    key={tagOption}
                    type="button"
                    onClick={() => handleUpdateTag(selectedClient.id, tagOption)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                      selectedClient.tag === tagOption
                        ? "bg-brand-brown text-white shadow-xs"
                        : "bg-white text-brand-brown border border-brand-border hover:bg-brand-sand-light"
                    }`}
                  >
                    {tagOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Lifetime Metrics */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-brand-sand-light/30 rounded-xl border border-brand-border">
                <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                  {isAr ? "إجمالي الإقامات" : "Total Stays"}
                </span>
                <span className="text-lg font-bold text-brand-brown">{selectedClient.totalBookings}</span>
              </div>
              <div className="p-3 bg-brand-sand-light/30 rounded-xl border border-brand-border">
                <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                  {isAr ? "إجمالي الإنفاق" : "Lifetime Spend"}
                </span>
                <span className="text-lg font-mono font-bold text-brand-terracotta">
                  {selectedClient.lifetimeSpendEgp.toLocaleString()} EGP
                </span>
              </div>
              <div className="p-3 bg-brand-sand-light/30 rounded-xl border border-brand-border">
                <span className="text-[10px] uppercase font-bold text-brand-brown-muted block">
                  {isAr ? "تاريخ الانضمام" : "Member Since"}
                </span>
                <span className="text-lg font-bold text-brand-brown">{selectedClient.memberSince}</span>
              </div>
            </div>

            {/* Concierge Notes */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-brown-muted">
                {isAr ? "ملاحظات وتفضيلات النزيل الخاصة" : "Concierge Notes & Preferences"}
              </h3>
              <p className="text-xs text-brand-brown leading-relaxed p-3.5 bg-brand-sand-light/30 rounded-xl border border-brand-border">
                {selectedClient.notes}
              </p>
            </div>

            {/* Complete Stays & Bookings History */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-brown-muted">
                {isAr ? "سجل الإقامات والحجوزات السابقة" : "Complete Stays & Bookings History"}
              </h3>
              <div className="space-y-2.5">
                {selectedClient.history.map((stay) => (
                  <div
                    key={stay.id}
                    className="p-3.5 rounded-xl border border-brand-border bg-white flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-brand-brown">{stay.property}</div>
                      <div className="text-[11px] text-brand-brown-muted">
                        {isAr ? "المرجع:" : "Ref:"} <span className="font-mono">{stay.reference}</span> &bull; {stay.dates}
                      </div>
                    </div>

                    <div className="text-end">
                      <div className="font-mono font-bold text-brand-brown">
                        {stay.amountEgp.toLocaleString()} EGP
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          stay.status === "Completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {stay.status === "Completed" ? (isAr ? "مكتمل" : "Completed") : (isAr ? "قادم" : "Upcoming")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-2 flex justify-between items-center border-t border-brand-border">
              {selectedClient.phone ? (
                <a
                  href={`https://wa.me/${selectedClient.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Hello ${selectedClient.name}, GouNow VIP Reservations Desk is checking in.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center shadow-xs cursor-pointer"
                >
                  <span>{isAr ? "محادثة واتساب مباشرة" : "Direct WhatsApp Contact"}</span>
                </a>
              ) : (
                <span className="text-xs text-brand-brown-muted italic">
                  {isAr ? "لا يوجد رقم هاتف مسجل" : "No phone number registered"}
                </span>
              )}

              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown font-bold text-xs rounded-xl cursor-pointer"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
