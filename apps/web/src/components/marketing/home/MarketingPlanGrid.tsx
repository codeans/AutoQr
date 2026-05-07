import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Car, Check, KeyRound, Layers2, Truck } from "lucide-react";
import { CATALOG_PLAN_SLUGS } from "@autoqr/shared";
import { LinkButton } from "../shared/Button";
import { Container } from "../shared/Container";
import { fetchPlans } from "../../../modules/plans/services/plans.service";
import { formatCurrency, type Plan } from "../../../modules/plans/types";
import { localizePlan } from "../../../modules/plans/planDisplay";

function planIcon(slug: string) {
  switch (slug) {
    case "car-basic":
      return Car;
    case "smart-key":
      return KeyRound;
    case "premium-combo":
      return Layers2;
    case "fleet-pro":
      return Truck;
    default:
      return Car;
  }
}

const slugOrder = new Map(CATALOG_PLAN_SLUGS.map((s, i) => [s, i]));

export const MarketingPlanGrid = () => {
  const { t, i18n } = useTranslation();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPlans()
      .then((list) => {
        const sorted = [...list].sort((a, b) => {
          const ia = slugOrder.get(a.slug as (typeof CATALOG_PLAN_SLUGS)[number]) ?? 99;
          const ib = slugOrder.get(b.slug as (typeof CATALOG_PLAN_SLUGS)[number]) ?? 99;
          return ia - ib;
        });
        setPlans(sorted);
      })
      .catch(() => setError(t("home.planGrid.error")))
      .finally(() => setLoading(false));
  }, [t]);

  const lang = i18n.language;

  const cards = useMemo(
    () =>
      plans.map((plan) => {
        const copy = localizePlan(plan, lang);
        const Icon = planIcon(plan.slug);
        const hasDiscount = plan.compareAtCents > plan.priceCents;
        const highlight = plan.isBestValue;
        return { plan, copy, Icon, hasDiscount, highlight };
      }),
    [plans, lang]
  );

  return (
    <section className="relative bg-surface-soft py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700">
            {t("home.planGrid.eyebrow")}
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-content sm:text-5xl">
            {t("home.planGrid.title")}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-content-muted sm:text-lg">
            {t("home.planGrid.subtitle")}
          </p>
        </div>

        {loading && <p className="mt-14 text-center text-content-muted">{t("home.planGrid.loading")}</p>}
        {error && <p className="mt-14 text-center text-red-600">{error}</p>}

        {!loading && !error && plans.length === 0 && (
          <p className="mt-14 text-center text-content-muted">{t("home.planGrid.empty")}</p>
        )}

        {!loading && !error && plans.length > 0 && (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ plan, copy, Icon, hasDiscount, highlight }) => (
              <article
                key={plan._id}
                className={`relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white p-7 shadow-card transition hover:border-brand-200/60 ${
                  highlight ? "border-brand-200 ring-1 ring-brand-200/40" : "border-surface-border"
                }`}
              >
                {highlight && (
                  <span className="absolute right-5 top-5 rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-brand-700">
                    {t("home.planGrid.mostPopular")}
                  </span>
                )}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-800">
                  <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="font-display text-xl font-semibold tracking-tight text-content sm:text-2xl">
                  {copy.name}
                </h3>
                <p className="mt-2 min-h-[2.75rem] text-sm leading-relaxed text-content-muted">{copy.tagline}</p>
                <div className="mt-5 flex flex-wrap items-baseline gap-2">
                  <span className="font-display text-3xl font-semibold text-content">
                    {formatCurrency(plan.priceCents, plan.currency, lang)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-content-muted line-through">
                      {formatCurrency(plan.compareAtCents, plan.currency, lang)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-content-subtle">
                  {t("home.planGrid.oneTime")} · {t("home.planGrid.tagsIncluded", { count: plan.tagsIncluded })}
                </p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {copy.highlights.slice(0, 5).map((h) => (
                    <li key={h} className="flex items-start gap-2.5 text-[13px] leading-snug text-content">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
                        <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                      </span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 space-y-2">
                  <LinkButton
                    to={`/checkout/${plan.slug}`}
                    size="lg"
                    variant={highlight ? "primary" : "secondary"}
                    className="w-full"
                    showArrow
                  >
                    {t("home.planGrid.choose", { name: copy.name })}
                  </LinkButton>
                  <LinkButton to={`/plans/${plan.slug}`} variant="ghost" size="sm" className="w-full">
                    {t("home.planGrid.compareDetails")}
                  </LinkButton>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && plans.length > 0 && (
          <p className="mt-10 text-center text-[12.5px] text-content-subtle">
            {t("home.planGrid.fleetSales")}{" "}
            <a href="/partner" className="text-brand-700 underline-offset-4 hover:underline">
              {t("home.planGrid.fleetSalesLink")}
            </a>
          </p>
        )}
      </Container>
    </section>
  );
};
