"use client";

import { useEffect } from "react";

const FORM_SELECTOR = [
  "input",
  "textarea",
  "select",
  "[contenteditable='true']",
].join(", ");

const MODAL_SELECTOR = [
  "[aria-modal='true']",
  "[role='dialog']",
  "dialog[open]",
].join(", ");

function canScrollElement(element: HTMLElement, deltaY: number) {
  const style = window.getComputedStyle(element);
  const canOverflowY = style.overflowY === "auto" || style.overflowY === "scroll";
  if (!canOverflowY || element.scrollHeight <= element.clientHeight + 1) {
    return false;
  }

  if (deltaY > 0) {
    return element.scrollTop + element.clientHeight < element.scrollHeight - 1;
  }

  return element.scrollTop > 1;
}

function hasScrollableAncestor(target: EventTarget | null, deltaY: number) {
  let element = target instanceof HTMLElement ? target : null;

  while (element && element !== document.body && element !== document.documentElement) {
    if (canScrollElement(element, deltaY)) {
      return true;
    }

    element = element.parentElement;
  }

  return false;
}

function canScrollWindow(deltaY: number) {
  const root = document.documentElement;
  const maxScrollTop = Math.max(root.scrollHeight - window.innerHeight, 0);

  if (deltaY > 0) {
    return window.scrollY < maxScrollTop - 1;
  }

  return window.scrollY > 1;
}

function getScrollAmount(event: WheelEvent) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return event.deltaY * 16;
  }

  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return event.deltaY * window.innerHeight;
  }

  return event.deltaY;
}

export function ScrollPassthroughGuard() {
  useEffect(() => {
    let pendingFrame = 0;
    let pendingScrollAmount = 0;
    let pendingStartY = 0;
    const wheelOptions = { capture: true, passive: true };

    function handleWheel(event: WheelEvent) {
      if (
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        Math.abs(event.deltaY) <= Math.abs(event.deltaX)
      ) {
        return;
      }

      const target = event.target instanceof HTMLElement ? event.target : null;
      if (!target || target.closest(FORM_SELECTOR) || target.closest(MODAL_SELECTOR)) {
        return;
      }

      const scrollAmount = getScrollAmount(event);

      if (!canScrollWindow(scrollAmount) || hasScrollableAncestor(target, scrollAmount)) {
        return;
      }

      if (pendingFrame === 0) {
        pendingStartY = window.scrollY;
      }

      pendingScrollAmount += scrollAmount;

      if (pendingFrame) {
        return;
      }

      pendingFrame = window.requestAnimationFrame(() => {
        const pageAlreadyMoved = Math.abs(window.scrollY - pendingStartY) > 0.5;
        const amount = pendingScrollAmount;

        pendingFrame = 0;
        pendingScrollAmount = 0;

        if (
          pageAlreadyMoved ||
          document.documentElement.dataset.routeHydrating === "true" ||
          !canScrollWindow(amount)
        ) {
          return;
        }

        window.scrollBy({ top: amount, left: 0, behavior: "auto" });
      });
    }

    window.addEventListener("wheel", handleWheel, wheelOptions);
    return () => {
      if (pendingFrame) {
        window.cancelAnimationFrame(pendingFrame);
      }
      window.removeEventListener("wheel", handleWheel, wheelOptions);
    };
  }, []);

  return null;
}
