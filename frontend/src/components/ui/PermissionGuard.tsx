"use client";

import React, { useEffect, useState } from "react";
import { getAbilities } from "@/lib/api/auth";

interface PermissionGuardProps {
  permission?: string;
  role?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * PermissionGuard: Checks whether the authenticated administrator possesses
 * the necessary permission or role before rendering sensitive actions.
 * Note: Frontend checks are for UX protection only; backend enforces security authoritatively.
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

      if (!abilities) {
        setHasAccess(false);
        return;
      }

      // Super admin has universal access
      if (abilities.is_admin && (abilities.permissions?.includes("*") || abilities.roles?.includes("super_admin"))) {
        setHasAccess(true);
        return;
      }

      let allowed = true;

      if (role && !abilities.roles?.includes(role)) {
        allowed = false;
      }

      if (permission && !abilities.permissions?.includes(permission)) {
        allowed = false;
      }

      setHasAccess(allowed);
    });

    return () => {
      mounted = false;
    };
  }, [permission, role]);

  if (hasAccess === null) {
    return null; // Still resolving abilities
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
