"use client";

import { type XDiscussionPost, type XDiscussionReply } from "@/lib/site-data";

const LEGACY_STORAGE_KEY = "timin-x-discussion-feed";
const STORAGE_KEY = "timin-discussion-feed-v2";
const LEGACY_SEED_IDS = new Set([
  "huhu-trial-thread",
  "aether-main-choice",
  "grocery-dual-pricing",
  "dasuapi-needs-testing",
  "xinjianya-grok-note",
  "qq-group-collab-call",
]);

export type DiscussionPost = XDiscussionPost;
export type DiscussionReply = XDiscussionReply;

function normalizePosts(value: unknown): DiscussionPost[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((post): post is DiscussionPost => {
      return (
        typeof post === "object" &&
        post !== null &&
        "id" in post &&
        "body" in post &&
        typeof post.id === "string" &&
        typeof post.body === "string" &&
        !LEGACY_SEED_IDS.has(post.id)
      );
    })
    .map((post) => ({
      ...post,
      tags: Array.isArray(post.tags) ? post.tags : [],
      stats: {
        replies: post.stats?.replies ?? post.replies?.length ?? 0,
        likes: post.stats?.likes ?? 0,
        bookmarks: post.stats?.bookmarks ?? 0,
      },
      replies: Array.isArray(post.replies) ? post.replies : [],
    }));
}

export function loadDiscussionPosts(): DiscussionPost[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return normalizePosts(JSON.parse(saved));
    }

    const legacySaved = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacySaved) {
      const migrated = normalizePosts(JSON.parse(legacySaved));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      return migrated;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    return [];
  }
}

export function saveDiscussionPosts(posts: DiscussionPost[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export function createDiscussionPost(input: {
  author?: string;
  handle?: string;
  body: string;
  station?: string;
  tags?: string[];
}) {
  const current = loadDiscussionPosts();
  const next: DiscussionPost = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    author: input.author?.trim() || "群友补充",
    handle: input.handle?.trim() || "@group_note",
    postedAt: "刚刚",
    body: input.body.trim(),
    station: input.station?.trim() || undefined,
    tags: input.tags?.filter(Boolean).map((tag) => tag.trim()).slice(0, 4) ?? [],
    stats: {
      replies: 0,
      likes: 0,
      bookmarks: 0,
    },
    replies: [],
  };

  const updated = [next, ...current];
  saveDiscussionPosts(updated);
  return updated;
}

export function likeDiscussionPost(id: string) {
  const updated = loadDiscussionPosts().map((post) =>
    post.id === id
      ? {
          ...post,
          stats: {
            ...post.stats,
            likes: post.stats.likes + 1,
          },
        }
      : post,
  );

  saveDiscussionPosts(updated);
  return updated;
}

export function bookmarkDiscussionPost(id: string) {
  const updated = loadDiscussionPosts().map((post) =>
    post.id === id
      ? {
          ...post,
          stats: {
            ...post.stats,
            bookmarks: post.stats.bookmarks + 1,
          },
        }
      : post,
  );

  saveDiscussionPosts(updated);
  return updated;
}

export function replyDiscussionPost(
  id: string,
  input: {
    author?: string;
    handle?: string;
    body: string;
  },
) {
  const reply: DiscussionReply = {
    author: input.author?.trim() || "群友回复",
    handle: input.handle?.trim() || "@relay_reply",
    postedAt: "刚刚",
    body: input.body.trim(),
  };

  const updated = loadDiscussionPosts().map((post) =>
    post.id === id
      ? {
          ...post,
          replies: [...(post.replies ?? []), reply],
          stats: {
            ...post.stats,
            replies: (post.replies?.length ?? 0) + 1,
          },
        }
      : post,
  );

  saveDiscussionPosts(updated);
  return updated;
}
