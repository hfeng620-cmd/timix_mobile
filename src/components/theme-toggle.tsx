"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "timin-theme";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("light", "dark");

  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.add(prefersDark ? "dark" : "light");
  } else {
    root.classList.add(theme);
  }
}

export function ThemeToggleInline() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = getStoredTheme();
    setTheme(stored);
    applyTheme(stored);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (getStoredTheme() === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  function handleToggle() {
    const next: Theme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  const label = theme === "light" ? "浅色" : theme === "dark" ? "深色" : "跟随系统";
  const icon = theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "💻";

  return (
    <button
      className="flex w-full items-center justify-between rounded-[14px] border border-[var(--color-line)] bg-[var(--color-soft)] px-3 py-3 text-sm font-semibold text-[var(--color-ink)] transition-all duration-300 hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)]"
      onClick={handleToggle}
      type="button"
    >
      <span>主题模式</span>
      <span className="flex items-center gap-1.5">
        <span>{icon}</span>
        <span className="text-xs text-[var(--color-muted)]">{label}</span>
      </span>
    </button>
  );
}

/** @deprecated Use ThemeToggleInline instead */
export const ThemeToggle = ThemeToggleInline;
