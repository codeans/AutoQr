import { Container } from "../shared/Container";
import { useMarketingContent } from "../content/useMarketingContent";

export const Solution = () => {
  const { solution } = useMarketingContent();
  return (
    <section className="relative bg-surface-soft py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700">
            {solution.eyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-content sm:text-5xl">
            {solution.headline}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-content-muted sm:text-lg">
            {solution.description}
          </p>
        </div>

        <div className="relative mt-16">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[44px] hidden h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent lg:block"
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {solution.steps.map((step, idx) => (
              <div
                key={step.title}
                className="relative rounded-2xl border border-surface-border bg-white p-8 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-700 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(29,78,216,0.6)]">
                  {idx + 1}
                </span>
                <h3 className="mt-6 text-lg font-semibold text-content">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-content-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};
