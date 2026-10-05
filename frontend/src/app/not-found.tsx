import React from "react";
import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#FAF8F5] text-[#3D2E26] p-6 text-center font-sans">
        <div className="max-w-md space-y-4">
          <span className="inline-block px-3 py-1 bg-[#B85D3B]/10 text-[#B85D3B] text-xs font-bold uppercase tracking-wider rounded-full">
            404 Error
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#3D2E26]">
            Page Not Found
          </h1>
          <p className="text-sm text-[#786B63]">
            The page you are looking for does not exist or has moved.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/en"
              className="px-6 py-3 bg-[#B85D3B] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#9A4A2B] transition"
            >
              English Home
            </Link>
            <Link
              href="/ar"
              className="px-6 py-3 bg-white border border-[#E8E2D9] text-[#3D2E26] rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-stone-50 transition"
            >
              الرئيسية بالعربية
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
