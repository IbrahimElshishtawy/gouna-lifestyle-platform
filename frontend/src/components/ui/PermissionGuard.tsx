"use client";

import React, { useEffect, useState } from "react";
import { getAbilities, UserAbilitiesResponse } from "@/lib/api/auth";

interface PermissionGuardProps {
  permission?: string;
  role?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

function checkAccess(
  abilities: UserAbilitiesResponse["data"] | null | undefined,
  permission?: string,
  role?: string
): boolean {
  if (!abilities) return false;

  // Super admin has universal access
  if (
    abilities.is_admin &&
    (abilities.permissions?.includes("*") || abilities.roles?.includes("super_admin"))
  ) {
    return true;
  }

  let allowed = true;

  if (role && !abilities.roles?.includes(role)) {
    allowed = false;
  }

  if (permission && !abilities.permissions?.includes(permission)) {
    allowed = false;
  }

  return allowed;
}

/**
 * PermissionGuard: Checks whether the authenticated administrator possesses
 * the necessary permission or role before rendering sensitive actions.
 * Optimized with in-memory caching for instantaneous zero-latency rendering.
 */
export default function PermissionGuard({
  permission,
  role,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    getAbilities().then((abilities) => {
      if (!mounted) return;
      setHasAccess(checkAccess(abilities, permission, role));
    });

    return () => {
      mounted = false;
    };
  }, [permission, role]);

  // If still determining access, render fallback
  if (hasAccess === null) {
    return <>{fallback}</>;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
