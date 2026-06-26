"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NotificationBell } from "@/components/notification-bell";

const navItems = [
  { label: "首页", href: "/", tone: "utility" },
  { label: "榜单", href: "/stations", tone: "primary" },
  { label: "模型", href: "/models", tone: "primary" },
  { label: "指南", href: "/guides", tone: "primary" },
  { label: "社区", href: "/community", tone: "primary" },
  { label: "我的", href: "/profile", tone: "utility" },
] as const;

export function MobileDock() {
  const pathname = usePathname();

  return (
    <>
      <nav
        aria-label="站内主导航"
        className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-6 rounded-[24px] border border-[var(--color-line)] bg-[color:color-mix(in_srgb,var(--color-panel)_88%,white)] p-1.5 shadow-[0_18px_60px_rgba(15,23,42,0.14)] backdrop-blur lg:hidden"
        data-selection-comments="off"
      >
        {navItems.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-[16px] px-2 py-3 text-center text-[11px] font-bold transition ${
                active
                  ? "bg-[var(--color-brand)] text-[var(--color-on-brand)] shadow-[0_10px_24px_var(--color-panel-glow)]"
                  : item.tone === "primary"
                    ? "text-[var(--color-muted)] hover:bg-[var(--color-soft)] hover:text-[var(--color-ink)]"
                    : "text-[color:color-mix(in_srgb,var(--color-muted)_86%,var(--color-brand-deep))] hover:bg-[var(--color-soft)] hover:text-[var(--color-ink)]"
              }`}
              href={item.href}
              title={item.label}
            >
              <span
                className={`mx-auto mb-1 h-1.5 w-6 rounded-full transition ${
                  active
                    ? "bg-[var(--color-on-brand)]/80"
                    : item.tone === "primary"
                      ? "bg-[var(--color-line)]"
                      : "bg-[color:color-mix(in_srgb,var(--color-line)_75%,var(--color-brand-soft))]"
                }`}
              />
              <span className="block leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      {/* Notification bell above the mobile dock, only on mobile */}
      <div
        className="fixed bottom-[84px] right-3 z-40 lg:hidden"
        data-selection-comments="off"
      >
        <NotificationBell dropdownAbove />
      </div>
    </>
  );
}
