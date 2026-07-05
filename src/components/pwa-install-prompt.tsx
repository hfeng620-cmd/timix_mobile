"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "timix-pwa-install-dismissed";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(DISMISSED_KEY)) return;

    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!showPrompt || !deferredPrompt) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShowPrompt(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    }
  }

  return (
    <div className="fixed bottom-20 left-3 right-3 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-500 lg:hidden">
      <div
        className="flex items-center gap-3 rounded-2xl border p-3 shadow-lg"
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(28px) saturate(200%)",
          WebkitBackdropFilter: "blur(28px) saturate(200%)",
          border: "1px solid rgba(255,255,255,0.14)",
        }}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--dt-primary)]/10">
          <Download className="h-5 w-5 text-[var(--dt-primary)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">\u5b89\u88c5 Timix \u5230\u624b\u673a</p>
          <p className="text-[11px] text-white/50">\u50cf App \u4e00\u6837\u4f7f\u7528\uff0c\u652f\u6301\u79bb\u7ebf\u8bbf\u95ee</p>
        </div>
        <button
          className="shrink-0 rounded-full bg-[var(--dt-primary)] px-3 py-1.5 text-xs font-bold text-black touch-press"
          onClick={handleInstall}
          type="button"
        >
          \u5b89\u88c5
        </button>
        <button
          aria-label="\u5173\u95ed"
          className="shrink-0 rounded-full p-1 text-white/40 transition hover:text-white/80"
          onClick={handleDismiss}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
