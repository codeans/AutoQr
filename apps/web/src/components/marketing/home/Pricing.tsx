import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LinkButton } from "../shared/Button";
import { Container } from "../shared/Container";
import { useMarketingContent } from "../content/useMarketingContent";

export const Pricing = () => {
  const { t } = useTranslation();
  const { pricing } = useMarketingContent();
  return (
    <section className="relative bg-surface-soft py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700">
            {pricing.eyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-content sm:text-5xl">
            {pricing.headline}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-content-muted sm:text-lg">
            {pricing.description}
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-xl overflow-hidden rounded-3xl border border-surface-border bg-white shadow-card">
          <div className="bg-brand-700 px-8 py-10 text-center text-white sm:px-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-100">
              {t("home.pricingBadge")}
            </p>
            <div className="mt-4 flex items-baseline justify-center gap-2">
              <span className="font-display text-6xl font-semibold tracking-tight sm:text-7xl">
                {pricing.price}
              </span>
              <span className="text-sm font-medium text-brand-100">{pricing.priceCaption}</span>
            </div>
          </div>
          <div className="px-8 py-10 sm:px-12">
            <ul className="space-y-3.5">
              {pricing.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-content">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
                    <Check className="h-3 w-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex justify-center">
              <LinkButton to={pricing.cta.to} size="lg" showArrow>
                {pricing.cta.label}
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
