"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Hook to detect reduced motion preference
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return prefersReduced;
}

/**
 * Reveal animation container using IntersectionObserver
 */
export function FadeIn({
  children,
  direction = "up",
  delay = 0,
  duration = 750,
  className = "",
}: {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [reducedMotion]);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const offsetMap = {
    up: "translate3d(0, 28px, 0)",
    down: "translate3d(0, -28px, 0)",
    left: "translate3d(-28px, 0, 0)",
    right: "translate3d(28px, 0, 0)",
    none: "translate3d(0, 0, 0)",
  };

  const style: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translate3d(0, 0, 0)" : offsetMap[direction],
    transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    willChange: "opacity, transform",
  };

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}

/**
 * Editorial Chapter Tag (e.g., CHAPTER 01 // SANCTUARY & VILLAS)
 */
export function ChapterTag({
  number,
  title,
  subtitle,
  dark = false,
}: {
  number: string;
  title: string;
  subtitle?: string;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-col items-start gap-1 mb-4 sm:mb-6">
      <div className="flex items-center gap-2.5">
        <span
          className={`text-[10px] font-mono tracking-[0.25em] uppercase font-bold px-2 py-0.5 rounded-sm ${
            dark
              ? "bg-white/10 text-white/80 border border-white/15"
              : "bg-brand-terracotta/10 text-brand-terracotta border border-brand-terracotta/20"
          }`}
        >
          {number}
        </span>
        <span
          className={`h-[1px] w-6 ${
            dark ? "bg-white/20" : "bg-brand-border"
          }`}
        />
        <span
          className={`text-[11px] uppercase tracking-[0.2em] font-semibold ${
            dark ? "text-white/70" : "text-brand-brown-muted"
          }`}
        >
          {title}
        </span>
      </div>
      {subtitle && (
        <span
          className={`text-xs font-light italic ps-0.5 ${
            dark ? "text-white/50" : "text-brand-brown-muted/70"
          }`}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}

/**
 * Cinematic Luxury Image with curtain reveal and gentle zoom
 */
export function ImageReveal({
  src,
  alt,
  className = "",
  aspectRatio = "aspect-[16/10]",
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  children?: React.ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden group ${aspectRatio} ${className} bg-stone-900`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-105 ${
          loaded ? "opacity-100 scale-100 filter-none" : "opacity-0 scale-105 blur-sm"
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}
