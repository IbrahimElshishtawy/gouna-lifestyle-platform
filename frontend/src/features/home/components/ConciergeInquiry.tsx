"use client";

import React, { useState } from "react";
import { submitConciergeInquiry } from "../services/home.api";
import { useLanguage } from "@/context/LanguageContext";

export default function ConciergeInquiry() {
  const { t, locale } = useLanguage();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("villa-stay");
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
        message: `[Service: ${service}] ${message}`,
      });

      setStatus("success");
      setFeedback(res.message || t.concierge.successText);

      // Open WhatsApp for instant VIP concierge connection
      const whatsappText = encodeURIComponent(
        `Hello GouNow VIP Concierge,\nMy Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nRequested Service: ${service}\nDetails: ${message || "I would like to inquire about bespoke arrangements."}`
      );
      window.open(`https://wa.me/201000000000?text=${whatsappText}`, "_blank");
    } catch {
      setStatus("error");
      setFeedback(
        locale === "ar"
          ? "تعذر الإرسال عبر الموقع حالياً. يرجى مراسلة كونسيرج واتساب مباشرة."
          : "Unable to submit online. Please message our 24/7 WhatsApp concierge directly."
      );
    }
  };

  return (
    <section id="concierge" className="py-20 lg:py-24 px-6 lg:px-12 bg-[#FAF8F5] border-t border-brand-border/80">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Narrative & Direct VIP Channels (6 cols) */}
          <div className="lg:col-span-6">
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-2">
              {t.concierge.eyebrow}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown leading-[1.15]">
              {t.concierge.title}
            </h2>
            <p className="text-xs sm:text-sm text-brand-brown-muted mt-4 font-light leading-relaxed max-w-lg">
              {t.concierge.subtitle}
            </p>

            <div className="mt-8 space-y-4">
              {/* Phone Channel */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-brand-border/70 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-brand-sand-light flex items-center justify-center text-brand-terracotta text-lg">
                  📞
                </div>
                <div>
                  <span className="block text-[11px] uppercase font-bold text-brand-brown-muted tracking-wider">
                    {t.concierge.directPhone}
                  </span>
                  <a
                    href="tel:+201000000000"
                    className="text-sm font-bold text-brand-brown hover:text-brand-terracotta transition-colors"
                  >
                    +20 100 000 0000
                  </a>
                </div>
              </div>

              {/* Email Channel */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-brand-border/70 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-brand-sand-light flex items-center justify-center text-brand-terracotta text-lg">
                  ✉️
                </div>
                <div>
                  <span className="block text-[11px] uppercase font-bold text-brand-brown-muted tracking-wider">
                    {t.concierge.clientEmail}
                  </span>
                  <a
                    href="mailto:concierge@gounow.com"
                    className="text-sm font-bold text-brand-brown hover:text-brand-terracotta transition-colors"
                  >
                    concierge@gounow.com
                  </a>
                </div>
              </div>

              {/* WhatsApp Fast Track */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/70 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg">
                  💬
                </div>
                <div className="flex-1">
                  <span className="block text-[11px] uppercase font-bold text-emerald-800 tracking-wider">
                    {t.concierge.instantWhatsApp}
                  </span>
                  <span className="block text-xs text-emerald-700 font-light">
                    {t.concierge.whatsappSub}
                  </span>
                </div>
                <a
                  href="https://wa.me/201000000000?text=Hello%20GouNow,%20I%20would%20like%20VIP%20concierge%20assistance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  {t.concierge.chatNow}
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Tailored Arrangements Form Card (6 cols) */}
          <div className="lg:col-span-6">
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-brand-border/80 shadow-xl relative overflow-hidden">
              <div className="mb-6">
                <h3 className="font-serif text-2xl font-bold text-brand-brown mb-1">
                  {t.concierge.formTitle}
                </h3>
                <p className="text-xs text-brand-brown-muted font-light">
                  {t.concierge.formSubtitle}
                </p>
              </div>

              {status === "success" ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto">
                    ✓
                  </div>
                  <h4 className="font-serif text-xl font-bold text-brand-brown">
                    {t.concierge.successTitle}
                  </h4>
                  <p className="text-xs text-brand-brown-muted max-w-sm mx-auto font-light leading-relaxed">
                    {feedback}
                  </p>
                  <button
                    onClick={() => {
                      setStatus("idle");
                      setName("");
                      setPhone("");
                      setEmail("");
                      setMessage("");
                    }}
                    className="mt-4 px-6 py-2.5 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {t.concierge.sendAnother}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-brown mb-1.5">
                      {t.concierge.fullName}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lord Alexander Wright"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-brand-sand-light/50 border border-brand-border rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-terracotta focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-brown mb-1.5">
                        {t.concierge.phone}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+20 100 000 0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-brand-sand-light/50 border border-brand-border rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-terracotta focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-brown mb-1.5">
                        {t.concierge.email}
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="alexander@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-brand-sand-light/50 border border-brand-border rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-terracotta focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-brown mb-1.5">
                      {t.concierge.serviceOfInterest}
                    </label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full px-4 py-3 bg-brand-sand-light/50 border border-brand-border rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-terracotta focus:bg-white transition-colors cursor-pointer"
                    >
                      <option value="villa-stay">{t.concierge.services.villaStay}</option>
                      <option value="yacht-charter">{t.concierge.services.yachtCharter}</option>
                      <option value="real-estate-viewing">{t.concierge.services.realEstate}</option>
                      <option value="private-chef">{t.concierge.services.privateChef}</option>
                      <option value="airport-fast-track">{t.concierge.services.airportTransfer}</option>
                      <option value="other-arrangements">{t.concierge.services.custom}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-brown mb-1.5">
                      {t.concierge.detailsLabel}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={t.concierge.detailsPlaceholder}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 bg-brand-sand-light/50 border border-brand-border rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-terracotta focus:bg-white transition-colors"
                    />
                  </div>

                  {status === "error" && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                      {feedback}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
                  >
                    {status === "loading"
                      ? t.concierge.sending
                      : t.concierge.sendButton}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
