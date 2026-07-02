"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { AuthButton } from "@/components/auth-button";
import { GlobalInboxModal } from "@/components/global-inbox-modal";
import { NotificationBell } from "@/components/notification-bell";
import { OnlineIndicator } from "@/components/online-indicator";

const links = [
  { label: "首页", href: "/" },
  { label: "中转站榜单", href: "/stations" },
  { label: "论坛入口", href: "/community" },
  { label: "模型择优", href: "/models" },
  { label: "福利Drop", href: "/drops" },
  { label: "热门有趣项目Share", href: "/guides" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isInboxOpen, setIsInboxOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-0 right-0 z-[100] px-4 sm:px-8 lg:px-16">
      <div className="mx-auto flex max-w-7xl items-center justify-between py-3 gap-3">
        <Link
          href="/"
          className="group flex shrink-0 items-center transition-all duration-300"
        >
          <span
            className="text-2xl tracking-wide font-extrabold bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-100 to-gray-400"
            style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,0.25))" }}
          >
            Ti
          </span>
          <span
            className="text-2xl tracking-wide font-light bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-500"
            style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.15))" }}
          >
            Mix
          </span>
        </Link>

        {/* iOS 26 frosted glass nav pill */}
        <div
          className="hidden items-center gap-0.5 rounded-full px-1.5 py-1 md:flex"
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(28px) saturate(200%)",
            WebkitBackdropFilter: "blur(28px) saturate(200%)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow:
              "0 4px 24px rgba(0,0,0,0.12), inset 0 0.5px 0 rgba(255,255,255,0.18), inset 0 -0.5px 0 rgba(255,255,255,0.04)",
          }}
        >
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 font-body ${
                  active
                    ? "bg-white/18 text-white shadow-[inset_0_0.5px_0_rgba(255,255,255,0.15)]"
                    : "text-white/65 hover:text-white hover:bg-white/6"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/stations"
            className="rounded-full px-4 py-2 text-sm font-medium text-white md:hidden"
            style={{
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(28px) saturate(200%)",
              WebkitBackdropFilter: "blur(28px) saturate(200%)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            榜单
          </Link>
          <OnlineIndicator />
          <NotificationBell />
          <button
            aria-label="我的私信"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-muted)] transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300"
            onClick={() => setIsInboxOpen(true)}
            title="我的私信"
            type="button"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
          <AuthButton />
        </div>
      </div>
      {isInboxOpen ? <GlobalInboxModal onClose={() => setIsInboxOpen(false)} /> : null}
    </nav>
  );
}
