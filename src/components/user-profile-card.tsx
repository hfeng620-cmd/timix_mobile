"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

type UserProfileRow = {
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  tags: string[] | null;
  personality_tags: string[] | null;
  created_at: string | null;
};

type UserProfile = {
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  tags: string[];
  created_at: string | null;
};

type UserProfileCardProps = {
  userId: string;
  position: { x: number; y: number };
  onClose: () => void;
};

function normalizeProfile(row: UserProfileRow): UserProfile {
  const rawTags =
    Array.isArray(row.tags) && row.tags.length > 0
      ? row.tags
      : Array.isArray(row.personality_tags)
        ? row.personality_tags
        : [];

  return {
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    bio: row.bio,
    tags: rawTags
      .filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
      .map((tag) => tag.trim())
      .slice(0, 5),
    created_at: row.created_at,
  };
}

function formatProfileJoinDate(value: string | null) {
  if (!value) return "加入时间未知";

  try {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return "加入时间未知";
  }
}

function createArchiveId(userId: string) {
  return `PF-${userId.slice(0, 8).toUpperCase()}`;
}

export function UserProfileCard({ userId, position, onClose }: UserProfileCardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardPosition, setCardPosition] = useState(position);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Smooth entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  // Smooth exit animation
  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await getSupabaseClient()
          .from("forum_profiles")
          .select("display_name, avatar_url, bio, tags, personality_tags, created_at")
          .eq("id", userId)
          .single();
        if (!cancelled && data) {
          setProfile(normalizeProfile(data as UserProfileRow));
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const width = 320;
    const height = 560;
    const padding = 12;
    const nextLeft = Math.min(
      Math.max(padding, position.x),
      Math.max(padding, window.innerWidth - width - padding),
    );
    const nextTop = Math.min(
      Math.max(padding, position.y),
      Math.max(padding, window.innerHeight - height - padding),
    );

    setCardPosition({ x: nextLeft, y: nextTop });
  }, [position]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        handleClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClose]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleClose]);

  const name = profile?.display_name || "用户";
  const initial = name.charAt(0).toUpperCase();
  const bioText = profile?.bio?.trim() ?? "";
  const bio = bioText || "还没有留下个人简介，这张名片暂时只展示基础身份信息。";
  const tags = profile?.tags ?? [];
  const profileCompleteness = [
    Boolean(profile?.display_name?.trim()),
    Boolean(profile?.avatar_url),
    Boolean(profile?.bio?.trim()),
    tags.length > 0,
  ].filter(Boolean).length;
  const completenessPercent = Math.round((profileCompleteness / 4) * 100);
  const completenessLabel =
    completenessPercent >= 100
      ? "主页已完成"
      : completenessPercent >= 75
        ? "接近完整"
        : completenessPercent >= 50
          ? "还差一点"
          : "建议继续补充";
  const joinDate = formatProfileJoinDate(profile?.created_at ?? null);
  const archiveId = createArchiveId(userId);
  const introStatusLabel = bioText ? `已写 ${bioText.length} 字简介` : "简介仍待补充";
  const identityConsistencyValue =
    profile?.display_name?.trim() && tags.length > 0
      ? "已统一"
      : profile?.display_name?.trim() || tags.length > 0
        ? "部分统一"
        : "待统一";
  const profilePresentationTone = bioText
    ? tags.length > 0
      ? "这张主页已经具备对外自我说明和标签侧写。"
      : "简介已经补上，再加几个标签会更像完整名片。"
    : "还缺一句能代表自己的介绍，进入主页补完后展示会更完整。";
  const identityRows = [
    { label: "档案编号", value: archiveId },
    { label: "加入 Timix", value: joinDate },
    { label: "资料字段", value: `${profileCompleteness}/4 已填写` },
  ];
  const completionItems = [
    { label: "头像", done: Boolean(profile?.avatar_url) },
    { label: "昵称", done: Boolean(profile?.display_name?.trim()) },
    { label: "简介", done: Boolean(profile?.bio?.trim()) },
    { label: "标签", done: tags.length > 0 },
  ];

  return (
    <div
      ref={cardRef}
      className="z-50 w-[320px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[24px] border border-[var(--color-line)] bg-[var(--color-panel)] shadow-[0_22px_60px_rgba(15,23,42,0.18)]"
      style={{
        position: "fixed",
        left: cardPosition.x,
        top: cardPosition.y,
        transform: isAnimating ? "scale(1) translateY(0)" : "scale(0.95) translateY(-8px)",
        opacity: isAnimating ? 1 : 0,
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        transformOrigin: "top left",
      }}
    >
      {loading ? (
        <div className="p-5">
          <div className="h-24 animate-pulse rounded-[20px] bg-[var(--color-soft)]" />
          <div className="mt-4 flex items-center gap-3">
            <div className="h-16 w-16 animate-pulse rounded-full bg-[var(--color-soft)]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-[var(--color-soft)]" />
              <div className="h-3 w-32 animate-pulse rounded bg-[var(--color-soft)]" />
            </div>
          </div>
          <div className="mt-4 h-16 animate-pulse rounded-[18px] bg-[var(--color-soft)]" />
          <div className="mt-3 flex gap-2">
            <div className="h-6 w-16 animate-pulse rounded-full bg-[var(--color-soft)]" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-[var(--color-soft)]" />
          </div>
        </div>
      ) : (
        <>
          <div className="relative overflow-hidden border-b border-[var(--color-line)] bg-[linear-gradient(135deg,rgba(37,99,235,0.1),rgba(255,255,255,0.94)_55%,rgba(191,219,254,0.32))] px-5 pb-5 pt-4">
            <button
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/72 text-xs text-[var(--color-muted)] transition hover:bg-white hover:text-[var(--color-ink)]"
              onClick={handleClose}
              type="button"
              aria-label="关闭"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-brand-deep)]">
              个人档案
            </p>

            <div className="mt-4 flex items-start gap-4">
              {profile?.avatar_url ? (
                <img
                  alt={name}
                  className="h-16 w-16 shrink-0 rounded-[22px] object-cover ring-1 ring-[var(--color-line)]"
                  src={profile.avatar_url}
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-[var(--color-soft)] text-2xl font-black text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
                  {initial}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-lg font-black text-[var(--color-ink)]">{name}</p>
                  <span className="rounded-full bg-[var(--color-brand)]/10 px-2.5 py-1 text-[10px] font-bold text-[var(--color-brand-deep)] ring-1 ring-[var(--color-brand)]/15">
                    Timix 观察成员
                  </span>
                </div>
                <p className="mt-2 text-xs text-[var(--color-muted)]">{joinDate}</p>
                <p className="mt-1 text-xs font-medium text-[var(--color-brand-deep)]">{completenessLabel}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {identityRows.map((item) => (
                <span
                  key={item.label}
                  className="rounded-full border border-white/80 bg-white/76 px-2.5 py-1 text-[10px] font-medium text-[var(--color-muted)]"
                >
                  <span>{item.label}</span>
                  <span className="mx-1 text-[var(--color-line)]">·</span>
                  <span className="font-bold text-[var(--color-ink)]">{item.value}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[18px] border border-[var(--color-line)] bg-[var(--color-soft)] px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  资料完成度
                </p>
                <p className="mt-2 text-xl font-black text-[var(--color-ink)]">{completenessPercent}%</p>
              </div>
              <div className="rounded-[18px] border border-[var(--color-line)] bg-[var(--color-soft)] px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  个人标签
                </p>
                <p className="mt-2 text-xl font-black text-[var(--color-ink)]">{tags.length}</p>
              </div>
            </div>

            <div className="rounded-[18px] border border-[var(--color-line)] bg-[linear-gradient(135deg,var(--color-brand-soft),rgba(255,255,255,0.76))] px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  主页状态
                </p>
                <span className="text-xs font-bold text-[var(--color-brand-deep)]">
                  {completenessPercent}%
                </span>
              </div>
              <p className="mt-2 text-sm font-bold text-[var(--color-ink)]">
                {completenessPercent >= 100
                  ? "这张主页已经比较完整。"
                  : completenessPercent >= 75
                    ? "资料已经很接近完整。"
                    : completenessPercent >= 50
                      ? "身份信息已经立起来一半以上。"
                      : "还在补充基础身份信息。"}
              </p>
              <p className="mt-2 text-xs leading-5 text-[var(--color-muted)]">
                {tags.length > 0
                  ? "已经有自己的标签侧写，再补一点内容互动会更完整。"
                  : "再补简介、标签或内容记录，这张主页会更像完整名片。"}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/72">
                <div
                  className="h-full rounded-full bg-[var(--color-brand)] transition-[width]"
                  style={{ width: `${completenessPercent}%` }}
                />
              </div>
            </div>

            <div className="rounded-[18px] border border-[var(--color-line)] bg-[var(--color-soft)] px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  身份字段
                </p>
                <span className="text-[11px] font-bold text-[var(--color-brand-deep)]">
                  {profileCompleteness}/4
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {completionItems.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[14px] border border-[var(--color-line)] bg-white/72 px-3 py-2"
                  >
                    <p className="text-[11px] font-semibold text-[var(--color-muted)]">{item.label}</p>
                    <p className="mt-1 text-xs font-bold text-[var(--color-ink)]">
                      {item.done ? "已填写" : "待补充"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[18px] border border-[var(--color-line)] bg-white/72 px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  个人简介
                </p>
                <span className="rounded-full bg-[var(--color-brand)]/10 px-2.5 py-1 text-[10px] font-bold text-[var(--color-brand-deep)] ring-1 ring-[var(--color-brand)]/15">
                  {introStatusLabel}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{bio}</p>
              <p className="mt-3 text-xs leading-5 text-[var(--color-muted)]">{profilePresentationTone}</p>
            </div>

            <div className="rounded-[18px] border border-[var(--color-line)] bg-[var(--color-soft)] px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  标签侧写
                </p>
                <span className="text-[11px] font-bold text-[var(--color-brand-deep)]">
                  {identityConsistencyValue}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[var(--color-brand)]/10 px-3 py-1 text-[11px] font-bold text-[var(--color-brand-deep)] ring-1 ring-[var(--color-brand)]/15"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full border border-dashed border-[var(--color-line)] px-3 py-1 text-[11px] font-semibold text-[var(--color-muted)]">
                    还没有填写个人标签
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--color-muted)]">
                {tags.length > 0
                  ? "这些标签会直接影响别人对这张主页的第一印象。"
                  : "进入主页补 2 到 3 个稳定标签，会让身份展示更统一。"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link
                className="block rounded-full bg-[var(--color-brand)] py-2.5 text-center text-sm font-bold text-[var(--color-on-brand)] transition hover:bg-[var(--color-brand-deep)]"
                href="/profile"
              >
                查看主页
              </Link>
              <Link
                className="block rounded-full border border-[var(--color-line)] bg-white/82 py-2.5 text-center text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-brand)] hover:text-[var(--color-brand-deep)]"
                href="/community"
              >
                去讨论区
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
