"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import { useLanguage } from "@/context/LanguageContext";
import { login, challenge2fa } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const { locale, setLocale } = useLanguage();
  
  const [email, setEmail] = useState("superadmin@gounow.com");
  const [password, setPassword] = useState("SuperAdmin@2026!");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAutofill, setActiveAutofill] = useState<string | null>(null);

  // 2FA state
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (showTwoFactor) {
        await challenge2fa(twoFactorToken, twoFactorCode);
        router.push("/admin");
        return;
      }

      const res = await login({
        email: email.trim(),
        password,
        remember,
      });

      if (res?.data?.two_factor_required) {
        setTwoFactorToken(res.data.two_factor_token || "");
        setShowTwoFactor(true);
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Invalid administrative credentials. Please try again.");
      }
      setLoading(false);
    }
  };

  const handleAutofill = (demoEmail: string, demoPass: string, roleKey: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setActiveAutofill(roleKey);
    setTimeout(() => setActiveAutofill(null), 1200);
  };

  return (
    <div className="min-h-screen bg-[#F6F3EE] text-brand-brown flex flex-col justify-between p-4 sm:p-6 lg:p-8 selection:bg-brand-terracotta/20 selection:text-brand-terracotta">
      {/* 1. Top Navigation Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2 mb-4 sm:mb-6">
        {/* Brand Left */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-brand-terracotta flex items-center justify-center text-white shadow-sm p-2 group-hover:scale-105 transition-transform">
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-base tracking-wider text-brand-brown">
                GOUNOW
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-brand-terracotta/40 bg-brand-terracotta/10 text-brand-terracotta">
                Executive
              </span>
            </div>
            <span className="block text-[11px] text-brand-brown-muted font-light tracking-tight">
              Red Sea Coastal &amp; Portfolio Command
            </span>
          </div>
        </Link>

        {/* Status & Language Right */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Node Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-brand-border/80 shadow-xs text-xs text-brand-brown/80 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>El Gouna Node: Operational (99.98%)</span>
          </div>

          {/* Language Toggle Pill */}
          <div className="flex items-center bg-white/90 p-1 rounded-full border border-brand-border shadow-xs text-xs font-bold">
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                locale === "en"
                  ? "bg-brand-terracotta text-white shadow-xs"
                  : "text-brand-brown-muted hover:text-brand-brown"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLocale("ar")}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                locale === "ar"
                  ? "bg-brand-terracotta text-white shadow-xs"
                  : "text-brand-brown-muted hover:text-brand-brown"
              }`}
            >
              العربية
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Executive Split Card */}
      <main className="max-w-6xl w-full mx-auto my-auto py-2 sm:py-4">
        <div className="bg-white rounded-[28px] sm:rounded-3xl shadow-[0_25px_70px_-15px_rgba(61,46,38,0.12)] border border-brand-border/80 overflow-hidden flex flex-col lg:flex-row transition-all duration-300">
          
          {/* Left Column: Dark Executive Hero Panel */}
          <div className="w-full lg:w-[46%] bg-[#12100E] text-white p-7 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div
              className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full pointer-events-none opacity-40 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(184, 93, 59, 0.45) 0%, rgba(18, 16, 14, 0) 70%)",
              }}
            />
            <div
              className="absolute -left-20 -top-20 w-80 h-80 rounded-full pointer-events-none opacity-25 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(229, 220, 211, 0.3) 0%, rgba(18, 16, 14, 0) 70%)",
              }}
            />

            {/* Top Area: Badge & Heading */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[11px] text-[#E5DCD3] tracking-wider mb-6 sm:mb-8 backdrop-blur-sm">
                <svg
                  className="w-3.5 h-3.5 text-brand-terracotta fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
                <span className="font-medium">Authorized Enterprise Access Only</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] leading-[1.18] font-bold text-white tracking-tight">
                Architecture of{" "}
                <span className="italic font-normal text-[#D6A07A] font-serif block sm:inline">
                  Excellence
                </span>{" "}
                on the Red Sea.
              </h1>

              <p className="text-xs sm:text-sm text-[#C2B7AC] leading-relaxed font-light mt-4 max-w-md">
                GouNow Command centralizes ultra-luxury waterfront estates,
                private superyacht charters, and VIP concierge dispatch across
                El Gouna&apos;s premier lagoons.
              </p>
            </div>

            {/* Middle Area: Glassmorphism Metrics Card */}
            <div className="relative z-10 mt-8 lg:mt-12 bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-inner">
              {/* Metric 1 */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 text-[#C2B7AC]">
                  <span className="text-sm">🏡</span>
                  <span className="font-light">Active Villa Stays</span>
                </div>
                <span className="font-semibold text-white tracking-wide">
                  142 Properties
                </span>
              </div>

              {/* Metric 2 */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 text-[#C2B7AC]">
                  <span className="text-sm">⚓</span>
                  <span className="font-light">Marina Fleet Dispatches</span>
                </div>
                <span className="font-semibold text-white tracking-wide">
                  28 Active Charters
                </span>
              </div>

              {/* Metric 3 */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 text-[#C2B7AC]">
                  <span className="text-sm">✨</span>
                  <span className="font-light">Concierge Satisfaction</span>
                </div>
                <span className="font-semibold text-white tracking-wide">
                  99.4% (Q1 High-Season)
                </span>
              </div>
            </div>

            {/* Bottom Security Info */}
            <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#8E8379]">
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 text-brand-terracotta"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>256-Bit Hardware Encrypted</span>
              </div>
              <span className="font-mono text-[10px] tracking-wider text-[#A3978C]">
                v4.8.2-PROD
              </span>
            </div>
          </div>

          {/* Right Column: Light Authentication Panel */}
          <div className="w-full lg:w-[54%] bg-white p-7 sm:p-10 lg:p-12 flex flex-col justify-between">
            <div>
              {/* Star Emblem Box */}
              <div className="w-12 h-12 rounded-2xl border border-brand-terracotta/30 bg-brand-sand-light/60 flex items-center justify-center text-brand-terracotta mb-5 shadow-xs">
                <svg
                  className="w-6 h-6 fill-none stroke-current"
                  strokeWidth="1.75"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z"
                  />
                </svg>
              </div>

              {/* Title & Subtitle */}
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-brown tracking-tight">
                GouNow Management
              </h2>
              <p className="text-xs sm:text-sm text-brand-brown-muted mt-1.5 mb-6 font-light">
                Sign in to access your administrative workspace &amp; reservation engines
              </p>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                {showTwoFactor ? (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="twoFactorCode"
                        className="block text-[11px] font-bold text-brand-brown uppercase tracking-wider"
                      >
                        Two-Factor Authentication Code
                      </label>
                      <span className="text-[11px] text-brand-terracotta font-medium">
                        TOTP Verification
                      </span>
                    </div>
                    <input
                      id="twoFactorCode"
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      placeholder="000000"
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-center font-mono text-xl tracking-widest text-brand-brown placeholder-brand-brown-muted/30 focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20 focus:border-brand-terracotta transition-all shadow-xs"
                    />
                    <p className="text-[11px] text-brand-brown-muted mt-2">
                      Please enter the 6-digit code from your authenticator app.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Email Address */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="email"
                          className="block text-[11px] font-bold text-brand-brown uppercase tracking-wider"
                        >
                          Email Address
                        </label>
                        <span className="text-[11px] text-brand-brown-muted/80 font-light">
                          Single Sign-On Enabled
                        </span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-brown-muted/60">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.8"
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="admin@gounow.com"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-border bg-white text-sm text-brand-brown placeholder-brand-brown-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20 focus:border-brand-terracotta transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Security Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="password"
                          className="block text-[11px] font-bold text-brand-brown uppercase tracking-wider"
                        >
                          Security Password
                        </label>
                        <a
                          href="https://wa.me/201000000000?text=Hello%20GouNow%20IT,%20I%20need%20password%20reset%20assistance"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-brand-terracotta hover:text-brand-terracotta-dark font-medium transition-colors"
                        >
                          Need help?
                        </a>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-brown-muted/60">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.8"
                              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                            />
                          </svg>
                        </div>
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••••••"
                          className="w-full pl-10 pr-10 py-3 rounded-xl border border-brand-border bg-white text-sm text-brand-brown placeholder-brand-brown-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20 focus:border-brand-terracotta transition-all shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brand-brown-muted/60 hover:text-brand-brown transition-colors cursor-pointer"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.8"
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.8"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.8"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Remember & SSO Ready Row */}
                    <div className="flex items-center justify-between text-xs pt-1 pb-1">
                      <label className="flex items-center text-brand-brown cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={remember}
                          onChange={(e) => setRemember(e.target.checked)}
                          className="w-4 h-4 rounded text-brand-terracotta border-brand-border focus:ring-brand-terracotta cursor-pointer accent-[#B85D3B]"
                        />
                        <span className="ml-2 font-medium">Keep me signed in for 30 days</span>
                      </label>

                      <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                        <svg
                          className="w-3.5 h-3.5 text-emerald-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>SSO Ready</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-terracotta to-brand-terracotta-dark hover:from-brand-terracotta-dark hover:to-[#83381B] text-white text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Authenticating Session...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in to Platform</span>
                      <span className="text-base rtl:rotate-180">&rarr;</span>
                    </>
                  )}
                </button>
              </form>

              {/* Demo Test Accounts Section */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-brand-border" />
                </div>
                <span className="relative bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-brand-brown-muted">
                  Demo Test Accounts
                </span>
              </div>

              {/* Account Cards */}
              <div className="space-y-2.5">
                {/* Account 1: Super Admin */}
                <div
                  className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between ${
                    activeAutofill === "superadmin"
                      ? "border-brand-terracotta bg-brand-terracotta/5 shadow-xs"
                      : "border-brand-border/90 bg-brand-sand-light/40 hover:bg-brand-sand-light/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#181311] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      SA
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-brand-brown">
                          Super Admin
                        </span>
                        <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 px-1.5 py-0.2 rounded">
                          Full Access
                        </span>
                      </div>
                      <span className="text-[11px] text-brand-brown-muted block font-light">
                        superadmin@gounow.com
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleAutofill("superadmin@gounow.com", "SuperAdmin@2026!", "superadmin")
                    }
                    className="px-3 py-1.5 rounded-lg border border-brand-border bg-white text-[11px] font-semibold text-brand-brown hover:border-brand-terracotta hover:text-brand-terracotta hover:bg-brand-terracotta/5 transition-all shadow-2xs cursor-pointer shrink-0"
                  >
                    Auto Fill
                  </button>
                </div>

                {/* Account 2: Platform Admin */}
                <div
                  className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between ${
                    activeAutofill === "admin"
                      ? "border-brand-terracotta bg-brand-terracotta/5 shadow-xs"
                      : "border-brand-border/90 bg-brand-sand-light/40 hover:bg-brand-sand-light/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-terracotta text-white flex items-center justify-center text-xs font-bold shrink-0">
                      AD
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-brand-brown">
                          Administrator
                        </span>
                        <span className="text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200 px-1.5 py-0.2 rounded">
                          Operational Admin
                        </span>
                      </div>
                      <span className="text-[11px] text-brand-brown-muted block font-light">
                        admin@gounow.com
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleAutofill("admin@gounow.com", "Admin@2026!", "admin")
                    }
                    className="px-3 py-1.5 rounded-lg border border-brand-border bg-white text-[11px] font-semibold text-brand-brown hover:border-brand-terracotta hover:text-brand-terracotta hover:bg-brand-terracotta/5 transition-all shadow-2xs cursor-pointer shrink-0"
                  >
                    Auto Fill
                  </button>
                </div>

                {/* Account 3: Portfolio Director */}
                <div
                  className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between ${
                    activeAutofill === "sales"
                      ? "border-brand-terracotta bg-brand-terracotta/5 shadow-xs"
                      : "border-brand-border/90 bg-brand-sand-light/40 hover:bg-brand-sand-light/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-xs font-bold shrink-0">
                      RE
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-brand-brown">
                          Portfolio Director
                        </span>
                        <span className="text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200 px-1.5 py-0.2 rounded">
                          Real Estate CRM
                        </span>
                      </div>
                      <span className="text-[11px] text-brand-brown-muted block font-light">
                        sales@gounow.com
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleAutofill("sales@gounow.com", "GouNow@2026!Secure", "sales")
                    }
                    className="px-3 py-1.5 rounded-lg border border-brand-border bg-white text-[11px] font-semibold text-brand-brown hover:border-brand-terracotta hover:text-brand-terracotta hover:bg-brand-terracotta/5 transition-all shadow-2xs cursor-pointer shrink-0"
                  >
                    Auto Fill
                  </button>
                </div>
              </div>
            </div>

            {/* Return Link at bottom of form */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-brand-brown-muted hover:text-brand-terracotta transition font-medium"
              >
                <span className="rtl:rotate-180">&larr;</span>
                <span>Return to public guest site</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Global Footer */}
      <footer className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-xs text-brand-brown-muted font-light">
        <p>&copy; 2026 GouNow Lifestyle &amp; Real Estate Management Ltd. All rights reserved.</p>
        <div className="flex items-center gap-4 text-xs text-brand-brown-muted">
          <span className="hover:text-brand-brown cursor-pointer transition">Security Policy</span>
          <span>&bull;</span>
          <span className="hover:text-brand-brown cursor-pointer transition">Audit Logs</span>
          <span>&bull;</span>
          <span className="hover:text-brand-brown cursor-pointer transition">24/7 IT Concierge</span>
        </div>
      </footer>
    </div>
  );
}
