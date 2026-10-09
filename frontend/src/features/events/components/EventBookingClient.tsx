"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import SafeImage from "@/components/ui/SafeImage";
import { bookPublicEvent, inquirePublicEvent, type PublicEventItem } from "../services/events.api";

interface EventBookingClientProps {
  event: PublicEventItem;
  locale: string;
}

export default function EventBookingClient({ event, locale }: EventBookingClientProps) {
  const isAr = locale === "ar";
  const { attributes, relationships } = event;

  const ticketTypes = relationships?.ticket_types || [];
  const [selectedTicketId, setSelectedTicketId] = useState<number>(
    ticketTypes.length > 0 ? ticketTypes[0].id : 0
  );
  const [quantity, setQuantity] = useState<number>(1);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "instapay" | "cash_on_arrival">("card");
  const [specialRequests, setSpecialRequests] = useState("");

  // UI state
  const [tab, setTab] = useState<"tickets" | "vip_inquiry">("tickets");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<any>(null);

  // Selected ticket calculation
  const selectedTicket = ticketTypes.find((t) => t.id === selectedTicketId) || ticketTypes[0];
  const ticketPrice = selectedTicket ? selectedTicket.price : (attributes.min_price || 0);
  const totalPrice = ticketPrice * quantity;
  const currency = selectedTicket?.currency || "EGP";

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedTicket && ticketTypes.length > 0) {
      setErrorMsg(isAr ? "يرجى اختيار فئة التذكرة." : "Please select a ticket tier.");
      return;
    }
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg(isAr ? "يرجى إدخال كافة البيانات المطلوبة." : "Please fill in your name, email, and phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await bookPublicEvent(attributes.slug, {
        ticket_type_id: selectedTicketId || (ticketTypes[0]?.id ?? 1),
        quantity,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        payment_method: paymentMethod,
        special_requests: specialRequests,
      });

      setSuccessData(res.data);
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          (isAr
            ? "تعذر إتمام الحجز حالياً، يرجى المحاولة مرة أخرى أو التواصل مع الكونسيرج."
            : "Booking could not be completed. Please try again or reach out to VIP Concierge.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg(isAr ? "يرجى تعبئة جميع الحقول للتواصل معكم." : "Please provide your contact information.");
      return;
    }

    setLoading(true);
    try {
      const res = await inquirePublicEvent(attributes.slug, {
        name,
        email,
        phone,
        message: specialRequests || (isAr ? "طلب حجز مقاعد أو باقة كبار الزوار للفعالية" : "VIP Event Pass & Table Inquiry"),
      });

      setSuccessData({
        order_number: "INQ-" + Math.floor(100000 + Math.random() * 900000),
        event_title: isAr && attributes.title_ar ? attributes.title_ar : attributes.title_en,
        customer_name: name,
        customer_phone: phone,
        isInquiry: true,
        message: res.message,
      });
    } catch (err: any) {
      setErrorMsg(err?.message || (isAr ? "حدث خطأ أثناء إرسال الطلب." : "Failed to submit request."));
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border/80 shadow-2xl text-center max-w-xl mx-auto animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <span className="px-3 py-1 rounded-full bg-brand-terracotta/10 text-brand-terracotta text-xs font-bold uppercase tracking-widest mb-3 inline-block">
          {successData.isInquiry ? (isAr ? "تم استلام الطلب" : "Request Received") : (isAr ? "تم الحجز بنجاح" : "Booking Confirmed")}
        </span>

        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown mb-2">
          {isAr ? "تهانينا! حجزك مؤكد" : "Your Spot is Confirmed!"}
        </h3>

        <p className="text-sm text-brand-brown-muted mb-6 leading-relaxed">
          {isAr
            ? `شكراً لك، ${successData.customer_name}. تم تسجيل طلبك لـ "${successData.event_title}".`
            : `Thank you, ${successData.customer_name}. Your reservation for "${successData.event_title}" is confirmed.`}
        </p>

        {/* Order Details Card */}
        <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-brand-border/60 text-start space-y-3 mb-6">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-brand-border/50">
            <span className="text-brand-brown-muted">{isAr ? "رقم المرجع:" : "Reference #:"}</span>
            <span className="font-mono font-bold text-brand-brown text-sm">{successData.order_number}</span>
          </div>

          {successData.quantity && (
            <div className="flex justify-between items-center text-xs pb-2 border-b border-brand-border/50">
              <span className="text-brand-brown-muted">{isAr ? "عدد التذاكر:" : "Tickets:"}</span>
              <span className="font-semibold text-brand-brown">{successData.quantity}</span>
            </div>
          )}

          {successData.total_amount && (
            <div className="flex justify-between items-center text-xs pb-2 border-b border-brand-border/50">
              <span className="text-brand-brown-muted">{isAr ? "إجمالي المبلغ:" : "Total Amount:"}</span>
              <span className="font-serif font-bold text-base text-brand-terracotta">
                {successData.total_amount.toLocaleString()} {currency}
              </span>
            </div>
          )}

          {successData.tickets && successData.tickets.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase text-brand-brown block mb-2">
                {isAr ? "أرقام التذاكر الصادرة (جاهزة للدخول):" : "Issued Admission Codes:"}
              </span>
              <div className="space-y-1.5">
                {successData.tickets.map((t: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-brand-border/80 font-mono text-xs">
                    <span className="font-bold text-brand-terracotta">{t.ticket_number}</span>
                    <span className="text-[10px] text-brand-brown-muted">{t.ticket_type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* WhatsApp Share Button */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`https://wa.me/201000000000?text=${encodeURIComponent(
              `Hello GouNow Concierge, here is my Event Booking #${successData.order_number} for "${successData.event_title}". Name: ${successData.customer_name}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.353.101.173.448.74 1.018 1.246.732.651 1.349.852 1.541.947.192.095.304.08.418-.051.116-.13.491-.572.622-.767.13-.195.26-.163.439-.097.179.065 1.133.535 1.328.633.195.098.326.145.375.228.049.083.049.48-.095.885z" />
            </svg>
            <span>{isAr ? "إرسال التذكرة للكونسيرج عبر واتساب" : "Send Receipt to WhatsApp"}</span>
          </a>

          <Link
            href="/events"
            className="py-3 px-6 rounded-xl bg-brand-sand hover:bg-brand-sand-dark text-brand-brown font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center justify-center"
          >
            <span>{isAr ? "استكشف فعاليات أخرى" : "Browse More Events"}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-brand-border/80 shadow-xl">
      {/* Tab Switcher: Direct Tickets vs VIP Bespoke Request */}
      <div className="flex bg-[#F5EFEA] p-1.5 rounded-2xl mb-8 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setTab("tickets")}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            tab === "tickets"
              ? "bg-brand-terracotta text-white shadow-md shadow-brand-terracotta/20"
              : "text-brand-brown hover:text-brand-terracotta"
          }`}
        >
          {isAr ? "حجز التذاكر المباشر" : "Book Tickets"}
        </button>
        <button
          type="button"
          onClick={() => setTab("vip_inquiry")}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            tab === "vip_inquiry"
              ? "bg-brand-terracotta text-white shadow-md shadow-brand-terracotta/20"
              : "text-brand-brown hover:text-brand-terracotta"
          }`}
        >
          {isAr ? "طلب طاولة أو باقة VVIP" : "VIP Table & Concierge"}
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm text-center">
          {errorMsg}
        </div>
      )}

      {tab === "tickets" ? (
        <form onSubmit={handleBooking} className="space-y-8">
          {/* 1. Ticket Tier Selection */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-brand-brown mb-3">
              {isAr ? "1. اختر فئة التذكرة" : "1. Select Ticket Tier"}
            </label>

            {ticketTypes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ticketTypes.map((tier) => {
                  const selected = selectedTicketId === tier.id;
                  const tierName = isAr && tier.name_ar ? tier.name_ar : tier.name_en;

                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setSelectedTicketId(tier.id)}
                      className={`p-4 sm:p-5 rounded-2xl border text-start transition-all cursor-pointer relative ${
                        selected
                          ? "border-brand-terracotta bg-[#FFF8F5] shadow-md ring-2 ring-brand-terracotta/20"
                          : "border-brand-border/80 hover:border-brand-terracotta/50 bg-[#FAF8F5]"
                      }`}
                    >
                      {selected && (
                        <span className="absolute top-3 end-3 w-5 h-5 rounded-full bg-brand-terracotta text-white flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                      )}
                      <h4 className="font-serif font-bold text-sm sm:text-base text-brand-brown mb-1">
                        {tierName}
                      </h4>
                      <p className="text-xs text-brand-brown-muted line-clamp-2 mb-3 font-light">
                        {tier.description || (isAr ? "دخول الفعالية وحضور كافة الفقرات." : "General Admission & Access")}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-brand-border/40">
                        <span className="font-serif font-bold text-base text-brand-terracotta">
                          {tier.price.toLocaleString()} {tier.currency}
                        </span>
                        {tier.available !== undefined && (
                          <span className="text-[10px] text-brand-brown-muted font-mono">
                            {isAr ? `متبقي ${tier.available}` : `${tier.available} left`}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-brand-border text-center text-xs text-brand-brown-muted">
                {isAr
                  ? "التذاكر متاحة عبر طلب باقة الحضور لكبار الزوار أو التسجيل المسبق."
                  : "Tickets are available through invitation or VIP concierge pre-registration."}
              </div>
            )}
          </div>

          {/* 2. Quantity Counter */}
          <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-2xl border border-brand-border/80">
            <div>
              <span className="block text-xs font-mono uppercase tracking-wider text-brand-brown">
                {isAr ? "2. عدد التذاكر المطلوبة" : "2. Quantity"}
              </span>
              <span className="text-[11px] text-brand-brown-muted">
                {isAr ? `الحد الأقصى ${selectedTicket?.max_per_order || 10} تذاكر لكل طلب` : `Max ${selectedTicket?.max_per_order || 10} tickets per order`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 rounded-xl bg-white border border-brand-border text-brand-brown font-bold flex items-center justify-center hover:bg-brand-sand transition"
              >
                -
              </button>
              <span className="w-8 text-center font-bold text-base text-brand-brown">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(selectedTicket?.max_per_order || 10, quantity + 1))}
                className="w-9 h-9 rounded-xl bg-white border border-brand-border text-brand-brown font-bold flex items-center justify-center hover:bg-brand-sand transition"
              >
                +
              </button>
            </div>
          </div>

          {/* 3. Customer Information */}
          <div className="space-y-4">
            <label className="block text-xs font-mono uppercase tracking-wider text-brand-brown">
              {isAr ? "3. بيانات الحضور والتواصل" : "3. Attendee & Contact Details"}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-brand-brown-muted mb-1">
                  {isAr ? "الاسم بالكامل *" : "Full Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAr ? "مثال: كريم الشناوي" : "e.g. Karim El Shennawy"}
                  className="w-full px-4 py-3 rounded-xl border border-brand-border focus:outline-none focus:border-brand-terracotta bg-[#FAF8F5] text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-brand-brown-muted mb-1">
                  {isAr ? "البريد الإلكتروني *" : "Email Address *"}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-brand-border focus:outline-none focus:border-brand-terracotta bg-[#FAF8F5] text-xs sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-brand-brown-muted mb-1">
                  {isAr ? "رقم الهاتف / واتساب *" : "Phone / WhatsApp *"}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+20 100 000 0000"
                  className="w-full px-4 py-3 rounded-xl border border-brand-border focus:outline-none focus:border-brand-terracotta bg-[#FAF8F5] text-xs sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-brand-brown-muted mb-1">
                  {isAr ? "ملاحظات أو طلبات خاصة (اختياري)" : "Special Requests (Optional)"}
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder={isAr ? "ترتيب مقاعد متجاورة، باقة استقبال، الخ..." : "Adjacent seating, dietary restrictions..."}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-terracotta bg-[#FAF8F5] text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* 4. Payment Method */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-brand-brown mb-3">
              {isAr ? "4. طريقة الدفع" : "4. Payment Method"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "card", label_en: "Credit / Debit Card", label_ar: "بطاقة بنكية / فيزا", icon: "💳" },
                { id: "instapay", label_en: "InstaPay / Wallet", label_ar: "إنستاباي / محفظة", icon: "⚡" },
                { id: "cash_on_arrival", label_en: "Pay at Entry", label_ar: "الدفع عند الوصول", icon: "🎟️" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-3 rounded-xl border text-start flex items-center gap-2.5 transition cursor-pointer ${
                    paymentMethod === m.id
                      ? "border-brand-terracotta bg-[#FFF8F5] text-brand-terracotta font-bold"
                      : "border-brand-border bg-[#FAF8F5] text-brand-brown"
                  }`}
                >
                  <span className="text-lg">{m.icon}</span>
                  <span className="text-xs">{isAr ? m.label_ar : m.label_en}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Summary & Submit */}
          <div className="p-5 bg-gradient-to-r from-brand-sand-light to-[#FAF8F5] rounded-2xl border border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="block text-xs text-brand-brown-muted font-mono">
                {isAr ? "الإجمالي المستحق" : "Total Amount Due"}
              </span>
              <span className="font-serif text-2xl font-bold text-brand-brown">
                {totalPrice.toLocaleString()} {currency}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-dark disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-brand-terracotta/30 hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading && <span className="animate-spin">⏳</span>}
              <span>{isAr ? "تأكيد الحجز والدفع" : "Confirm & Complete Booking"}</span>
            </button>
          </div>
        </form>
      ) : (
        /* VIP Inquiry Form */
        <form onSubmit={handleInquiry} className="space-y-6">
          <div className="p-4 bg-brand-sand/50 rounded-2xl border border-brand-border text-xs text-brand-brown leading-relaxed">
            {isAr
              ? "يتولى فريق كونسيرج الجونة ترتيب طاولات VVIP الخاصة، تصاريح السجادة الحمراء، والخدمات الخاصة لك ولضيوفك."
              : "Our Concierge arranges private VVIP tables, backstage access, and bespoke hospitality packages for this event."}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-brand-brown-muted mb-1">{isAr ? "الاسم *" : "Name *"}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isAr ? "الاسم الكريم" : "Your Name"}
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-[#FAF8F5] text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-brand-brown-muted mb-1">{isAr ? "البريد الإلكتروني *" : "Email *"}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vip@example.com"
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-[#FAF8F5] text-xs sm:text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-brand-brown-muted mb-1">{isAr ? "رقم الهاتف / واتساب *" : "Phone / WhatsApp *"}</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 100 000 0000"
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-[#FAF8F5] text-xs sm:text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-brand-brown-muted mb-1">{isAr ? "تفاصيل الطلب أو عدد الضيوف" : "Request Details / Guests Count"}</label>
              <textarea
                rows={3}
                required
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder={isAr ? "أود حجز طاولة خاصة لـ 6 أفراد مع سيارة فاخرة..." : "Looking for private table for 6 guests with chauffeur..."}
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-[#FAF8F5] text-xs sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-dark disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-brand-terracotta/30 hover:scale-[1.01] active:scale-95 cursor-pointer"
          >
            {isAr ? "إرسال طلب كبار الزوار للكونسيرج" : "Submit VIP Concierge Request"}
          </button>
        </form>
      )}
    </div>
  );
}
