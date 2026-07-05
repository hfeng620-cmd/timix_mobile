"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

type VideoBackgroundProps = {
  hlsSrc?: string;
  mp4Src?: string;
  poster?: string;
  desaturated?: boolean;
  topOffset?: string;
  className?: string;
};

export function VideoBackground({
  hlsSrc,
  mp4Src,
  poster,
  desaturated = false,
  topOffset,
  className = "",
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (hlsSrc && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false, lowLatencyMode: true });
      hls.loadSource(hlsSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); });
      return () => { hls.destroy(); };
    }

    if (mp4Src) {
      video.play().catch(() => {});
    }
  }, [hlsSrc, mp4Src]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: poster
            ? `linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.18)), url(${poster})`
            : "radial-gradient(circle at 35% 25%, rgba(34,211,238,0.16), transparent 34%), radial-gradient(circle at 72% 18%, rgba(217,70,239,0.12), transparent 30%), #000",
          filter: desaturated ? "saturate(0)" : undefined,
        }}
      />
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster={poster}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          objectPosition: topOffset ? `center ${topOffset}` : "center center",
          filter: desaturated ? "saturate(0)" : undefined,
        }}
      >
        {mp4Src && <source src={mp4Src} type="video/mp4" />}
      </video>
    </div>
  );
}
