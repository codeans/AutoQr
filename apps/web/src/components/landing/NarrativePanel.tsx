import { motion, useTransform, type MotionValue } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import type { NarrativeBeat } from "../../types/narrative";

interface NarrativePanelProps {
  beat: NarrativeBeat;
  scrollYProgress: MotionValue<number>;
}

const HIGHLIGHT_RE = /<highlight>(.+?)<\/highlight>/g;

/** Convert a string with `<highlight>...</highlight>` segments into React nodes. */
const parseHighlights = (input: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  HIGHLIGHT_RE.lastIndex = 0;
  while ((match = HIGHLIGHT_RE.exec(input)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(input.slice(lastIndex, match.index));
    }
    nodes.push(
      <span key={`hl-${key++}`} className="text-[#0066FF]">
        {match[1]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < input.length) {
    nodes.push(input.slice(lastIndex));
  }
  return nodes;
};

export const NarrativePanel = ({ beat, scrollYProgress }: NarrativePanelProps) => {
  const { t } = useTranslation();
  const fadeIn = beat.start + 0.05;
  const fadeOut = beat.end - 0.05;

  const opacity = useTransform(
    scrollYProgress,
    [beat.start, fadeIn, fadeOut, beat.end],
    [0, 1, 1, 0]
  );
  const y = useTransform(
    scrollYProgress,
    [beat.start, fadeIn, fadeOut, beat.end],
    [40, 0, 0, -40]
  );

  const headline = t(`landingHero.chapters.${beat.id}.headline`);
  const subline = t(`landingHero.chapters.${beat.id}.subline`);
  const chapterLabel = t("landingHero.chapterLabel");

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex items-center px-6 sm:px-10 md:items-center md:justify-start lg:px-16"
    >
      <div className="w-full max-w-[680px] md:max-w-[620px]">
        <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-7 shadow-[0_24px_70px_rgba(0,20,60,0.16)] backdrop-blur-xl sm:p-9">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.8),rgba(239,246,255,0.5),rgba(255,255,255,0.7))]"
          />
          <div className="relative">
            <p className="mb-4 inline-flex items-center rounded-full border border-[#0066FF]/20 bg-[#0066FF]/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0052cc]">
              {chapterLabel} {beat.chapter}
            </p>

            <h1 className="text-4xl font-bold leading-[0.95] tracking-[-0.03em] text-[#001233] sm:text-6xl lg:text-7xl">
              {parseHighlights(headline)}
            </h1>

            <p className="mt-5 max-w-prose text-base leading-relaxed text-[#4A5260] sm:text-lg md:text-xl">
              {subline}
            </p>

            {beat.showCTA && <CtaPair />}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CtaPair = () => {
  const { t } = useTranslation();
  return (
    <div className="mt-10 flex flex-col gap-4 sm:flex-row">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          to="/shop/car-qr"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#001233] px-8 py-4 font-medium text-white shadow-[0_12px_32px_-12px_rgba(0,18,51,0.4)] transition-all duration-300 hover:scale-[1.03] hover:bg-[#0066FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          {t("landingHero.ctaPrimary")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          to="/shop/key-qr"
          className="inline-flex items-center justify-center rounded-full border-2 border-[#001233] bg-white px-8 py-4 font-medium text-[#001233] transition-colors duration-300 hover:bg-[#001233] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          {t("landingHero.ctaSecondary")}
        </Link>
      </motion.div>
    </div>
  );
};
