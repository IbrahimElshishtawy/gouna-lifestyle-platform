import React from "react";

export default function WhatsAppButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href="https://wa.me/201000000000?text=Hello%20GouNow,%20I%20am%20interested%20in%20luxury%20stays%20and%20experiences%20in%20El%20Gouna"
        target="_blank"
        rel="noopener noreferrer"
        data-ga-event="contact_whatsapp_floating"
        data-ga-item="floating_widget"
        data-ga-category="concierge"
        className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group border border-emerald-400/30"
      >
        <span className="text-xl">💬</span>
        <div className="text-left hidden sm:block">
          <span className="block text-[10px] uppercase font-bold tracking-wider text-emerald-200">
            24/7 Concierge
          </span>
          <span className="block text-xs font-semibold">WhatsApp Desk</span>
        </div>
      </a>
    </div>
  );
}
