"use client";

import { useEffect, useRef } from "react";
import EmojiPicker, { Theme, type EmojiClickData } from "emoji-picker-react";
import { Smile } from "lucide-react";

import { HOT_EMOJI_ITEMS } from "@/lib/hot-emojis";

type EmojiPickerButtonProps = {
  open: boolean;
  disabled?: boolean;
  align?: "left" | "right";
  buttonClassName?: string;
  iconClassName?: string;
  pickerClassName?: string;
  onClose: () => void;
  onToggle: () => void;
  onEmojiSelect: (emoji: string) => void;
};

export function EmojiPickerButton({
  open,
  disabled = false,
  align = "left",
  buttonClassName = "",
  iconClassName = "h-4 w-4",
  pickerClassName = "",
  onClose,
  onToggle,
  onEmojiSelect,
}: EmojiPickerButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  function handleEmojiClick(emojiData: EmojiClickData) {
    onEmojiSelect(emojiData.emoji);
    onClose();
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        className={buttonClassName}
        disabled={disabled}
        onClick={onToggle}
        title="插入表情"
        type="button"
      >
        <Smile className={iconClassName} />
      </button>

      {open ? (
        <div
          className={`absolute bottom-full mb-2 z-[220] overflow-hidden rounded-lg border border-white/10 shadow-2xl ${
            align === "right" ? "right-0" : "left-0"
          } ${pickerClassName}`}
        >
          <div className="border-b border-white/10 bg-zinc-950/95 px-3 py-3">
            <p className="mb-2 text-[11px] font-medium tracking-[0.18em] text-zinc-500">热门表情</p>
            <div className="flex flex-wrap gap-2">
              {HOT_EMOJI_ITEMS.map((item) => (
                <button
                  key={item.insertText}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                  onClick={() => {
                    onEmojiSelect(item.insertText);
                    onClose();
                  }}
                  type="button"
                >
                  <span aria-hidden="true">{item.preview}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          <EmojiPicker
            height={400}
            lazyLoadEmojis
            onEmojiClick={handleEmojiClick}
            searchDisabled={false}
            skinTonesDisabled
            theme={Theme.DARK}
            width={300}
          />
        </div>
      ) : null}
    </div>
  );
}
