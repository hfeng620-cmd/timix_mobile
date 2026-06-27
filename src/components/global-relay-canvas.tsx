"use client";

import { usePathname } from "next/navigation";

import { RelayNetworkCanvas } from "@/components/relay-network-canvas";

const CANVAS_ROUTE_PREFIXES = [
  ["stations", "/stations"],
  ["community", "/community"],
  ["models", "/models"],
  ["guides", "/guides"],
  ["profile", "/profile"],
] as const;

function getCanvasRoute(pathname: string) {
  return (
    CANVAS_ROUTE_PREFIXES.find(([, route]) => pathname === route || pathname.startsWith(`${route}/`))?.[0] ?? null
  );
}

export function GlobalRelayCanvas() {
  const pathname = usePathname();
  const canvasRoute = getCanvasRoute(pathname);
  const enabled = canvasRoute !== null;

  return (
    <div
      aria-hidden="true"
      className={`global-relay-canvas ${enabled ? "global-relay-canvas--active" : ""}`}
      data-selection-comments="off"
      data-relay-route={canvasRoute ?? "idle"}
    >
      <RelayNetworkCanvas active={enabled} className="global-relay-canvas__scene" />
    </div>
  );
}
