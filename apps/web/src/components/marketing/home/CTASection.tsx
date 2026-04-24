import { LinkButton } from "../shared/Button";
import { Container } from "../shared/Container";
import { useMarketingContent } from "../content/useMarketingContent";

export const CTASection = () => {
  const { cta } = useMarketingContent();
  return (
    <section className="relative bg-white py-24 sm:py-32">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-brand-700 px-8 py-16 text-center text-white shadow-glass sm:px-16 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.18),transparent_60%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 left-1/2 h-64 w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(96,155,250,0.4),transparent_60%)] blur-2xl"
          />
          <div className="relative">
            <h2
              className="mx-auto max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-5xl"
              style={{ textWrap: "balance" }}
            >
              {cta.headline}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-brand-100 sm:text-lg">
              {cta.description}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <LinkButton
                to={cta.primaryCta.to}
                size="lg"
                showArrow
                className="!bg-white !text-brand-700 hover:!bg-brand-50"
              >
                {cta.primaryCta.label}
              </LinkButton>
              <LinkButton
                to={cta.secondaryCta.to}
                size="lg"
                className="!border !border-white/30 !bg-transparent !text-white hover:!bg-white/10"
              >
                {cta.secondaryCta.label}
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
