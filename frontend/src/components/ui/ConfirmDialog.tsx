"use client";

import React from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl border border-brand-border p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
              isDestructive
                ? "bg-rose-100 text-rose-700"
                : "bg-brand-sand-light text-brand-terracotta"
            }`}
          >
            {isDestructive ? "⚠️" : "ℹ️"}
          </div>
          <h3 className="font-serif text-lg font-bold text-brand-brown">
            {title}
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-brand-brown-muted font-light leading-relaxed">
          {description}
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border/60">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-brown hover:bg-brand-sand-light transition cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 ${
              isDestructive
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-brand-terracotta hover:bg-brand-terracotta-dark text-white"
            } disabled:opacity-50`}
          >
            {isLoading && (
              <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
