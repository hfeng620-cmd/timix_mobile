"use client";

import type { Liker } from "@/lib/share-storage";

function isPrivilegedLiker(liker: Liker) {
  return liker.role === "owner" || liker.role === "admin";
}

function LikerName({ liker }: { liker: Liker }) {
  const nickname = liker.displayName || "未知用户";
  if (isPrivilegedLiker(liker)) {
    return <span className="font-bold text-red-500">TiMix站主 {nickname}</span>;
  }

  return <span className="text-zinc-300">{nickname}</span>;
}

export function LikeIndicator({ likers }: { likers: Liker[] }) {
  if (!likers || likers.length === 0) return null;

  const firstLiker = likers[0];

  return (
    <span className="ml-2 inline-flex items-center gap-1 text-xs text-zinc-500 font-body">
      <svg
        aria-hidden="true"
        className="h-3.5 w-3.5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>
        <LikerName liker={firstLiker} />
        {likers.length === 1 ? " 赞过" : ` 等 ${likers.length} 人赞过`}
      </span>
    </span>
  );
}
