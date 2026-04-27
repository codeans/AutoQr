import { useEffect, type RefObject } from "react";

/**
 * iOS Safari blocks programmatic `video.currentTime` updates until the user
 * has interacted with the page AND playback has been initiated. This hook
 * unlocks playback on first user interaction and immediately pauses again.
 */
export function useVideoUnlock(videoRef: RefObject<HTMLVideoElement>): void {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let unlocked = false;

    const cleanup = () => {
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("scroll", unlock);
    };

    const unlock = () => {
      if (unlocked) return;
      unlocked = true;
      video
        .play()
        .then(() => video.pause())
        .catch(() => {});
      cleanup();
    };

    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("scroll", unlock, { once: true, passive: true });

    return cleanup;
  }, [videoRef]);
}
