import { useEffect, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

export type MotionTier = "none" | "limited" | "full";

export const useMotionTier = (): MotionTier => {
  const reduced = useReducedMotion();
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [smallViewport, setSmallViewport] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const pointerQuery = window.matchMedia("(pointer: coarse)");
    const viewportQuery = window.matchMedia("(max-width: 1024px)");

    const update = () => {
      setCoarsePointer(pointerQuery.matches);
      setSmallViewport(viewportQuery.matches);
    };

    update();
    pointerQuery.addEventListener("change", update);
    viewportQuery.addEventListener("change", update);
    return () => {
      pointerQuery.removeEventListener("change", update);
      viewportQuery.removeEventListener("change", update);
    };
  }, []);

  if (reduced) return "none";
  if (coarsePointer || smallViewport) return "limited";
  return "full";
};
