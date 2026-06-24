"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type BarState = "idle" | "active" | "done";

export function PageLoadingBar() {
  const pathname = usePathname();
  const [state, setState] = useState<BarState>("idle");
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current === pathname) {
      prevPathname.current = pathname;
      return;
    }

    prevPathname.current = pathname;

    // Start the loading animation
    setState("active");

    // After the bar fills, fade it out
    const doneTimer = setTimeout(() => {
      setState("done");
    }, 900);

    // After fade-out, hide completely
    const resetTimer = setTimeout(() => {
      setState("idle");
    }, 1300);

    return () => {
      clearTimeout(doneTimer);
      clearTimeout(resetTimer);
    };
  }, [pathname]);

  if (state === "idle") return null;

  return (
    <div
      className={`page-loading-bar page-loading-bar--${state}`}
      aria-hidden="true"
    />
  );
}
