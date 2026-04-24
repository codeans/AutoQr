import type { ReactNode } from "react";
import { Container } from "./Container";

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
};

export const PageHero = ({ eyebrow, title, subtitle, children }: PageHeroProps) => (
  <section className="relative overflow-hidden pb-16 pt-20 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-32">
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-brand-soft" />
    <div
      aria-hidden
      className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(59,124,246,0.14),transparent_60%)] blur-2xl"
    />
    <Container>
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700">
          {eyebrow}
        </p>
      )}
      <h1
        className="mt-5 max-w-4xl font-display text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] text-content sm:text-[56px] lg:text-[72px]"
        style={{ textWrap: "balance" }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-content-muted sm:text-lg">
          {subtitle}
        </p>
      )}
      {children && <div className="mt-10">{children}</div>}
    </Container>
  </section>
);
