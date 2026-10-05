"use client";

import React, { useState } from "react";
import { Experience } from "../types/experience.types";
import { inquireExperience } from "../services/experiences.api";
import { useLanguage } from "@/context/LanguageContext";

interface ExperienceInquiryWidgetProps {
  experience: Experience;
}

export default function ExperienceInquiryWidget({
  experience,
}: ExperienceInquiryWidgetProps) {
  const { t, locale } = useLanguage();
  const [requestedDate, setRequestedDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split("T")[0];
  });
  const [guests, setGuests] = useState(2);
  const [preferredTime, setPreferredTime] = useState("Sunset (04:30 PM - 07:00 PM)");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await inquireExperience(experience.slug, {
        requested_date: requestedDate,
        guests,
        pax: guests,
        preferred_time: preferredTime,
        name,
        email,
        phone,
        message: `[Activity Booking Details]\nDate: ${requestedDate}\nPax: ${guests} Persons\nTime: ${preferredTime}${message ? `\nNotes: ${message}` : ""}`,
      });

      // Construct WhatsApp fallback URL matching concierge desk
      const waText = encodeURIComponent(
        locale === "ar"
          ? `مرحباً كونسيرج جو ناو VIP،\n\nأود حجز التجربة: ${experience.title}\nالتاريخ: ${requestedDate}\nعدد الأفراد: ${guests}\nالموعد: ${preferredTime}\nالعميل: ${name} (${phone || email})\n\nملاحظات: ${message || "يرجى تأكيد التوافر."}`
          : `Hello GouNow VIP Concierge,\n\nI am inquiring about the activity: ${experience.title}\nDate: ${requestedDate}\nPax: ${guests} Persons\nTime: ${preferredTime}\nClient: ${name} (${phone || email})\n\nNotes: ${message || "Please confirm availability."}`
      );
      window.open(`https://wa.me/201000000000?text=${waText}`, "_blank");

      setSuccessMessage(
        locale === "ar"
          ? `شكراً لك ${name || "عزيزي الضيف"}! تم إرسال طلب حجز التجربة لتاريخ ${requestedDate} في موعد ${preferredTime} (${guests} أفراد) إلى مكتب الكونسيرج VIP بالجونة.`
          : `Thank you ${name || "Guest"}! Your activity booking inquiry for ${requestedDate} at ${preferredTime} (${guests} pax) has been forwarded to our VIP Concierge desk.`
      );
    } catch {
      setSuccessMessage(
        locale === "ar"
          ? "شكراً لك! جاري تحويلك إلى فريق الكونسيرج."
          : "Thank you! Connecting you with our concierge team."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-brand-border shadow-lg space-y-5">
      <div>
        <span className="text-xs text-brand-brown-muted block">{t.experienceInquiry.pricing}</span>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-serif font-bold text-brand-brown">
            {experience.price_formatted}
          </span>
          <span className="text-xs text-brand-brown-muted">
            {experience.currency}
          </span>
          <span className="text-[11px] text-brand-terracotta font-medium ms-1 capitalize">
            / {experience.pricing_type?.replace(/^\/\s*/, "") || t.experienceInquiry.perGroup}
          </span>
        </div>
      </div>

      {successMessage ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs space-y-2">
          <p className="font-bold">{t.experienceInquiry.inquirySuccess}</p>
          <p>{successMessage}</p>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-[11px] font-bold text-emerald-700 underline mt-2 cursor-pointer"
          >
            {t.experienceInquiry.sendAnother}
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 pt-3 border-t border-brand-border text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {t.experienceInquiry.date}
              </label>
              <input
                type="date"
                name="requested_date"
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
                required
                className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                {t.experienceInquiry.pax}
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="guests"
                  min={1}
                  max={experience.max_guests || 20}
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  required
                  className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                />
                <span className="absolute end-3 top-2.5 text-[11px] text-brand-brown-muted pointer-events-none">
                  pax
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
              {t.experienceInquiry.timeSlot}
            </label>
            <select
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta cursor-pointer"
            >
              <option value="Morning (09:00 AM - 12:00 PM)">{t.experienceInquiry.slotMorning}</option>
              <option value="Mid-Day (12:30 PM - 03:30 PM)">{t.experienceInquiry.slotMidDay}</option>
              <option value="Sunset (04:30 PM - 07:00 PM)">{t.experienceInquiry.slotSunset}</option>
              <option value="Evening (07:30 PM - 10:30 PM)">{t.experienceInquiry.slotEvening}</option>
              <option value="Flexible / Full Day">{t.experienceInquiry.slotFlexible}</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
              {t.experienceInquiry.yourName} *
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={locale === "ar" ? "مثال: مريم خليل" : "Elena Rostova"}
              className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
              {t.experienceInquiry.email} *
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="elena@example.com"
              className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
              {t.experienceInquiry.phone} *
            </label>
            <input
              type="text"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+20 10..."
              className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
              {t.experienceInquiry.specialRequests}
            </label>
            <textarea
              name="message"
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.experienceInquiry.specialRequestsPlaceholder}
              className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
          >
            {submitting ? t.experienceInquiry.submitting : t.experienceInquiry.requestBooking}
          </button>

          <p className="text-[10px] text-center text-brand-brown-muted">
            {t.experienceInquiry.noImmediatePayment}
          </p>
        </form>
      )}
    </div>
  );
}
