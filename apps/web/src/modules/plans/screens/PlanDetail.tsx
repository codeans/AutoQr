import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check } from "lucide-react";
import { LinkButton } from "../../../components/marketing/shared/Button";
import { Container } from "../../../components/marketing/shared/Container";
import { Reveal } from "../../../components/marketing/shared/Reveal";
import { SectionWrapper } from "../../../components/marketing/shared/SectionWrapper";
import { fetchPlan } from "../services/plans.service";
import { formatCurrency } from "../types";
import type { Plan } from "../types";

export const PlanDetailScreen = () => {
  const { slug } = useParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetchPlan(slug)
      .then(setPlan)
      .catch(() => setError("Plan not found"));
  }, [slug]);

  if (error)
    return (
      <SectionWrapper>
        <Container>
          <p className="text-red-300">{error}</p>
          <Link to="/plans" className="mt-4 text-content underline">
            Back to plans
          </Link>
        </Container>
      </SectionWrapper>
    );
  if (!plan)
    return (
      <SectionWrapper>
        <Container>Loading…</Container>
      </SectionWrapper>
    );

  return (
    <SectionWrapper spacing="default">
      <Container>
        <Link to="/plans" className="text-[13px] text-content-subtle hover:text-content">
          ← Back to plans
        </Link>
        <Reveal>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-3xl border border-surface-border bg-surface-soft p-10">
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-content-subtle">
                <span className="h-px w-6 bg-fog-400/40" /> {plan.tier}
              </div>
              <h1 className="mt-5 font-display text-4xl text-content sm:text-5xl">{plan.name}</h1>
              <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-content-muted">{plan.description}</p>

              <div className="mt-10 grid gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-content-subtle">Highlights</h3>
                  <ul className="mt-4 space-y-2.5 text-[14px] text-content">
                    {plan.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-content-subtle">What's in the box</h3>
                  <ul className="mt-4 space-y-2.5 text-[14px] text-content">
                    {plan.includes.map((h) => (
                      <li key={h} className="flex items-start gap-2.5">
                        <span className="mt-2 h-1 w-1 rounded-full bg-accent/70" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <dl className="mt-10 grid grid-cols-2 gap-3 rounded-2xl border border-surface-border bg-surface-soft0 p-5 text-[13.5px] sm:grid-cols-4">
                <div>
                  <dt className="text-content-subtle">Tags</dt>
                  <dd className="mt-1 font-display text-lg text-content">{plan.tagsIncluded}</dd>
                </div>
                <div>
                  <dt className="text-content-subtle">Vehicles</dt>
                  <dd className="mt-1 font-display text-lg text-content">{plan.vehicleLimit}</dd>
                </div>
                <div>
                  <dt className="text-content-subtle">Emergency contacts</dt>
                  <dd className="mt-1 font-display text-lg text-content">{plan.emergencyContactLimit}</dd>
                </div>
                <div>
                  <dt className="text-content-subtle">Support</dt>
                  <dd className="mt-1 font-display text-lg text-content capitalize">{plan.supportTier}</dd>
                </div>
              </dl>
            </div>

            <aside className="rounded-3xl border border-surface-border bg-white/60 p-8">
              <span className="text-[11px] uppercase tracking-[0.2em] text-content-subtle">You pay</span>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-display text-4xl text-content">
                  {formatCurrency(plan.priceCents, plan.currency)}
                </span>
                {plan.compareAtCents > plan.priceCents && (
                  <span className="text-[14px] text-content0 line-through">
                    {formatCurrency(plan.compareAtCents, plan.currency)}
                  </span>
                )}
              </div>
              <p className="mt-2 text-[13px] text-content0">
                {plan.billingCycle === "one_time" ? "One-time payment · no subscription" : "Billed yearly"}
              </p>

              <LinkButton to={`/onboard/${plan.slug}`} size="lg" className="mt-8 w-full" showArrow>
                Start onboarding
              </LinkButton>
              <p className="mt-4 text-[12px] text-content0 text-center">
                14-day return · Secured by Stripe · Privacy-first relay
              </p>
            </aside>
          </div>
        </Reveal>
      </Container>
    </SectionWrapper>
  );
};
