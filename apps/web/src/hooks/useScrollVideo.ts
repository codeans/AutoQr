import { useEffect, type RefObject } from "react";

/**
 * Binds the user's scroll position inside `containerRef` to the playhead
 * (`currentTime`) of the `<video>` referenced by `videoRef`.
 *
 * Smoothing strategy:
 *  - Velocity-based adaptive damping: a low-pass filter of recent scroll
 *    velocity drives the lerp factor. Slow drags get heavy damping
 *    (smooth seek). Fast flicks crank the factor up so the playhead
 *    keeps up with the cursor.
 *  - Frame quantization: target time snaps to the nearest 1/FPS so the
 *    decoder is asked for whole frames, never sub-frame interpolations.
 *    Source is encoded with g=2 keyframes — every frame is essentially
 *    independent — so we lean on that and quantize aggressively.
 *  - Skip threshold: writes are suppressed below half a frame to avoid
 *    fighting the decoder with sub-perceptible seeks.
 *  - rAF loop runs every animation frame regardless of video state, so
 *    convergence and seek scheduling stay in lockstep with the page.
 *  - IntersectionObserver pauses the loop when the section is offscreen.
 */
const ASSUMED_FPS = 30;
const FRAME_DURATION = 1 / ASSUMED_FPS;
const SKIP_THRESHOLD = FRAME_DURATION * 0.5;

export function useScrollVideo(
  videoRef: RefObject<HTMLVideoElement>,
  containerRef: RefObject<HTMLElement>
): void {
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    let target = 0;
    let current = 0;
    let lastApplied = -1;
    let rafId = 0;
    let targetRafId = 0;
    let pendingTargetUpdate = false;
    let isReady = false;
    let isVisible = true;

    // Velocity tracking — exponential moving average of |Δscroll|.
    let lastScrollY = window.scrollY;
    let velocity = 0;

    const quantize = (t: number) => Math.round(t / FRAME_DURATION) * FRAME_DURATION;

    const computeTarget = () => {
      pendingTargetUpdate = false;
      const y = window.scrollY;
      const dy = Math.abs(y - lastScrollY);
      lastScrollY = y;
      // EMA: 0.7 history weight, 0.3 new sample. ~3-frame attack, ~6-frame decay.
      velocity = velocity * 0.7 + dy * 0.3;

      if (!isReady || !video.duration) return;
      const rect = container.getBoundingClientRect();
      const scrollableHeight = container.offsetHeight - window.innerHeight;
      if (scrollableHeight <= 0) {
        target = 0;
        return;
      }
      const scrolled = Math.max(0, -rect.top);
      const progress = Math.min(1, Math.max(0, scrolled / scrollableHeight));
      target = progress * video.duration;
    };

    const scheduleTargetUpdate = () => {
      if (pendingTargetUpdate) return;
      pendingTargetUpdate = true;
      targetRafId = requestAnimationFrame(computeTarget);
    };

    const onLoadedMetadata = () => {
      isReady = true;
      try {
        video.pause();
        video.currentTime = 0;
      } catch {
        // Safari may throw on early seeks; ignore.
      }
      scheduleTargetUpdate();
    };

    const tick = () => {
      if (isReady && isVisible && video.duration) {
        const diff = target - current;
        const absDiff = Math.abs(diff);

        if (absDiff > 0.0001) {
          // Velocity-driven lerp.
          //   • Calm scroll (vel ≈ 0):    lerp ≈ 0.09 → glide-y.
          //   • Brisk scroll (vel ≈ 30):  lerp ≈ 0.18 → keeps up.
          //   • Flick (vel ≥ 80):         lerp ≈ 0.32 → snaps without tearing.
          const lerp = Math.min(0.32, 0.09 + velocity * 0.003);
          current += diff * lerp;

          const quantized = quantize(current);
          if (
            Math.abs(quantized - lastApplied) >= SKIP_THRESHOLD &&
            absDiff >= SKIP_THRESHOLD * 0.5
          ) {
            try {
              video.currentTime = quantized;
              lastApplied = quantized;
            } catch {
              // Safari occasionally throws on rapid seeks — safe to ignore.
            }
          }

          if (absDiff < FRAME_DURATION * 0.25) {
            current = target;
          }
        }

        // Velocity decays each frame even without new scroll events.
        velocity *= 0.92;
      }
      rafId = requestAnimationFrame(tick);
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    visibilityObserver.observe(container);

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    window.addEventListener("scroll", scheduleTargetUpdate, { passive: true });
    window.addEventListener("resize", scheduleTargetUpdate);
    rafId = requestAnimationFrame(tick);

    if (video.readyState >= 1) onLoadedMetadata();

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      window.removeEventListener("scroll", scheduleTargetUpdate);
      window.removeEventListener("resize", scheduleTargetUpdate);
      visibilityObserver.disconnect();
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(targetRafId);
    };
  }, [videoRef, containerRef]);
}
