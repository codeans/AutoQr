import { Quote } from "lucide-react";
import { Container } from "../shared/Container";
import { useMarketingContent } from "../content/useMarketingContent";

export const Testimonials = () => {
  const { testimonials } = useMarketingContent();
  return (
    <section className="relative bg-white py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-content sm:text-5xl">
            {testimonials.headline}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-content-muted sm:text-lg">
            {testimonials.description}
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {testimonials.items.map((t, i) => (
            <figure
              key={`${t.author}-${i}`}
              className="relative flex flex-col rounded-2xl border border-surface-border bg-surface-soft p-8 transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-white hover:shadow-card"
            >
              <Quote className="h-6 w-6 text-brand-200" aria-hidden />
              <blockquote className="mt-5 flex-1 text-base leading-relaxed text-content">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 border-t border-surface-border pt-5">
                <p className="text-sm font-semibold text-content">{t.author}</p>
                <p className="mt-0.5 text-xs text-content-subtle">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
};
