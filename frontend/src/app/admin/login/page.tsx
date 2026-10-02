"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@gounow.com");
  const [password, setPassword] = useState("GouNow@2026!Secure");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate authentication and set session cookie/storage
      if (typeof window !== "undefined") {
        localStorage.setItem("gounow_admin_auth", "true");
        localStorage.setItem("gounow_admin_email", email);
      }
      setTimeout(() => {
        router.push("/admin");
      }, 500);
    } catch {
      setError("Invalid administrative credentials. Please try again.");
      setLoading(false);
    }
  };

  const handleAutofill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#FAF8F5] text-brand-brown relative">
      {/* Language Selector Header */}
      <div className="absolute top-6 right-6">
        <div className="flex items-center bg-white/80 backdrop-blur-xs p-1 rounded-xl border border-brand-border text-xs font-bold shadow-xs">
          <span className="px-3 py-1 rounded-lg transition-all bg-brand-terracotta text-white">
            English
          </span>
          <span className="px-3 py-1 rounded-lg transition-all text-brand-brown-muted hover:text-brand-brown cursor-pointer">
            العربية
          </span>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Official Brand Logo */}
        <div className="inline-block p-1 bg-white rounded-2xl shadow-sm border border-brand-border mb-4">
          <div className="h-16 w-16 relative rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500/15 to-brand-terracotta/20 p-2.5">
            <Image
              src="/assets/images/official-elgouna-icon.png"
              alt="El Gouna"
              width={48}
              height={48}
              className="object-contain drop-shadow"
            />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-brown tracking-tight">
          GOUNOW Management
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-brand-brown-muted">
          Sign in to access your administrative workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-md shadow-brand-brown/5 rounded-3xl border border-brand-border sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-brand-brown uppercase tracking-wider mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gounow.com"
                  className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-sand-light/40 text-brand-brown placeholder-brand-brown-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-terracotta focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-brand-brown uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-sand-light/40 text-brand-brown placeholder-brand-brown-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-terracotta focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            {/* Remember Me & Help */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-brand-brown cursor-pointer">
                <input
                  type="checkbox"
                  name="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-terracotta border-brand-border focus:ring-brand-terracotta"
                />
                <span className="ml-2 font-medium">Remember me</span>
              </label>

              <span className="text-brand-brown-muted hover:text-brand-terracotta cursor-pointer transition-colors">
                Need help?
              </span>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-xs text-sm font-bold text-white bg-brand-terracotta hover:bg-brand-terracotta-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-terracotta transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in to Platform"}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="mt-8 pt-6 border-t border-brand-border">
            <span className="block text-[11px] font-bold text-brand-brown uppercase tracking-wider text-center mb-3">
              Demo Test Accounts
            </span>
            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  handleAutofill("admin@gounow.com", "GouNow@2026!Secure")
                }
                className="w-full p-2.5 rounded-xl bg-brand-sand-light/70 hover:bg-brand-sand border border-brand-border flex items-center justify-between transition-colors text-left"
              >
                <div>
                  <span className="font-bold text-brand-brown block">
                    Super Admin
                  </span>
                  <span className="text-[11px] text-brand-brown-muted">
                    admin@gounow.com
                  </span>
                </div>
                <span className="font-mono text-[10px] bg-white px-2 py-1 rounded border border-brand-border text-brand-terracotta font-semibold">
                  Auto Fill
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleAutofill("stays@gounow.com", "GouNow@2026!Secure")
                }
                className="w-full p-2.5 rounded-xl bg-brand-sand-light/70 hover:bg-brand-sand border border-brand-border flex items-center justify-between transition-colors text-left"
              >
                <div>
                  <span className="font-bold text-brand-brown block">
                    Property Manager
                  </span>
                  <span className="text-[11px] text-brand-brown-muted">
                    stays@gounow.com
                  </span>
                </div>
                <span className="font-mono text-[10px] bg-white px-2 py-1 rounded border border-brand-border text-brand-terracotta font-semibold">
                  Auto Fill
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs text-brand-brown-muted hover:text-brand-terracotta transition"
            >
              &larr; Return to public site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
