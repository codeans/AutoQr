import { AlertTriangle, Car, Eye, KeyRound, LucideIcon } from "lucide-react";
import { Container } from "../shared/Container";
import { useMarketingContent } from "../content/useMarketingContent";

const ICONS: Record<string, LucideIcon> = {
  car: Car,
  key: KeyRound,
  eye: Eye,
  alert: AlertTriangle
};

export const Problem = () => {
  const { problem } = useMarketingContent();
  return (
    <section className="relative border-y border-surface-border bg-white py-24 sm:py-32">
      <Container>
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700">
            {problem.eyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-content sm:text-5xl">
            {problem.headline}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-content-muted sm:text-lg">
            {problem.description}
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {problem.items.map((item) => {
            const Icon = ICONS[item.icon] ?? AlertTriangle;
            return (
              <div
                key={item.title}
                className="group rounded-2xl border border-surface-border bg-surface-soft p-6 transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-white hover:shadow-card"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-content">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-content-muted">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
