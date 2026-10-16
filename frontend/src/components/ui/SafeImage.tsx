"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

export interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
  fallbackIcon?: React.ReactNode;
  iconOnlyOnFailure?: boolean;
  containerClassName?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * Sanitizes URLs that might have accidental nested storage prefixes
 */
export function sanitizeMediaUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Handle accidental nested patterns like http://localhost:8000/storage/https://...
  const doubleNested = trimmed.match(/\/storage\/(https?:\/\/.*)/i);
  if (doubleNested && doubleNested[1]) {
    return doubleNested[1];
  }

  return trimmed;
}

/**
 * SafeImage component with automatic fallback to El Gouna icon / luxury emblem
 * when the image fails to load or has an invalid source.
 */
export default function SafeImage({
  src,
  alt = "El Gouna",
  fallbackSrc = "/assets/images/hero-villa-dusk.jpg",
  fallbackIcon,
  className = "",
  containerClassName = "",
  fill = false,
  width,
  height,
  priority = false,
  sizes,
  style,
  ...rest
}: SafeImageProps) {
  const cleanSrc = sanitizeMediaUrl(typeof src === "string" ? src : undefined);
  const [hasError, setHasError] = useState(!cleanSrc);
  const [currentSrc, setCurrentSrc] = useState<string>(cleanSrc || fallbackSrc);

  useEffect(() => {
    const nextClean = sanitizeMediaUrl(typeof src === "string" ? src : undefined);
    if (!nextClean) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(false);
      setCurrentSrc(nextClean);
    }
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
    }
  };

  // If image errored out, display the elegant El Gouna Icon replacement
  if (hasError) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#1C1714] via-[#2A231E] to-[#1C1714] text-brand-sand border border-white/5 select-none ${
          fill ? "w-full h-full absolute inset-0" : ""
        } ${containerClassName || className}`}
        style={!fill && width && height ? { width, height, ...style } : style}
        role="img"
        aria-label={alt || "El Gouna Signature"}
      >
        {/* Subtle Ambient Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        {/* Fallback Icon Container */}
        <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center">
          {fallbackIcon ? (
            fallbackIcon
          ) : (
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-2.5 flex items-center justify-center shadow-lg">
                <svg
                  className="w-7 h-7 text-[#DBC0A0]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="text-[10px] sm:text-[11px] font-serif tracking-[0.2em] uppercase text-[#DBC0A0] font-semibold drop-shadow-sm">
                GOUNOW · EL GOUNA
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      priority={priority}
      sizes={sizes}
      className={className}
      style={style}
      onError={handleError}
      {...rest}
    />
  );
}
