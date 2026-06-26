"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ThemeToggleInline, type ThemeToggleView } from "@/components/theme-toggle";
import { siteLinks } from "@/lib/site-links";

const HINT_DISMISSED_KEY = "relay-theme-hint-seen";

const navigationRoutes = [
  {
    label: "榜单",
    href: "/stations",
  },
  {
    label: "模型",
    href: "/models",
  },
  {
    label: "指南",
    href: "/guides",
  },
  {
    label: "社区",
    href: "/community",
  },
] as const;

const utilityRoutes = [
  {
    label: "首页",
    href: "/",
    description: "回到总览入口",
  },
  {
    label: "我的",
    href: "/profile",
    description: "查看个人记录与收藏",
  },
] as const;

function isRouteActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

type AppearancePanel = Extract<ThemeToggleView, "theme" | "palette">;

export function FloatingQuickPanel() {
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [appearancePanel, setAppearancePanel] = useState<AppearancePanel | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (appearancePanel) return;
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [appearancePanel]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(HINT_DISMISSED_KEY)) return;
    setShowHint(true);
  }, []);

  useEffect(() => {
    setOpen(false);
    setAppearancePanel(null);
  }, [pathname]);

  useEffect(() => {
    if (!appearancePanel) return;
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAppearancePanel(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [appearancePanel]);

  function dismissHint() {
    setShowHint(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(HINT_DISMISSED_KEY, "1");
    }
  }

  function openAppearancePanel(panel: AppearancePanel) {
    setOpen(false);
    setAppearancePanel(panel);
    dismissHint();
  }

  return (
    <>
    <div className="fixed bottom-20 left-4 z-[70] lg:bottom-4" data-selection-comments="off" ref={wrapperRef}>
      {open ? (
        <div
          aria-label="导航与快捷操作"
          className="surface-in mb-3 w-[328px] overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-[var(--surface-gradient)] p-4 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur"
          id="quick-panel-menu"
          role="navigation"
        >
          <div className="border-b border-[var(--color-line)] pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[var(--color-ink)]">观察站导航台</p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                  常用入口、主题和配色都收在这里。
                </p>
              </div>
              <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-brand-deep)]">
                UI
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                className="rounded-[14px] border border-[var(--color-line)] bg-[var(--color-soft)] px-3 py-3 text-left text-sm font-bold text-[var(--color-ink)] transition hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand-deep)]"
                onClick={() => openAppearancePanel("theme")}
                type="button"
              >
                主题
              </button>
              <button
                className="rounded-[14px] border border-[var(--color-line)] bg-[var(--color-soft)] px-3 py-3 text-left text-sm font-bold text-[var(--color-ink)] transition hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand-deep)]"
                onClick={() => openAppearancePanel("palette")}
                type="button"
              >
                配色
              </button>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              主导航
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {navigationRoutes.map((item) => {
                const active = isRouteActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-[14px] border px-3 py-3 text-sm font-semibold transition-all duration-300 ${
                      active
                        ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand-deep)] shadow-[0_10px_26px_rgba(37,99,235,0.12)]"
                        : "border-[var(--color-line)] bg-[var(--color-soft)] text-[var(--color-ink)] hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand-deep)]"
                    }`}
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              辅助入口
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {utilityRoutes.map((item) => {
                const active = isRouteActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-[14px] border px-3 py-3 text-left transition-all duration-300 ${
                      active
                        ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand-deep)]"
                        : "border-[var(--color-line)] bg-[var(--color-soft)] text-[var(--color-ink)] hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand-deep)]"
                    }`}
                    href={item.href}
                  >
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                      {item.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              协作入口
            </p>
            <div className="mt-2 grid gap-2">
              <a
                className="rounded-[14px] border border-[var(--color-line)] bg-[var(--color-soft)] px-3 py-3.5 text-sm font-semibold text-[var(--color-ink)] transition-all duration-300 hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand-deep)]"
                href={siteLinks.discussions}
                rel="noopener noreferrer"
                target="_blank"
              >
                GitHub Discussions
              </a>
              <a
                className="rounded-[14px] border border-[var(--color-line)] bg-[var(--color-soft)] px-3 py-3.5 text-sm font-semibold text-[var(--color-ink)] transition-all duration-300 hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand-deep)]"
                href={siteLinks.repo}
                rel="noopener noreferrer"
                target="_blank"
              >
                GitHub 仓库
              </a>
            </div>
          </div>
        </div>
      ) : null}

      <button
        aria-label="打开导航与外观面板"
        aria-controls="quick-panel-menu"
        aria-expanded={open}
        className={`relative flex h-11 min-w-11 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-4 text-sm font-bold text-[var(--color-brand-deep)] shadow-[0_12px_34px_rgba(15,23,42,0.14)] transition hover:border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)] ${showHint ? "theme-hint-pulse" : ""}`}
        onClick={() => {
          setOpen((current) => !current);
          dismissHint();
        }}
        type="button"
      >
        <span className="mr-1.5 text-base leading-none" aria-hidden="true">✦</span>
        导航 / 外观
      </button>
    </div>
    {appearancePanel ? (
      <div
        aria-labelledby="appearance-dialog-title"
        aria-modal="true"
        className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(15,23,42,0.34)] p-4 backdrop-blur-md"
        data-selection-comments="off"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setAppearancePanel(null);
          }
        }}
        role="dialog"
      >
        <div
          className="surface-in max-h-[82vh] w-full max-w-2xl overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-[var(--surface-gradient)] shadow-[0_28px_90px_rgba(15,23,42,0.26)]"
          ref={panelRef}
        >
          <div className="flex items-start justify-between gap-4 border-b border-[var(--color-line)] px-5 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                外观快捷
              </p>
              <h2 id="appearance-dialog-title" className="mt-1 text-xl font-black text-[var(--color-ink)]">
                {appearancePanel === "theme" ? "主题" : "配色"}
              </h2>
            </div>
            <button
              aria-label="关闭外观弹窗"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-soft)] text-lg leading-none text-[var(--color-muted)] transition hover:border-[var(--color-brand)] hover:text-[var(--color-ink)]"
              onClick={() => setAppearancePanel(null)}
              ref={closeButtonRef}
              type="button"
            >
              ×
            </button>
          </div>
          <div className="max-h-[calc(82vh-74px)] overflow-y-auto px-5 py-5">
            <ThemeToggleInline compact view={appearancePanel} />
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}
