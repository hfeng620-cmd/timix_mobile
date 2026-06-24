"use client";

import { useRef, useEffect } from "react";

export default function useScrollReveal<T extends HTMLElement>(options?: {
  threshold?: number;
  rootMargin?: string;
}): React.RefObject<T | null> {
  const ref = useRef<T>(null);
  const threshold = options?.threshold ?? 0.15;
  const rootMargin = options?.rootMargin ?? "0px 0px -40px 0px";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If already revealed, skip re-observation (prevents double-init in strict mode)
    if (el.classList.contains("reveal-visible")) return;

    el.classList.add("reveal-hidden");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove("reveal-hidden");
          el.classList.add("reveal-visible");
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return ref;
}
