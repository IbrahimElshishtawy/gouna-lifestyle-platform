"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale-up" | "fade";
  delay?: number; // Delay in milliseconds
  duration?: number; // Duration in milliseconds
  className?: string;
  threshold?: number;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 700,
  className = "",
  threshold = 0.12,
  once = true,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once && domRef.current) {
              observer.unobserve(domRef.current);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    const currentEl = domRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, [threshold, once]);

  // Compute CSS transform and opacity based on animation type and visibility
  const getAnimationStyles = (): React.CSSProperties => {
    const baseTransition = `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;

    if (isVisible) {
      return {
        opacity: 1,
        transform: "translate3d(0, 0, 0) scale(1)",
        transition: baseTransition,
        willChange: "opacity, transform",
      };
    }

    switch (animation) {
      case "fade-up":
        return {
          opacity: 0,
          transform: "translate3d(0, 32px, 0)",
          transition: baseTransition,
          willChange: "opacity, transform",
        };
      case "fade-down":
        return {
          opacity: 0,
          transform: "translate3d(0, -32px, 0)",
          transition: baseTransition,
          willChange: "opacity, transform",
        };
      case "fade-left":
        return {
          opacity: 0,
          transform: "translate3d(-32px, 0, 0)",
          transition: baseTransition,
          willChange: "opacity, transform",
        };
      case "fade-right":
        return {
          opacity: 0,
          transform: "translate3d(32px, 0, 0)",
          transition: baseTransition,
          willChange: "opacity, transform",
        };
      case "scale-up":
        return {
          opacity: 0,
          transform: "translate3d(0, 20px, 0) scale(0.96)",
          transition: baseTransition,
          willChange: "opacity, transform",
        };
      case "fade":
      default:
        return {
          opacity: 0,
          transform: "translate3d(0, 0, 0)",
          transition: baseTransition,
          willChange: "opacity, transform",
        };
    }
  };

  return (
    <div ref={domRef} style={getAnimationStyles()} className={className}>
      {children}
    </div>
  );
}
