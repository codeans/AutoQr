import { Check } from "lucide-react";
import { LinkButton } from "../../../components/marketing/shared/Button";
import { formatCurrency } from "../types";
import type { Plan } from "../types";

export const PlanCard = ({ plan }: { plan: Plan }) => {
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
          Most popular
        </span>
      )}
      <div className="mb-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-content-subtle">
        <span className="h-px w-5 bg-fog-400/40" />
        {plan.tier}
      </div>
      <h3 className="font-display text-3xl text-content">{plan.name}</h3>
      <p className="mt-2 text-[14.5px] text-content-muted">{plan.tagline}</p>

      <div className="mt-6 flex items-baseline gap-3">
        <span className="font-display text-4xl text-content">{formatCurrency(plan.priceCents, plan.currency)}</span>
        {hasDiscount && (
          <span className="text-[13px] text-content0 line-through">
            {formatCurrency(plan.compareAtCents, plan.currency)}
          </span>
        )}
      </div>
      <p className="mt-1 text-[12px] text-content0">
        {plan.billingCycle === "one_time" ? "One-time payment" : "Billed yearly"} · {plan.tagsIncluded} tag
        {plan.tagsIncluded > 1 ? "s" : ""} included
      </p>

      <ul className="mt-7 space-y-3 text-[14px] text-content">
        {plan.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <LinkButton
          to={`/onboard/${plan.slug}`}
          size="lg"
          variant={plan.isBestValue ? "primary" : "secondary"}
          className="w-full"
          showArrow
        >
          Choose {plan.name}
        </LinkButton>
        <LinkButton
          to={`/plans/${plan.slug}`}
          variant="ghost"
          size="sm"
          className="mt-3 w-full"
        >
          Compare details
        </LinkButton>
      </div>
    </article>
  );
};
