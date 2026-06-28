"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function VpsFallbackBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.location.hostname.includes("github.io")) setShow(true);
  }, []);

  if (!show || dismissed) return null;

  return (
    <div className="fixed top-20 left-0 right-0 z-30 flex items-center justify-center px-4">
      <div className="inline-flex items-center gap-3 rounded-full bg-amber-500/10 border border-amber-500/20 px-5 py-2.5 text-sm text-amber-300 backdrop-blur">
        <span>⚠️ 备份只读模式，数据可能不是最新。</span>
        <button onClick={() => setDismissed(true)} className="text-amber-400 hover:text-white" aria-label="关闭">
          <X className="h-4 w-3.5" />
        </button>
      </div>
    </div>
  );
}
