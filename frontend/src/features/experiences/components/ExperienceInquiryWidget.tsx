"use client";

import React, { useState } from "react";
import { Experience } from "../types/experience.types";
import { inquireExperience } from "../services/experiences.api";

interface ExperienceInquiryWidgetProps {
  experience: Experience;
}

export default function ExperienceInquiryWidget({
  experience,
}: ExperienceInquiryWidgetProps) {
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
        `Hello GouNow VIP Concierge,\n\nI am inquiring about the activity: ${experience.title}\nDate: ${requestedDate}\nPax: ${guests} Persons\nTime: ${preferredTime}\nClient: ${name} (${phone || email})\n\nNotes: ${message || "Please confirm availability."}`
      );
      window.open(`https://wa.me/201000000000?text=${waText}`, "_blank");

      setSuccessMessage(
        `Thank you ${name || "Guest"}! Your activity booking inquiry for ${requestedDate} at ${preferredTime} (${guests} pax) has been forwarded to our VIP Concierge desk.`
      );
    } catch {
      setSuccessMessage("Thank you! Connecting you with our concierge team.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-brand-border shadow-lg space-y-5">
      <div>
        <span className="text-xs text-brand-brown-muted block">Pricing</span>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-2xl font-serif font-bold text-brand-brown">
            {experience.price_formatted}
          </span>
          <span className="text-xs text-brand-brown-muted">
            {experience.currency}
          </span>
          <span className="text-[11px] text-brand-terracotta font-medium ml-1 capitalize">
            / {experience.pricing_type?.replace(/^\/\s*/, "") || "per group"}
          </span>
        </div>
      </div>

      {successMessage ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs space-y-2">
          <p className="font-bold">Inquiry Sent Successfully!</p>
          <p>{successMessage}</p>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-[11px] font-bold text-emerald-700 underline mt-2"
          >
            Send another request
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
                Date
              </label>
              <input
                type="date"
                name="requested_date"
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
                required
                className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                Pax (Persons)
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
                <span className="absolute right-3 top-2.5 text-[11px] text-brand-brown-muted pointer-events-none">
                  pax
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
              Time / Preferred Slot
            </label>
            <select
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
            >
              <option value="Morning (09:00 AM - 12:00 PM)">Morning (09:00 AM - 12:00 PM)</option>
              <option value="Mid-Day (12:30 PM - 03:30 PM)">Mid-Day (12:30 PM - 03:30 PM)</option>
              <option value="Sunset (04:30 PM - 07:00 PM)">Sunset (04:30 PM - 07:00 PM)</option>
              <option value="Evening (07:30 PM - 10:30 PM)">Evening (07:30 PM - 10:30 PM)</option>
              <option value="Flexible / Full Day">Flexible / Full Day</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
              Your Name
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Elena Rostova"
              className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
              Email
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
              Phone / WhatsApp
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
              Special Requests
            </label>
            <textarea
              name="message"
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Sunset departure preferred, private catering..."
              className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Request Experience Booking"}
          </button>

          <p className="text-[10px] text-center text-brand-brown-muted">
            No immediate payment required &bull; Concierge will confirm timing
          </p>
        </form>
      )}
    </div>
  );
}
