import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { LinkButton } from "../shared/Button";
import { Container } from "../shared/Container";
import { GridBackdrop } from "../shared/GridBackdrop";
import { Reveal } from "../shared/Reveal";

const stats = [
  { label: "Identity protected", value: "100%" },
  { label: "Setup to dispatch", value: "<24h" },
  { label: "Owner payment", value: "One-time" },
  { label: "Incidents audited", value: "Every scan" }
];

export const Hero = () => {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden pb-24 pt-20 sm:pb-32 sm:pt-28 lg:pb-40 lg:pt-32">
      <GridBackdrop />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(233,199,154,0.08),transparent_60%)]"
      />

      <Container>
        <Reveal>
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-fog-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Now shipping in Germany
          </div>
        </Reveal>

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <Reveal delay={0.05}>
              <h1
                className="font-display text-[48px] font-medium leading-[0.95] tracking-[-0.04em] text-fog-50 sm:text-[72px] lg:text-[96px] xl:text-[112px]"
                style={{ textWrap: "balance" }}
              >
                Your car. Contactable.
                <br />
                <span className="text-fog-400">Your number, still private.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.15}>
              <p className="mt-8 max-w-xl text-base leading-relaxed text-fog-300 sm:text-lg">
                AutoQR is a privacy-first QR contact platform built only for cars.
                Anyone who needs to reach you — wrong parking, headlights on,
                towing, emergency — can alert you instantly, without ever seeing
                your phone number.
              </p>
            </Reveal>

            <Reveal delay={0.22}>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <LinkButton to="/plans" size="lg" showArrow>
                  Choose a plan
                </LinkButton>
                <LinkButton to="/how-it-works" variant="secondary" size="lg">
                  See how it works
                </LinkButton>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="mt-10 flex items-center gap-3 text-xs text-fog-400">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <span>
                  GDPR-aligned. Owner contact details never exposed publicly.
                </span>
              </div>
            </Reveal>
          </div>

          <div className="relative lg:col-span-4">
            <motion.div
              initial={reduce ? undefined : { opacity: 0, scale: 0.96 }}
              animate={reduce ? undefined : { opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-auto aspect-square w-full max-w-[420px] lg:ml-auto"
            >
              <HeroVisual />
            </motion.div>
          </div>
        </div>

        <Reveal delay={0.4}>
          <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] sm:mt-28 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-ink-900 px-5 py-6 sm:px-7 sm:py-8">
                <div className="font-display text-3xl font-medium tracking-tight text-fog-50 sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-fog-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
};

const HeroVisual = () => (
  <div className="relative h-full w-full">
    <div className="absolute inset-0 rounded-[28px] border border-white/10 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 p-6 shadow-elevate">
      <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.2em] text-fog-400">
        <span>AQR-003-DE</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Active
        </span>
      </div>
      <div className="mt-5 grid aspect-square w-full place-items-center rounded-2xl border border-white/10 bg-ink-950 p-6">
        <QrArt />
      </div>
      <div className="mt-5 space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-fog-400">
          Private identity
        </p>
        <p className="font-mono text-sm tracking-tight text-fog-100">
          scan → secure bridge → owner
        </p>
      </div>
    </div>
    <motion.div
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="pointer-events-none absolute -inset-10 -z-10 rounded-[36px] bg-[radial-gradient(ellipse_at_top,rgba(233,199,154,0.22),transparent_60%)] blur-2xl"
    />
  </div>
);

const QrArt = () => {
  const cells = 9;
  return (
    <div
      className="grid aspect-square w-full gap-[2px]"
      style={{ gridTemplateColumns: `repeat(${cells}, 1fr)` }}
    >
      {Array.from({ length: cells * cells }).map((_, i) => {
        const r = Math.floor(i / cells);
        const c = i % cells;
        const corner =
          (r < 3 && c < 3) ||
          (r < 3 && c > cells - 4) ||
          (r > cells - 4 && c < 3);
        const border =
          corner &&
          (r === 0 ||
            r === 2 ||
            c === 0 ||
            c === 2 ||
            (r > cells - 4 && (r === cells - 3 || r === cells - 1)) ||
            (c > cells - 4 && (c === cells - 3 || c === cells - 1)));
        const filledCorner =
          corner && ((r === 1 && c === 1) || (r === 1 && c === cells - 2) || (r === cells - 2 && c === 1));
        const seed = (r * 13 + c * 7 + 5) % 9;
        const filled = border || filledCorner || (!corner && seed < 4);
        return (
          <div
            key={i}
            className={filled ? "bg-fog-50" : "bg-transparent"}
            style={{ borderRadius: 2 }}
          />
        );
      })}
    </div>
  );
};
