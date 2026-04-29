import { useEffect, useRef, useState, type RefObject } from "react";
import { useScrollVideo } from "../../hooks/useScrollVideo";
import { useVideoUnlock } from "../../hooks/useVideoUnlock";
import heroVideoUrl from "../../assets/hero.mp4";

interface ScrollVideoStageProps {
  containerRef: RefObject<HTMLElement>;
  onError: () => void;
}

type Status = "loading" | "ready" | "error";

export const ScrollVideoStage = ({
  containerRef,
  onError
}: ScrollVideoStageProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<Status>("loading");

  useScrollVideo(videoRef, containerRef);
  useVideoUnlock(videoRef);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoaded = () => setStatus("ready");
    const onErr = () => {
      setStatus("error");
      onError();
    };

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("error", onErr);

    const timeout = window.setTimeout(() => {
      if (video.readyState < 1) {
        setStatus("error");
        onError();
      }
    }, 5000);

    if (video.readyState >= 1) onLoaded();

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("error", onErr);
      window.clearTimeout(timeout);
    };
  }, [onError]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      {/* Loading state — soft pulse until video metadata arrives */}
      <div
        aria-hidden
        className={`absolute inset-0 bg-gradient-to-br from-[#E8F0FF] via-white to-[#F8F9FB] transition-opacity duration-700 ${
          status === "ready" ? "opacity-0" : "opacity-100"
        } ${status === "loading" ? "animate-pulse" : ""}`}
      />

      <video
        ref={videoRef}
        src={heroVideoUrl}
        muted
        playsInline
        preload="auto"
        disableRemotePlayback
        // @ts-ignore — non-standard attribute, valid in WebKit
        disablePictureInPicture
        aria-hidden="true"
        // GPU compositing hints: promote to its own layer so seeks repaint
        // on the compositor thread instead of fighting the main-thread
        // page repaint queue.
        style={{
          willChange: "transform",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          contain: "paint"
        }}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          status === "ready" ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Overlay 1 — left fade (desktop) for headline contrast */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(250,252,255,0.95) 0%, rgba(250,252,255,0.64) 33%, rgba(250,252,255,0.1) 67%)"
        }}
      />

      {/* Overlay 2 — bottom fade (mobile) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] md:hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(248,251,255,0) 0%, rgba(248,251,255,0.86) 64%, rgba(248,251,255,0.97) 100%)"
        }}
      />

      {/* Overlay 3 — radial vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 62% at 55% 48%, rgba(0,18,51,0) 30%, rgba(0,18,51,0.22) 100%)"
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 15%, rgba(0,102,255,0.12), rgba(0,102,255,0) 35%), radial-gradient(circle at 85% 22%, rgba(111,77,255,0.12), rgba(111,77,255,0) 40%)"
        }}
      />
    </div>
  );
};
