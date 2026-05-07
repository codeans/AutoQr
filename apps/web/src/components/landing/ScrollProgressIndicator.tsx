import { motion, useTransform, type MotionValue } from "framer-motion";
import { heroNarrativeBeats } from "../../data/heroNarrative";

interface ScrollProgressIndicatorProps {
  scrollYProgress: MotionValue<number>;
}

export const ScrollProgressIndicator = ({
  scrollYProgress
}: ScrollProgressIndicatorProps) => {
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-12 top-1/2 z-30 hidden -translate-y-1/2 md:block"
    >
      <div className="relative h-[60vh] w-px bg-[#001B36]/10">
        <motion.div
          className="absolute inset-x-0 top-0 h-full w-[2px] -translate-x-px bg-[#003878]"
          style={{ scaleY, transformOrigin: "top" }}
        />

        {heroNarrativeBeats.map((beat) => (
          <ChapterMarker
            key={beat.id}
            chapter={beat.chapter}
            position={beat.start}
            beatStart={beat.start}
            beatEnd={beat.end}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>
    </div>
  );
};

interface ChapterMarkerProps {
  chapter: string;
  position: number;
  beatStart: number;
  beatEnd: number;
  scrollYProgress: MotionValue<number>;
}

const ChapterMarker = ({
  chapter,
  position,
  beatStart,
  beatEnd,
  scrollYProgress
}: ChapterMarkerProps) => {
  const isActive = useTransform<number, number>(scrollYProgress, (v) =>
    v >= beatStart && v <= beatEnd ? 1 : 0
  );
  const scale = useTransform(isActive, [0, 1], [1, 1.2]);
  const dotOpacity = useTransform(isActive, [0, 1], [0.3, 1]);
  const labelColor = useTransform(isActive, [0, 1], [
    "rgba(0,27,54,0.3)",
    "rgba(0,56,120,1)"
  ]);

  return (
    <motion.div
      className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3"
      style={{
        top: `${position * 100}%`,
        scale
      }}
    >
      <motion.span
        className="block h-2 w-2 rounded-full bg-[#003878]"
        style={{ opacity: dotOpacity }}
      />
      <motion.span
        className="absolute left-5 text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: labelColor }}
      >
        {chapter}
      </motion.span>
    </motion.div>
  );
};
