import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { LinkButton } from "../../../components/marketing/shared/Button";
import { Container } from "../../../components/marketing/shared/Container";
import { Reveal } from "../../../components/marketing/shared/Reveal";
import { SectionWrapper } from "../../../components/marketing/shared/SectionWrapper";
import { fetchPlan } from "../services/plans.service";
import { formatEmergencyContactCap, localizePlan, vehicleCap } from "../planDisplay";
import { formatCurrency } from "../types";
import type { Plan } from "../types";

export const PlanDetailScreen = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetchPlan(slug)
      .then(setPlan)
      .catch(() => setError(t("plans.planNotFound")));
  }, [slug, t]);

  if (error)
    return (
      <SectionWrapper>
        <Container>
          <p className="text-red-300">{error}</p>
          <Link to="/plans" className="mt-4 text-content underline">
            {t("plans.backToPlans")}
          </Link>
        </Container>
      </SectionWrapper>
    );
  if (!plan)
    return (
      <SectionWrapper>
        <Container>{t("plans.loading")}</Container>
      </SectionWrapper>
    );

  const copy = localizePlan(plan, i18n.language);
  const tierLabel = t(`home.planTier.${plan.tier}`, { defaultValue: plan.tier });
  const emergencyDisplay = formatEmergencyContactCap(plan, t("plans.emergencyUnlimited"));

  return (
    <SectionWrapper spacing="default">
      <Container>
        <Link to="/plans" className="text-[13px] text-content-subtle hover:text-content">
          {t("plans.backToPlans")}
        </Link>
        <Reveal>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-3xl border border-surface-border bg-surface-soft p-10">
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-content-subtle">
                <span className="h-px w-6 bg-fog-400/40" /> {tierLabel}
              </div>
              <h1 className="mt-5 font-display text-4xl text-content sm:text-5xl">{copy.name}</h1>
              <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-content-muted">{copy.description}</p>

              <div className="mt-10 grid gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-content-subtle">
                    {t("plans.highlights")}
                  </h3>
                  <ul className="mt-4 space-y-2.5 text-[14px] text-content">
                    {copy.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-content-subtle">
                    {t("plans.whatsInTheBox")}
                  </h3>
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
                  <dt className="text-content-subtle">{t("plans.qrCodesLabel")}</dt>
                  <dd className="mt-1 font-display text-lg text-content">{plan.tagsIncluded}</dd>
                </div>
                <div>
                  <dt className="text-content-subtle">{t("plans.vehiclesLabel")}</dt>
                  <dd className="mt-1 font-display text-lg text-content">{vehicleCap(plan)}</dd>
                </div>
                <div>
                  <dt className="text-content-subtle">{t("plans.emergencyContactsLabel")}</dt>
                  <dd className="mt-1 font-display text-lg text-content">{emergencyDisplay}</dd>
                </div>
                <div>
                  <dt className="text-content-subtle">{t("plans.supportLabel")}</dt>
                  <dd className="mt-1 font-display text-lg text-content capitalize">{plan.supportTier}</dd>
                </div>
              </dl>
            </div>

            <aside className="rounded-3xl border border-surface-border bg-white/60 p-8">
              <span className="text-[11px] uppercase tracking-[0.2em] text-content-subtle">{t("plans.youPay")}</span>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-display text-4xl text-content">
                  {formatCurrency(plan.priceCents, plan.currency, i18n.language)}
                </span>
                {plan.compareAtCents > plan.priceCents && (
                  <span className="text-[14px] text-content0 line-through">
                    {formatCurrency(plan.compareAtCents, plan.currency, i18n.language)}
                  </span>
                )}
              </div>
              <p className="mt-2 text-[13px] text-content0">
                {plan.billingCycle === "one_time" ? t("plans.oneTime") : t("plans.billedYearly")}
              </p>

              <LinkButton to={`/checkout/${plan.slug}`} size="lg" className="mt-8 w-full" showArrow>
                {t("plans.checkoutCta")}
              </LinkButton>
              <p className="mt-4 text-[12px] text-content0 text-center">{t("plans.priceFooter")}</p>
            </aside>
          </div>
        </Reveal>
      </Container>
    </SectionWrapper>
  );
};
