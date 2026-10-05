import React from "react";
import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/features/properties/services/properties.api";
import CheckoutClient from "@/features/checkout/components/CheckoutClient";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

interface Props {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
  searchParams: Promise<{
    check_in?: string;
    check_out?: string;
    guests?: string;
    promo_code?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const property = await getPropertyBySlug(slug);
  const isAr = locale === "ar";
  if (!property) return { title: isAr ? "إتمام الحجز" : "Booking Checkout" };

  return {
    title: `${isAr ? "إتمام حجز" : "Checkout -"} ${property.title} | ${isAr ? "جوناو الجونة" : "GouNow El Gouna"}`,
    description: isAr
      ? `أكمل حجز إقامتك الفاخرة في ${property.title} بالجونة مع تأكيد كونسيرج فوري.`
      : `Complete your luxury booking reservation for ${property.title} in El Gouna.`,
  };
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const query = await searchParams;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  // Calculate sensible default dates (Tomorrow -> +3 days) if not provided
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultCheckIn = tomorrow.toISOString().split("T")[0];

  const threeDaysLater = new Date(tomorrow);
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  const defaultCheckOut = threeDaysLater.toISOString().split("T")[0];

  const checkIn = query.check_in || defaultCheckIn;
  const checkOut = query.check_out || defaultCheckOut;
  const guests = parseInt(query.guests || "2", 10) || 2;
  const promoCode = query.promo_code || "";

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      <CheckoutClient
        property={property}
        initialCheckIn={checkIn}
        initialCheckOut={checkOut}
        initialGuests={guests}
        initialPromo={promoCode}
      />
    </div>
  );
}

