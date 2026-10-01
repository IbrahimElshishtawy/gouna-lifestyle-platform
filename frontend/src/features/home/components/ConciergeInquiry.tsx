"use client";

import React, { useState } from "react";
import { submitConciergeInquiry } from "../services/home.api";

export default function ConciergeInquiry() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await submitConciergeInquiry({
        name,
        phone,
        email,
        message,
      });

      setStatus("success");
      setFeedback(res.message);

      // WhatsApp Concierge redirection like the original form
      const whatsappText = encodeURIComponent(
        `Hello GouNow VIP Concierge, my name is ${name}${phone ? ` (${phone})` : ""}.\n${message}`
      );
      window.open(`https://wa.me/201000000000?text=${whatsappText}`, "_blank");
    } catch {
      setStatus("error");
      setFeedback("Unable to send inquiry. Please reach out via WhatsApp directly.");
    }
  };

  return (
    <section id="concierge" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
      <div className="bg-brand-sand-card rounded-3xl border border-brand-border p-8 sm:p-12 lg:p-16 shadow-xs relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-terracotta/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Column: Info */}
          <div>
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-2">
              24/7 VIP Hospitality
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
              El Gouna Concierge Desk
            </h2>
            <p className="text-xs sm:text-sm text-brand-brown-muted mt-4 font-light leading-relaxed max-w-lg">
              Whether you require a private chef for your villa, a last-minute
              yacht berth in Abu Tig Marina, airport transfers, or VIP nightlife
              reservations, our dedicated team is at your command.
            </p>

            <div className="mt-8 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  💬
                </span>
                <div>
                  <span className="block font-bold text-brand-brown">Instant WhatsApp Support</span>
                  <a
                    href="https://wa.me/201000000000?text=Hello%20GouNow,%20I%20need%20VIP%20concierge%20assistance"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-terracotta hover:underline font-medium"
                  >
                    +20 100 000 0000
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-brand-sand text-brand-brown flex items-center justify-center font-bold">
                  📍
                </span>
                <div>
                  <span className="block font-bold text-brand-brown">Clubhouse Desk</span>
                  <span className="text-brand-brown-muted">Abu Tig Marina Promenade, El Gouna</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-md">
            {status === "success" && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
                {feedback}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full text-xs p-3 bg-brand-sand-light/50 border border-brand-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1.5">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 100 000 0000"
                    className="w-full text-xs p-3 bg-brand-sand-light/50 border border-brand-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guest@example.com"
                    className="w-full text-xs p-3 bg-brand-sand-light/50 border border-brand-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted mb-1.5">
                  How May We Assist You? *
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Villa preferences, dates, yacht charter requirements, or special celebration arrangements..."
                  className="w-full text-xs p-3 bg-brand-sand-light/50 border border-brand-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
              >
                {status === "loading" ? "Submitting..." : "Send Concierge Request"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
