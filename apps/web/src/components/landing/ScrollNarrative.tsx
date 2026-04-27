import type { MotionValue } from "framer-motion";
import { heroNarrativeBeats } from "../../data/heroNarrative";
import { NarrativePanel } from "./NarrativePanel";

interface ScrollNarrativeProps {
  scrollYProgress: MotionValue<number>;
}

export const ScrollNarrative = ({ scrollYProgress }: ScrollNarrativeProps) => (
  <div
    className="pointer-events-none absolute inset-0 z-20 flex items-end pb-[20vh] md:items-center md:pb-0"
    aria-live="polite"
  >
    {/* Each panel is absolutely positioned and manages its own visibility. */}
    <div className="pointer-events-auto relative h-full w-full md:w-[60%] lg:w-[55%]">
      {heroNarrativeBeats.map((beat) => (
        <NarrativePanel
          key={beat.id}
          beat={beat}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </div>
  </div>
);
