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
              ? "تعذر الاتصال بالخادم. يرجى التأكد من تشغيل خادم النظام."
              : "Unable to reach the backend server. Please verify the API is running."
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
            ? "تعذر الاتصال بالخادم. يرجى التأكد من تشغيل خادم النظام."
            : "Unable to reach the backend server. Please verify the API is running."
        );
      } else {
        setError(
          isAr
            ? "بيانات الدخول غير صحيحة. يرجى مراجعة البريد وكلمة المرور."
            : "Invalid credentials. Please verify your email and password."
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
    setTimeout(() => setActiveAutofill(null), 1000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-brand-brown flex flex-col justify-between items-center p-4 sm:p-6 selection:bg-brand-terracotta/20 selection:text-brand-terracotta">
      {/* Top Bar: Minimal Brand & Language Switch */}
      <header className="w-full max-w-sm sm:max-w-md flex items-center justify-between py-2">
        <Link href="/" className="font-serif text-lg font-bold tracking-wider text-brand-brown hover:text-brand-terracotta transition">
          GOUNOW
        </Link>

        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={`px-2 py-0.5 rounded transition ${
              locale === "en" ? "font-bold text-brand-brown" : "text-brand-brown-muted hover:text-brand-brown"
            }`}
          >
            EN
          </button>
          <span className="text-brand-border">|</span>
          <button
            type="button"
            onClick={() => setLocale("ar")}
            className={`px-2 py-0.5 rounded transition ${
              locale === "ar" ? "font-bold text-brand-brown" : "text-brand-brown-muted hover:text-brand-brown"
            }`}
          >
            عربي
          </button>
        </div>
      </header>

      {/* Main Centered Compact Card */}
      <main className="w-full max-w-sm sm:max-w-md my-auto py-4">
        <div className="bg-white rounded-2xl border border-brand-border/70 shadow-xs sm:shadow-sm p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-brand-brown tracking-tight">
              {isAr ? "تسجيل الدخول للإدارة" : "Management Sign In"}
            </h1>
            <p className="text-xs text-brand-brown-muted mt-1">
              {isAr ? "أدخل بيانات حسابك للوصول للوحة التحكم" : "Enter your credentials to access the console"}
            </p>
          </div>

          {/* Error Message (Clean Text) */}
          {error && (
            <div className="mb-4 p-3 bg-red-50/90 border border-red-200/80 text-red-700 text-xs rounded-lg leading-relaxed">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {showTwoFactor ? (
              <div>
                <label
                  htmlFor="twoFactorCode"
                  className="block text-xs font-medium text-brand-brown mb-1.5"
                >
                  {isAr ? "رمز التحقق (2FA)" : "Two-Factor Code"}
                </label>
                <input
                  id="twoFactorCode"
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="000000"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border bg-white text-center font-mono text-lg tracking-widest text-brand-brown focus:outline-none focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta/20 transition"
                  dir="ltr"
                />
                <p className="text-[11px] text-brand-brown-muted mt-1.5">
                  {isAr ? "أدخل الرمز المكون من 6 أرقام من تطبيقك." : "Enter the 6-digit code from your authenticator app."}
                </p>
              </div>
            ) : (
              <>
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-brand-brown mb-1.5"
                  >
                    {isAr ? "البريد الإلكتروني" : "Email Address"}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gounow.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border bg-white text-xs sm:text-sm text-brand-brown placeholder-brand-brown-muted/40 focus:outline-none focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta/20 transition"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password"
                      className="block text-xs font-medium text-brand-brown"
                    >
                      {isAr ? "كلمة المرور" : "Password"}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-brand-brown-muted hover:text-brand-brown transition"
                    >
                      {showPassword ? (isAr ? "إخفاء" : "Hide") : (isAr ? "إظهار" : "Show")}
                    </button>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    dir="ltr"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border bg-white text-xs sm:text-sm text-brand-brown placeholder-brand-brown-muted/40 focus:outline-none focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta/20 transition"
                  />
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center text-xs text-brand-brown cursor-pointer select-none gap-2">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-brand-border text-brand-terracotta focus:ring-brand-terracotta accent-[#B85D3B]"
                    />
                    <span className="text-[11px] sm:text-xs text-brand-brown-muted">
                      {isAr ? "تذكر الجلسة" : "Keep me signed in"}
                    </span>
                  </label>

                  <a
                    href="https://wa.me/201000000000?text=Hello%20GouNow%20IT,%20I%20need%20password%20assistance"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-brand-brown-muted hover:text-brand-terracotta transition"
                  >
                    {isAr ? "مساعدة؟" : "Need help?"}
                  </a>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs sm:text-sm font-semibold transition active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {loading
                ? (isAr ? "جاري التحقق..." : "Signing in...")
                : (isAr ? "تسجيل الدخول" : "Sign In")}
            </button>
          </form>

          {/* Simple Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-brand-border/60">
            <span className="block text-[10px] font-medium text-brand-brown-muted mb-2 text-center uppercase tracking-wider">
              {isAr ? "تعبئة سريعة للتجربة" : "Quick Demo Fill"}
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleAutofill("superadmin@gounow.com", "SuperAdmin@2026!", "superadmin")}
                className={`py-1.5 px-2 rounded border text-[11px] font-medium transition cursor-pointer text-center truncate ${
                  activeAutofill === "superadmin"
                    ? "border-brand-terracotta bg-brand-terracotta/10 text-brand-terracotta"
                    : "border-brand-border bg-[#FAF8F5] text-brand-brown hover:border-brand-terracotta/50"
                }`}
                title="Super Admin"
              >
                {isAr ? "المدير العام" : "Super Admin"}
              </button>

              <button
                type="button"
                onClick={() => handleAutofill("admin@gounow.com", "Admin@2026!", "admin")}
                className={`py-1.5 px-2 rounded border text-[11px] font-medium transition cursor-pointer text-center truncate ${
                  activeAutofill === "admin"
                    ? "border-brand-terracotta bg-brand-terracotta/10 text-brand-terracotta"
                    : "border-brand-border bg-[#FAF8F5] text-brand-brown hover:border-brand-terracotta/50"
                }`}
                title="Administrator"
              >
                {isAr ? "المدير" : "Admin"}
              </button>

              <button
                type="button"
                onClick={() => handleAutofill("sales@gounow.com", "GouNow@2026!Secure", "sales")}
                className={`py-1.5 px-2 rounded border text-[11px] font-medium transition cursor-pointer text-center truncate ${
                  activeAutofill === "sales"
                    ? "border-brand-terracotta bg-brand-terracotta/10 text-brand-terracotta"
                    : "border-brand-border bg-[#FAF8F5] text-brand-brown hover:border-brand-terracotta/50"
                }`}
                title="Portfolio Sales"
              >
                {isAr ? "المبيعات" : "Sales"}
              </button>
            </div>
          </div>

          {/* Return Link */}
          <div className="mt-5 text-center">
            <Link
              href="/"
              className="text-xs text-brand-brown-muted hover:text-brand-terracotta transition"
            >
              {isAr ? "العودة للموقع الرئيسي" : "Return to public site"}
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full max-w-sm sm:max-w-md text-center py-2 text-[11px] text-brand-brown-muted">
        © 2026 GouNow Management
      </footer>
    </div>
  );
}
