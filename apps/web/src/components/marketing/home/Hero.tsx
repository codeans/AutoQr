import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, KeyRound, ShieldCheck } from "lucide-react";
import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { LinkButton } from "../shared/Button";
import { Container } from "../shared/Container";
import { useMarketingContent } from "../content/useMarketingContent";

export const Hero = () => {
  const { t } = useTranslation();
  const reduce = useReducedMotion() ?? false;
  const { hero } = useMarketingContent();

  return (
    <section className="relative overflow-hidden pb-20 pt-14 sm:pb-28 sm:pt-20 lg:pb-32 lg:pt-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f7fbff_0%,#edf4ff_35%,#f9fbff_100%)]" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[640px] w-[1200px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(59,124,246,0.24),transparent_62%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-8rem] top-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.18),transparent_68%)] blur-2xl"
      />

      <Container>
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-100/80 bg-white/90 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700 shadow-soft backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" />
              </span>
              {hero.eyebrow}
            </div>
            <h1
              className="mt-6 font-display text-[42px] font-semibold leading-[1.02] tracking-[-0.038em] text-content sm:text-[62px] lg:text-[80px]"
              style={{ textWrap: "balance" }}
            >
              {hero.headline}{" "}
              <span className="bg-[linear-gradient(90deg,#2f69f8_0%,#6f4dff_100%)] bg-clip-text text-transparent">
                {hero.highlight}
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-relaxed text-content-muted sm:text-lg">
              {hero.description}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <LinkButton to={hero.primaryCta.to} size="lg" showArrow>
                {hero.primaryCta.label}
              </LinkButton>
              <LinkButton to={hero.secondaryCta.to} variant="secondary" size="lg">
                {hero.secondaryCta.label}
              </LinkButton>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-content-subtle">
              <span className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-white/80 px-3 py-1.5">
                <ShieldCheck className="h-4 w-4 text-brand-700" />
                <span>{hero.trustLine || t("home.heroVisual.fallbackTrustLine")}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-content-subtle">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>{t("home.heroVisual.active")}</span>
              </span>
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <motion.div
              initial={reduce ? undefined : { opacity: 0, y: 16 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-auto w-full max-w-[470px] lg:ml-auto"
            >
              <HeroVisual t={t} reduced={reduce} />
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
};

type HeroVisualProps = { t: (key: string) => string; reduced: boolean };

const HeroVisual = ({ t, reduced }: HeroVisualProps) => {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 170, damping: 22, mass: 0.45 });
  const smoothY = useSpring(pointerY, { stiffness: 170, damping: 22, mass: 0.45 });

  const rotateX = useTransform(smoothY, [-40, 40], [11, -11]);
  const rotateY = useTransform(smoothX, [-40, 40], [-13, 13]);
  const orbShiftX = useTransform(smoothX, [-40, 40], [-10, 10]);
  const orbShiftY = useTransform(smoothY, [-40, 40], [-8, 8]);

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    pointerX.set(x - rect.width / 2);
    pointerY.set(y - rect.height / 2);
  };

  const onLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <div className="relative [perspective:1400px]" onMouseMove={onMove} onMouseLeave={onLeave}>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-8 -right-6 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(88,86,255,0.36),rgba(88,86,255,0)_70%)] blur-xl"
        style={reduced ? undefined : { x: orbShiftX, y: orbShiftY }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-4 -left-10 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(47,105,248,0.28),rgba(47,105,248,0)_72%)] blur-xl"
        style={reduced ? undefined : { x: orbShiftY, y: orbShiftX }}
      />

      <motion.div
        className="pointer-events-none absolute -inset-2 rounded-[34px] bg-[linear-gradient(135deg,rgba(47,105,248,0.22),rgba(111,77,255,0.12),rgba(255,255,255,0.5))] blur-lg"
        style={reduced ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
      />
      <motion.div
        className="relative rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_25px_60px_rgba(25,48,95,0.17)] backdrop-blur"
        style={reduced ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.2em] text-content-subtle">
          <span>AQR · DE-003</span>
          <span className="flex items-center gap-1.5 text-emerald-600/90">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(34,197,94,0.18)]" />
            {t("home.heroVisual.active")}
          </span>
        </div>
        <div className="mt-5 grid aspect-square w-full place-items-center rounded-2xl border border-surface-border/70 bg-[linear-gradient(180deg,rgba(0,18,51,0.06)_0%,rgba(255,255,255,0.92)_100%)] p-6 [transform:translateZ(26px)]">
          <QrArt reduced={reduced} />
        </div>
        <div className="mt-5 space-y-1.5 [transform:translateZ(14px)]">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-content-subtle">
            {t("home.heroVisual.secureCallBridge")}
          </p>
          <p className="font-mono text-sm tracking-tight text-content">
            {t("home.heroVisual.bridgeFlow")}
          </p>
        </div>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute -bottom-6 -right-3 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-[0_14px_35px_rgba(18,36,75,0.12)] backdrop-blur sm:-bottom-8 sm:-right-7"
        style={reduced ? undefined : { x: orbShiftX, y: orbShiftY }}
      >
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700 shadow-inner">
          <KeyRound className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-content-subtle">
            {t("home.heroVisual.worksFor")}
          </p>
          <p className="text-sm font-semibold text-content">{t("home.heroVisual.carsAndKeys")}</p>
        </div>
      </motion.div>
      <div className="pointer-events-none absolute left-4 top-4 h-2 w-2 rounded-full bg-white/85 shadow-[0_0_24px_rgba(255,255,255,0.95)]" />
      <div className="pointer-events-none absolute right-16 top-20 h-1.5 w-1.5 rounded-full bg-brand-300/70 shadow-[0_0_18px_rgba(59,124,246,0.55)]" />
      <div className="pointer-events-none absolute bottom-8 left-10 h-1.5 w-1.5 rounded-full bg-indigo-300/70 shadow-[0_0_18px_rgba(111,77,255,0.55)]" />
    </div>
  );
};

const QrArt = ({ reduced }: { reduced: boolean }) => (
  <div className="relative h-full w-full overflow-hidden rounded-xl">
    {/* Background glows */}
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse at 20% 25%, rgba(0,102,255,0.28) 0%, rgba(0,102,255,0) 55%), radial-gradient(ellipse at 75% 30%, rgba(111,77,255,0.22) 0%, rgba(111,77,255,0) 52%), radial-gradient(ellipse at 50% 85%, rgba(0,18,51,0.12) 0%, rgba(0,18,51,0) 60%)"
      }}
    />

    {/* Animated scanlines */}
    {!reduced && (
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,102,255,0) 0%, rgba(0,102,255,0.10) 45%, rgba(0,102,255,0) 100%)"
        }}
        animate={{ y: ["-30%", "30%"] }}
        transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
      />
    )}

    {/* 3D ring hologram */}
    <div className="absolute inset-0 grid place-items-center">
      <div
        aria-hidden
        className="absolute h-[140%] w-[140%] rounded-full"
        style={{
          background:
            "conic-gradient(from 210deg, rgba(0,102,255,0.0) 0deg, rgba(0,102,255,0.35) 70deg, rgba(111,77,255,0.35) 145deg, rgba(0,102,255,0.0) 220deg)"
        }}
      />

      <motion.svg
        aria-hidden
        width="100%"
        height="100%"
        viewBox="0 0 200 200"
        className="relative"
        style={{ transformStyle: "preserve-3d" }}
        initial={reduced ? undefined : { rotate: -8 }}
        animate={reduced ? undefined : { rotate: [0, 14, -6, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="aqrRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2f69f8" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#6f4dff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#2f69f8" stopOpacity="0.65" />
          </linearGradient>
        </defs>
        {/* Outer ring */}
        <motion.circle
          cx="100"
          cy="100"
          r="66"
          fill="none"
          stroke="url(#aqrRing)"
          strokeWidth="2.8"
          strokeDasharray="18 10"
          strokeLinecap="round"
          animate={reduced ? undefined : { strokeDashoffset: [0, -60] }}
          transition={reduced ? undefined : { duration: 2.4, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner ring */}
        <motion.circle
          cx="100"
          cy="100"
          r="46"
          fill="none"
          stroke="url(#aqrRing)"
          strokeWidth="2.0"
          strokeDasharray="6 9"
          strokeLinecap="round"
          opacity="0.7"
          animate={reduced ? undefined : { strokeDashoffset: [0, 60] }}
          transition={reduced ? undefined : { duration: 2.0, repeat: Infinity, ease: "linear" }}
        />

        {/* Bridge arc */}
        <motion.path
          d="M 45 118 C 72 74, 128 74, 155 118"
          fill="none"
          stroke="#0066FF"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.9"
          strokeDasharray="8 8"
          animate={reduced ? undefined : { strokeDashoffset: [0, -64] }}
          transition={reduced ? undefined : { duration: 2.1, repeat: Infinity, ease: "linear" }}
        />
      </motion.svg>
    </div>

    {/* Pulsing nodes */}
    <div className="absolute inset-0">
      {[
        { left: "22%", top: "40%", delay: 0.0 },
        { left: "50%", top: "26%", delay: 0.25 },
        { left: "78%", top: "40%", delay: 0.5 },
        { left: "32%", top: "70%", delay: 0.65 },
        { left: "68%", top: "70%", delay: 0.85 }
      ].map((n, idx) => (
        <motion.div
          // eslint-disable-next-line react/no-array-index-key
          key={idx}
          aria-hidden
          className="absolute h-2.5 w-2.5 rounded-full bg-[#0066FF] shadow-[0_0_18px_rgba(0,102,255,0.55)]"
          style={{ left: n.left, top: n.top }}
          animate={
            reduced
              ? undefined
              : {
                  opacity: [0.35, 1, 0.35],
                  scale: [0.9, 1.25, 0.9]
                }
          }
          transition={
            reduced
              ? undefined
              : {
                  duration: 1.45,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: n.delay
                }
          }
        />
      ))}
    </div>
  </div>
);
