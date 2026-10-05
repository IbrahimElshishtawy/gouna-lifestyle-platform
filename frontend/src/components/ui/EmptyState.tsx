import React from "react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = "📂",
  title,
  description,
  actionText,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white rounded-2xl sm:rounded-3xl border border-dashed border-brand-border text-center space-y-4 my-6">
      <div className="w-14 h-14 rounded-2xl bg-brand-sand-light flex items-center justify-center text-2xl shadow-xs">
        <span>{icon}</span>
      </div>
      <div className="max-w-md space-y-1">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-brown">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-brand-brown-muted font-light leading-relaxed">
          {description}
        </p>
      </div>

      {actionText && (
        <div className="pt-2">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold transition shadow-xs"
            >
              <span>+</span>
              <span>{actionText}</span>
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span>{actionText}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
