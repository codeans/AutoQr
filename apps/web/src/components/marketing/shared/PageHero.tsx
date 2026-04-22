import type { ReactNode } from "react";
import { Container } from "./Container";
import { GridBackdrop } from "./GridBackdrop";
import { Eyebrow } from "./HeadingBlock";
import { Reveal } from "./Reveal";

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
};

export const PageHero = ({ eyebrow, title, subtitle, children }: PageHeroProps) => (
  <section className="relative overflow-hidden pb-16 pt-20 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-36">
    <GridBackdrop />
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(233,199,154,0.06),transparent_60%)]"
    />
    <Container>
      {eyebrow && (
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h1
          className="mt-5 max-w-5xl font-display text-[44px] font-medium leading-[0.98] tracking-[-0.04em] text-fog-50 sm:text-[64px] lg:text-[84px]"
          style={{ textWrap: "balance" }}
        >
          {title}
        </h1>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.12}>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-fog-300 sm:text-lg">
            {subtitle}
          </p>
        </Reveal>
      )}
      {children && (
        <Reveal delay={0.2}>
          <div className="mt-10">{children}</div>
        </Reveal>
      )}
    </Container>
  </section>
);
