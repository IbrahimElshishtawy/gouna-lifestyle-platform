"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default function PropertyAvailabilityRedirectPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/admin/properties/${resolvedParams.id}?tab=availability`);
  }, [resolvedParams.id, router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-xs text-brand-brown-muted">
      Redirecting to property availability...
    </div>
  );
}
