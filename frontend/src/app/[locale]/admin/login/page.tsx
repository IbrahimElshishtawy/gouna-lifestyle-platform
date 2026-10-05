"use client";

import React, { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useLanguage } from "@/context/LanguageContext";
import { login, challenge2fa } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const { locale, setLocale } = useLanguage();
  const isAr = locale === "ar";
  
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
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (
          err.status === 0 ||
          err.message?.includes("Failed to fetch") ||
          err.message?.includes("NetworkError") ||
          err.code === "NETWORK_ERROR"
        ) {
          setError(
            isAr
              ? "تعذر الاتصال بخادم النظام (127.0.0.1:8000). يرجى التأكد من تشغيل خادم Laravel backend."
              : "Unable to reach the backend API server (127.0.0.1:8000). Please ensure Laravel server is active."
          );
        } else {
          setError(err.message);
        }
      } else if (
        err instanceof Error &&
        (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))
      ) {
        setError(
          isAr
            ? "تعذر الاتصال بخادم النظام (127.0.0.1:8000). يرجى التأكد من تشغيل خادم Laravel backend."
            : "Unable to reach the backend API server (127.0.0.1:8000). Please ensure Laravel server is active."
        );
      } else {
        setError(
          isAr
            ? "بيانات الدخول الإدارية غير صحيحة. يرجى مراجعة البريد وكلمة المرور."
            : "Invalid administrative credentials. Please verify your email and password."
        );
      }
      setLoading(false);
    }
  };

  const handleAutofill = (demoEmail: string, demoPass: string, roleKey: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setActiveAutofill(roleKey);
    setTimeout(() => setActiveAutofill(null), 1200);
  };

  return (
    <div className="min-h-screen bg-[#F6F3EE] text-brand-brown flex flex-col justify-between p-3.5 sm:p-6 lg:p-8 selection:bg-brand-terracotta/20 selection:text-brand-terracotta">
      {/* 1. Top Navigation Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2 mb-3 sm:mb-6">
        {/* Brand Left */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-terracotta flex items-center justify-center text-white shadow-sm p-2 group-hover:scale-105 transition-transform">
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
              <span className="font-sans font-bold text-sm sm:text-base tracking-wider text-brand-brown">
                GOUNOW
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-brand-terracotta/40 bg-brand-terracotta/10 text-brand-terracotta">
                {isAr ? "لوحة الإدارة" : "Executive"}
              </span>
            </div>
            <span className="hidden sm:block text-[11px] text-brand-brown-muted font-light tracking-tight">
              {isAr ? "مركز قيادة المحفظة العقارية والساحلية بالجونة" : "Red Sea Coastal & Portfolio Command"}
            </span>
          </div>
        </Link>

        {/* Status & Language Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Node Status Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-brand-border/80 shadow-xs text-xs text-brand-brown/80 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{isAr ? "خادم الجونة: متصل ونشط (99.98%)" : "El Gouna Node: Operational (99.98%)"}</span>
          </div>

          {/* Language Toggle Pill */}
          <div className="flex items-center bg-white/90 p-1 rounded-full border border-brand-border shadow-xs text-xs font-bold">
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`px-2.5 sm:px-3 py-1 rounded-full transition-all cursor-pointer ${
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
              className={`px-2.5 sm:px-3 py-1 rounded-full transition-all cursor-pointer ${
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
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_-15px_rgba(61,46,38,0.12)] border border-brand-border/80 overflow-hidden flex flex-col lg:flex-row transition-all duration-300">
          
          {/* Column 1: Light Authentication Panel (Primary on mobile) */}
          <div className="w-full lg:w-[54%] bg-white p-5 sm:p-8 lg:p-12 flex flex-col justify-between order-1">
            <div>
              {/* Star Emblem Box */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border border-brand-terracotta/30 bg-brand-sand-light/60 flex items-center justify-center text-brand-terracotta mb-4 sm:mb-5 shadow-xs">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 fill-none stroke-current"
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
                {isAr ? "إدارة منصة جو ناو" : "GouNow Management"}
              </h2>
              <p className="text-xs sm:text-sm text-brand-brown-muted mt-1.5 mb-5 sm:mb-6 font-light">
                {isAr
                  ? "سجل الدخول للوصول إلى لوحة التحكم الإدارية ومحركات الحجز"
                  : "Sign in to access your administrative workspace & reservation engines"}
              </p>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 animate-fade-in-scale">
                  <span className="text-base shrink-0">⚠️</span>
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {showTwoFactor ? (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="twoFactorCode"
                        className="block text-[11px] font-bold text-brand-brown uppercase tracking-wider"
                      >
                        {isAr ? "رمز التحقق بخطوتين (2FA)" : "Two-Factor Authentication Code"}
                      </label>
                      <span className="text-[11px] text-brand-terracotta font-medium">
                        {isAr ? "تحقق TOTP" : "TOTP Verification"}
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
                      dir="ltr"
                    />
                    <p className="text-[11px] text-brand-brown-muted mt-2">
                      {isAr
                        ? "يرجى إدخال الرمز المكون من 6 أرقام من تطبيق المصادقة الخاص بك."
                        : "Please enter the 6-digit code from your authenticator app."}
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
                          {isAr ? "البريد الإلكتروني" : "Email Address"}
                        </label>
                        <span className="text-[10px] sm:text-[11px] text-brand-brown-muted/80 font-light">
                          {isAr ? "دخول موحد (SSO)" : "Single Sign-On Enabled"}
                        </span>
                      </div>
                      <div className="relative flex items-center">
                        <div className="absolute start-0 ps-3.5 pointer-events-none text-brand-brown-muted/60">
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
                          dir="ltr"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="admin@gounow.com"
                          className="w-full ps-10 pe-4 py-2.5 sm:py-3 rounded-xl border border-brand-border bg-white text-xs sm:text-sm text-brand-brown placeholder-brand-brown-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20 focus:border-brand-terracotta transition-all shadow-xs"
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
                          {isAr ? "كلمة المرور الإدارية" : "Security Password"}
                        </label>
                        <a
                          href="https://wa.me/201000000000?text=Hello%20GouNow%20IT,%20I%20need%20password%20reset%20assistance"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-brand-terracotta hover:text-brand-terracotta-dark font-medium transition-colors"
                        >
                          {isAr ? "المساعدة بالدخول؟" : "Need help?"}
                        </a>
                      </div>
                      <div className="relative flex items-center">
                        <div className="absolute start-0 ps-3.5 pointer-events-none text-brand-brown-muted/60">
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
                          dir="ltr"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••••••"
                          className="w-full ps-10 pe-10 py-2.5 sm:py-3 rounded-xl border border-brand-border bg-white text-xs sm:text-sm text-brand-brown placeholder-brand-brown-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20 focus:border-brand-terracotta transition-all shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute end-0 pe-3.5 flex items-center text-brand-brown-muted/60 hover:text-brand-brown transition-colors cursor-pointer"
                          title={showPassword ? (isAr ? "إخفاء كلمة المرور" : "Hide password") : (isAr ? "إظهار كلمة المرور" : "Show password")}
                        >
                          {showPassword ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Remember & SSO Ready Row */}
                    <div className="flex items-center justify-between text-xs pt-1 pb-1">
                      <label className="flex items-center text-brand-brown cursor-pointer select-none gap-2">
                        <input
                          type="checkbox"
                          checked={remember}
                          onChange={(e) => setRemember(e.target.checked)}
                          className="w-4 h-4 rounded text-brand-terracotta border-brand-border focus:ring-brand-terracotta cursor-pointer accent-[#B85D3B]"
                        />
                        <span className="font-medium text-[11px] sm:text-xs">
                          {isAr ? "تذكر جلسة تسجيل الدخول لمدة 30 يوماً" : "Keep me signed in for 30 days"}
                        </span>
                      </label>

                      <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-emerald-600 shrink-0">
                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{isAr ? "نظام دخول آمن" : "SSO Ready"}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 sm:py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-terracotta to-brand-terracotta-dark hover:from-brand-terracotta-dark hover:to-[#83381B] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>{isAr ? "جاري التحقق من الجلسة..." : "Authenticating Session..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{isAr ? "تسجيل الدخول إلى النظام" : "Sign in to Platform"}</span>
                      <span className="text-base rtl:rotate-180">&rarr;</span>
                    </>
                  )}
                </button>
              </form>

              {/* Demo Test Accounts Section */}
              <div className="relative my-5 sm:my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-brand-border" />
                </div>
                <span className="relative bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-brand-brown-muted">
                  {isAr ? "حسابات التجربة الإدارية السريعة" : "Demo Test Accounts"}
                </span>
              </div>

              {/* Account Cards */}
              <div className="space-y-2 sm:space-y-2.5">
                {/* Account 1: Super Admin */}
                <div
                  className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between ${
                    activeAutofill === "superadmin"
                      ? "border-brand-terracotta bg-brand-terracotta/5 shadow-xs"
                      : "border-brand-border/90 bg-brand-sand-light/40 hover:bg-brand-sand-light/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#181311] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      SA
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="font-bold text-xs text-brand-brown">
                          {isAr ? "المدير العام (سوبر أدمن)" : "Super Admin"}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 px-1.5 py-0.2 rounded">
                          {isAr ? "صلاحيات كاملة" : "Full Access"}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-brand-brown-muted block font-mono" dir="ltr">
                        superadmin@gounow.com
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleAutofill("superadmin@gounow.com", "SuperAdmin@2026!", "superadmin")
                    }
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-brand-border bg-white text-[10px] sm:text-[11px] font-semibold text-brand-brown hover:border-brand-terracotta hover:text-brand-terracotta hover:bg-brand-terracotta/5 transition-all shadow-2xs cursor-pointer shrink-0"
                  >
                    {isAr ? "تعبئة سريعة" : "Auto Fill"}
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
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-terracotta text-white flex items-center justify-center text-xs font-bold shrink-0">
                      AD
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="font-bold text-xs text-brand-brown">
                          {isAr ? "مدير المنصة" : "Administrator"}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200 px-1.5 py-0.2 rounded">
                          {isAr ? "إدارة تشغيلية" : "Operational Admin"}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-brand-brown-muted block font-mono" dir="ltr">
                        admin@gounow.com
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleAutofill("admin@gounow.com", "Admin@2026!", "admin")
                    }
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-brand-border bg-white text-[10px] sm:text-[11px] font-semibold text-brand-brown hover:border-brand-terracotta hover:text-brand-terracotta hover:bg-brand-terracotta/5 transition-all shadow-2xs cursor-pointer shrink-0"
                  >
                    {isAr ? "تعبئة سريعة" : "Auto Fill"}
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
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-xs font-bold shrink-0">
                      RE
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="font-bold text-xs text-brand-brown">
                          {isAr ? "مدير المحفظة العقارية" : "Portfolio Director"}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200 px-1.5 py-0.2 rounded">
                          {isAr ? "نظام CRM" : "Real Estate CRM"}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-brand-brown-muted block font-mono" dir="ltr">
                        sales@gounow.com
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleAutofill("sales@gounow.com", "GouNow@2026!Secure", "sales")
                    }
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-brand-border bg-white text-[10px] sm:text-[11px] font-semibold text-brand-brown hover:border-brand-terracotta hover:text-brand-terracotta hover:bg-brand-terracotta/5 transition-all shadow-2xs cursor-pointer shrink-0"
                  >
                    {isAr ? "تعبئة سريعة" : "Auto Fill"}
                  </button>
                </div>
              </div>
            </div>

            {/* Return Link at bottom of form */}
            <div className="mt-5 sm:mt-6 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-brand-brown-muted hover:text-brand-terracotta transition font-medium"
              >
                <span className="rtl:rotate-180">&larr;</span>
                <span>{isAr ? "العودة إلى الموقع العام للزوار" : "Return to public guest site"}</span>
              </Link>
            </div>
          </div>

          {/* Column 2: Dark Executive Hero Panel */}
          <div className="w-full lg:w-[46%] bg-[#12100E] text-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden order-2">
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[10px] sm:text-[11px] text-[#E5DCD3] tracking-wider mb-5 sm:mb-8 backdrop-blur-sm">
                <svg
                  className="w-3.5 h-3.5 text-brand-terracotta fill-current shrink-0"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
                <span className="font-medium">
                  {isAr ? "وصول مصرح للمسؤولين فقط" : "Authorized Enterprise Access Only"}
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl lg:text-[40px] leading-[1.2] font-bold text-white tracking-tight">
                {isAr ? (
                  <>
                    معمارية{" "}
                    <span className="italic font-normal text-[#D6A07A] font-serif">
                      التميز العقاري
                    </span>{" "}
                    على ساحل البحر الأحمر
                  </>
                ) : (
                  <>
                    Architecture of{" "}
                    <span className="italic font-normal text-[#D6A07A] font-serif">
                      Excellence
                    </span>{" "}
                    on the Red Sea
                  </>
                )}
              </h1>

              <p className="text-xs sm:text-sm text-[#C2B7AC] leading-relaxed font-light mt-3 sm:mt-4 max-w-md">
                {isAr
                  ? "مركز تحكم منصة جو ناو الموحد لإدارة أصول الفلل الفاخرة، وحجوزات اليخوت الخاصة، وجدولة خدمات الكونسيرج الاستثنائية في بحيرات الجونة."
                  : "GouNow Command centralizes ultra-luxury waterfront estates, private superyacht charters, and VIP concierge dispatch across El Gouna's premier lagoons."}
              </p>
            </div>

            {/* Middle Area: Glassmorphism Metrics Card */}
            <div className="relative z-10 mt-6 sm:mt-8 lg:mt-12 bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3 shadow-inner">
              {/* Metric 1 */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-[#C2B7AC]">
                  <span className="text-sm">🏡</span>
                  <span className="font-light">
                    {isAr ? "إقامات الفلل النشطة" : "Active Villa Stays"}
                  </span>
                </div>
                <span className="font-semibold text-white tracking-wide font-mono">
                  {isAr ? "142 وحدة معتمدة" : "142 Properties"}
                </span>
              </div>

              {/* Metric 2 */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-[#C2B7AC]">
                  <span className="text-sm">⚓</span>
                  <span className="font-light">
                    {isAr ? "أسطول المارينا واليخوت" : "Marina Fleet Dispatches"}
                  </span>
                </div>
                <span className="font-semibold text-white tracking-wide font-mono">
                  {isAr ? "28 يخت في الخدمة" : "28 Active Charters"}
                </span>
              </div>

              {/* Metric 3 */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-[#C2B7AC]">
                  <span className="text-sm">✨</span>
                  <span className="font-light">
                    {isAr ? "معدل رضا النزلاء VIP" : "Concierge Satisfaction"}
                  </span>
                </div>
                <span className="font-semibold text-white tracking-wide font-mono">
                  {isAr ? "99.4% (الموسم الأول)" : "99.4% (Q1 High-Season)"}
                </span>
              </div>
            </div>

            {/* Bottom Security Info */}
            <div className="relative z-10 mt-6 sm:mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#8E8379]">
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 text-brand-terracotta shrink-0"
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
                <span>{isAr ? "تشفير عتادي 256 بت" : "256-Bit Hardware Encrypted"}</span>
              </div>
              <span className="font-mono text-[10px] tracking-wider text-[#A3978C]" dir="ltr">
                v4.8.2-PROD
              </span>
            </div>
          </div>

        </div>
      </main>

      {/* 3. Global Footer */}
      <footer className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 sm:pt-4 text-xs text-brand-brown-muted font-light text-center sm:text-start">
        <p>
          {isAr
            ? "© 2026 جو ناو لإدارة نمط الحياة والفلل الفاخرة. جميع الحقوق محفوظة."
            : "© 2026 GouNow Lifestyle & Real Estate Management Ltd. All rights reserved."}
        </p>
        <div className="flex items-center gap-3 sm:gap-4 text-xs text-brand-brown-muted">
          <span className="hover:text-brand-brown cursor-pointer transition">
            {isAr ? "سياسة الأمان" : "Security Policy"}
          </span>
          <span>&bull;</span>
          <span className="hover:text-brand-brown cursor-pointer transition">
            {isAr ? "سجلات التدقيق" : "Audit Logs"}
          </span>
          <span>&bull;</span>
          <span className="hover:text-brand-brown cursor-pointer transition">
            {isAr ? "دعم تقني 24/7" : "24/7 IT Concierge"}
          </span>
        </div>
      </footer>
    </div>
  );
}
