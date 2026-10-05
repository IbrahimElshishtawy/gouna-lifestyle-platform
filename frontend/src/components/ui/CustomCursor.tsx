"use client";

import React, { useEffect, useState } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(true);

  useEffect(() => {
    // Disable on touch devices
    if (typeof window === "undefined") return;
    if (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      setIsTouch(true);
      return;
    }
    setIsTouch(false);

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = Boolean(
          target.closest("a, button, input, select, textarea, [role='button'], .cursor-pointer, .interactive-hover")
        );
        setIsHovered(isClickable);
      }
    };

    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.body.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.body.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [isVisible]);

  if (isTouch || !isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[9999] top-0 left-0 transition-transform duration-75 ease-out will-change-transform"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
    >
      {/* Subtle outer aura ring */}
      <div
        className={`-translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-terracotta/40 transition-all duration-300 ease-out ${
          isHovered
            ? "w-10 h-10 bg-brand-terracotta/10 border-brand-terracotta/80 scale-125"
            : "w-5 h-5 bg-transparent scale-100"
        }`}
      />
      {/* Precision inner center dot */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-terracotta transition-all duration-200 ${
          isHovered ? "w-1.5 h-1.5 opacity-80" : "w-1 h-1 opacity-100"
        }`}
      />
    </div>
  );
}
