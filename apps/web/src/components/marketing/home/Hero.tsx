import { motion, useReducedMotion } from "framer-motion";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LinkButton } from "../shared/Button";
import { Container } from "../shared/Container";
import { useMarketingContent } from "../content/useMarketingContent";

export const Hero = () => {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const { hero } = useMarketingContent();

  return (
    <section className="relative overflow-hidden pb-20 pt-16 sm:pb-28 sm:pt-24 lg:pb-32 lg:pt-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-brand-soft" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[640px] w-[1200px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(59,124,246,0.18),transparent_60%)] blur-2xl"
      />

      <Container>
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-700 shadow-soft">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" />
          </span>
          {hero.eyebrow}
        </div>

        <div className="mt-10 grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <h1
              className="font-display text-[44px] font-semibold leading-[1.02] tracking-[-0.035em] text-content sm:text-[64px] lg:text-[80px]"
              style={{ textWrap: "balance" }}
            >
              {hero.headline}{" "}
              <span className="text-brand-700">{hero.highlight}</span>
            </h1>

            <p className="mt-8 max-w-xl text-base leading-relaxed text-content-muted sm:text-lg">
              {hero.description}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <LinkButton to={hero.primaryCta.to} size="lg" showArrow>
                {hero.primaryCta.label}
              </LinkButton>
              <LinkButton to={hero.secondaryCta.to} variant="secondary" size="lg">
                {hero.secondaryCta.label}
              </LinkButton>
            </div>

            <div className="mt-10 flex items-center gap-3 text-sm text-content-subtle">
              <ShieldCheck className="h-4 w-4 text-brand-700" />
              <span>{hero.trustLine || t("home.heroVisual.fallbackTrustLine")}</span>
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <motion.div
              initial={reduce ? undefined : { opacity: 0, y: 16 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-auto w-full max-w-[440px] lg:ml-auto"
            >
              <HeroVisual t={t} />
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
};

type HeroVisualProps = { t: (key: string) => string };

const HeroVisual = ({ t }: HeroVisualProps) => (
  <div className="relative">
    <div className="relative rounded-[28px] border border-surface-border bg-white p-6 shadow-card">
      <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.2em] text-content-subtle">
        <span>AQR · DE-003</span>
        <span className="flex items-center gap-1.5 text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {t("home.heroVisual.active")}
        </span>
      </div>
      <div className="mt-5 grid aspect-square w-full place-items-center rounded-2xl border border-surface-border bg-surface-soft p-6">
        <QrArt />
      </div>
      <div className="mt-5 space-y-1.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-content-subtle">
          {t("home.heroVisual.secureCallBridge")}
        </p>
        <p className="font-mono text-sm tracking-tight text-content">
          {t("home.heroVisual.bridgeFlow")}
        </p>
      </div>
    </div>

    <div className="pointer-events-none absolute -bottom-6 -right-4 flex items-center gap-3 rounded-2xl border border-surface-border bg-white px-4 py-3 shadow-card sm:-bottom-8 sm:-right-8">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
        <KeyRound className="h-5 w-5" />
      </span>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-content-subtle">
          {t("home.heroVisual.worksFor")}
        </p>
        <p className="text-sm font-semibold text-content">{t("home.heroVisual.carsAndKeys")}</p>
      </div>
    </div>
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
            className={filled ? "bg-content" : "bg-transparent"}
            style={{ borderRadius: 2 }}
          />
        );
      })}
    </div>
  );
};
