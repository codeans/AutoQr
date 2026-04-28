import { useRef, useState } from "react";
import { useScroll, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ScrollVideoStage } from "./ScrollVideoStage";
import { ScrollNarrative } from "./ScrollNarrative";
import { ScrollProgressIndicator } from "./ScrollProgressIndicator";
import { heroNarrativeBeats } from "../../data/heroNarrative";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { NarrativeBeat } from "../../types/narrative";

const HIGHLIGHT_RE = /<highlight>(.+?)<\/highlight>/g;

const renderHighlight = (input: string) => {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  HIGHLIGHT_RE.lastIndex = 0;
  while ((m = HIGHLIGHT_RE.exec(input)) !== null) {
    if (m.index > last) parts.push(input.slice(last, m.index));
    parts.push(
      <span key={k++} className="text-[#0066FF]">
        {m[1]}
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < input.length) parts.push(input.slice(last));
  return parts;
};

export const ScrollVideoHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [videoFailed, setVideoFailed] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.3,
    restDelta: 0.0005
  });

  if (reduced || videoFailed) {
    return <StaticHeroFallback />;
  }

  return (
    <section
      ref={containerRef}
      className="relative h-[400vh] w-full"
      aria-label="AutoQR Story-Hero"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-white">
        <ScrollVideoStage
          containerRef={containerRef}
          onError={() => setVideoFailed(true)}
        />
        <ScrollNarrative scrollYProgress={smoothProgress} />
        <ScrollProgressIndicator scrollYProgress={smoothProgress} />
      </div>
    </section>
  );
};

const StaticHeroFallback = () => (
  <>
    {heroNarrativeBeats.map((beat, i) => (
      <StaticBeat key={beat.id} beat={beat} index={i} />
    ))}
  </>
);

const StaticBeat = ({
  beat,
  index
}: {
  beat: NarrativeBeat;
  index: number;
}) => {
  const isFirst = index === 0;
  const isRight = index % 2 === 1;
  return (
    <section
      className={`relative flex min-h-screen items-center overflow-hidden ${
        isFirst ? "pt-24" : ""
      } ${isRight ? "justify-end" : "justify-start"} px-6 sm:px-10 lg:px-16`}
      style={
        isFirst
          ? {
              backgroundImage: "url(/videos/hero-parking-poster.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }
          : undefined
      }
    >
      {isFirst && (
        <div className="pointer-events-none absolute inset-0 bg-white/70" aria-hidden />
      )}
      <StaticBeatContent beat={beat} isFirst={isFirst} />
    </section>
  );
};

const StaticBeatContent = ({
  beat,
  isFirst
}: {
  beat: NarrativeBeat;
  isFirst: boolean;
}) => {
  const { t } = useTranslation();
  const headline = t(`landingHero.chapters.${beat.id}.headline`);
  const subline = t(`landingHero.chapters.${beat.id}.subline`);

  return (
    <div className="relative w-full max-w-[640px]">
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#0066FF]">
        {t("landingHero.chapterLabel")} {beat.chapter}
      </p>
      <h1
        className={`font-bold leading-[0.95] tracking-[-0.02em] text-[#001233] ${
          isFirst ? "text-5xl md:text-7xl" : "text-4xl md:text-6xl"
        }`}
      >
        {renderHighlight(headline)}
      </h1>
      <p className="mt-6 max-w-prose text-lg leading-relaxed text-[#4A5260] md:text-xl">
        {subline}
      </p>
      {beat.showCTA && (
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            to="/shop/car-qr"
            className="inline-flex items-center justify-center rounded-full bg-[#001233] px-8 py-4 font-medium text-white transition-colors hover:bg-[#0066FF]"
          >
            {t("landingHero.ctaPrimary")}
          </Link>
          <Link
            to="/shop/key-qr"
            className="inline-flex items-center justify-center rounded-full border-2 border-[#001233] bg-white px-8 py-4 font-medium text-[#001233] transition-colors hover:bg-[#001233] hover:text-white"
          >
            {t("landingHero.ctaSecondary")}
          </Link>
        </div>
      )}
    </div>
  );
};
