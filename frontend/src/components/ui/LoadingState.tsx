import React from "react";

interface LoadingStateProps {
  message?: string;
  rows?: number;
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full bg-white rounded-2xl border border-brand-border p-4 space-y-4 animate-pulse">
      <div className="h-8 bg-brand-sand-light rounded-xl w-1/4"></div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 bg-brand-sand-light/50 rounded-xl w-full flex items-center px-4 justify-between">
            <div className="h-4 bg-brand-sand rounded w-1/3"></div>
            <div className="h-4 bg-brand-sand rounded w-1/6"></div>
            <div className="h-4 bg-brand-sand rounded w-1/8"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 bg-white rounded-2xl border border-brand-border space-y-3 animate-pulse">
          <div className="h-4 bg-brand-sand-light rounded w-1/2"></div>
          <div className="h-8 bg-brand-sand rounded w-3/4"></div>
          <div className="h-3 bg-brand-sand-light rounded w-1/3"></div>
        </div>
      ))}
    </div>
  );
}

export default function LoadingState({ message = "Loading...", rows = 5 }: LoadingStateProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-brand-brown-muted font-medium">
        <span className="w-2 h-2 rounded-full bg-brand-terracotta animate-ping"></span>
        <span>{message}</span>
      </div>
      <TableSkeleton rows={rows} />
    </div>
  );
}
