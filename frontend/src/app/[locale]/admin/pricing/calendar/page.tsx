"use client";

import { use, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default function PricingCalendarRedirectPage({ params }: PageProps) {
  use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const propertyId = searchParams.get("property_id");
    const query = new URLSearchParams();
    query.set("tab", "calendar");
    if (propertyId) query.set("property_id", propertyId);
    router.replace(`/admin/pricing?${query.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-xs text-brand-brown-muted">
      Redirecting to Pricing Calendar...
    </div>
  );
}
