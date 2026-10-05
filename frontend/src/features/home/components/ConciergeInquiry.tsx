"use client";

import React, { useState } from "react";
import { submitConciergeInquiry } from "../services/home.api";
import { useLanguage } from "@/context/LanguageContext";
import { ChapterTag } from "@/components/ui/MotionPrimitives";

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
    <section id="concierge" className="py-14 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-12 bg-[#FAF8F5] border-t border-brand-border/80 scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left Column: Narrative & Direct VIP Channels (6 cols) */}
          <div className="lg:col-span-6">
            <ChapterTag
              number="CHAPTER 07"
              title={t.concierge.eyebrow}
              subtitle={t.concierge.subtitle}
            />
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown leading-[1.15]">
              {t.concierge.title}
            </h2>
            <p className="text-xs sm:text-sm text-brand-brown-muted mt-3 sm:mt-4 font-light leading-relaxed max-w-lg">
              {t.concierge.subtitle}
            </p>

            <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
              {/* Phone Channel */}
              <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-brand-border/70 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-brand-sand-light flex items-center justify-center text-brand-terracotta shrink-0">
                  <svg className="w-5 h-5 text-brand-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-[10px] sm:text-[11px] uppercase font-bold text-brand-brown-muted tracking-wider">
                    {t.concierge.directPhone}
                  </span>
                  <a
                    href="tel:+201000000000"
                    className="text-xs sm:text-sm font-bold text-brand-brown hover:text-brand-terracotta transition-colors"
                  >
                    +20 100 000 0000
                  </a>
                </div>
              </div>

              {/* Email Channel */}
              <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-brand-border/70 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-brand-sand-light flex items-center justify-center text-brand-terracotta shrink-0">
                  <svg className="w-5 h-5 text-brand-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <span className="block text-[10px] sm:text-[11px] uppercase font-bold text-brand-brown-muted tracking-wider">
                    {t.concierge.clientEmail}
                  </span>
                  <a
                    href="mailto:concierge@gounow.com"
                    className="text-xs sm:text-sm font-bold text-brand-brown hover:text-brand-terracotta transition-colors truncate block"
                  >
                    concierge@gounow.com
                  </a>
                </div>
              </div>

              {/* WhatsApp Fast Track */}
              <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200/70 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.943.514 1.785.78 2.796.78h.005c3.18 0 5.767-2.587 5.768-5.766.001-3.182-2.585-5.767-5.773-5.767zm3.375 8.16c-.14.394-.808.753-1.121.794-.312.041-.703.064-2.146-.532-1.748-.724-2.884-2.483-2.973-2.6-.088-.117-.714-.95-.714-1.812s.449-1.286.609-1.464c.16-.178.349-.223.465-.223.116 0 .233.001.335.006.107.006.251-.041.393.3.145.349.494 1.205.538 1.293.044.088.073.19.015.306-.058.117-.087.19-.174.292-.087.102-.184.228-.263.307-.087.087-.178.182-.077.356.102.175.452.747.97 1.208.667.594 1.229.778 1.404.865.174.087.276.073.378-.044.102-.117.436-.51.553-.685.116-.175.233-.146.393-.087.16.058 1.019.48 1.194.568.174.087.291.131.335.204.043.073.043.423-.097.817z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[10px] sm:text-[11px] uppercase font-bold text-emerald-800 tracking-wider truncate">
                    {t.concierge.instantWhatsApp}
                  </span>
                  <span className="block text-[11px] sm:text-xs text-emerald-700 font-light truncate">
                    {t.concierge.whatsappSub}
                  </span>
                </div>
                <a
                  href="https://wa.me/201000000000?text=Hello%20GouNow,%20I%20would%20like%20VIP%20concierge%20assistance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 sm:px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
                >
                  {t.concierge.chatNow}
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Tailored Arrangements Form Card (6 cols) */}
          <div className="lg:col-span-6">
            <div className="bg-white p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-brand-border/80 shadow-xl relative overflow-hidden">
              <div className="mb-5 sm:mb-6">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-brown mb-1">
                  {t.concierge.formTitle}
                </h3>
                <p className="text-xs text-brand-brown-muted font-light">
                  {t.concierge.formSubtitle}
                </p>
              </div>

              {status === "success" ? (
                <div className="py-8 sm:py-12 text-center space-y-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-serif text-lg sm:text-xl font-bold text-brand-brown">
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
                <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-brown mb-1">
                      {t.concierge.fullName}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lord Alexander Wright"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-brand-sand-light/50 border border-brand-border rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-terracotta focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-brown mb-1">
                        {t.concierge.phone}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+20 100 000 0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-brand-sand-light/50 border border-brand-border rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-terracotta focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-brown mb-1">
                        {t.concierge.email}
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="alexander@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-brand-sand-light/50 border border-brand-border rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-terracotta focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-brown mb-1">
                      {t.concierge.serviceOfInterest}
                    </label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-brand-sand-light/50 border border-brand-border rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-terracotta focus:bg-white transition-colors cursor-pointer"
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
                    <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-brown mb-1">
                      {t.concierge.detailsLabel}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={t.concierge.detailsPlaceholder}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-brand-sand-light/50 border border-brand-border rounded-xl text-xs text-brand-brown focus:outline-none focus:border-brand-terracotta focus:bg-white transition-colors"
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
                    className="w-full py-3.5 sm:py-4 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 cursor-pointer"
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
