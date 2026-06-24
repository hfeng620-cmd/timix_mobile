"use client";

import { useEffect, useState } from "react";
import { useToast, type Toast } from "@/lib/toast-context";

const ICON: Record<Toast["type"], string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  warning: "⚠",
};

const COLOR: Record<Toast["type"], string> = {
  success: "#30D158",
  error: "#FF453A",
  info: "#0A84FF",
  warning: "#FF9500",
};

function ToastItem({ toast }: { toast: Toast }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation on next frame
    const enter = requestAnimationFrame(() => setVisible(true));

    // Start exit animation 300ms before removal
    const exit = setTimeout(() => setVisible(false), 3700);

    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(exit);
    };
  }, []);

  const icon = ICON[toast.type];
  const color = COLOR[toast.type];

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        maxWidth: 400,
        height: 48,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 280ms ease, transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        backgroundColor: "var(--color-panel)",
        color: "var(--color-ink)",
        boxShadow: "var(--shadow-card)",
        border: "1px solid var(--color-line)",
      }}
      className="mx-auto flex items-center gap-3 rounded-full px-5 text-sm font-medium"
    >
      <span
        aria-hidden
        style={{ color }}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
      >
        {icon}
      </span>
      <span className="truncate">{toast.message}</span>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="通知"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col-reverse items-center gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
