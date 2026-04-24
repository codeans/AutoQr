import { Container } from "../shared/Container";
import { useMarketingContent } from "../content/useMarketingContent";

export const Workflow = () => {
  const { workflow } = useMarketingContent();
  return (
    <section className="relative bg-surface-soft py-24 sm:py-32">
      <div aria-hidden className="absolute inset-0 bg-brand-fade opacity-50" />
      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700">
            {workflow.eyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-content sm:text-5xl">
            {workflow.headline}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-content-muted sm:text-lg">
            {workflow.description}
          </p>
        </div>

        <div className="mt-16 overflow-hidden rounded-3xl border border-surface-border bg-white shadow-card">
          <ol className="grid grid-cols-1 divide-y divide-surface-border sm:grid-cols-2 sm:divide-x lg:grid-cols-3">
            {workflow.steps.map((step, idx) => (
              <li
                key={step.title}
                className="relative flex gap-4 p-6 sm:p-8"
              >
                <span className="mt-0.5 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-brand-50 px-2 text-xs font-semibold text-brand-700">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-content">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-content-muted">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
};
