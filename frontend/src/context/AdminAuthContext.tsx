"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { getMe, getAbilities, logout, UserProfile, UserAbilitiesResponse } from "@/lib/api/auth";
import { getStoredAuthToken, setStoredAuthToken } from "@/lib/api/client";

interface AdminAuthContextType {
  user: UserProfile | null;
  abilities: UserAbilitiesResponse["data"] | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [abilities, setAbilities] = useState<UserAbilitiesResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = async () => {
    const token = getStoredAuthToken();
    if (!token) {
      setUser(null);
      setAbilities(null);
      setIsLoading(false);
      if (!pathname.endsWith("/admin/login")) {
        router.push("/admin/login");
      }
      return;
    }

    try {
      const [userProfile, userAbilities] = await Promise.all([
        getMe(),
        getAbilities(),
      ]);

      if (!userProfile) {
        setStoredAuthToken(null);
        setUser(null);
        setAbilities(null);
        if (!pathname.endsWith("/admin/login")) {
          router.push("/admin/login");
        }
      } else {
        setUser(userProfile);
        setAbilities(userAbilities);
      }
    } catch {
      setStoredAuthToken(null);
      setUser(null);
      setAbilities(null);
      if (!pathname.endsWith("/admin/login")) {
        router.push("/admin/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const signOut = async () => {
    try {
      await logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setStoredAuthToken(null);
      setUser(null);
      setAbilities(null);
      router.push("/admin/login");
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        abilities,
        isLoading,
        signOut,
        refreshAuth,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
