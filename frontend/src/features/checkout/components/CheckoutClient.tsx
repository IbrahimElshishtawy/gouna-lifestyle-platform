"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Property } from "@/features/properties/types/property.types";
import { PAYMENT_METHODS, processCheckout } from "../services/checkout.api";

interface CheckoutClientProps {
  property: Property;
  initialCheckIn: string;
  initialCheckOut: string;
  initialGuests: number;
  initialPromo: string;
}

export default function CheckoutClient({
  property,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  initialPromo,
}: CheckoutClientProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Egypt");
  const [specialRequests, setSpecialRequests] = useState("");

  const [paymentType, setPaymentType] = useState<"deposit" | "full">("full");
  const [paymentMethodId, setPaymentMethodId] = useState(1);
  const [promoCode, setPromoCode] = useState(initialPromo);
  const [appliedPromo, setAppliedPromo] = useState(initialPromo ? "VIP10" : "");
  const [openNights, setOpenNights] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmedRef, setBookingConfirmedRef] = useState<string | null>(null);

  // Compute stay duration
  const checkInDate = new Date(initialCheckIn);
  const checkOutDate = new Date(initialCheckOut);
  const diffTime = Math.max(0, checkOutDate.getTime() - checkInDate.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const basePricePerNight = Math.round(property.price_cents / 100);
  const baseStayAmount = basePricePerNight * nights;
  const cleaningFee = 1500;
  const serviceFee = 2000;
  const subtotal = baseStayAmount + cleaningFee + serviceFee;
  const discountAmount = appliedPromo ? Math.round(subtotal * 0.1) : 0;
  const taxable = subtotal - discountAmount;
  const taxAmount = Math.round(taxable * 0.14);
  const totalAmount = taxable + taxAmount;

  const depositRate = 0.3; // 30%
  const depositAmount = Math.round(totalAmount * depositRate);
  const remainingDepositBalance = totalAmount - depositAmount;

  const payableAmount = paymentType === "deposit" ? depositAmount : totalAmount;

  const formatEgp = (num: number) => new Intl.NumberFormat().format(num);

  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "VIP10" || promoCode.trim().length > 2) {
      setAppliedPromo(promoCode.trim().toUpperCase());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await processCheckout({
        property_id: property.id,
        check_in: initialCheckIn,
        check_out: initialCheckOut,
        guests: initialGuests,
        promo_code: appliedPromo,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        country,
        special_requests: specialRequests,
        payment_type: paymentType,
        payment_method_id: paymentMethodId,
      });

      const ref = res.booking_reference || `GON-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      setBookingConfirmedRef(ref);

      // WhatsApp concierge notification fallback matching legacy behavior
      const text = encodeURIComponent(
        `Hello GouNow VIP Reservations,\n\nI have submitted a booking reservation for ${property.title}.\nBooking Reference: ${ref}\nCheck-in: ${initialCheckIn}\nCheck-out: ${initialCheckOut} (${nights} Nights)\nGuests: ${initialGuests}\nGuest Name: ${firstName} ${lastName} (${phone || email})\nTotal: ${formatEgp(totalAmount)} EGP (Due Today: ${formatEgp(payableAmount)} EGP - ${paymentType.toUpperCase()})\n\nPlease confirm availability and payment verification.`
      );
      window.open(`https://wa.me/201000000000?text=${text}`, "_blank");
    } catch {
      setBookingConfirmedRef(`GON-2026-${Math.floor(100000 + Math.random() * 900000)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingConfirmedRef) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-6 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
          ✓
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-brand-terracotta">
          Reservation Request Confirmed
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-brown">
          Thank you, {firstName || "Guest"}!
        </h1>
        <p className="text-sm text-brand-brown-muted max-w-md mx-auto leading-relaxed">
          Your booking reference is{" "}
          <strong className="font-mono text-brand-brown">{bookingConfirmedRef}</strong>.
          Our VIP Concierge desk in Abu Tig Marina is reviewing your reservation details and will reach out shortly.
        </p>

        <div className="bg-white p-6 rounded-2xl border border-brand-border text-left max-w-md mx-auto text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-brand-brown-muted">Property:</span>
            <span className="font-bold text-brand-brown">{property.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-brown-muted">Dates:</span>
            <span className="font-medium text-brand-brown">
              {formatDateDisplay(initialCheckIn)} — {formatDateDisplay(initialCheckOut)} ({nights} Nights)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-brown-muted">Payable Due Today:</span>
            <span className="font-bold text-brand-terracotta">{formatEgp(payableAmount)} EGP</span>
          </div>
        </div>

        <div className="pt-4 flex justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition"
          >
            Return to Homepage
          </Link>
          <a
            href="https://wa.me/201000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2"
          >
            <span>💬</span> Concierge WhatsApp
          </a>
        </div>
      </div>
    );
  }

  const thumbImg = property.images?.[0]?.url || "/assets/images/bg-sand-texture.jpg";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-12">
      {/* Checkout Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-brand-brown-muted mb-6">
        <Link href="/" className="hover:text-brand-brown">
          Home
        </Link>
        <span>/</span>
        <Link href="/stays" className="hover:text-brand-brown">
          Stays
        </Link>
        <span>/</span>
        <Link href={`/stays/${property.slug}`} className="hover:text-brand-brown">
          {property.title}
        </Link>
        <span>/</span>
        <span className="text-brand-brown font-medium">Checkout</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* LEFT COLUMN: Checkout Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Guest Information */}
            <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-brand-border pb-3">
                <span className="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h2 className="font-bold text-brand-brown text-sm uppercase tracking-wider">
                  Guest Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Elena"
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Rostova"
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena@example.com"
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    Mobile / WhatsApp Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 100 000 0000"
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    Country of Residence
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Egypt, Germany, UAE..."
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-brand-brown-muted mb-1">
                    Special Requests or Arrival Notes
                  </label>
                  <textarea
                    rows={2}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Early check-in preferred, baby cot required, lagoon view preference..."
                    className="w-full text-xs bg-brand-sand-light/50 border border-brand-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Schedule Option */}
            <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-brand-border pb-3">
                <span className="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h2 className="font-bold text-brand-brown text-sm uppercase tracking-wider">
                  Payment Schedule
                </h2>
              </div>

              <div className="space-y-3">
                {/* Deposit Option */}
                <label
                  onClick={() => setPaymentType("deposit")}
                  className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentType === "deposit"
                      ? "border-brand-terracotta bg-brand-sand-light/50 ring-1 ring-brand-terracotta"
                      : "border-brand-border bg-white hover:bg-brand-sand-light/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_type"
                    value="deposit"
                    checked={paymentType === "deposit"}
                    onChange={() => setPaymentType("deposit")}
                    className="mt-1 text-brand-terracotta focus:ring-brand-terracotta"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-brown">
                        Pay Deposit Now
                      </span>
                      <span className="text-xs font-bold text-brand-terracotta">
                        {formatEgp(depositAmount)} EGP
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-brown-muted mt-1">
                      Pay 30.00% today. Remaining balance of {formatEgp(remainingDepositBalance)} EGP due 14 days before arrival.
                    </p>
                  </div>
                </label>

                {/* Full Payment Option */}
                <label
                  onClick={() => setPaymentType("full")}
                  className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentType === "full"
                      ? "border-brand-terracotta bg-brand-sand-light/50 ring-1 ring-brand-terracotta"
                      : "border-brand-border bg-white hover:bg-brand-sand-light/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_type"
                    value="full"
                    checked={paymentType === "full"}
                    onChange={() => setPaymentType("full")}
                    className="mt-1 text-brand-terracotta focus:ring-brand-terracotta"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-brown">
                        Pay In Full
                      </span>
                      <span className="text-xs font-bold text-brand-terracotta">
                        {formatEgp(totalAmount)} EGP
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-brown-muted mt-1">
                      Complete 100% of payment today for hassle-free instant express check-in upon arrival.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-brand-border pb-3">
                <span className="w-6 h-6 rounded-full bg-brand-terracotta text-white flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <h2 className="font-bold text-brand-brown text-sm uppercase tracking-wider">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                {PAYMENT_METHODS.map((pm) => {
                  const isSelected = paymentMethodId === pm.id;
                  return (
                    <label
                      key={pm.id}
                      onClick={() => setPaymentMethodId(pm.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-brand-terracotta bg-brand-sand-light/50 ring-1 ring-brand-terracotta"
                          : "border-brand-border bg-white hover:bg-brand-sand-light/20"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="payment_method_id"
                          value={pm.id}
                          checked={isSelected}
                          onChange={() => setPaymentMethodId(pm.id)}
                          className="text-brand-terracotta focus:ring-brand-terracotta"
                        />
                        <div>
                          <span className="block text-xs font-bold text-brand-brown">
                            {pm.name}
                          </span>
                          <span className="block text-[11px] text-brand-brown-muted">
                            {pm.description}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-brand-brown-muted uppercase bg-brand-sand-light px-2 py-0.5 rounded">
                        {pm.type}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 4. Cancellation & House Rules */}
            <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs text-xs text-brand-brown space-y-2">
              <h3 className="font-bold text-sm text-brand-brown mb-1">
                Moderate Cancellation Policy
              </h3>
              <p className="text-brand-brown-muted leading-relaxed">
                Full refund up to 7 days before check-in. 50% refund thereafter.
              </p>
              <p className="text-[11px] text-brand-brown-muted pt-2 border-t border-brand-border">
                By selecting &apos;Complete Reservation&apos;, you agree to the GouNow Villa Rental Terms, House Rules, and Privacy Policy.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? "Processing..." : "Complete Reservation & Pay"}</span>
              <span>({formatEgp(payableAmount)} EGP)</span>
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Financial Summary Card (5 Cols, Sticky) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
          <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
            {/* Property Header */}
            <div className="p-6 border-b border-brand-border flex items-center space-x-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-brand-sand shrink-0 border border-brand-border relative">
                <Image
                  src={thumbImg}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-brand-terracotta uppercase tracking-wider bg-brand-terracotta/10 px-2 py-0.5 rounded">
                  {property.category?.name || "Luxury Villa"}
                </span>
                <h3 className="font-bold text-brand-brown text-sm mt-1 leading-snug">
                  {property.title}
                </h3>
                <p className="text-[11px] text-brand-brown-muted mt-0.5">
                  📍 {property.location?.name || "El Gouna"}
                </p>
              </div>
            </div>

            {/* Dates & Guests Box */}
            <div className="p-6 border-b border-brand-border bg-brand-sand-light/30 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="border-r border-brand-border/80">
                <span className="block text-[10px] font-bold text-brand-brown-muted uppercase">
                  Check-in
                </span>
                <span className="font-bold text-brand-brown">
                  {formatDateDisplay(initialCheckIn)}
                </span>
              </div>
              <div className="border-r border-brand-border/80">
                <span className="block text-[10px] font-bold text-brand-brown-muted uppercase">
                  Check-out
                </span>
                <span className="font-bold text-brand-brown">
                  {formatDateDisplay(initialCheckOut)}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-brand-brown-muted uppercase">
                  Duration
                </span>
                <span className="font-bold text-brand-brown">
                  {nights} Nights • {initialGuests} Guests
                </span>
              </div>
            </div>

            {/* Price Breakdown Snapshot */}
            <div className="p-6 space-y-3 text-xs text-brand-brown">
              <div className="flex items-center justify-between">
                <span>Base Stay ({nights} Nights)</span>
                <span className="font-semibold">{formatEgp(baseStayAmount)} EGP</span>
              </div>

              {/* Nightly Accordion */}
              <div className="border-y border-brand-border/60 py-2">
                <button
                  type="button"
                  onClick={() => setOpenNights(!openNights)}
                  className="w-full flex items-center justify-between text-[11px] text-brand-terracotta font-semibold hover:underline"
                >
                  <span>Nightly Rate Details</span>
                  <span>{openNights ? "▲ Hide" : "▼ View"}</span>
                </button>
                {openNights && (
                  <div className="mt-2 space-y-1.5 pl-2 text-[11px] text-brand-brown-muted">
                    {Array.from({ length: nights }).map((_, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span>Night {idx + 1} (Standard Rate)</span>
                        <span className="font-medium text-brand-brown">
                          {formatEgp(basePricePerNight)} EGP
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span>Departure Cleaning Fee</span>
                <span className="font-semibold">{formatEgp(cleaningFee)} EGP</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Concierge & Guest Service Fee</span>
                <span className="font-semibold">{formatEgp(serviceFee)} EGP</span>
              </div>

              {appliedPromo && (
                <div className="flex items-center justify-between text-emerald-700 font-semibold">
                  <span>Promo Discount ({appliedPromo})</span>
                  <span>-{formatEgp(discountAmount)} EGP</span>
                </div>
              )}

              <div className="flex items-center justify-between text-brand-brown-muted">
                <span>Applicable Taxes (14%)</span>
                <span>{formatEgp(taxAmount)} EGP</span>
              </div>

              <div className="border-t border-brand-border pt-3 flex items-center justify-between text-sm font-bold">
                <span>Total Stay Amount</span>
                <span className="text-brand-terracotta text-base">
                  {formatEgp(totalAmount)} EGP
                </span>
              </div>

              {/* Due Today Highlight */}
              <div className="bg-brand-sand-light p-3.5 rounded-xl border border-brand-border mt-3">
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>Amount Due Today</span>
                  <span className="text-brand-terracotta text-sm">
                    {formatEgp(payableAmount)} EGP
                  </span>
                </div>
                {paymentType === "deposit" && (
                  <p className="text-[10px] text-brand-brown-muted mt-1">
                    Remaining {formatEgp(remainingDepositBalance)} EGP payable prior to arrival.
                  </p>
                )}
              </div>
            </div>

            {/* Promo Code Box */}
            <div className="p-6 bg-brand-sand-light/40 border-t border-brand-border">
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo / Voucher Code"
                  className="flex-1 text-xs rounded-xl border-brand-border py-2 px-3 uppercase font-mono bg-white focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                />
                <button
                  type="submit"
                  className="py-2 px-4 bg-brand-brown text-white text-xs font-semibold rounded-xl hover:bg-brand-brown-dark transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>
              {appliedPromo && (
                <p className="text-[10px] text-emerald-700 font-medium mt-1.5">
                  ✓ Voucher &quot;{appliedPromo}&quot; applied: 10% discount!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
