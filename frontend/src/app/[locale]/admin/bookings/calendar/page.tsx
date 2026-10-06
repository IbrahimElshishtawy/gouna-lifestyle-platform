"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  getAdminProperties,
  getPropertyCalendar,
  addPropertyAvailabilityBlock,
  removePropertyAvailabilityBlock,
} from "@/features/admin/services/admin.api";
import type {
  AdminPropertyItem,
  PropertyCalendarResponse,
  AvailabilityBlockItem,
} from "@/features/admin/types";
import { useLanguage } from "@/context/LanguageContext";
import LoadingState from "@/components/ui/LoadingState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PermissionGuard from "@/components/ui/PermissionGuard";

export default function AdminBookingsCalendarPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [properties, setProperties] = useState<AdminPropertyItem[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  // Month & Year state
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Calendar data
  const [calendarData, setCalendarData] = useState<PropertyCalendarResponse | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Quick Block modal state
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockForm, setBlockForm] = useState({
    start_date: "",
    end_date: "",
    status: "blocked" as "blocked" | "maintenance" | "owner_use",
    reason: "",
  });
  const [blockSubmitting, setBlockSubmitting] = useState(false);

  // Block deletion state
  const [blockToDelete, setBlockToDelete] = useState<AvailabilityBlockItem | null>(null);

  // Fetch properties once
  useEffect(() => {
    let mounted = true;
    getAdminProperties({ type: "rent" })
      .then((res) => {
        if (!mounted) return;
        setProperties(res.data);
        if (res.data.length > 0) {
          setSelectedPropertyId(res.data[0].id);
        }
      })
      .catch(() => {
        if (mounted) setProperties([]);
      })
      .finally(() => {
        if (mounted) setPropertiesLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch calendar data for selected property & year
  const fetchCalendar = useCallback(async () => {
    if (!selectedPropertyId) return;
    setCalendarLoading(true);
    try {
      const res = await getPropertyCalendar(selectedPropertyId, year);
      setCalendarData(res);
    } catch {
      setCalendarData(null);
    } finally {
      setCalendarLoading(false);
    }
  }, [selectedPropertyId, year]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month days computation
  const monthDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    const startingDayIndex = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const days: Array<{
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    // Leading empty/prev-month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const padDate = new Date(year, month - 1, d);
      const iso = padDate.toISOString().split("T")[0];
      days.push({
        dateStr: iso,
        dayNum: d,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Days of current month
    const todayIso = new Date().toISOString().split("T")[0];
    for (let d = 1; d <= totalDays; d++) {
      const pad = String(d).padStart(2, "0");
      const monthPad = String(month + 1).padStart(2, "0");
      const iso = `${year}-${monthPad}-${pad}`;
      days.push({
        dateStr: iso,
        dayNum: d,
        isCurrentMonth: true,
        isToday: iso === todayIso,
      });
    }

    // Trailing days padding to fill 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const iso = nextDate.toISOString().split("T")[0];
      days.push({
        dateStr: iso,
        dayNum: i,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, [year, month]);

  // Quick lookup helpers
  const getDayInfo = useCallback(
    (dateStr: string) => {
      if (!calendarData) return { booking: null, block: null, season: null };

      // Find booking overlapping this date (check_in <= date < check_out)
      const booking =
        calendarData.booked_ranges.find(
          (b) => dateStr >= b.start_date && dateStr < b.end_date
        ) || null;

      // Find block overlapping this date (start_date <= date <= end_date)
      const block =
        calendarData.blocked_ranges.find(
          (bl) => dateStr >= bl.start_date && dateStr <= bl.end_date
        ) || null;

      // Find seasonal price rule overlapping this date
      const season =
        calendarData.seasonal_prices.find(
          (s) => dateStr >= s.start_date && dateStr <= s.end_date
        ) || null;

      return { booking, block, season };
    },
    [calendarData]
  );

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId) return;
    setFeedback(null);
    setBlockSubmitting(true);
    try {
      await addPropertyAvailabilityBlock(selectedPropertyId, {
        start_date: blockForm.start_date,
        end_date: blockForm.end_date,
        status: blockForm.status,
        reason: blockForm.reason || undefined,
      });
      setFeedback({
        type: "success",
        message: isAr
          ? "تم حظر الفترة الزمنية بنجاح وحفظها في التقويم."
          : "Availability block created successfully.",
      });
      setIsBlockModalOpen(false);
      setBlockForm({
        start_date: "",
        end_date: "",
        status: "blocked",
        reason: "",
      });
      await fetchCalendar();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message:
          err.message ||
          (isAr
            ? "تعذر إنشاء حظر التوفر. تحقق من عدم وجود تضارب مع حجوزات قائمة."
            : "Failed to block dates. Please ensure no booking conflicts exist."),
      });
    } finally {
      setBlockSubmitting(false);
    }
  };

  const handleConfirmDeleteBlock = async () => {
    if (!selectedPropertyId || !blockToDelete) return;
    setFeedback(null);
    try {
      await removePropertyAvailabilityBlock(selectedPropertyId, blockToDelete.id);
      setFeedback({
        type: "success",
        message: isAr ? "تم إلغاء حظر التوفر." : "Availability block removed.",
      });
      setBlockToDelete(null);
      await fetchCalendar();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || (isAr ? "تعذر إلغاء الحظر." : "Failed to remove block."),
      });
    }
  };

  const monthNamesEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const monthNamesAr = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
  ];

  const weekdayNamesEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekdayNamesAr = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);
  const selectedPropertyTitle =
    isAr && selectedProperty?.title_ar
      ? selectedProperty.title_ar
      : selectedProperty?.title_en || (isAr ? "العقار المحدد" : "Selected Property");

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs text-brand-brown-muted mb-1">
            <Link href="/admin/bookings" className="hover:text-brand-terracotta">
              {isAr ? "الحجوزات" : "Bookings"}
            </Link>
            <span>/</span>
            <span className="text-brand-brown font-semibold">
              {isAr ? "تقويم الإتاحة والتشغيل" : "Availability Calendar"}
            </span>
          </nav>
          <h1 className="text-2xl font-serif font-bold text-brand-brown">
            {isAr ? "تقويم التوفر والحجوزات التشغيلي" : "Operational Availability & Bookings Calendar"}
          </h1>
          <p className="text-xs text-brand-brown-muted mt-1 font-light">
            {isAr
              ? "مراقبة الإشغال الفعلي لكل وحدة، الحجوزات المؤكدة، الصيانة، وحظر التوفر الآمن."
              : "Live visual occupancy, confirmed stays, maintenance blocks, and safe operational holds."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PermissionGuard permission="manage_bookings">
            <button
              onClick={() => setIsBlockModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>+</span>
              <span>{isAr ? "حظر تواريخ جديدة" : "Block Dates"}</span>
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="underline cursor-pointer">
            {isAr ? "إغلاق" : "Dismiss"}
          </button>
        </div>
      )}

      {/* Control Bar: Property Picker + Month/Year Navigation */}
      <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Property Selector */}
        <div className="w-full md:w-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-sand-light border border-brand-border flex items-center justify-center text-lg shrink-0">
            🏡
          </div>
          <div className="flex-1 md:w-72">
            <label className="text-[11px] font-bold text-brand-brown-muted uppercase tracking-wider block mb-1">
              {isAr ? "اختر العقار / الوحدة" : "Select Property / Unit"}
            </label>
            {propertiesLoading ? (
              <div className="h-9 bg-brand-sand-light animate-pulse rounded-xl" />
            ) : (
              <select
                value={selectedPropertyId || ""}
                onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
                className="w-full text-xs font-bold text-brand-brown bg-brand-sand-light/50 border border-brand-border rounded-xl px-3 py-2 outline-none focus:border-brand-terracotta transition"
              >
                {properties.map((p) => {
                  const pTitle = isAr && p.title_ar ? p.title_ar : p.title_en;
                  return (
                    <option key={p.id} value={p.id}>
                      {pTitle} ({p.reference_number})
                    </option>
                  );
                })}
              </select>
            )}
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="px-3 py-2 rounded-xl border border-brand-border bg-brand-sand-light hover:bg-brand-sand text-brand-brown font-bold transition cursor-pointer"
            title={isAr ? "الشهر السابق" : "Previous Month"}
          >
            ←
          </button>

          <div className="text-center min-w-[160px]">
            <h2 className="text-base font-serif font-bold text-brand-brown">
              {isAr ? monthNamesAr[month] : monthNamesEn[month]} {year}
            </h2>
            <button
              onClick={handleToday}
              className="text-[11px] font-bold text-brand-terracotta hover:underline cursor-pointer mt-0.5"
            >
              {isAr ? "العودة لليوم" : "Go to Today"}
            </button>
          </div>

          <button
            onClick={handleNextMonth}
            className="px-3 py-2 rounded-xl border border-brand-border bg-brand-sand-light hover:bg-brand-sand text-brand-brown font-bold transition cursor-pointer"
            title={isAr ? "الشهر القادم" : "Next Month"}
          >
            →
          </button>
        </div>
      </div>

      {/* Visual Legend (Color + Explicit Icon + Text) */}
      <div className="bg-white px-6 py-4 rounded-2xl border border-brand-border shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
        <div className="flex items-center gap-1.5 text-emerald-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>{isAr ? "متاح للحجز (Available)" : "Available"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-blue-800">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>{isAr ? "محجوز لمقيم (Booked)" : "Booked"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-rose-800">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span>{isAr ? "محظور إدارياً (Blocked)" : "Admin Blocked"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-800">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>{isAr ? "تحت الصيانة (Maintenance)" : "Maintenance"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-purple-800">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          <span>{isAr ? "استخدام المالك (Owner Use)" : "Owner Use"}</span>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-xs overflow-hidden">
        {calendarLoading ? (
          <div className="p-16">
            <LoadingState message={isAr ? "جارٍ تحميل بيانات التوفر والإشغال..." : "Loading availability & occupancy data..."} />
          </div>
        ) : (
          <div>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-brand-border bg-brand-sand-light/60 text-center font-bold text-xs text-brand-brown-muted py-3">
              {(isAr ? weekdayNamesAr : weekdayNamesEn).map((day, idx) => (
                <div key={idx}>{day}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-brand-border/60 rtl:divide-x-reverse border-b border-brand-border">
              {monthDays.map((d, index) => {
                const { booking, block, season } = getDayInfo(d.dateStr);

                let cellBg = "bg-white";
                let badge = null;

                if (booking) {
                  cellBg = "bg-blue-50/80 hover:bg-blue-100/70";
                  badge = (
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="mt-1.5 block p-1.5 rounded-lg bg-blue-100/90 text-blue-900 border border-blue-200 hover:border-blue-400 transition"
                      title={booking.guest_name}
                    >
                      <div className="font-bold text-[10px] truncate flex items-center gap-1">
                        <span>🗓️</span>
                        <span>{booking.reference}</span>
                      </div>
                      <div className="text-[9px] text-blue-700 truncate font-medium">
                        {booking.guest_name}
                      </div>
                    </Link>
                  );
                } else if (block) {
                  if (block.status === "maintenance") {
                    cellBg = "bg-amber-50/80 hover:bg-amber-100/70";
                    badge = (
                      <div className="mt-1.5 p-1.5 rounded-lg bg-amber-100/90 text-amber-900 border border-amber-200">
                        <div className="font-bold text-[10px] flex items-center justify-between gap-1">
                          <span className="flex items-center gap-1">
                            <span>🔧</span>
                            <span>{isAr ? "صيانة" : "Maint."}</span>
                          </span>
                          <button
                            onClick={() => setBlockToDelete(block)}
                            className="text-amber-800 hover:text-rose-600 transition cursor-pointer text-xs"
                            title={isAr ? "إلغاء الحظر" : "Remove block"}
                          >
                            ✕
                          </button>
                        </div>
                        {block.reason && (
                          <div className="text-[9px] text-amber-700 truncate">{block.reason}</div>
                        )}
                      </div>
                    );
                  } else if (block.status === "owner_use") {
                    cellBg = "bg-purple-50/80 hover:bg-purple-100/70";
                    badge = (
                      <div className="mt-1.5 p-1.5 rounded-lg bg-purple-100/90 text-purple-900 border border-purple-200">
                        <div className="font-bold text-[10px] flex items-center justify-between gap-1">
                          <span className="flex items-center gap-1">
                            <span>🔑</span>
                            <span>{isAr ? "المالك" : "Owner"}</span>
                          </span>
                          <button
                            onClick={() => setBlockToDelete(block)}
                            className="text-purple-800 hover:text-rose-600 transition cursor-pointer text-xs"
                            title={isAr ? "إلغاء الحظر" : "Remove block"}
                          >
                            ✕
                          </button>
                        </div>
                        {block.reason && (
                          <div className="text-[9px] text-purple-700 truncate">{block.reason}</div>
                        )}
                      </div>
                    );
                  } else {
                    cellBg = "bg-rose-50/80 hover:bg-rose-100/70";
                    badge = (
                      <div className="mt-1.5 p-1.5 rounded-lg bg-rose-100/90 text-rose-900 border border-rose-200">
                        <div className="font-bold text-[10px] flex items-center justify-between gap-1">
                          <span className="flex items-center gap-1">
                            <span>🚫</span>
                            <span>{isAr ? "محظور" : "Blocked"}</span>
                          </span>
                          <button
                            onClick={() => setBlockToDelete(block)}
                            className="text-rose-800 hover:text-rose-950 transition cursor-pointer text-xs"
                            title={isAr ? "إلغاء الحظر" : "Remove block"}
                          >
                            ✕
                          </button>
                        </div>
                        {block.reason && (
                          <div className="text-[9px] text-rose-700 truncate">{block.reason}</div>
                        )}
                      </div>
                    );
                  }
                } else if (d.isCurrentMonth) {
                  cellBg = "hover:bg-brand-sand-light/40";
                }

                return (
                  <div
                    key={index}
                    className={`min-h-[105px] p-2 flex flex-col justify-between transition ${cellBg} ${
                      !d.isCurrentMonth ? "opacity-35 bg-brand-sand-light/20" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                          d.isToday
                            ? "bg-brand-terracotta text-white"
                            : "text-brand-brown"
                        }`}
                      >
                        {d.dayNum}
                      </span>

                      {season && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold truncate max-w-[80px]"
                          title={`${season.name_en}: ${season.formatted_price}`}
                        >
                          {season.formatted_price}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-end">
                      {badge}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Quick Link to Property Overview */}
      {selectedPropertyId && (
        <div className="p-4 rounded-2xl bg-brand-sand-light border border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-brand-brown">
            <span>🏡</span>
            <span>
              {isAr ? "إدارة تفاصيل وأسعار هذا العقار:" : "Manage settings and pricing for this property:"}
            </span>
            <span className="font-bold">{selectedPropertyTitle}</span>
          </div>
          <Link
            href={`/admin/properties/${selectedPropertyId}`}
            className="text-xs font-bold text-brand-terracotta hover:underline flex items-center gap-1"
          >
            <span>{isAr ? "فتح ملف العقار" : "Open Property Dossier"}</span>
            <span className="rtl:rotate-180">→</span>
          </Link>
        </div>
      )}

      {/* Block Dates Modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-brown/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-brand-border max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h3 className="text-base font-bold text-brand-brown">
                {isAr ? "حظر تواريخ في التقويم" : "Create Availability Block"}
              </h3>
              <button
                onClick={() => setIsBlockModalOpen(false)}
                className="text-brand-brown-muted hover:text-brand-brown text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-brand-brown-muted">
              {isAr
                ? `سيتم حظر التواريخ المحددة لوحدة "${selectedPropertyTitle}" لمنع أي حجوزات جديدة خلالها.`
                : `Block dates for "${selectedPropertyTitle}" to prevent new guest bookings during this period.`}
            </p>

            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-brand-brown-muted uppercase tracking-wider block mb-1">
                    {isAr ? "تاريخ البداية" : "Start Date"}
                  </label>
                  <input
                    type="date"
                    required
                    value={blockForm.start_date}
                    onChange={(e) => setBlockForm({ ...blockForm, start_date: e.target.value })}
                    className="w-full text-xs font-bold text-brand-brown bg-brand-sand-light/50 border border-brand-border rounded-xl px-3 py-2 outline-none focus:border-brand-terracotta"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-brand-brown-muted uppercase tracking-wider block mb-1">
                    {isAr ? "تاريخ النهاية" : "End Date"}
                  </label>
                  <input
                    type="date"
                    required
                    value={blockForm.end_date}
                    onChange={(e) => setBlockForm({ ...blockForm, end_date: e.target.value })}
                    className="w-full text-xs font-bold text-brand-brown bg-brand-sand-light/50 border border-brand-border rounded-xl px-3 py-2 outline-none focus:border-brand-terracotta"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-brand-brown-muted uppercase tracking-wider block mb-1">
                  {isAr ? "نوع الحظر" : "Block Type"}
                </label>
                <select
                  value={blockForm.status}
                  onChange={(e) =>
                    setBlockForm({
                      ...blockForm,
                      status: e.target.value as "blocked" | "maintenance" | "owner_use",
                    })
                  }
                  className="w-full text-xs font-bold text-brand-brown bg-brand-sand-light/50 border border-brand-border rounded-xl px-3 py-2 outline-none focus:border-brand-terracotta"
                >
                  <option value="blocked">{isAr ? "حظر إداري عام" : "General Admin Block"}</option>
                  <option value="maintenance">{isAr ? "أعمال صيانة أو تجديد" : "Maintenance / Repairs"}</option>
                  <option value="owner_use">{isAr ? "إقامة خاصة بالمالك" : "Owner Personal Stay"}</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-brand-brown-muted uppercase tracking-wider block mb-1">
                  {isAr ? "السبب / الملاحظات (اختياري)" : "Reason / Note (Optional)"}
                </label>
                <input
                  type="text"
                  placeholder={isAr ? "مثال: صيانة التكييف المركزي أو زيارة المالك" : "e.g. AC maintenance, owner holiday"}
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  className="w-full text-xs text-brand-brown bg-brand-sand-light/50 border border-brand-border rounded-xl px-3 py-2 outline-none focus:border-brand-terracotta"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-brand-brown text-xs font-bold hover:bg-brand-sand-light transition cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={blockSubmitting}
                  className="px-4 py-2 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {blockSubmitting
                    ? isAr
                      ? "جارٍ الحفظ..."
                      : "Saving..."
                    : isAr
                    ? "تأكيد الحظر"
                    : "Confirm Block"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block Deletion Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!blockToDelete}
        title={isAr ? "إلغاء حظر التوفر" : "Remove Availability Block"}
        description={
          isAr
            ? `هل أنت متأكد من رغبتك في إلغاء حظر التواريخ من (${blockToDelete?.start_date}) إلى (${blockToDelete?.end_date})؟ ستصبح الوحدة متاحة للحجز مرة أخرى.`
            : `Are you sure you want to remove the block from (${blockToDelete?.start_date}) to (${blockToDelete?.end_date})? The unit will become available for booking.`
        }
        confirmText={isAr ? "نعم، إلغاء الحظر" : "Yes, Remove Block"}
        cancelText={isAr ? "تراجع" : "Cancel"}
        isDestructive={true}
        onConfirm={handleConfirmDeleteBlock}
        onCancel={() => setBlockToDelete(null)}
      />
    </div>
  );
}
