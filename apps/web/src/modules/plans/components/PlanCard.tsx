import { Car, Check, KeyRound, Layers2, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LinkButton } from "../../../components/marketing/shared/Button";
import { formatCurrency } from "../types";
import type { Plan } from "../types";
import { localizePlan } from "../planDisplay";

function PlanVisual({ slug }: { slug: string }) {
  const Icon =
    slug === "car-basic"
      ? Car
      : slug === "smart-key"
        ? KeyRound
        : slug === "premium-combo"
          ? Layers2
          : slug === "fleet-pro"
            ? Truck
            : Car;
  return (
    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-800">
      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
    </div>
  );
}

export const PlanCard = ({ plan }: { plan: Plan }) => {
  const { t, i18n } = useTranslation();
  const copy = localizePlan(plan, i18n.language);
  const tierLabel = t(`home.planTier.${plan.tier}`, { defaultValue: plan.tier });
  const hasDiscount = plan.compareAtCents > plan.priceCents;
  const highlightBorder = plan.isBestValue
    ? "border-brand-200 bg-accent/[0.03]"
    : "border-surface-border bg-surface-soft";
  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border p-7 transition hover:border-surface-border ${highlightBorder}`}
    >
      {plan.isBestValue && (
        <span className="absolute right-5 top-5 rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-brand-700">
          {t("home.planGrid.mostPopular")}
        </span>
      )}
      <PlanVisual slug={plan.slug} />
      <div className="mb-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-content-subtle">
        <span className="h-px w-5 bg-fog-400/40" />
        {tierLabel}
      </div>
      <h3 className="font-display text-3xl text-content">{copy.name}</h3>
      <p className="mt-2 text-[14.5px] text-content-muted">{copy.tagline}</p>

      <div className="mt-6 flex items-baseline gap-3">
        <span className="font-display text-4xl text-content">{formatCurrency(plan.priceCents, plan.currency, i18n.language)}</span>
        {hasDiscount && (
          <span className="text-[13px] text-content0 line-through">
            {formatCurrency(plan.compareAtCents, plan.currency, i18n.language)}
          </span>
        )}
      </div>
      <p className="mt-1 text-[12px] text-content0">
        {plan.billingCycle === "one_time" ? t("home.planGrid.oneTime") : t("home.planGrid.billedYearly")} ·{" "}
        {t("home.planGrid.tagsIncluded", { count: plan.tagsIncluded })}
      </p>

      <ul className="mt-7 space-y-3 text-[14px] text-content">
        {copy.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <LinkButton
          to={`/checkout/${plan.slug}`}
          size="lg"
          variant={plan.isBestValue ? "primary" : "secondary"}
          className="w-full"
          showArrow
        >
          {t("home.planGrid.choose", { name: copy.name })}
        </LinkButton>
        <LinkButton to={`/plans/${plan.slug}`} variant="ghost" size="sm" className="mt-3 w-full">
          {t("home.planGrid.compareDetails")}
        </LinkButton>
      </div>
    </article>
  );
};
